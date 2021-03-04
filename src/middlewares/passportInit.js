import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import { genAccessToken, genRefreshToken } from '../utils/tokenHelper'
import { passportStrategy, jwt } from '../config/index';
import p from '../utils/agents';
const { v4: uuidv4 } = require('uuid');
import asyncRoute from "../utils/asyncRoute";

const GoogleStrategy = require('passport-google-oauth20').Strategy;

export default asyncRoute(async(req, res, next) => {

  const findUser = (schemaProfileKey, id, cb) => {
    console.log('find user')
    p.query(`SELECT * FROM users WHERE ${schemaProfileKey}_agent_id = $1`,
      [id]
    ).then( results => {
      const userFound = results.rows;
      return cb(null, userFound);
    })
    .catch( err => {
      return cb(err);
    });
  };

  const mapProfile = (platform, profile) => {
    let user;
    switch(platform){
      case "facebook":
        user = {
          facebook_agent_id: profile._json.id,
          email: profile._json.email,
          gender: profile._json.gender,
          age: profile._json.age,
          name: profile._json.name,
          avatar_url: profile._json.picture.data.url,
        };
        break;
      case "google":
        user = {
          google_agent_id: profile._json.id,
          email: profile._json.email,
          gender: profile._json.gender,
          age: profile._json.age,
          name: profile._json.displayName,
          avatar_url: profile._json.image.url,
        };
        break;
      default:
        throw new Error("Please specify a correct platform name")
    }
    const keys = [];
    const values = [];
  //  console.log(user);
    for (const k in user) {
      if (typeof user[k] !== "undefined") {
        keys.push(k);
        values.push(user[k]);
      }
    }
    return {
      query: `INSERT INTO users (${keys.join(',')}, last_login_time, created_at) VALUES ('${values.join("','")}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`,
      user
    };
  };

  const loginOrCreate = async (platform, userFound, profile, done) => {

    if (userFound.length === 0){
      console.log('user not found');
      const params = mapProfile(platform, profile);
      try{
        let session_id; let refresh_token;
        await p.tx(async client => {
          const insertResult = await client.query(params.query)

          const userId = insertResult.rows[0].id;
          session_id = uuidv4();
          refresh_token = genRefreshToken({session_id});
          const values = client.query(
              `INSERT INTO sessions (user_id, session_id, refresh_token, login_time, created_at)
               VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
               RETURNING session_id, refresh_token`,
            [userId, session_id, refresh_token])
        });

        const [results, results2] = values;
        const { user_id } = results.rows[0];
        session_id = results2.rows[0].session_id;
        refresh_token = results2.rows[0].refresh_token;
        const access_token = genAccessToken({ user_id, session_id });
        const info = { user_id, session_id, avatarUrl: params.user.avatar_url };
        const data = {token: access_token, info};
        done(null, data )
      }catch(err){
        res.pushError(err);
        res.error();
      }
    }
    else {
      console.log('user found');
      const user = userFound[0];
      const { user_id } = user;
      const session_id = uuidv4();
      const refresh_token = genRefreshToken({ session_id });
      try {
        await Promise.all([
          p.query(
              `UPDATE users
               SET last_login_time=CURRENT_TIMESTAMP
               WHERE id = $1
               RETURNING last_login_time`,
            [user_id]
          ),
          p.query(
              `INSERT INTO sessions (user_id, session_id, refresh_token, login_time, created_at)
               VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [user_id, session_id, refresh_token])
        ]);

        const access_token = genAccessToken({user_id, session_id});
        console.log('case 2');
        const info = {user_id, session_id, avatarUrl: userFound[0].avatar_url};
        const data = {token: access_token, info};
        done(null, data);

      }catch(err) {
        console.log(err);
      }
    }
  };

  if (passportStrategy.facebook) {
    passport.use(
      new FacebookStrategy(
        {
          ...passportStrategy.facebook,
          profileFields: [
            'id', 'displayName', 'first_name', 'middle_name',
            'last_name', 'gender', 'photos', 'email'
          ]
        },
        (_req, accessToken, refreshToken, profile, done) => {
          findUser(
            'facebook',
            profile._json.id,
            (err, userFound) => {
              loginOrCreate('facebook', userFound, profile, done);
            })
        }
      )
    );
  }

  if (passportStrategy.google) {
    passport.use(
      new GoogleStrategy(
        passportStrategy.google,
        (_req, accessToken, refreshToken, profile, done) => {
          findUser(
            'google',
            profile._json.id,
            (err, userFound) => {
              loginOrCreate('google', userFound, profile, done);
            })
        }
      )
    );
  }

  passport.initialize()(req, res, next);


});
