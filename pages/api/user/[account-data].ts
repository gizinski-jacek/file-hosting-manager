// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import connectMongo from '../../../lib/mongodb';
import { MongoUserModel } from '../../../lib/types/types';
import User from '../../../models/user';
import { nextAuthOptions } from '../auth/[...nextauth]';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const session = await unstable_getServerSession(req, res, nextAuthOptions);
		if (session && session.user) {
			if (req.method === 'GET') {
				await connectMongo();
				const userData = await User.findById(session.user._id)
					.select('-_id api_data')
					.exec();
				if (!userData) {
					return res.status(404).json('User not found');
				}
				return res.status(200).json(userData);
			}
			if (req.method === 'PUT') {
				//
			}
			if (req.method === 'DELETE') {
				const { host } = req.query;
				await connectMongo();
				const user: MongoUserModel | null = await User.findById(
					session.user._id
				)
					.lean()
					.select('api_data')
					.exec();
				if (!user) {
					return res.status(404).json('User not found');
				}
				const newData = user.api_data.filter((d) => d.host !== host);
				if (!newData) {
					return res.status(404).json('Data to delete not found');
				}
				const updatedUser = await User.findByIdAndUpdate(
					session.user._id,
					{ $set: { api_data: newData } },
					{ timestamps: true, new: true }
				)
					.select('-_id api_data')
					.exec();
				if (!updatedUser) {
					return res.status(404).json('Error updating user');
				}
				return res.status(200).json(updatedUser.api_data);
			}
			return res.status(200).json('No endpoint');
		} else {
			return res.status(401).json('Unauthorized access');
		}
	} catch (error) {
		console.log(error);
		return res.status(404).json(error);
	}
}
