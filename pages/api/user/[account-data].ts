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
				const user = await User.findById(session.user._id)
					.select('+api_data')
					.exec();
				if (!user) {
					return res.status(404).json('User not found');
				}
				return res.status(200).json(user.api_data);
			}
			if (req.method === 'PUT') {
				await connectMongo();
				const user: MongoUserModel = await User.findById(session.user._id)
					.select('+api_data')
					.exec();
				if (!user) {
					return res.status(404).json('User not found');
				}
				const apiData = user.api_data.find((d) => d.host === req.body.host);
				if (apiData) {
					const updatedUser = await User.findByIdAndUpdate(
						user._id,
						{ $set: { 'api_data.$[el]': req.body } },
						{
							arrayFilters: [{ 'el.host': req.body.host }],
							timestamps: true,
							new: true,
						}
					)
						.select('-_id api_data')
						.exec();
					if (!updatedUser) {
						return res.status(404).json('Error updating user');
					}
					return res.status(200).json(updatedUser.api_data);
				} else {
					const updatedUser = await User.findByIdAndUpdate(
						user._id,
						{ $addToSet: { api_data: req.body } },
						{ upsert: true, timestamps: true, new: true }
					)
						.select('-_id api_data')
						.exec();
					if (!updatedUser) {
						return res.status(404).json('Error updating user');
					}
					return res.status(200).json(updatedUser.api_data);
				}
			}
			if (req.method === 'DELETE') {
				const { host } = req.query as { host: string };
				await connectMongo();
				const user: MongoUserModel | null = await User.findById(
					session.user._id
				).exec();
				if (!user) {
					return res.status(404).json('User not found');
				}
				const updatedUser = await User.findByIdAndUpdate(
					session.user._id,
					{ $pull: { api_data: { host: host } } },
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
		return res.status(404).json(error);
	}
}
