#!/usr/bin/env node
import { cyan, magenta, green, red } from 'colorette';
import inquirer from 'inquirer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import createNewEntity from "../entity.js";
import {
  questionContinue,
  versionNumber,
  coarseString,
  coarseDataType,
} from "./comoon.js";

const yarg = yargs(hideBin(process.argv));

// Yargs stored version number
yarg.version(versionNumber);

const builder = (command) =>
  command
    .positional("singularName", {
      describe: "Entity singular name",
      coerce: coarseString,
      default: 'woman',
    })
    .positional("pluralName", {
      describe: "Entity plural name",
      coerce: coarseString,
      default: 'women',
    })
    .positional("properties", {
      describe: 'Properties with types',
      coerce: coarseDataType,
      default: "id:string;married?:boolean",
    });

const handler = async ({ singularName, pluralName, properties }) => {
  console.log(cyan("your new entity singular name is"), singularName);
  console.log(cyan("your new entity plural name is"), pluralName);
  console.log(magenta("your new entity properties are"), properties, "\n");
  
  const answer = await inquirer.prompt(questionContinue);
  
  if(!answer.canContinue) {
    console.log(red("aborting process... bye"));
    process.exit();
  }
  
  console.log(green("creating new entity with the above settings... please wait"));
  try {
    await createNewEntity(singularName, pluralName, properties);
  } catch (err) {
    console.error(err.message);
    process.exit()
  }
};

yarg.command(
  "* <singularName> <pluralName> <properties>",
  false,
  builder,
  handler,
).parse();
