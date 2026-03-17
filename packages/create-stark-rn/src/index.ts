import { Command } from "commander";
import chalk from "chalk";
import { getProjectOptions } from "./cli.js";
import { createProject } from "./create-project.js";
import { logError, validateProjectName } from "./utils.js";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, "..", "package.json");
    const pkg = fs.readJsonSync(pkgPath);
    return pkg.version || "0.1.0";
  } catch {
    return "0.1.0";
  }
}

const program = new Command();

program
  .name("create-stark-rn")
  .description("Scaffold a new Scaffold Stark React Native project")
  .version(getVersion())
  .argument("[project-name]", "Name for the new project")
  .option("--skip-install", "Skip installing dependencies", false)
  .option("--skip-git", "Skip initializing a git repository", false)
  .option("--use-npm", "Use npm as the package manager")
  .option("--use-yarn", "Use yarn as the package manager")
  .option("--use-pnpm", "Use pnpm as the package manager")
  .option("--no-contracts", "Skip including example smart contracts")
  .action(async (projectNameArg: string | undefined, cmdOptions: Record<string, unknown>) => {
    console.log("");
    console.log(chalk.bold.cyan("  Scaffold Stark - React Native"));
    console.log(chalk.dim("  Build StarkNet dApps with Expo + React Native"));
    console.log("");

    // Quick validation if name provided as argument
    if (projectNameArg) {
      const validation = validateProjectName(projectNameArg);
      if (validation !== true) {
        logError(validation);
        process.exit(1);
      }
    }

    try {
      const options = await getProjectOptions(projectNameArg);
      if (!options) {
        process.exit(1);
      }

      // Apply CLI flag overrides
      if (cmdOptions.skipInstall) options.skipInstall = true;
      if (cmdOptions.skipGit) options.skipGit = true;
      if (cmdOptions.useNpm) options.packageManager = "npm";
      if (cmdOptions.useYarn) options.packageManager = "yarn";
      if (cmdOptions.usePnpm) options.packageManager = "pnpm";
      if (cmdOptions.contracts === false) options.includeContracts = false;

      await createProject(options);
    } catch (error) {
      logError(error instanceof Error ? error.message : "An unexpected error occurred.");
      process.exit(1);
    }
  });

program.parse();
