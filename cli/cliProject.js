#!/usr/bin/env node
import { cyan, magenta, green, red } from 'colorette';
import inquirer from 'inquirer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import createNewProject from "../project.js";

const yarg = yargs(hideBin(process.argv));

// Yargs stored version number
yarg.version('0.2.22');

const coarseString = text => {
  try {
    const value = text.toString();
    if (value.length > 0) {
      return value;
    }
  } catch (err) {
    console.error(err.message);
  }
  throw new Error(red("param cannot be empty"));
}

const builder = (command) =>
  command
    .positional("projectName", {
      describe: "The name of your backend new project",
      coerce: coarseString
    });

const handler = async ({ projectName }) => {
  console.log(cyan("your new project name is"), projectName);

  const questionContinue = [
    {
        type: 'confirm',
        name: 'canContinue',
        message: 'Are you happy with these settings?',
        default: true
    }
  ];
  
  const answer = await inquirer.prompt(questionContinue);
  
  if(!answer.canContinue) {
    console.log(red("aborting process... bye"));
    process.exit();
  }
  
  console.log(green("creating new project with the above settings... please wait"));
  createNewProject(projectName);
};

yarg.command(
  "* <projectName>",
  false,
  builder,
  handler,
).parse();
