#!/usr/bin/env node
import { cyan, cyanBright, green, greenBright, red } from 'colorette';
import inquirer from 'inquirer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import createNewProject from "../project.js";
import { questionContinue, versionNumber, coarseString } from "./comoon.js";

const yarg = yargs(hideBin(process.argv));

// Yargs stored version number
yarg.version(versionNumber);

const builder = (command) =>
  command
    .positional("projectName", {
      describe: "The name of your backend new project",
      coerce: coarseString
    });

const handler = async ({ projectName }) => {
  console.log(cyan("your new project name is"), projectName);
  const answer = await inquirer.prompt(questionContinue);
  
  if(!answer.canContinue) {
    console.log(red("aborting process... bye"));
    process.exit();
  }
  
  console.log(green("creating new project with the above settings... please wait"));
  try {
    await createNewProject(projectName);
  } catch (err) {
    console.error(err.message);
    process.exit()
  }
};

yarg.command(
  "* <projectName>",
  false,
  builder,
  handler,
).parse();
