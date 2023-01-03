import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const createNewEntity = async (singularName, pluralName, properties) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  console.log('__dirname', __dirname);
  console.log('cwd', process.cwd());
};

export default createNewEntity;
