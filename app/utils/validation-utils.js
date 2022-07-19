const { pick } = require('lodash');

function validateAndConvert(type, value, key, errorStack, options = {}) {
  if (type == 'integer') {
    value = parseInt(value);
    if (isNaN(value)) {
      errorStack.push(`${key}: Invalid number`);
    }
  } else if (type == 'boolean') {
    if (value === true || value === 'true') {
      value = true;
    } else if (value === false || value === 'false') {
      value = false;
    } else {
      errorStack.push(`${key}: Invalid boolean`);
    }
  } else if (type == 'date') {
    value = new Date(value);
    if (isNaN(value.getTime())) {
      errorStack.push(`${key}: Invalid date`);
    }
  } else if (type == 'array') {
    if (value instanceof Array == false) {
      errorStack.push(`${key}: Invalid array`);
    }
  } else if (type == 'string') {
    if (typeof value != 'string') {
      errorStack.push(`${key}: Invalid string`);
    } else {
      value = value.toString();
    }

    if (options.lowerCase == true) {
      value = value.toLowerCase();
    }
  } else if (type == 'array or string') {
    if (typeof value != 'string' && value instanceof Array == false) {
      errorStack.push(`${key}: Invalid array or string`);
    }
  }

  return value;
}

function isEmpty(type, value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (type == 'string') {
    return value == '';
  }
  if (type == 'array') {
    return value.length == 0;
  }

  return false;
}

function validateOrReject(obj, schemaProperties, options = {}) {
  options.strict = options.strict || true;

  let schemaPropertiesKeys = Object.keys(schemaProperties);

  let errorStack = [];
  let allPromises = [];
  schemaPropertiesKeys.forEach((key) => {
    let type = schemaProperties[key].type;
    let value = obj[key];

    if (isEmpty(type, value)) {
      if (schemaProperties[key].required == true) {
        errorStack.push(`${key}: Is required`);
      } else {
        if (type == 'array' && value === null) {
          obj[key] = [];
        } else if (type == 'string' && value === '') {
          obj[key] = null;
        }

        if (schemaProperties[key].defaultToUndefined === true) {
          delete obj[key];
        } else if (
          schemaProperties[key].defaultValue !== undefined &&
          obj[key] !== undefined
        ) {
          obj[key] = schemaProperties[key].defaultValue;
        }
      }
    } else {
      obj[key] = validateAndConvert(type, value, key, errorStack, {
        lowerCase: schemaProperties[key].lowerCase,
      });
      value = obj[key];
      if (
        schemaProperties[key].availableValues &&
        !schemaProperties[key].availableValues.includes(value)
      ) {
        errorStack.push(
          `${key}: Invalid value ${value}. AvailableValues are: [${schemaProperties[
            key
          ].availableValues.join(', ')}]`
        );
      }

      if (schemaProperties[key].childProperties) {
        allPromises.push(
          validateOrReject(
            value,
            schemaProperties[key].childProperties,
            options
          ).then((cleanChild) => {
            obj[key] = cleanChild;
          })
        );
      }
    }
  });
  if (errorStack.length > 0) {
    return Promise.reject(errorStack);
  }
  if (options.strict == true) {
    obj = pick(obj, schemaPropertiesKeys);
  }

  return Promise.all(allPromises).then(() => obj);
}

module.exports = {
  validateOrReject,
};
