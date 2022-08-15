// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongodb';
import User from '../../../models/user';
import jwt from 'jsonwebtoken';
import { unstable_getServerSession } from 'next-auth';
import { nextAuthOptions } from '../auth/[...nextauth]';
import { MongoUserModel, TempUserToken } from '../../../lib/types/types';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		if (req.method === 'POST') {
			const { host } = req.query as { host: string };
			if (!host) {
				return res.status(404).json('Error, host not found');
			}
			const session = await unstable_getServerSession(
				req,
				res,
				nextAuthOptions
			);
			if (session && session.user) {
				await connectMongo();
				const user: MongoUserModel = await User.findById(session.user._id)
					.select('+api_data')
					.exec();
				if (!user) {
					return res.status(404).json('User not found');
				}
				const apiData = user.api_data.find((d) => d.host === host);
				if (apiData) {
					const newData = {
						...req.body,
						host: host,
					};
					const updatedUser = await User.findByIdAndUpdate(
						user._id,
						{ $set: { 'api_data.$[el]': newData } },
						{ arrayFilters: [{ 'el.host': host }], timestamps: true, new: true }
					).exec();
					if (!updatedUser) {
						return res.status(404).json('Error updating user');
					}
					return res.status(200).json({ success: true });
				} else {
					const newData = {
						...req.body,
						host: host,
					};
					const updatedUser = await User.findByIdAndUpdate(
						user._id,
						{ $addToSet: { api_data: newData } },
						{ upsert: true, timestamps: true, new: true }
					).exec();
					if (!updatedUser) {
						return res.status(404).json('Failed to update user');
					}
					return res.status(200).json({ success: true });
				}
			} else if (req.cookies.tempUserToken) {
				if (!process.env.JWT_STRATEGY_SECRET) {
					return res.status(404).json('Server error');
				}
				const decodedToken: TempUserToken = jwt.verify(
					req.cookies.tempUserToken,
					process.env.JWT_STRATEGY_SECRET
				);
				//prevent duplicates
				const payload = {
					api_data: [...decodedToken.api_data, { host: host, ...req.body }],
				};
				const token = jwt.sign(payload, process.env.JWT_STRATEGY_SECRET);
				res.setHeader(
					'Set-Cookie',
					`tempUserToken=${token}; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=3600` // 60 minutes
				);
				return res.status(200).json({ success: true });
			} else {
				if (!process.env.JWT_STRATEGY_SECRET) {
					return res.status(404).json('Server error');
				}
				const payload = {
					api_data: [{ host: host, ...req.body }],
				};
				const token = jwt.sign(payload, process.env.JWT_STRATEGY_SECRET);
				res.setHeader(
					'Set-Cookie',
					`tempUserToken=${token}; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=3600` // 60 minutes
				);
				return res.status(200).json({ success: true });
			}
		}
		return res.status(404).json('No endpoint');
	} catch (error) {
		return res.status(404).json(error);
	}
}
