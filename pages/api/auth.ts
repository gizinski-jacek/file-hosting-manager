// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../lib/mongodb';
import User from '../../models/user';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface myJWT extends JwtPayload {
	_id: string;
	username: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<
		{ [key: string]: string | Boolean } | { [key: string]: string }[] | null
	>
) {
	const { userToken } = req.cookies;
	if (!userToken) {
		return res.status(200).json(null);
	}
	if (!process.env.JWT_STRATEGY_SECRET) {
		console.log('Please provide JWT Strategy Secret key');
		return res.status(401).json({ msg: 'Server error' });
	}
	try {
		const decodedToken = jwt.verify(
			userToken,
			process.env.JWT_STRATEGY_SECRET
		) as myJWT;
		await connectMongo();
		const user = await User.findById(decodedToken._id).exec();
		if (!user) {
			return res.status(401).json({ msg: 'Account not found' });
		}
		const data = { ...user._doc };
		delete data.password;
		delete data.createdAt;
		delete data.updatedAt;
		return res.status(200).json(data);
	} catch (error) {
		res.setHeader(
			'Set-Cookie',
			`userToken=''; Path=/; SameSite=strict; HttpOnly=true; Secure=true; Max-Age=-0`
		);
		return res.status(401).json({ msg: 'Failed to verify user token' });
	}
}
