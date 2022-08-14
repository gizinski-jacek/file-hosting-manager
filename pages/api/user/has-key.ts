// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import connectMongo from '../../../lib/mongodb';
import User from '../../../models/user';
import { nextAuthOptions } from '../auth/[...nextauth]';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const session = await unstable_getServerSession(req, res, nextAuthOptions);
		if (session) {
			if (req.method === 'GET') {
				const { host } = req.query as { host: string };
				await connectMongo();
				const user = await User.findById(session.user?._id)
					.select('+api_data')
					.exec();
				const apiData = user.api_data.find((d) => d.host === host);
				if (!apiData || !apiData.api_key) {
					return res.status(200).json(false);
				} else {
					return res.status(200).json(true);
				}
			}
			return res.status(404).json({ success: false });
		} else {
			return res.status(401).json('Unauthorized access');
		}
	} catch (error) {
		return res.status(404).json(error);
	}
}
