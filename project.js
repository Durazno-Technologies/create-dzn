const downloadFromGitHub = () => {
  console.log('downloading git repo');
};

const installDependencies = () => {
  console.log('installing dependencies');
};

const updateLocalValues = () => {
  console.log('updating local values');
};

const createNewProject = () => {
  downloadFromGitHub();
  installDependencies();
  updateLocalValues();
};

export default createNewProject;
