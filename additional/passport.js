import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { userSchema } from '../mongooseDb/userSchema.js';
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
}, async function (accessToken, refreshToken, profile, done) {
    try {
        let user = await userSchema.findOne({ email: profile.emails[0].value });
        if (user) {
            return done(null, { userdata: user });
        } else {
            let data = new userSchema({
                name: profile.displayName,
                email: profile.emails[0].value,
                type: "google",
            })
            await data.save()
            return done(null, { userdata: user });
        }
    } catch (err) {
        return done(err, null);
    }
}));
passport.serializeUser((user, done) => {
    return done(null, user);
});

passport.deserializeUser((user, done) => {
    return done(null, user);
});