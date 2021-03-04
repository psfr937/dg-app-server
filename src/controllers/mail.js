
import { genVerifyEmailToken, genResetPasswordToken } from '../utils/tokenHelper';
import asyncRoute from "../utils/asyncRoute";
import tokenToURL from "../utils/tokenToURL";
import {q, qNonEmpty} from '../utils/q'
import emailTemplates from '../constants/EmailTemplate'

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const buildMail = async (emailType, to, data) => {
  const templateInfo = (await qNonEmpty(`SELECT * FROM email_templates WHERE key = $1`,
    [emailType])).rows[0];

  const { from_email, sendgrid_template_id } = templateInfo;

  return {
    from:{ from_email },
    personalizations:[
      { to: to, dynamic_template_data: data }
    ],
    template_id: sendgrid_template_id
  };
};

export default {

  activateAccountMail: async(req, res) => {
    const {user} = req;
    const {access_token, name, user_id, session_id, email} = user;

    const nonce = Math.random();
    await q(`UPDATE users SET verify_email_nonce = $1 where id = $2`, [
      nonce, req.user.id]);

    const token = genVerifyEmailToken(user_id, nonce);
    const info = { user_id, session_id, name };

    const msg = buildMail(
      emailTemplates.ACTIVATE_ACCOUNT,
      [{email: email}],
      { c2a_link: tokenToURL(token)}
    );

    try {
      const result = await sgMail.send(msg);

      res.status(200).json({
        status: 200,
        token: access_token,
        info,
        result
      });
    }catch(err){
      console.log(err);
      res.status(400).json(err);
    }
  },

  resetPasswordMail: asyncRoute(async(req, res) =>  {
    const {user} = req;
    const {user_id, email} = user;
    const nonce = Math.random();
    
    await q(`UPDATE users SET reset_password_nonce = $1 where id = $2`, [
      nonce, req.user.id]);

    const token = genResetPasswordToken(user_id, nonce);


    const msg = buildMail(
      emailTemplates.RESET_PASSWORD,
      [{email: email}],
      { c2a_link: tokenToURL(token)}
    );

    try {
      const result = await sgMail.send(msg);

      res.status(200).json({
        status: 200,
        result
      });
    }
    catch(err){
      console.log(err);
      res.status(400).json(err);
    }
  }),

  sendBuyReceipt: asyncRoute(async(req, res) =>  {
    const msg = buildMail(
      emailTemplates.BUY_RECEIPT,
      [{email: req.user.email}],
      req.emailData
    );

    try {
      const result = await sgMail.send(msg);

      res.status(200).json({
        status: 200,
        result
      });
    }
    catch(err){
      console.log(err);
      res.status(400).json(err);
    }
  })
};
