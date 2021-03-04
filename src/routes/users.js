import userController from "../controllers/users"
import { jwt } from '../config';
import bodyParser from '../middlewares/bodyParser';
import { jwtAuth } from '../middlewares/jwtAuth';
import mailController from '../controllers/mail';
import { form, recaptcha, verifyUserNonce } from '../middlewares/validate';

export default app => {
  // user
  app.get('/users', userController.list);

  app.post(
    '/users',
    bodyParser.json,
    userController.emailRegister,
    mailController.activateAccountMail
  );

  app.post(
    '/users/email/verify',
    bodyParser.json,
    bodyParser.jwt('verifyEmailToken', jwt.verifyEmail.secret),
    verifyUserNonce('verify_email_nonce'),
    userController.verifyEmail
  );

  app.post(
    '/users/email/request-verify',
    bodyParser.json,
    mailController.activateAccountMail
  );
  app.post('/users/login/email', bodyParser.json, userController.emailLogin);
  app.post(
    '/users/password/request-reset',
    bodyParser.json,
    recaptcha,
    mailController.resetPasswordMail
  );
  app.put(
    '/users/password',
    bodyParser.json,
    bodyParser.jwt('resetPasswordToken', jwt.resetPassword.secret),
    // validate.verifyUserNonce('resetPassword'),
    form('user/ResetPasswordForm'),
    userController.emailResetPassword
  );
  // jwt required for the following:

  app.get('/users/logout', jwtAuth, userController.logout);

  app.get('/users/me', jwtAuth, userController.readSelf);
};
