import asyncRoute from "../utils/asyncRoute";
import {q, qNonEmpty} from "../utils/q";


const url = require('url');
import crypto from 'crypto';
import Errors from '../constants/Errors';
import { jwt, nodemailer } from '../config/index';
import {  genAccessToken, genRefreshToken } from '../utils/tokenHelper'

import p from '../utils/agents';

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
      const products = (await qNonEmpty(
          `SELECT * FROM users`)
      ).rows
      return res.json({status: 200, data: products})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  readSelf: (req, res) => {
    console.log(req.user);
    res.json({
      data: req.user
    });
  },

  nicknameRegister: (req, res, next) => {
    console.log("email register");
    let userReturned = {};
    p.query('SELECT * FROM sessions where session_id = $1', [req.header.session_id])
      .then(results => {
        if (results.rowCount > 0) {
          throw Errors.USER_EXISTED;
        } else {
          return Promise.resolve();
        }
      }).then( results =>
      p.transaction((conn, resolve, reject) => {
        conn.query(`INSERT INTO users (display_name) 
          VALUES ($1) RETURNING id, display_name`, [req.body.name])
          .then(insertResult => {
            console.log(insertResult);
            const { display_name } = insertResult.rows[0];
            userReturned = {display_name};

            const lastId = insertResult.rows[0].id;;
            const session_id = uuidv4();
            const refresh_token = genRefreshToken({session_id});

            resolve(Promise.all([
              conn.query(
                `INSERT INTO sessions (user_id, session_id, refresh_token , login_time, created_at )
                   VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                   RETURNING user_id, session_id`,
                [lastId, session_id, refresh_token]),
            ]));
          }).catch( err => {
          reject(err);
        })
      })
    ).then( results => {
      const { user_id, session_id } = results[0].rows[0];
      const access_token = genAccessToken({ user_id, session_id });
      userReturned = { user_id, session_id, access_token, ...userReturned };
      req.user = userReturned;

      const data = {
        token: access_token,
        info: {
          user_id,
          session_id,
          display_name: req.body.name,
          avatar_url: null }
      };
      return res.status(200).json({status: 200, ...data, isUnused: true });

    }).catch( err => {
      console.log('omg');
      console.log(err);
      res.pushError(err);
      res.errors();
    })
  },

  emailRegister: (req, res, next) => {
    console.log("email register");
    let userReturned = {};
    p.query('SELECT * FROM users where email = $1', [req.body.email])
      .then(results => {
        if (results.rowCount > 0) {
          throw Errors.USER_EXISTED;
        } else {
          return Promise.all([hashPassword(req.body.password),randomValueHex(6)]);
        }
      }).then( results =>
      p.transaction((conn, resolve, reject) => {
        conn.query(`INSERT INTO users (display_name, email, password, verify_email_nonce) 
             VALUES ($1, $2, $3, $4) RETURNING id, display_name, email, verify_email_nonce`,
          [req.body.name, req.body.email, results[0], results[1]])
          .then(insertResult => {
            console.log(insertResult);
            const { display_name, email, verify_email_nonce } = insertResult.rows[0];
            userReturned = {display_name, email, verify_email_nonce};

            const lastId = insertResult.rows[0].id;
            const session_id = uuidv4();
            const refresh_token = genRefreshToken({session_id});

            resolve(Promise.all([
              conn.query(
                `INSERT INTO sessions (user_id, session_id, refresh_token ,login_time, created_at )
                   VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                   RETURNING user_id, session_id`,
                [lastId, session_id, refresh_token]),
              conn.query(
                `INSERT INTO emails (address, is_verified) VALUES ($1, $2)`,
                [email, false])

            ]));
          }).catch( err => {
          reject(err);
        })
      })
    ).then( results => {
      const { user_id, session_id } = results[0].rows[0];
      const access_token = genAccessToken({ user_id, session_id });
      userReturned = { user_id, session_id, access_token, ...userReturned };
      req.user = userReturned;
      if (!nodemailer) {
        const data = {
          token: access_token,
          info: {
            user_id,
            session_id,
            display_name: req.body.name,
            avatar_url: null }
        };
        return res.status(200).json({status: 200, ...data, isUnused: true });
      }
      return next();
    }).catch( err => {
      console.log('omg');
      console.log(err);
      res.pushError(err);
      res.errors();
    })
  },

  emailLogin: (req, res) => {
    console.log("email login");
    let userInfo;
    p.query('SELECT * FROM users where email = $1', [req.body.email])
      .then(result => {
        if (result.rowCount === 0) {
          console("no user found");
          throw Errors.USER_UNAUTHORIZED;
        }
        else if(result.rows[0].password === hashPassword(req.body.password)) {
          userInfo = result.rows[0];
          const userId = userInfo.id
          const session_id = uuidv4();
          const refresh_token = genRefreshToken({session_id});
          return Promise.all([
            p.query(
              `UPDATE users SET last_login_time=CURRENT_TIMESTAMP WHERE id=$1
              RETURNING last_login_time`,
              [userId]
            ),
            p.query(
              `INSERT INTO sessions (user_id, session_id, refresh_token, login_time, created_at ) 
              VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
              RETURNING user_id, session_id`,
              [userId, session_id, refresh_token])
          ]);
        }
        else{
          console.log("wrong password");
          throw Errors.USER_UNAUTHORIZED;
        }
      }).then(results => {
      const { user_id, session_id } = results[1].rows[0];
      console.log('user_id and session_id')
      console.log(user_id)
      console.log(session_id)
      const access_token = genAccessToken({ user_id, session_id });
      console.log('case 2');

      const data = {
        token: access_token,
        info: {
          user_id,
          session_id,
          display_name: userInfo.display_name,
          avatar_url: userInfo.avatar_url,
          rank: userInfo.rank
        }
      }
      res.status(200).json({status: 200, isAuth: true, ...data})
    }).catch(err => {
      console.log(err)
      res.pushError(err)
      res.errors()
    })
  },

  verifyEmail: (req, res) => {
    const { user } = req;
    p.query(`UPDATE emails SET is_verified = true, verified_at = CURRENT_TIMESTAMP
      WHERE address = $1`,
      [user.email])
      .then((result) => {
        res.status(200).json({status: 200, data: result});
      })
      .catch(err => {
        res.pushError(err);
        res.errors();
      });
  },

  emailSetNonce: (nonceKey) => (req, res, next) => {

    p.query(`SELECT * FROM users where email = $1`, [req.body.email])
      .then( result => {
        const user = result.rows[0];
        user[nonceKey] = Math.random();
        return p.query(`UPDATE * FROM users where user_id = $1`, [user.user_id])
      })
      .then( result => {
        res.status(200).json({status: 200, data: result});
      })
      .catch( err => {
        res.pushError(err);
        res.errors();
      });
  },

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
  emailUpdatePassword: (req, res) => {
    const {user} = req;
    if(req.body === null){
      res.pushError(Errors.INVALID_DATA);
      res.errors();
    }
    p.query(`SELECT password FROM users WHERE user_id`, user.user_id)
      .then(result => {
        const pw = result.rows[0];
        if (pw === hashPassword(req.body.oldPassword)) {
          return p.query(`UPDATE users SET password = $1`, req.body.newPassword);
        }
        else {
          res.json({
            isAuth: false
          });
        }
      }).then(result => {
      res.status(200).json({
        status: 200,
        data: { originAttributes: req.body, isAuth: true, user: result }
      });
    }).catch(err => {

    });
  },

  emailResetPassword: (req, res) => {
    const { user } = req;
    p.query('UPDATE users SET password = $1 WHERE user_id = $2',
      [req.body.newPassword, user.user_id])
      .then(result => {
        const _user = result.rows[0];
        res.json({
          originAttributes: req.body,
          user: _user
        });
      }).catch(err=>{
      res.pushError(err);
      res.errors();
    });
  },

  logout(req, res) {
    console.log(res.locals.decoded);
    p.query('DELETE FROM sessions WHERE session_id = $1',
      [res.locals.decoded.session_id]
    ).then(results => {
      req.logout();
      res.status(200).json({status: 200, data: results});
    }).catch(err => {
      res.pushError(err);
      res.errors();
    });
  },

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
