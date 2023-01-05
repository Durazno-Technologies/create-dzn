import { cyanBright, green, red, yellowBright } from 'colorette';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const myPathAsLibraryInsideNodeModules = dirname(fileURLToPath(import.meta.url));
const originalUserDir = process.cwd();
const templates = {
  __SINGLE_TITLE__: '',
  __SINGLE__: '',
  __TABLE_NAME__: '',
}
const files = {
  databaseIndexService: {
    source: join(originalUserDir, 'src', 'database', 'services', 'index.ts'),
    dest: null,
    replacements: {
      '// do not edit, import services': `// do not edit, import services
import __SINGLE_TITLE__Service from "./__SINGLE__Service";`,
      '} = process.env;': `\t__TABLE_NAME__,
} = process.env;`,
      '// do not edit, export services': `// do not edit, export services
export const __SINGLE__Service = new __SINGLE_TITLE__Service(createDynamoDBClient(), __TABLE_NAME__);`,
    }
  },
}

const injectNewValues = (str) => str
  .replace('__SINGLE_TITLE__', templates.__SINGLE_TITLE__)
  .replace('__SINGLE__', templates.__SINGLE__)
  .replace('__TABLE_NAME__', templates.__TABLE_NAME__);

const updateLocalValues = async (singularName, pluralName) => new Promise(
  (resolve) => {
    // change vars
    templates.__SINGLE_TITLE__ = `${
      singularName[0].toUpperCase()
    }${
      singularName.slice(1).toLowerCase()
    }`;
    templates.__SINGLE__ = singularName.toLowerCase();
    templates.__TABLE_NAME__ = `${pluralName.toUpperCase()}_TABLE`;
    
    // apply changes to all files
    for (const keyFile in files) {
      let contents = readFileSync(
        files[keyFile].source,
        { encoding: 'utf-8' }
      );
      for (const [key, val] of Object.entries(files[keyFile].replacements)) {
        contents = contents.replace(key, injectNewValues(val));
      }
      writeFileSync(
        files[keyFile].dest || files[keyFile].source,
        contents,
        { encoding: 'utf-8' }
      );
    }
    resolve('success');
  }
);

const createNewEntity = async (singularName, pluralName, properties) => {
  try {
    await updateLocalValues(singularName, pluralName);
    console.log(
      green(`new entity ${cyanBright(singularName)} was created`),
      green("\nthese files were modified in your project\n"),
      yellowBright(files.databaseIndexService.source + '\n'),
      yellowBright(files.databaseIndexService.source + '\n'),
      green("\n\nthese files were added to your project\n"),
      yellowBright(yellowBright(files.databaseIndexService.source) + '\n'),
      yellowBright(yellowBright(files.databaseIndexService.source) + '\n'),
      yellowBright(yellowBright(files.databaseIndexService.source) + '\n'),
    );
  } catch (err) {
    console.error(err.message);
    throw new Error(`failed creating new entity with name ${
      red(singularName)
    }`);
  }
};

export default createNewEntity;
