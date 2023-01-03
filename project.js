import { red, magentaBright, greenBright } from 'colorette';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { spawn } from 'child_process';

const duraznoBackendSeed = 'git@github.com:Durazno-Technologies/durazno-backend-seed.git';
const originalUserDir = process.cwd();

const downloadFromGitHub = async (projectName) => new Promise(
  (resolve) => {
    if (existsSync(join(originalUserDir, projectName))) {
      throw new Error(`folder ${magentaBright(projectName)} already exists in the current path`);
    }
    console.log('downloading git repo...');
    mkdirSync(join(originalUserDir, projectName));
    const git = spawn('git', ['clone', duraznoBackendSeed, projectName]);
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

const installDependencies = async () => new Promise(
  (resolve) => {
    console.log('installing dependencies...');
    const npmi = spawn('npm', ['install']);
    npmi.stdout.on('data', (data) => process.stdout.write(data.toString()));
    npmi.stderr.on('data', (data) => process.stdout.write(data.toString()));
    npmi.on('close', (code) => {
      if (code !== 0) {
        throw new Error(`${greenBright('npm')} failed with error code ${code}`);
      }
      const dynamo = spawn('npx', ['sls', 'dynamodb', 'install']);
      dynamo.stdout.on('data', (data) => process.stdout.write(data.toString()));
      dynamo.stderr.on('data', (data) => process.stdout.write(data.toString()));
      npmi.on('close', (code) => {
        if (code !== 0) {
          throw new Error(`${greenBright('dynamo')} failed with error code ${code}`);
        }
        resolve(code);
      });
    });
  }
);

const updateLocalValues = () => {
  console.log('updating local values');
};

const createNewProject = async (projectName) => {
  try {
    await downloadFromGitHub(projectName);
    process.chdir(projectName);
    await installDependencies();
    process.chdir(originalUserDir);
    updateLocalValues();
  } catch (err) {
    console.error(err.message);
    throw new Error(`failed creating new project with name ${red(projectName)}`);
  }
};

export default createNewProject;
