import * as validator from 'express-validator';

export const validateDisplayName = (
  options: { optional?: boolean } = { optional: false }
) =>
  validator
    .body('displayName')
    .optional(options.optional)
    .isString()
    .notEmpty()
    .withMessage('must be a string')
    .isLength({ min: 3, max: 15 })
    .withMessage('must be between 3 and 15 chars long');
