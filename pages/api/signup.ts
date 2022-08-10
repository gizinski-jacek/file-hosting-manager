// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../lib/mongodb';
import * as Yup from 'yup';
import yupValidation from '../../lib/yupValidation';
import User from '../../models/user';
import bcryptjs from 'bcryptjs';

interface UserSignUpModel {
	signup_email: string;
	signup_username: string;
	signup_password: string;
	signup_repeat_password: string;
}

interface UserModel {
	email: string;
	username: string;
	password: string;
}

export const userSignUpValidationSchema: Yup.SchemaOf<UserSignUpModel> =
	Yup.object().shape({
		signup_email: Yup.string()
			.min(4, { signup_email: 'Min 4 characters' })
			.max(32, { signup_email: 'Max 32 characters' })
			.email({ signup_email: 'Invalid email format' })
			.test(
				'email-taken',
				{ signup_email: 'Email is already taken' },
				async (value, testContext) => {
					const account_list: UserModel[] = await User.find({
						email: value,
					}).exec();
					return account_list.length === 0;
				}
			)
			.required({ signup_email: 'Email is required' }),
		signup_username: Yup.string()
			.min(4, { signup_username: 'Min 4 characters' })
			.max(32, { signup_username: 'Max 32 characters' })
			.test(
				'username-taken',
				{ signup_username: 'Username is already taken' },
				async (value, testContext) => {
					const account_list: UserModel[] = await User.find({
						username: value,
					}).exec();
					return account_list.length === 0;
				}
			)
			.required({ signup_username: 'Username is required' }),
		signup_password: Yup.string()
			.min(4, { signup_password: 'Min 4 characters' })
			.max(32, { signup_password: 'Max 32 characters' })
			.required({ signup_password: 'Password is required' }),

		signup_repeat_password: Yup.string()
			.min(4, { signup_repeat_password: 'Min 4 characters' })
			.max(32, { signup_repeat_password: 'Max 32 characters' })
			.oneOf([Yup.ref('signup_password')], {
				signup_repeat_password: 'Passwords do not match',
			})
			.required({ signup_repeat_password: 'Password repeat is required' }),
	});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<
		{ [key: string]: string | Boolean } | { [key: string]: string }[]
	>
) {
	const { errors } = await yupValidation(userSignUpValidationSchema, req.body);
	if (errors) {
		return res.status(422).json(errors);
	}
	const { signup_email, signup_username, signup_password } = req.body;
	await connectMongo();
	const hashedPassword = await bcryptjs.hash(signup_password, 5);
	const newUser = new User({
		email: signup_email,
		username: signup_username,
		password: hashedPassword,
	});
	const savedUser = await newUser.save();
	if (!savedUser) {
		return res.status(404).json([{ signup_email: 'Error creating user' }]);
	}
	return res.status(200).json({ success: true });
}
