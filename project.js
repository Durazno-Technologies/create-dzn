import { cyanBright, red, magentaBright, green, greenBright } from 'colorette';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';
import { userInfo } from 'os';

const duraznoBackendSeed = 'git@github.com:Durazno-Technologies/durazno-backend-seed.git';
const originalUserDir = process.cwd();

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

const installDependencies = async () => new Promise(
  (resolve) => {
    console.log('installing dependencies...');
    const npmi = spawn('npm', ['install'], { timeout: 60 * 5 * 1000 });
    npmi.stdout.on('data', (data) => process.stdout.write(data.toString()));
    npmi.stderr.on('data', (data) => process.stdout.write(data.toString()));
    npmi.on('close', (code) => {
      if (code !== 0) {
        throw new Error(`${greenBright('npm')} failed with error code ${code}`);
      }
      const dynamo = spawn('npx', ['sls', 'dynamodb', 'install'], { timeout: 60 * 5 * 1000});
      dynamo.stdout.on('data', (data) => process.stdout.write(data.toString()));
      dynamo.stderr.on('data', (data) => process.stdout.write(data.toString()));
      dynamo.on('close', (code) => {
        if (code !== 0) {
          throw new Error(`${greenBright('dynamo')} failed with error code ${code}`);
        }
        resolve(code);
      });
    });
  }
);

const updateLocalValues = async (projectName) => new Promise(
  (resolve) => {
    console.log('updating local values...');
    let contents = readFileSync('package.json', { encoding: 'utf-8' });
    contents = contents.replace(/durazno-backend-seed/, projectName);
    contents = contents.replace(/richi/, userInfo().username);
    writeFileSync('package.json', contents, { encoding: 'utf-8' });
    contents = readFileSync('serverless.yml', { encoding: 'utf-8' });
    contents = contents.replace(/book-quote/g, projectName);
    writeFileSync('serverless.yml', contents, { encoding: 'utf-8' });
    resolve();
  }
);

const createNewProject = async (projectName) => {
  try {
    await downloadFromGitHub(projectName);
    process.chdir(projectName);
    await installDependencies();
    await updateLocalValues(projectName);
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
