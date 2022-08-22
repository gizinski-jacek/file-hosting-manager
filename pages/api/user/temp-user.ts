// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { TempUserToken } from '../../../lib/types/types';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		if (req.method === 'PUT') {
			if (req.cookies.tempUserToken) {
				if (!process.env.JWT_STRATEGY_SECRET) {
					return res.status(404).json('Server error');
				}
				const decodedToken: TempUserToken = jwt.verify(
					req.cookies.tempUserToken,
					process.env.JWT_STRATEGY_SECRET
				);
				const filtered = decodedToken.api_data.filter(
					(d) => d.host !== req.body.host
				);
				const payload = {
					api_data: [filtered, req.body],
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
					api_data: [req.body],
				};
				const token = jwt.sign(payload, process.env.JWT_STRATEGY_SECRET);
				res.setHeader(
					'Set-Cookie',
					`tempUserToken=${token}; Path=/; httpOnly=true; SameSite=strict; Secure=true; Max-Age=3600` // 60 minutes
				);
				return res.status(200).json({ success: true });
			}
		}
	} catch (error) {
		return res.status(404).json(error);
	}
}
