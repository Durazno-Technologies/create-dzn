#!/usr/bin/env node
import { cyan, magenta, green, red } from 'colorette';
import inquirer from 'inquirer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import createNewEntity from "../entity.js";

const yarg = yargs(hideBin(process.argv));

// Yargs stored version number
yarg.version('1.0.5');

const validDataTypes = {
  string: true,
  boolean: true,
  number: true,
}

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

const coarseDataType = text => {
  try {
    const properties = {};
    coarseString(text)
      .split(';')
      .map(tuple => {
        const [originalKey, dataType] = tuple.split(':');
        const key = originalKey.endsWith('?') ? originalKey.slice(0, -1) : originalKey;
        if (key.length === 0) {
          throw new Error(red('property name should not be empty'));
        }
        if (!validDataTypes[dataType]) {
          throw new Error(`${red("invalid dataType")} ${dataType}`);
        }
        properties[key] = {
          dataType,
          required: !originalKey.endsWith('?'),
        };
      });
    if (Object.keys(properties).length > 0) {
      return properties;
    }
  } catch (err) {
    console.error(err.message);
  }
  throw new Error(`"${red(text)}" has not a valid format. Review usage examples`);
}

const builder = (command) =>
  command
    .positional("singularName", {
      describe: "Entity singular name. Example woman",
      coerce: coarseString
    })
    .positional("pluralName", {
      describe: "Entity plural name. Example women",
      coerce: coarseString
    })
    .positional("properties", {
      describe: 'Optional or required properties with names and datatypes. Example "id:number;name:string;married?:boolean"',
      coerce: coarseDataType
    });

const handler = async ({ singularName, pluralName, properties }) => {
  console.log(cyan("your new entity singular name is"), singularName);
  console.log(cyan("your new entity plural name is"), pluralName);
  console.log(magenta("your new entity properties are"), properties, "\n");

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
