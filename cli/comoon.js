import { red } from 'colorette';

export const versionNumber = '1.0.8';

export const questionContinue = [
  {
      type: 'confirm',
      name: 'canContinue',
      message: 'Are you happy with these settings?',
      default: true
  }
];

export const coarseString = text => {
  try {
    const value = text.toString();
    if (value.length > 0) {
      return value;
    }
  } catch (err) {
    console.error(err.message);
  }
  throw new Error(red("param cannot be empty"));
};

const validDataTypes = {
  string: true,
  boolean: true,
  number: true,
};

export const coarseDataType = text => {
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
};
