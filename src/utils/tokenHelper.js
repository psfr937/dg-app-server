import jsonwebtoken from 'jsonwebtoken';
import { jwt } from '../config/index';
import Errors from "../constants/Errors";

module.exports = {
  jwtExtractor: req => (req.query.env === "native" || ( req.headers.platform && req.headers.platform === 'native')) ?
      ((typeof req.headers.authorization !== 'undefined') ?
          req.headers.authorization.match(/Bearer ([^#]+)/)[1]
          : null
      )
      : ((typeof req.headers.cookie !== 'undefined') ?
          req.headers.cookie.match(/token=([^#][^=;]+)/)[1]
          : null
      ),

  genAccessToken: async data => {
    try{
      const dataString = await JSON.stringify(data)
      const parsedData = await JSON.parse(dataString)
      return await jsonwebtoken.sign(parsedData, jwt.accessToken.secret, {
        expiresIn: jwt.accessToken.expiresIn
      })
    }
    catch(err){
      throw err
    }
  },

  genRefreshToken: async data => {
    try {
      const dataString = await JSON.stringify(data)
      const parsedData = await JSON.parse(dataString)
      return await jsonwebtoken.sign(parsedData, jwt.refreshToken.secret, {
          expiresIn: jwt.refreshToken.expiresIn
        })
    }
    catch(err){
      throw err
    }
  },

  genVerifyEmailToken: (id, verifyEmailNonce) => {
    const user = {
      _id: id,
      nonce: verifyEmailNonce,
    };
    const token = jsonwebtoken.sign(user, jwt.verifyEmail.secret, {
      expiresIn: jwt.verifyEmail.expiresIn,
    });
    return token;
  },

  genResetPasswordToken: (id, resetPasswordNonce) => {
    const user = {
      _id: id,
      nonce: resetPasswordNonce,
    };
    const token = jsonwebtoken.sign(user, jwt.resetPassword.secret, {
      expiresIn: jwt.resetPassword.expiresIn,
    });
    return token;
  }
}
