// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import * as Yup from 'yup';
import yupValidation from '../../lib/yupValidation';
import connectMongo from '../../lib/mongodb';
import User from '../../models/user';
import bcryptjs from 'bcryptjs';

interface UserModel {
	email: string;
	username: string;
	password: string;
}

interface UserSignUpModel extends UserModel {
	repeat_password: string;
}

const userSignUpValidationSchema: Yup.SchemaOf<UserSignUpModel> =
	Yup.object().shape({
		email: Yup.string()
			.min(4, { email: 'Min 4 characters' })
			.max(32, { email: 'Max 32 characters' })
			.email({ email: 'Invalid email format' })
			.test(
				'email-taken',
				{ email: 'Email is already taken' },
				async (value, testContext) => {
					const account_list: UserModel[] = await User.find({
						email: value,
					}).exec();
					return account_list.length === 0;
				}
			)
			.required({ email: 'Email is required' }),
		username: Yup.string()
			.min(4, { username: 'Min 4 characters' })
			.max(32, { username: 'Max 32 characters' })
			.test(
				'username-taken',
				{ username: 'Username is already taken' },
				async (value, testContext) => {
					const account_list: UserModel[] = await User.find({
						username: value,
					}).exec();
					return account_list.length === 0;
				}
			)
			.required({ username: 'Username is required' }),
		password: Yup.string()
			.min(4, { password: 'Min 4 characters' })
			.max(32, { password: 'Max 32 characters' })
			.required({ password: 'Password is required' }),

		repeat_password: Yup.string()
			.min(4, { repeat_password: 'Min 4 characters' })
			.max(32, { repeat_password: 'Max 32 characters' })
			.oneOf([Yup.ref('password')], {
				repeat_password: 'Passwords do not match',
			})
			.required({ repeat_password: 'Password repeat is required' }),
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
	const { email, username, password } = req.body;
	await connectMongo();
	const hashedPassword = await bcryptjs.hash(password, 5);
	const newUser = new User({
		email: email,
		username: username,
		password: hashedPassword,
	});
	const savedUser = await newUser.save();
	if (!savedUser) {
		return res.status(404).json([{ email: 'Error creating user' }]);
	}
	return res.status(200).json({ success: true });
}
