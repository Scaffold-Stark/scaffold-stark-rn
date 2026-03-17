import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import chalk from "chalk";
import { execa } from "execa";
import type { ProjectOptions } from "./types.js";
import {
  toAppSlug,
  getInstallCommand,
  getRunCommand,
  logStep,
  logSuccess,
  logWarning,
  logError,
  log,
} from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTemplateDir(): string {
  // Both in built dist/ and dev src/, template is a sibling directory
  const templateDir = path.resolve(__dirname, "..", "template");
  if (!fs.existsSync(templateDir)) {
    throw new Error(
      `Template directory not found at ${templateDir}. This is a bug in create-stark-rn.`,
    );
  }
  return templateDir;
}

export async function createProject(options: ProjectOptions): Promise<void> {
  const { projectName, includeContracts, packageManager, skipInstall, skipGit } = options;
  const projectDir = path.resolve(process.cwd(), projectName);
  const slug = toAppSlug(projectName);
  const templateDir = getTemplateDir();

  // Check if directory already exists
  if (fs.existsSync(projectDir)) {
    const contents = fs.readdirSync(projectDir);
    if (contents.length > 0) {
      logError(`Directory "${projectName}" already exists and is not empty.`);
      process.exit(1);
    }
  }

  log(chalk.bold(`\nCreating a new Scaffold Stark React Native project in ${chalk.cyan(projectDir)}\n`));

  // Step 1: Create project directory
  logStep("Creating project structure...");
  fs.ensureDirSync(projectDir);

  // Step 2: Copy RN app template
  logStep("Copying React Native app template...");
  const rnTemplateDir = path.join(templateDir, "rn");
  if (!fs.existsSync(rnTemplateDir)) {
    logError("Template directory not found. This is a bug in create-stark-rn.");
    process.exit(1);
  }

  const rnDestDir = path.join(projectDir, "packages", "rn");
  fs.copySync(rnTemplateDir, rnDestDir);
  logSuccess("React Native app template copied.");

  // Step 3: Update package.json with project name
  logStep("Configuring project...");
  const rnPkgPath = path.join(rnDestDir, "package.json");
  if (fs.existsSync(rnPkgPath)) {
    const rnPkg = fs.readJsonSync(rnPkgPath);
    rnPkg.name = `@${slug}/rn`;
    fs.writeJsonSync(rnPkgPath, rnPkg, { spaces: 2 });
  }

  // Step 4: Update app.json with project name
  const appJsonPath = path.join(rnDestDir, "app.json");
  if (fs.existsSync(appJsonPath)) {
    const appJson = fs.readJsonSync(appJsonPath);
    appJson.expo.name = projectName;
    appJson.expo.slug = slug;
    appJson.expo.scheme = slug.replace(/-/g, "");
    fs.writeJsonSync(appJsonPath, appJson, { spaces: 2 });
  }
  logSuccess("Project configuration updated.");

  // Step 5: Copy smart contracts if selected
  if (includeContracts) {
    logStep("Copying smart contract template...");
    const snfoundryTemplateDir = path.join(templateDir, "snfoundry");
    if (fs.existsSync(snfoundryTemplateDir)) {
      const snfoundryDestDir = path.join(projectDir, "packages", "snfoundry");
      fs.copySync(snfoundryTemplateDir, snfoundryDestDir);

      // Update snfoundry package.json name
      const snPkgPath = path.join(snfoundryDestDir, "package.json");
      if (fs.existsSync(snPkgPath)) {
        const snPkg = fs.readJsonSync(snPkgPath);
        snPkg.name = `@${slug}/snfoundry`;
        fs.writeJsonSync(snPkgPath, snPkg, { spaces: 2 });
      }
      logSuccess("Smart contract template copied.");
    } else {
      logWarning("Smart contract template not found, skipping.");
    }
  }

  // Step 6: Create root package.json
  logStep("Setting up workspace...");
  const workspacePackages = ["packages/rn"];
  if (includeContracts) {
    workspacePackages.push("packages/snfoundry");
  }

  const rootPkg = createRootPackageJson(projectName, slug, packageManager, workspacePackages, includeContracts);
  fs.writeJsonSync(path.join(projectDir, "package.json"), rootPkg, { spaces: 2 });

  // Create pnpm-workspace.yaml if using pnpm
  if (packageManager === "pnpm") {
    const pnpmWorkspace = `packages:\n${workspacePackages.map((p) => `  - "${p}"`).join("\n")}\n`;
    fs.writeFileSync(path.join(projectDir, "pnpm-workspace.yaml"), pnpmWorkspace);
  }

  // Create .env.example
  createEnvExample(projectDir);

  // Create .gitignore
  createGitignore(projectDir);

  // Create .prettierrc
  fs.writeJsonSync(path.join(projectDir, ".prettierrc"), { semi: true, singleQuote: false, tabWidth: 2, trailingComma: "all" }, { spaces: 2 });

  logSuccess("Workspace configured.");

  // Step 7: Initialize git
  if (!skipGit) {
    logStep("Initializing git repository...");
    try {
      await execa("git", ["init"], { cwd: projectDir });
      await execa("git", ["add", "-A"], { cwd: projectDir });
      await execa("git", ["commit", "-m", "chore: initial scaffold from create-stark-rn"], { cwd: projectDir });
      logSuccess("Git repository initialized.");
    } catch {
      logWarning("Could not initialize git repository. You can do this manually later.");
    }
  }

  // Step 8: Install dependencies
  if (!skipInstall) {
    logStep(`Installing dependencies with ${packageManager}...`);
    try {
      const installCmd = getInstallCommand(packageManager);
      const [cmd, ...args] = installCmd.split(" ");
      await execa(cmd, args, { cwd: projectDir, stdio: "inherit" });
      logSuccess("Dependencies installed.");
    } catch {
      logWarning("Could not install dependencies. Run the install command manually.");
    }
  }

  // Step 9: Print next steps
  printNextSteps(projectName, packageManager, includeContracts);
}

