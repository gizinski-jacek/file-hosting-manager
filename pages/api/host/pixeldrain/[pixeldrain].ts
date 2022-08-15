// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import connectMongo from '../../../../lib/mongodb';
import { MongoUserModel, TempUserToken } from '../../../../lib/types/types';
import User from '../../../../models/user';
import { nextAuthOptions } from '../../auth/[...nextauth]';
import jwt from 'jsonwebtoken';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const session = await unstable_getServerSession(req, res, nextAuthOptions);
		if (session && session.user) {
			if (req.method === 'GET') {
				if (req.query.pixeldrain === 'get-user-files') {
					await connectMongo();
					const user: MongoUserModel = await User.findById(session.user._id)
						.select('+api_data')
						.exec();
					if (!user) {
						return res.status(404).json('User not found');
					}
					const userAPIData = user.api_data.find(
						(d) => d.host === 'pixeldrain'
					);
					if (!userAPIData) {
						return res.status(404).json('No api data');
					}
					if (!userAPIData.api_key) {
						return res.status(404).json('No api key');
					}
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/files',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
							},
						}
					);
					return res.status(200).json(apiRes.data.files);
				}
				if (req.query.pixeldrain === 'get-user-folders') {
					await connectMongo();
					const user: MongoUserModel = await User.findById(session.user._id)
						.select('+api_data')
						.exec();
					if (!user) {
						return res.status(404).json('User not found');
					}
					const userAPIData = user.api_data.find(
						(d) => d.host === 'pixeldrain'
					);
					if (!userAPIData) {
						return res.status(404).json('No api data');
					}
					if (!userAPIData.api_key) {
						return res.status(404).json('No api key');
					}
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/lists',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
							},
						}
					);
					return res.status(200).json(apiRes.data.lists);
				}
				if (req.query.pixeldrain === 'get-single-file') {
					const apiRes = await axios.get(
						`https://pixeldrain.com/api/file/${req.query.id}?download`,
						{ responseType: 'blob' }
					);
					return res.status(200).json(apiRes.data);
				}
				if (req.query.pixeldrain === 'get-single-folder') {
					const apiRes = await axios.get(
						`https://pixeldrain.com/api/list/${req.query.id}`
					);
					return res.status(200).json(apiRes.data.files);
				}
			}
			if (req.method === 'POST') {
				// if (req.query.pixeldrain === 'add-file') {
				// 	const userAPIData = session.user.api_data.find(
				// 		(d) => d.host === 'pixeldrain'
				// 	);
				// }
				// if (req.query.pixeldrain === 'add-folder') {
				// 	const userAPIData = session.user.api_data.find(
				// 		(d) => d.host === 'pixeldrain'
				// 	);
				// }
			}
			if (req.method === 'PUT') {
				// if (req.query.pixeldrain === 'update-file') {
				// 	const userAPIData = session.user.api_data.find(
				// 		(d) => d.host === 'pixeldrain'
				// 	);
				// }
				// if (req.query.pixeldrain === 'update-folder') {
				// 	const userAPIData = session.user.api_data.find(
				// 		(d) => d.host === 'pixeldrain'
				// 	);
				// }
			}
			if (req.method === 'DELETE') {
				// if (req.query.pixeldrain === 'delete-file') {
				// 	const userAPIData = session.user.api_data.find(
				// 		(d) => d.host === 'pixeldrain'
				// 	);
				// }
				// if (req.query.pixeldrain === 'delete-folder') {
				// 	const userAPIData = session.user.api_data.find(
				// 		(d) => d.host === 'pixeldrain'
				// 	);
				// }
			}
			return res.status(404).json('No endpoint');
		} else if (req.cookies.tempUserToken) {
			if (req.method === 'GET') {
				if (req.query.pixeldrain === 'get-user-files') {
					if (!process.env.JWT_STRATEGY_SECRET) {
						return res.status(404).json('Server error');
					}
					const decodedToken: TempUserToken = jwt.verify(
						req.cookies.tempUserToken,
						process.env.JWT_STRATEGY_SECRET
					);
					const userAPIData = decodedToken.api_data.find(
						(d) => d.host === 'pixeldrain'
					);
					if (!userAPIData) {
						return res.status(404).json('No api data');
					}
					if (!userAPIData.api_key) {
						return res.status(404).json('No api key');
					}
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/files',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
							},
						}
					);
					return res.status(200).json(apiRes.data.files);
				}
				if (req.query.pixeldrain === 'get-user-folders') {
					if (!process.env.JWT_STRATEGY_SECRET) {
						return res.status(404).json('Server error');
					}
					const decodedToken: TempUserToken = jwt.verify(
						req.cookies.tempUserToken,
						process.env.JWT_STRATEGY_SECRET
					);
					const userAPIData = decodedToken.api_data.find(
						(d) => d.host === 'pixeldrain'
					);
					if (!userAPIData) {
						return res.status(404).json('No api data');
					}
					if (!userAPIData.api_key) {
						return res.status(404).json('No api key');
					}
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/lists',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
							},
						}
					);
					return res.status(200).json(apiRes.data.lists);
				}
				if (req.query.pixeldrain === 'get-single-file') {
					const apiRes = await axios.get(
						`https://pixeldrain.com/api/file/${req.query.id}?download`,
						{ responseType: 'blob' }
					);
					return res.status(200).json(apiRes.data);
				}
				if (req.query.pixeldrain === 'get-single-folder') {
					const apiRes = await axios.get(
						`https://pixeldrain.com/api/list/${req.query.id}`
					);
					return res.status(200).json(apiRes.data.files);
				}
			}
		} else {
			return res.status(404).json({ success: false });
		}
	} catch (error) {
		return res.status(404).json(error);
	}
}
