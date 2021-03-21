import asyncRoute from "../utils/asyncRoute";
import {q, qNonEmpty} from "../utils/q";


const url = require('url');
import crypto from 'crypto';
import Errors from '../constants/Errors';
import {  genAccessToken, genRefreshToken } from '../utils/tokenHelper'
import p from '../utils/agents';
import logger from "../utils/logger";

const { v4: uuidv4 } = require('uuid');

const appName = process.env.APP_NAME || "HopeMd";

const hashPassword = (rawPassword = '') => {
  let recursiveLevel = 5;
  while (recursiveLevel) {
    rawPassword = crypto
      .createHash('md5')
      .update(rawPassword)
      .digest('hex');
    recursiveLevel -= 1;
  }
  return rawPassword;
};

const randomValueHex = (len) =>
  crypto.randomBytes(Math.ceil(len/2))
    .toString('hex') // convert to hexadecimal format
    .slice(0,len).toUpperCase();   // return required number of characters

export default {

  list: asyncRoute(async (req, res) => {
    try {
      const users= (await q(
          `SELECT id FROM users;`)
      ).rows
      return res.json({status: 200, data: users})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  readSelf: asyncRoute(async(req, res) => {
    const staff = (await q(
        `SELECT * FROM staffs WHERE email = $1`, [req.user.email])
    ).rows;
    const isAdmin = staff.length > 0;
    console.log(req.user);
    res.json({
      status: 200,
      data: { ...req.user, admin: isAdmin }
    });
  }),

  emailRegister: asyncRoute(async (req, res, next) => {
    let userReturned = {};
    let emailResults = null;
    try {
      emailResults = await q('SELECT * FROM users where email = $1', [req.body.email])
      if (emailResults.rowCount > 0) {
        res.pushError(Errors.USER_EXISTED);
        return res.errors()
      }
    } catch (err) {
      res.pushError(Errors.SERVER_EXCEPTION(err));
      return res.errors()
    }

    let credentials = [];
    try {
      credentials = await Promise.all([hashPassword(req.body.password), randomValueHex(6)]);
      console.log(credentials)
    }catch(err){
        res.pushError(Errors.DB_OPERATION_FAIL(err));
        return res.errors()
    }

    let insertSessionResult = null;

    try {
      await p.tx(async client => {
        const insertResult = await client.query(`INSERT INTO users (name, email, password, verify_email_nonce) 
         VALUES ($1, $2, $3, $4) RETURNING id, name, email, verify_email_nonce`,
          [req.body.name, req.body.email, credentials[0], credentials[1]]);

        const {display_name, email, verify_email_nonce} = insertResult.rows[0];
        userReturned = {display_name, email, verify_email_nonce};

        const userId = insertResult.rows[0].id;
        const session_id = uuidv4();
        let refresh_token = null;
        try {
          refresh_token = await genRefreshToken({session_id});
        } catch (err) {
          throw err
        }

        insertSessionResult = await client.query(
            `INSERT INTO sessions (user_id, session_id, refresh_token ,login_time, created_at )
               VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
               RETURNING user_id, session_id`,
          [userId, session_id, refresh_token])
      })
    }
    catch(err){
      console.log(err);
      res.pushError([Errors.DB_OPERATION_FAIL(err)]);
      return res.errors()
    }

    const {user_id, session_id} = insertSessionResult.rows[0];
    const access_token = genAccessToken({user_id, session_id});
    userReturned = {user_id, session_id, access_token, ...userReturned};
    req.user = userReturned;
    req.resultData = {
      token: access_token,
      info: {
        user_id,
        session_id,
      },
      display_name: req.body.name,
      avatar_url: null
    };
    return next();

  }),

  emailLogin: asyncRoute(async(req, res) => {
    let userInfo;
    let existed = null;
    try {
      existed = await q('SELECT * FROM users where email = $1', [req.body.email])
    }
    catch(err){
      res.pushError([Errors.DB_OPERATION_FAIL(err)])
      return res.errors()
    }
    const userNotFound = existed.rowCount === 0;
    const wrongPassword = !userNotFound && (existed.rows[0].password !== hashPassword(req.body.password))

    if(userNotFound || wrongPassword){
      res.pushError(Errors.USER_UNAUTHORIZED);
      return res.errors()
    }

    userInfo = existed.rows[0];
    const userId = userInfo.id;
    const sessionId = uuidv4();
    let refreshToken = null;
    let accessToken = null;

    try {
      refreshToken = await genRefreshToken({sessionId})
      accessToken = await genAccessToken({ userId, sessionId })
    }
    catch(err){
      res.pushError([Errors.SERVER_EXCEPTION(err)])
      return res.errors()
    }

    try {
      await p.tx(async client => {
        await client.query(
          `UPDATE users SET last_login_time=CURRENT_TIMESTAMP WHERE id=$1`,
          [userId]
        );
        await client.query(
            `INSERT INTO sessions (user_id, session_id, refresh_token, login_time, created_at ) 
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [userId, sessionId, refreshToken]
          )
        }
      )
    }
    catch(loggingError){
      res.pushError(Errors.DB_OPERATION_FAIL);
      return res.errors()
    }

    const data = {
      token: accessToken,
      info: {
        user_id: userId,
        session_id: sessionId,
      },
      display_name: userInfo.display_name,
      avatar_url: userInfo.avatar_url,
      rank: userInfo.rank
    };
    return res.status(200).json({status: 200, isAuth: true, ...data})
  }),

  verifyEmail: asyncRoute(async(req, res) => {
    const { user } = req;
    try {
      const result = await p.query(`UPDATE users
                                    SET email_verified = true,
                                        email_verified_at = CURRENT_TIMESTAMP
                                    WHERE email = $1`,
        [user.email]);
      res.status(200).json({status: 200, data: result});
    }catch(err){
        res.pushError(err);
        res.errors();
    }
  }),

  socialLogin: (req, res, next) => {
    const state = JSON.parse(req.query.state);
    if(state.env === "native") {
      return res.redirect(`${appName}://login?user=${JSON.stringify(req.user)}`)
    }
    else {
      console.log(req.user);
      const { user } = req;
      const { token, info } = user;
      delete user.token;
      console.log('super bibibo');
      // req.store.dispatch(loginUser({ token, info }, res));
      //  res.redirect(state.next ||'/login');
      res.redirect(
        url.format({
          pathname:"/oauth",
          query: {
            "next": state.next,
            "user": JSON.stringify(req.user)
          }
        })
      )
      console.log('ultimate bibibo');
      return next();
    }
  },
  emailUpdatePassword: asyncRoute(async(req, res) => {
    const {user} = req;
    if(req.body === null){
      res.pushError(Errors.INVALID_DATA);
      res.errors();
    }
    try{
      const result = await p.query(`SELECT password FROM users WHERE id = $1`, [user.id])
      const pw = result.rows[0];
      if (pw === hashPassword(req.body.oldPassword)) {
        return p.query(`UPDATE users SET password = $1 WHERE id = $2`,
          [req.body.newPassword, req.user.id] );
      }
      else {
        res.json({
          isAuth: false
        });
      }

      return res.status(200).json({
        status: 200,
        data: { originAttributes: req.body, isAuth: true, user: result }
      });
    }catch(err){
      res.pushError(err);
      return res.errors();
    }
  }),

  emailResetPassword: asyncRoute(async(req, res) => {
    const { user } = req;
    try{
      const result = await p.query('UPDATE users SET password = $1 WHERE id = $2',
      [req.body.newPassword, user.user_id])

      const _user = result.rows[0];
      res.json({
        originAttributes: req.body,
        user: _user
      });
    }catch(err){
      res.pushError(err);
      return res.errors();
    }
  }),

  logout: asyncRoute(async(req, res) => {
    try{
      const result = await p.query('DELETE FROM sessions WHERE session_id = $1',
      [res.locals.decoded.session_id]
    )
      req.logout();
      res.status(200).json({status: 200, data: result});
    }catch(err){
      res.pushError(err);
      return res.errors();
    }
  }),

  // registerDevice(req, res) {
  //   const { uuid, device_token } = req.body;
  //   p.query(`UPDATE users SET uuid = $1, device_token = $2 WHERE user_id = $3`,
  //     [uuid, device_token, req.user.user_id])
  //     .then(
  //       res.json({ status: 200, data: { uuid, device_token } })
  //     ).catch(err => {
  //     res.pushError(err);
  //     res.errors();
  //   });
  // },

  // update(req, res) {
  //   const { user } = req;
  //   p.query(`UPDATE users SET $1`, [user])
  //     .then(_user => {
  //       res.json({
  //         originAttributes: req.body,
  //         user: _user
  //       });
  //     });
  // },
  //
  // updateAvatarURL(req, res) {
  //   const { url } = req;
  //   p.query(`UPDATE users SET avatar_url = $1`, [url])
  //     .then(
  //       res.json({ status: 200, data: url })
  //     ).catch(err => {
  //     res.pushError(err);
  //     res.errors();
  //   });
  // },
  //
  // uploadAvatar(req, res) {
  //   // use `req.file` to access the avatar file
  //   // and use `req.body` to access other fileds
  //   const { filename } = req.files.avatar[0];
  //   const tmpPath = req.files.avatar[0].path;
  //   const targetDir = path.join(
  //     __dirname,
  //     '../../public',
  //     'users',
  //     req.user._id.toString()
  //   );
  //   const targetPath = path.join(targetDir, filename);
  //
  //   mkdirp(
  //     targetDir,
  //     fs.rename(
  //       tmpPath,
  //       targetPath,
  //       () => {
  //         res.json({
  //           downloadURL: `/users/${req.user._id}/${filename}`
  //         });
  //       }
  //     )
  //   );
  // }
};
