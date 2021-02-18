import jsonwebtoken from 'jsonwebtoken';
import p from '../utils/agents'
import { jwt, stripe } from '../config'
import { jwtExtractor, genAccessToken } from '../utils/tokenHelper'
import Errors from '../constants/Errors';
import logger from '../utils/logger'

export const socketIORefreshAccessToken = (socket, next) => {
  p.query(`SELECT refresh_token FROM sessions WHERE session_id = $1`,
    [socket.decoded.session_id])
    .then(results => {
      const {refresh_token} = results.rows[0];
      jsonwebtoken.verify(
        refresh_token,
        jwt.refreshToken.secret,
        (err, decoded) => {
          if (err){
            return next(Errors.USER_UNAUTHORIZED);
          }
          const { user_id, session_id } = decoded;
          socket.token =  genAccessToken({user_id, session_id})
          socket.decoded = decoded
          next()
        }
      )
    }).catch(queryErr => {
    return next(queryErr);
  });
}

export const socketIOJwtAuth = (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      jwt.accessToken.secret,
      (err, decoded) => {
        if (err) {
          return next(new Error('Authentication error'));
        }
        else if (decoded.expiredAt < Date.now()) {
          socket.decoded = decoded
          return clientSocketIORefreshAccessToken(socket, next);
        }
        else {
          socket.decoded = decoded;
          next();
        }
      });
  } else {
    next(new Error('Authentication error'));
  }
}

export const refreshAccessToken  = (req, res, next) => {
  p.query(`SELECT refresh_token FROM sessions WHERE session_id = $1`,
    [res.locals.decoded.session_id])
    .then(results => {
      const {refresh_token} = results.rows[0];
      jsonwebtoken.verify(
        refresh_token,
        jwt.refreshToken.secret,
        (err, decoded) => {
          if (err){
            res.pushError(err);
            res.pushError(Errors.USER_UNAUTHORIZED);
            res.errors();
          }
          const { user_id, session_id } = decoded;

          const accessToken = genAccessToken({user_id, session_id});

          const info = {user_id, session_id};
          if (next) {
            res.send({status: 200, data: {token: accessToken, info}});
            next();
          }else {
            res.status(200).json({status: 200, data: {token: accessToken, info}});
          }
        }
      )
    }).catch(queryErr => {
      res.pushError(queryErr);
      res.errors();
  });
};



export const jwtAuth = (req, res, next) => {
  const extractedJWT = jwtExtractor(req)
  console.log(extractedJWT)
  console.log(jwt.accessToken.secret)
  jsonwebtoken.verify(
    extractedJWT,
    jwt.accessToken.secret,
    {
      ignoreExpiration: true
    },
    (err, decoded) => {

      if (err) {
        logger.error(err, '%o')
        if (res.locals.authType === "optional") {
          return next()
        } else {
          res.pushError(err);
          res.pushError(Errors.USER_UNAUTHORIZED);
          res.errors();
        }
      } else if (decoded.expiredAt < Date.now()) {
        res.locals.decoded = decoded;
        return refreshAccessToken(res, req, next);
      } else {
        res.locals.decoded = decoded;
        logger.info('decoded', '%o')

        p.query(
            `SELECT * FROM users WHERE id = $1`, [decoded.userId]
        ).then(results => {
          if (results.rowCount === 0){
            logger.info('user not found', '%o')
            res.pushError(Errors.USER_UNAUTHORIZED);
            return res.errors();
          }
          else {
            const user = results.rows[0];
            delete user.password
            req.user = user;
            logger.info('user found', '%o')
            return next();
          }
        }).catch(queryErr => {
          console.log(queryErr)
          res.pushError(queryErr);
          res.errors();
        });
      }
    }
  )
}



export const jwtAuthOptional = (req, res, next) => {
  res.locals.authType = "optional";
  return jwtAuth(req, res, next);
};