function getWorkspaceRunCmd(packageManager: string, workspaceName: string, script: string, extraArgs?: string): string {
  const args = extraArgs ? ` ${extraArgs}` : "";
  switch (packageManager) {
    case "yarn":
      return `yarn workspace ${workspaceName} ${script}${args}`;
    case "pnpm":
      return `pnpm --filter ${workspaceName} ${script}${args}`;
    default:
      return `npm run ${script} -w ${workspaceName}${args ? ` --${args}` : ""}`;
  }
}

function createRootPackageJson(
  projectName: string,
  slug: string,
  packageManager: string,
  workspacePackages: string[],
  includeContracts: boolean,
): Record<string, unknown> {
  const rnPkg = `@${slug}/rn`;
  const snPkg = `@${slug}/snfoundry`;

  const scripts: Record<string, string> = {
    start: getWorkspaceRunCmd(packageManager, rnPkg, "start"),
    "start:ios": getWorkspaceRunCmd(packageManager, rnPkg, "start", "--ios"),
    "start:android": getWorkspaceRunCmd(packageManager, rnPkg, "start", "--android"),
  };

  if (includeContracts) {
    scripts.chain = getWorkspaceRunCmd(packageManager, snPkg, "chain");
    scripts.deploy = getWorkspaceRunCmd(packageManager, snPkg, "deploy");
    scripts.compile = getWorkspaceRunCmd(packageManager, snPkg, "compile");
    scripts.test = getWorkspaceRunCmd(packageManager, snPkg, "test");
  }

  const pkg: Record<string, unknown> = {
    name: slug,
    version: "0.0.1",
    private: true,
    scripts,
    devDependencies: {
      prettier: "^3.2.5",
    },
  };

  // npm and yarn use the workspaces field in package.json
  // pnpm uses pnpm-workspace.yaml (created separately) but also supports this field
  pkg.workspaces = { packages: workspacePackages };

  if (packageManager === "yarn") {
    pkg.packageManager = "yarn@3.2.3";
  }

  return pkg;
}

function createEnvExample(projectDir: string): void {
  const envContent = `# Provider URLs
# Devnet: local starknet-devnet instance
EXPO_PUBLIC_DEVNET_PROVIDER_URL=http://127.0.0.1:5050

# Sepolia testnet (get a free key from https://www.alchemy.com/)
# EXPO_PUBLIC_SEPOLIA_PROVIDER_URL=

# Mainnet (get a free key from https://www.alchemy.com/)
# EXPO_PUBLIC_MAINNET_PROVIDER_URL=
`;
  fs.writeFileSync(path.join(projectDir, ".env.example"), envContent);

  // Also create a .env with defaults
  fs.writeFileSync(path.join(projectDir, "packages", "rn", ".env"), envContent);
}

function createGitignore(projectDir: string): void {
  const content = `# Dependencies
node_modules/

# Expo
.expo/
dist/

# Build output
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Yarn
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# pnpm
pnpm-debug.log*

# npm
package-lock.json
npm-debug.log*

# Misc
*.log
`;
  fs.writeFileSync(path.join(projectDir, ".gitignore"), content);
}

function printNextSteps(
  projectName: string,
  packageManager: "npm" | "yarn" | "pnpm",
  includeContracts: boolean,
): void {
  const run = (script: string) => getRunCommand(packageManager, script);

  log("");
  log(chalk.green.bold("  Your Scaffold Stark React Native project is ready!"));
  log("");
  log(chalk.bold("  Next steps:"));
  log("");
  log(`  ${chalk.cyan("cd")} ${projectName}`);

  if (includeContracts) {
    log("");
    log(chalk.dim("  # In terminal 1 - Start local StarkNet devnet:"));
    log(`  ${chalk.cyan(run("chain"))}`);
    log("");
    log(chalk.dim("  # In terminal 2 - Deploy contracts:"));
    log(`  ${chalk.cyan(run("deploy"))}`);
    log("");
    log(chalk.dim("  # In terminal 3 - Start the Expo dev server:"));
    log(`  ${chalk.cyan(run("start"))}`);
  } else {
    log("");
    log(chalk.dim("  # Start the Expo dev server:"));
    log(`  ${chalk.cyan(run("start"))}`);
  }

  log("");
  log(chalk.dim("  Documentation: https://github.com/Scaffold-Stark/scaffold-stark-rn"));
  log("");
}
