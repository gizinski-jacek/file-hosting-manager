// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import connectMongo from '../../../lib/mongodb';
import { MongoUserModel, TempUserToken } from '../../../lib/types/types';
import User from '../../../models/user';
import { nextAuthOptions } from '../auth/[...nextauth]';
import jwt from 'jsonwebtoken';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const session = await unstable_getServerSession(req, res, nextAuthOptions);
		const { host } = req.query as { host: string };
		if (session && session.user) {
			if (req.method === 'GET') {
				await connectMongo();
				const user: MongoUserModel = await User.findById(session.user._id)
					.select('+api_data')
					.exec();
				if (!user) {
					return res.status(404).json('User not found');
				}
				const userAPIData = user.api_data.find((d) => d.host === host);
				if (!userAPIData || !userAPIData.api_key) {
					return res.status(200).json(false);
				} else {
					return res.status(200).json(true);
				}
			}
			return res.status(404).json('No endpoint');
		} else if (req.cookies.tempUserToken) {
			if (!process.env.JWT_STRATEGY_SECRET) {
				return res.status(404).json('Server error');
			}
			const decodedToken: TempUserToken = jwt.verify(
				req.cookies.tempUserToken,
				process.env.JWT_STRATEGY_SECRET
			);
			const userAPIData = decodedToken.api_data.find((d) => d.host === host);
			if (!userAPIData || !userAPIData.api_key) {
				return res.status(200).json(false);
			} else {
				return res.status(200).json(true);
			}
		} else {
			return res.status(200).json(false);
		}
	} catch (error) {
		return res.status(404).json(error);
	}
}
