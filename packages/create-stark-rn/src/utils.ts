import { execSync } from "node:child_process";
import chalk from "chalk";

export function validateProjectName(name: string): string | true {
  if (!name) {
    return "Project name is required";
  }
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) {
    return "Project name must start with a letter and contain only letters, numbers, hyphens, and underscores";
  }
  if (name.length > 214) {
    return "Project name must be 214 characters or fewer";
  }
  return true;
}

export function detectPackageManager(): "npm" | "yarn" | "pnpm" {
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.startsWith("yarn")) return "yarn";
    if (userAgent.startsWith("pnpm")) return "pnpm";
  }
  return "npm";
}

export function isCommandAvailable(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function getInstallCommand(packageManager: "npm" | "yarn" | "pnpm"): string {
  switch (packageManager) {
    case "yarn":
      return "yarn install";
    case "pnpm":
      return "pnpm install";
    default:
      return "npm install";
  }
}

export function getRunCommand(packageManager: "npm" | "yarn" | "pnpm", script: string): string {
  switch (packageManager) {
    case "yarn":
      return `yarn ${script}`;
    case "pnpm":
      return `pnpm ${script}`;
    default:
      return `npm run ${script}`;
  }
}

export function toAppSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function log(message: string): void {
  console.log(message);
}

export function logStep(step: string): void {
  console.log(chalk.cyan(`\n> ${step}`));
}

export function logSuccess(message: string): void {
  console.log(chalk.green(`  ${message}`));
}

export function logWarning(message: string): void {
  console.log(chalk.yellow(`  ${message}`));
}

export function logError(message: string): void {
  console.error(chalk.red(`  ${message}`));
}
