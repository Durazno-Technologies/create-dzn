#!/usr/bin/env node
import { cyan, green, red } from 'colorette';
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
    })
    .option('localDynamoDB', {
      require: false,
      describe: "install a local dynamodb instance",
      default: false,
    });

const handler = async ({ projectName, localDynamoDB }) => {
  console.log(cyan("your new project name is"), projectName);
  console.log(cyan("Install Local DynamoDB?"), localDynamoDB ? 'Yes' : 'No');
  const answer = await inquirer.prompt(questionContinue);
  
  if(!answer.canContinue) {
    console.log(red("aborting process... bye"));
    process.exit();
  }
  
  console.log(green("creating new project with the above settings... please wait"));

  const options = {
    installLocalDynamoDB: localDynamoDB,
  };

  try {
    await createNewProject(projectName, options);
  } catch (err) {
    console.error(err.message);
    process.exit()
  }
};

yarg.command(
  "* <projectName> [localDynamoDB]",
  false,
  builder,
  handler,
).parse();
