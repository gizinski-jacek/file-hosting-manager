// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import * as Yup from 'yup';
import yupValidation from '../../../lib/yupValidation';
import connectMongo from '../../../lib/mongodb';
import User from '../../../models/user';
import jwt from 'jsonwebtoken';
import { getToken } from 'next-auth/jwt';

interface UserModel {
	email: string;
	username: string;
	password: string;
}

interface UserSignUpModel extends UserModel {
	repeat_password: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<{ [key: string]: string | boolean } | string>
) {
	if (req.method === 'POST') {
		const { host } = req.query as { host: string };
		if (!host) {
			return res.status(404).json('Error, host not found');
		}
		if (!process.env.JWT_STRATEGY_SECRET || !process.env.NEXTAUTH_SECRET) {
			return res.status(404).json('Server error');
		}
		if (req.cookies['next-auth.session-token']) {
			const decodedToken = await getToken({ req });
			await connectMongo();
			const userExists = await User.findById(decodedToken.user._id).exec();
			if (!userExists) {
				return res.status(404).json('User not found');
			}
			if (userExists.api_data.find((d) => d.host === host)) {
				const newData = {
					...req.body,
					host: host,
				};
				const updatedUser = await User.findByIdAndUpdate(
					userExists._id,
					{ $set: { 'api_data.$[el]': newData } },
					{
						arrayFilters: [{ 'el.host': host }],
						timestamps: true,
						new: true,
					}
				).exec();
				if (!updatedUser) {
					return res.status(404).json('Failed to update user');
				}
			} else {
				const newData = {
					...req.body,
					host: host,
				};
				const updatedUser = await User.findByIdAndUpdate(
					userExists._id,
					{ $addToSet: { api_data: newData } },
					{
						upsert: true,
						timestamps: true,
						new: true,
					}
				).exec();
				if (!updatedUser) {
					return res.status(404).json('Failed to update user');
				}
			}
			return res.status(200).json({ success: true });
		} else if (req.cookies.tempUserToken) {
			const decodedToken = jwt.verify(
				req.cookies.tempUserToken,
				process.env.JWT_STRATEGY_SECRET
			);
			const payload = {
				...decodedToken,
				[host]: req.body,
			};
			const token = jwt.sign(payload, process.env.JWT_STRATEGY_SECRET);
			res.setHeader(
				'Set-Cookie',
				`tempUserToken=${token}; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=3600` // 60 minutes
			);
			return res.status(200).json({ success: true });
		} else {
			const payload = {
				[host]: req.body,
			};
			if (!process.env.JWT_STRATEGY_SECRET) {
				return res.status(404).json('Server error');
			}
			const token = jwt.sign(payload, process.env.JWT_STRATEGY_SECRET);
			res.setHeader(
				'Set-Cookie',
				`tempUserToken=${token}; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=3600` // 60 minutes
			);
			return res.status(200).json({ success: true });
		}
	}
	return res.status(200).json({ success: false });
}
