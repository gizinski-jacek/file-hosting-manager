import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy } from 'passport-jwt';
import passport from 'passport';
import User from '../models/user';
import { NextApiRequest } from 'next';
import connectMongo from './mongodb';
import bcryptjs from 'bcryptjs';

passport.use(
	'login',
	new LocalStrategy(
		{
			usernameField: 'login_username_or_email',
			passwordField: 'login_password',
		},
		async (username_or_email, password, done) => {
			try {
				await connectMongo();
				const user = await User.findOne({
					$or: [{ email: username_or_email }, { username: username_or_email }],
				})
					.select('+password')
					.exec();
				if (!user) {
					return done(null, false, {
						msg: 'Account with entered email not found',
					});
				}
				const match = await bcryptjs.compare(password, user.password);
				if (!match) {
					return done(null, false, { msg: 'Entered password is incorrect' });
				}
				return done(null, user, { success: true });
			} catch (error) {
				done(error);
			}
		}
	)
);

const extractToken = (req: NextApiRequest) => {
	let token = null;
	if (req && req.cookies && req.cookies.passportSession) {
		token = req.cookies.passportSession;
	}
	return token;
};

passport.use(
	'jwt',
	new JWTStrategy(
		{
			jwtFromRequest: extractToken,
			secretOrKey: process.env.JWT_STRATEGY_SECRET,
		},
		async (jwtPayload, done) => {
			console.log(123321);
			try {
				if (jwtPayload) {
					done(null, jwtPayload);
				} else {
					done(null, false);
				}
			} catch (error) {
				done(error, false);
			}
		}
	)
);
