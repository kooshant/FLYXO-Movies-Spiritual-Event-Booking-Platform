import { validationResult } from 'express-validator';
import { error } from '../utils/apiResponse.js';

/** Run express-validator rules and return errors */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation failed', 400, errors.array());
  }
  next();
};
