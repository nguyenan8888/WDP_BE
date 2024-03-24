import _ from "lodash";

export const message = {
  required: (field) => `${_.capitalize(field)} is required`,
  invalid: (field) => `${_.capitalize(field)} is invalid`,
  incorrect: (field) => `${_.capitalize(field)} is incorrect`,
  notFound: (field) => `${_.capitalize(field)} is not existed`,
  existed: (field) => `${_.capitalize(field)} is already exists`,
  new: (field) => `New ${_.capitalize(field)} must be different from old ${_.capitalize(field)}`,
  stringLengthInRange: ({ field, min, max }) =>
    `${_.capitalize(
      field
    )} must be greater or equal than ${min} and less or equal than ${max} characters`,
  mustBeOneOf: ({ field, values }) =>
    `${_.capitalize(field)} must be one of [${values}]`,
  mustBeNumberAndGreaterThanOrEqual: ({ field, value = 1 }) =>
    `${_.capitalize(field)} must be number and greater than or equal ${value}`,
  exist: (field) => `${_.capitalize(field)} is already exists`,
};
