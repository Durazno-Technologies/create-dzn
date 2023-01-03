import { red } from 'colorette';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { spawn } from 'child_process';

const duraznoBackendSeed = 'git@github.com:Durazno-Technologies/durazno-backend-seed.git';
const originalUserDir = process.cwd();

const downloadFromGitHub = async (projectName) => new Promise(
  (resolve, reject) => {
    console.log('downloading git repo...');
    mkdirSync(join(originalUserDir, projectName));
    const git = spawn('git', ['clone', duraznoBackendSeed, projectName]);
    git.stdout.on('data', (data) => process.stdout.write(data.toString()));
    git.stderr.on('data', (data) => process.stdout.write(data.toString()));
    git.on('close', (code) => code ? reject(code) : resolve(code));
  }
);

const installDependencies = () => {
  console.log('installing dependencies');
};

const updateLocalValues = () => {
  console.log('updating local values');
};

const createNewProject = async (projectName) => {
  try {
    await downloadFromGitHub(projectName);
    installDependencies();
    updateLocalValues();
  } catch (err) {
    console.error(err.message);
    throw new Error(`failed creating new project with name ${red(projectName)}`);
  }
};

export default createNewProject;
