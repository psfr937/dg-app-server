
import VerifyEmailMail from '../components/Mail/VerifyEmailMail';
import ResetPasswordMail from '../components/Mail/ResetPasswordMail';
import { jwt }  from '../config'
import { genVerifyEmailToken, genResetPasswordToken } from '../utils/tokenHelper';
const createEmail = require('../utils/createMail');

export default {

  sendVerification(req, res) {
    const {user} = req;
    const {access_token, display_name, user_id, session_id, verify_email_nonce} = user;
    const token = genVerifyEmailToken(user_id, verify_email_nonce);
    const info = { user_id, session_id, display_name };

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const component = (token) => VerifyEmailMail(token);

    createEmail(component).then(html => {
      const msg = {
        to: 'psfr937@gmail.com',
        from: 'psfr937@gmail.com',
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html
      };

      console.log('passed');

      return sgMail.send(msg);
    }).then((result) => {
      res.status(200).json({
        status: 200,
        token: access_token,
        info,
        result
      });
    }).catch(err=>{
      console.log(err);
      res.status(400).json(err);
    });

  },


};
