// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import * as Yup from 'yup';
import yupValidation from '../../lib/yupValidation';
import User from '../../models/user';
import passport from 'passport';
import jwt from 'jsonwebtoken';

interface UserLoginModel {
	login_username_or_email: string;
	login_password: string;
}

interface UserModel {
	email: string;
	username: string;
	password: string;
}

const withPassport = (fn) => (req, res) => {
	fn(req, res);
};

export const userLoginUpValidationSchema: Yup.SchemaOf<UserLoginModel> =
	Yup.object().shape({
		login_username_or_email: Yup.string()
			.min(4, { login_username_or_email: 'Min 4 characters' })
			.max(32, { login_username_or_email: 'Max 32 characters' })
			.test(
				'no-account',
				{ login_username_or_email: 'Account not found' },
				async (value, testContext) => {
					const account_list: UserModel[] = await User.find({
						$or: [{ email: value }, { username: value }],
					}).exec();
					return account_list.length > 0;
				}
			)
			.required({ login_username_or_email: 'Username is required' }),
		login_password: Yup.string()
			.min(4, { login_password: 'Min 4 characters' })
			.max(32, { login_password: 'Max 32 characters' })
			.required({ login_password: 'Password is required' }),
	});

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<
		{ [key: string]: string | Boolean } | { [key: string]: string }[]
	>
) {
	const { errors } = await yupValidation(userLoginUpValidationSchema, req.body);
	if (errors) {
		return res.status(422).json(errors);
	}
	passport.authenticate(
		'login',
		{ session: false },
		async (error, user, msg) => {
			if (error) {
				return res.status(422).json({ error });
			}
			try {
				if (!user) {
					return res.status(401).json(msg);
				}
				if (!process.env.JWT_STRATEGY_SECRET) {
					console.log('Please provide JWT Strategy Secret key');
					return res.status(401).json({ msg: 'Server error' });
				}
				const payload = {
					_id: user._id,
					username: user.username,
				};
				const token = jwt.sign(payload, process.env.JWT_STRATEGY_SECRET, {
					expiresIn: '30m',
				});
				const data = { ...user._doc };
				delete data.password;
				delete data.createdAt;
				delete data.updatedAt;
				res.setHeader(
					'Set-Cookie',
					`userToken=${token}; Path=/; SameSite=strict; HttpOnly=true; Secure=true; Max-Age=3600`
				);
				return res.status(200).json(data);
			} catch (error) {
				return res.status(404).json(error);
			}
		}
	)(req, res);
}

export default withPassport(handler);
