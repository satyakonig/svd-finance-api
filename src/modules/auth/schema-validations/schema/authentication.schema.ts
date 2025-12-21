import * as Joi from 'joi';

export const AuthenticationSchema = Joi.object({
  key: Joi.required(),
}).options({
  abortEarly: false,
});
