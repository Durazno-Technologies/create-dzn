import * as uuid from "uuid"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export const templates = {
  __REQUEST_DELETE_UUID__:  `req_${uuid.v4().split('-').join('')}`,
  __REQUEST_GET_UUID__:     `req_${uuid.v4().split('-').join('')}`,
  __REQUEST_GETALL_UUID__:  `req_${uuid.v4().split('-').join('')}`,
  __REQUEST_PUT_UUID__:     `req_${uuid.v4().split('-').join('')}`,
  __REQUEST_POST_UUID__:    `req_${uuid.v4().split('-').join('')}`,
  __KEY_PAIR_UUID__:       `pair_${uuid.v4().split('-').join('')}`,
  __REQUEST_GROUP_UUID__:   `fld_${uuid.v4().split('-').join('')}`,
  __API_SPEC_UUID__:        `spc_${uuid.v4().split('-').join('')}`,
  __LOCAL_ENV_UUID__:       `env_${uuid.v4().split('-').join('')}`,
  __AMAZON_ENV_UUID__:      `env_${uuid.v4().split('-').join('')}`,
  __ENVIRONMENT_UUID__:     `env_${uuid.v4().split('-').join('')}`,
  __WORKSPACE_UUID__:       `wrk_${uuid.v4().split('-').join('')}`,
  __EPOCH_TIME__:     (new Date()).getTime(),
  __EPOCH_PLUS_ONE__: (new Date()).getTime() + 1,
  __FULL_DATE__:      (new Date()).toISOString(),
  __PROJECT_NAME__: '',
  __SINGLE_TITLE__: 'User',
  __PLURAL_TITLE__: 'Users',
  __TABLE_NAME__: '',
  __SINGLE__: 'user',
  __PLURAL__: 'users',
};

export const injectNewValues = (str, global = false) => {
  for (const key in templates) {
    str = str.replace(
      new RegExp(key, global ? 'g' : ''),
      templates[key],
    );
  }
  return str;
};

export const updateLocalValues = async (
  properties, files,
) => new Promise(
  (resolve) => {
    // apply changes to all files
    for (const keyFile in files) {
      
      // step (1) READ
      let contents = readFileSync(
        files[keyFile].source,
        { encoding: 'utf-8' },
      );
      
      // step (2) REPLACE
      files[keyFile].dest = files[keyFile]
        .dest ? injectNewValues(files[keyFile].dest) : null;
      if (properties && files[keyFile].injectProperties) {
        const myProps = Object.keys(properties)
          .map(property => `  ${property}${
            properties[property].required ? '' : '?'
          }: ${properties[property].dataType};`);
        myProps.push('}');
        files[keyFile].inlineReplacements['}'] = myProps.join('\n');
      }
      for (const [key, val] of Object
        .entries(files[keyFile].inlineReplacements)) {
          contents = contents.replace(key, injectNewValues(val));
      }
      if (files[keyFile].globalReplacements) {
        contents = injectNewValues(contents, true);
      }
      
      // step (3) WRITE
      if (!existsSync(dirname(files[keyFile].dest || files[keyFile].source))) {
        mkdirSync(
          dirname(files[keyFile].dest || files[keyFile].source),
          { recursive: true }
        );
      }
      writeFileSync(
        files[keyFile].dest || files[keyFile].source,
        contents,
        { encoding: 'utf-8' },
      );
    }

    // resolve promise
    resolve('success');
  }
);
