// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongodb';
import User from '../../../models/user';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		if (req.method === 'POST') {
			await connectMongo();
			const user = await User.findOne({
				$or: [
					{ email: req.body.username_or_email },
					{ username: req.body.username_or_email },
				],
			})
				.select('+password')
				.exec();
			if (!user) {
				return res.status(404).json('Account not found');
			}
			// handle password reset
			return res.status(200).json({ success: true });
		}
		return res.status(200).json('No endpoint');
	} catch (error) {
		console.log(error);
		return res.status(404).json(error);
	}
}
