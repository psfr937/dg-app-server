import userController from "../controllers/users"
import { jwt } from '../config';
import bodyParser from '../middlewares/bodyParser';
import { jwtAuth } from '../middlewares/jwtAuth';
import mailController from '../controllers/mail';
import { form, recaptcha, verifyUserNonce } from '../middlewares/validate';

export default app => {
  // user
  app.get('/api/users', userController.list);

  app.post(
    '/api/users',
    bodyParser.json,
    userController.emailRegister,
    mailController.sendVerification
  );

  app.post(
    '/api/users/email/verify',
    bodyParser.json,
    bodyParser.jwt('verifyEmailToken', jwt.verifyEmail.secret),
    verifyUserNonce('verify_email_nonce'),
    userController.verifyEmail
  );

  app.post(
    '/api/users/email/request-verify',
    bodyParser.json,
    // validate.form('user/VerifyEmailForm'),
    recaptcha,
    userController.emailSetNonce('verifyEmail')
  );
  app.post('/api/users/emaillogin', bodyParser.json, userController.emailLogin);
  app.post(
    '/api/users/password/request-reset',
    bodyParser.json,
    // validate.form('user/ForgetPasswordForm'),
    recaptcha,
    userController.emailSetNonce('resetPassword')
  );
  app.put(
    '/api/users/password',
    bodyParser.json,
    bodyParser.jwt('resetPasswordToken', jwt.resetPassword.secret),
    // validate.verifyUserNonce('resetPassword'),
    form('user/ResetPasswordForm'),
    userController.emailResetPassword
  );
  // jwt required for the following:

  app.get('/api/users/logout', jwtAuth, userController.logout);

  app.get('/api/users/me', jwtAuth, userController.readSelf);
};
