// auth/passportGoogle.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User Models/UserModel.js';

export default function setupGooglePassport() {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI 
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const providerId = profile.id;
      // find existing user
      let user = await User.findOne({ $or: [{ email }, { provider: 'google', providerId }] });
      if (!user) {
        user = await User.create({
          email,
          name: profile.displayName,
          provider: 'google',
          providerId,
          roles: ['user'] // default role
        });
      } else {
        // ensure provider fields exist
        if (!user.provider) { user.provider = 'google'; user.providerId = providerId; await user.save(); }
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}
