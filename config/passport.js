const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        role: 'user'
      });
      await user.save();
    }
    
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// Microsoft Strategy
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: '/api/auth/microsoft/callback',
  scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ microsoftId: profile.id });
    
    if (!user) {
      user = new User({
        microsoftId: profile.id,
        email: profile.emails[0].value,
        role: 'user'
      });
      await user.save();
    }
    
    done(null, user);
  } catch (err) {
    done(err);
  }
}));