import { cyanBright, red, magentaBright, green, greenBright } from 'colorette';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';
import { userInfo } from 'os';
import { dump } from 'js-yaml';
import { fileURLToPath } from 'url';
import { templates, updateLocalValues } from './utils.js';

const duraznoBackendSeed = 'git@github.com:Durazno-Technologies/durazno-backend-seed.git';
const originalUserDir = process.cwd();

const myPathAsLibraryInsideNodeModules = dirname(
  fileURLToPath(import.meta.url),
);

const files = {
  insomniaProjectYaml: {
    source: join(
      myPathAsLibraryInsideNodeModules,
      'newEntityBaseCode',
      'project.yaml'
    ),
    dest: null,
    inlineReplacements: {},
    globalReplacements: true,
  },
};

const downloadFromGitHub = async (projectName) => new Promise(
  (resolve) => {
    if (existsSync(join(originalUserDir, projectName))) {
      throw new Error(`folder ${magentaBright(projectName)} already exists in the current path`);
    }
    console.log('downloading git repo...');
    mkdirSync(join(originalUserDir, projectName));
    const git = spawn('git', ['clone', duraznoBackendSeed, projectName], { timeout: 60 * 5 * 1000});
    git.stdout.on('data', (data) => process.stdout.write(data.toString()));
    git.stderr.on('data', (data) => process.stdout.write(data.toString()));
    git.on('close', (code) => {
      if (code !== 0) {
        throw new Error(`${greenBright('git')} failed with error code ${code}`);
      }
      resolve(code);
    });
  }
);

const installDependencies = async (options) => new Promise(
  (resolve) => {
    console.log('installing dependencies...');
    const npmi = spawn('npm', ['install'], { timeout: 60 * 5 * 1000 });
    npmi.stdout.on('data', (data) => process.stdout.write(data.toString()));
    npmi.stderr.on('data', (data) => process.stdout.write(data.toString()));
    npmi.on('close', (code) => {
      if (code !== 0) {
        throw new Error(`${greenBright('npm')} failed with error code ${code}`);
      }

      if (options.installLocalDynamoDB) {
        const dynamo = spawn('npx', ['sls', 'dynamodb', 'install'], { timeout: 60 * 5 * 1000});
        dynamo.stdout.on('data', (data) => process.stdout.write(data.toString()));
        dynamo.stderr.on('data', (data) => process.stdout.write(data.toString()));
        dynamo.on('close', (code) => {
          if (code !== 0) {
            throw new Error(`${greenBright('dynamo')} failed with error code ${code}`);
          }
          resolve(code);
        });
      } else {
        resolve(code);
      }
    });
  }
);

const updateConfigFiles = async (projectName) => new Promise(
  (resolve) => {
    console.log(
      'updating values inside package.json and serverless.yml files',
    );
    
    // update package.json file
    let contents = readFileSync('package.json', { encoding: 'utf-8' });
    contents = contents.replace(/durazno-backend-seed/, projectName);
    contents = contents.replace(/richi/, userInfo().username);
    writeFileSync('package.json', contents, { encoding: 'utf-8' });

    // update serverless.yml file
    contents = readFileSync('serverless.yml', { encoding: 'utf-8' });
    contents = contents.replace(/book-quote/g, projectName);
    writeFileSync('serverless.yml', contents, { encoding: 'utf-8' });

    // resolve promise
    resolve('success');
  }
);

const generateInsomniaProjectFile = async (projectName) => new Promise(
  async (resolve) => {
    
    // write to settings file the generated values
    const mySettings = {
      __PROJECT_NAME__: `${
        projectName[0].toUpperCase()
      }${
        projectName.slice(1).toLowerCase()
      }`,
      __KEY_PAIR_UUID__: templates.__KEY_PAIR_UUID__,
      __API_SPEC_UUID__: templates.__API_SPEC_UUID__,
      __LOCAL_ENV_UUID__: templates.__LOCAL_ENV_UUID__,
      __AMAZON_ENV_UUID__: templates.__AMAZON_ENV_UUID__,
      __ENVIRONMENT_UUID__: templates.__ENVIRONMENT_UUID__,
      __WORKSPACE_UUID__: templates.__WORKSPACE_UUID__,
    };
    writeFileSync(
      'settings.yml',
      dump(mySettings),
      { encoding: 'utf-8' },
    );

    // inject and override extracted settings into templates values
    for (const key in mySettings) {
      templates[key] = mySettings[key];
    }
    
    // update template values
    files.insomniaProjectYaml.dest = join(
      originalUserDir,
      projectName,
      'insomnia__PROJECT_NAME__Project.yml',
    )
    await updateLocalValues(null, files);

    // resolve promise
    resolve('success');
  }
);

const createNewProject = async (projectName, options) => {
  try {
    await downloadFromGitHub(projectName);
    process.chdir(projectName);
    await installDependencies(options);
    await updateConfigFiles(projectName);
    await generateInsomniaProjectFile(projectName);
    process.chdir(originalUserDir);
    console.log(
      green("new folder was created within folder"),
      greenBright(projectName),
      '\n',
      green(`please check de ${
        cyanBright('serverless.yml')
      } file,\n then generate some new entities`),
      green("and when you feel ready,"),
      '\n',
      green("deploy your lambda functions to AWS using the command:\n"),
      cyanBright('yarn deploy'),
    );
  } catch (err) {
    console.error(err.message);
    throw new Error(`failed creating new project with name ${red(projectName)}`);
  }
};

export default createNewProject;
