export interface ProjectOptions {
  projectName: string;
  includeContracts: boolean;
  packageManager: "npm" | "yarn" | "pnpm";
  skipInstall: boolean;
  skipGit: boolean;
}

export interface TemplateFile {
  path: string;
  content: string;
}
