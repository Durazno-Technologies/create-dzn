import { cyanBright, green, red, yellowBright } from 'colorette';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const myPathAsLibraryInsideNodeModules = dirname(fileURLToPath(import.meta.url));
const originalUserDir = process.cwd();
const templates = {
  __SINGLE_TITLE__: '',
  __SINGLE__: '',
  __TABLE_NAME__: '',
};
const files = {
  databaseIndexService: {
    source: join(originalUserDir, 'src', 'database', 'services', 'index.ts'),
    dest: null,
    inlineReplacements: {
      '// do not edit, import services': `// do not edit, import services
import __SINGLE_TITLE__Service from "./__SINGLE__Service";`,
      '} = process.env;': `  __TABLE_NAME__,
} = process.env;`,
      '// do not edit, export services': `// do not edit, export services
export const __SINGLE__Service = new __SINGLE_TITLE__Service(createDynamoDBClient(), __TABLE_NAME__);`,
    },
    globalReplacements: false,
  },
  databaseService: {
    source: join(
      myPathAsLibraryInsideNodeModules,
      'newEntityBaseCode',
      'service.ts'
    ),
    dest: join(
      originalUserDir,
      'src',
      'database',
      'services',
      '__SINGLE__Service.ts',
    ),
    inlineReplacements: {},
    globalReplacements: true,
  },
  dataTransferObject: {
    source: join(
      myPathAsLibraryInsideNodeModules,
      'newEntityBaseCode',
      'dto.ts'
    ),
    dest: join(
      originalUserDir,
      'src',
      'dtos',
      '__SINGLE_TITLE__Dto.ts',
    ),
    inlineReplacements: {},
    globalReplacements: true,
  },
  model: {
    source: join(
      myPathAsLibraryInsideNodeModules,
      'newEntityBaseCode',
      'model.ts'
    ),
    dest: join(
      originalUserDir,
      'src',
      'models',
      '__SINGLE_TITLE__.ts',
    ),
    inlineReplacements: {},
    globalReplacements: true,
    injectProperties: true,
  },
  create: {
    source: join(
      myPathAsLibraryInsideNodeModules,
      'newEntityBaseCode',
      'create.ts'
    ),
    dest: join(
      originalUserDir,
      'src',
      'functions',
      '__SINGLE__',
      'create__SINGLE_TITLE__.ts',
    ),
    inlineReplacements: {},
    globalReplacements: true,
  },
};

const injectNewValues = (str, global = false) => str
  .replace(new RegExp('__SINGLE_TITLE__', global ? 'g' : ''), templates.__SINGLE_TITLE__)
  .replace(new RegExp('__SINGLE__', global ? 'g' : ''), templates.__SINGLE__)
  .replace(new RegExp('__TABLE_NAME__', global ? 'g' : ''), templates.__TABLE_NAME__);

const updateLocalValues = async (singularName, pluralName, properties) => new Promise(
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
      // step (1) READ
      let contents = readFileSync(
        files[keyFile].source,
        { encoding: 'utf-8' }
      );
      // step (2) REPLACE
      files[keyFile].dest = files[keyFile].dest ? injectNewValues(files[keyFile].dest) : null;
      if (files[keyFile].injectProperties) {
        const myProps = Object.keys(properties)
          .map(property => `  ${property}${
            properties[property].required ? '?' : ''
          }: ${properties[property].dataType};`);
        myProps.push('}');
        files[keyFile].inlineReplacements['}'] = myProps.join('\n');
      }
      for (const [key, val] of Object.entries(files[keyFile].inlineReplacements)) {
        contents = contents.replace(key, injectNewValues(val));
      }
      if (files[keyFile].globalReplacements) {
        contents = injectNewValues(contents, true);
      }
      // step (3) WRITE
      if (!existsSync(dirname(files[keyFile].dest || files[keyFile].source))) {
        mkdirSync(dirname(files[keyFile].dest || files[keyFile].source), { recursive: true });
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
    await updateLocalValues(singularName, pluralName, properties);
    console.log(
      green(`new entity ${cyanBright(singularName)} was created`),
      green("\n\nthese files were modified in your project"),
    );
    for (const keyFile in files) {
      if (!files[keyFile].dest) {
        console.log(yellowBright(files[keyFile].source));
      }
    }
    console.log(
      green("\nthese files were added to your project"),
    );
    for (const keyFile in files) {
      if (files[keyFile].dest) {
        console.log(yellowBright(files[keyFile].dest));
      }
    }
  } catch (err) {
    console.error(err.message);
    throw new Error(`failed creating new entity with name ${
      red(singularName)
    }`);
  } finally {
    console.log('');
  }
};

export default createNewEntity;
