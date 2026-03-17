import prompts from "prompts";
import type { ProjectOptions } from "./types.js";
import { detectPackageManager, validateProjectName, logError } from "./utils.js";

export async function getProjectOptions(projectNameArg?: string): Promise<ProjectOptions | null> {
  const defaultPm = detectPackageManager();

  // Handle ctrl+c gracefully
  let cancelled = false;
  const onCancel = () => {
    cancelled = true;
    return false;
  };

  const questions: prompts.PromptObject[] = [];

  // Only prompt for project name if not provided as argument
  if (!projectNameArg) {
    questions.push({
      type: "text",
      name: "projectName",
      message: "What is your project name?",
      initial: "my-stark-app",
      validate: (value: string) => {
        const result = validateProjectName(value);
        return result === true ? true : result;
      },
    });
  }

  questions.push(
    {
      type: "confirm",
      name: "includeContracts",
      message: "Include example smart contracts (StarkNet Foundry)?",
      initial: true,
    },
    {
      type: "select",
      name: "packageManager",
      message: "Which package manager do you want to use?",
      choices: [
        { title: "npm", value: "npm" },
        { title: "yarn", value: "yarn" },
        { title: "pnpm", value: "pnpm" },
      ],
      initial: defaultPm === "yarn" ? 1 : defaultPm === "pnpm" ? 2 : 0,
    },
  );

  const responses = await prompts(questions, { onCancel });

  if (cancelled) {
    logError("Setup cancelled.");
    return null;
  }

  const projectName = projectNameArg || responses.projectName;

  return {
    projectName,
    includeContracts: responses.includeContracts ?? true,
    packageManager: responses.packageManager ?? defaultPm,
    skipInstall: false,
    skipGit: false,
  };
}
