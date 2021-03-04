import jsonwebtoken from 'jsonwebtoken';
import { jwt } from '../config/index';

module.exports = {
  jwtExtractor: req => {
     if (typeof req.headers.authorization !== 'undefined') {
       return req.headers.authorization.match(/Bearer ([^#]+)/)[1]
     }else if(typeof req.headers.cookie !== 'undefined'){
       return req.headers.cookie.match(/token=([^#][^=;]+)/)[1]
     }
     else{
        return null
     }
  },

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
