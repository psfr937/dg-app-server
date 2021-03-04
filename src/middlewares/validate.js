import axios from 'axios';
import Errors from '../constants/Errors';
import configs from '../config';
import { validation, validateErrorObject } from '../utils/validateError';
import { q, qNonEmpty } from '../utils/q'
import asyncRoute from "../utils/asyncRoute";

export const form = (formPath, onlyFields = []) => (req, res, next) => {
    let errors = validation(formPath)({
      ...req.body,
      ...req.files
    });

    if (onlyFields.length > 0) {
      const newErrors = {};
      onlyFields.forEach(field => {
        newErrors[field] = errors[field];
      });
      errors = newErrors;
    }

    if (!validateErrorObject(errors)) {
      res.pushError(Errors.INVALID_DATA, {
        errors
      });
      return res.errors();
    }
    return next();
  }

export const rankPermission = right => async(req,res, next) => {
  let result
  console.log(right)
  try {
     result = await q(`
                SELECT role_id
                FROM permissions p
                         INNER JOIN rights r ON p.right_id = r.id
                WHERE r.action = $1`,
      [right]);
  }
  catch(err){
    console.log(err)
    res.pushError([Errors.UNEXPECTED_ERROR])
    return res.errors()
  }

  const allowedRoles = result.rows.map(r => r.role_id)
  console.log(allowedRoles)
  console.log(req.user.role_id)
  if(allowedRoles.indexOf(req.user.role_id) < 0){
    res.pushError(Errors.PERMISSION_DENIED);
    return res.errors();
  }
  return next()
  }

export const verifyUserNonce = nonceKey => asyncRoute(async (req, res, next) => {
    const { id, nonce } = req.decodedPayload;
    console.log(id);
    console.log(nonce);
    const user = (await qNonEmpty('SELECT * FROM users WHERE id = $1', [id])
    ).rows[0];
    if (nonce !== user[nonceKey]) {
      return res.errors([Errors.TOKEN_REUSED]);
    }
    req.user = user;
    return next();
  });

export const recaptcha = (req, res, next) => {
    if (process.env.NODE_ENV === 'test' || !configs.recaptcha) {
      return next();
    }
    axios
      .post('https://www.google.com/recaptcha/api/siteverify')
      .type('form')
      .send({
        secret: configs.recaptcha[process.env.NODE_ENV].secretKey,
        response: req.body.recaptcha
      })
      .end((err, { body } = {}) => {
        if (err) {
          res.pushError(Errors.UNKNOWN_EXCEPTION, {
            meta: err
          });
          return res.errors();
        }
        if (!body.success) {
          res.pushError(Errors.INVALID_RECAPTCHA, {
            meta: body['error-codes']
          });
          return res.errors();
        }
        return next();
      });
    return next();
  }
