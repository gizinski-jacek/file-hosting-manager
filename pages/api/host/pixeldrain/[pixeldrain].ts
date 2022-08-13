// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		if (req.method === 'GET') {
			if (req.query.pixeldrain === 'get-user-files') {
				const decodedToken = await getToken({ req });
				const userAPIData = decodedToken.user.api_data.find(
					(d) => d.host === 'pixeldrain'
				);
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
				const decodedToken = await getToken({ req });
				const userAPIData = decodedToken.user.api_data.find(
					(d) => d.host === 'pixeldrain'
				);
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
			// 	const decodedToken = await getToken({ req });
			// 	const userAPIData = decodedToken.user.api_data.find(
			// 		(d) => d.host === 'pixeldrain'
			// 	);
			// }
			// if (req.query.pixeldrain === 'add-folder') {
			// 	const decodedToken = await getToken({ req });
			// 	const userAPIData = decodedToken.user.api_data.find(
			// 		(d) => d.host === 'pixeldrain'
			// 	);
			// }
		}
		if (req.method === 'PUT') {
			// if (req.query.pixeldrain === 'update-file') {
			// 	const decodedToken = await getToken({ req });
			// 	const userAPIData = decodedToken.user.api_data.find(
			// 		(d) => d.host === 'pixeldrain'
			// 	);
			// }
			// if (req.query.pixeldrain === 'update-folder') {
			// 	const decodedToken = await getToken({ req });
			// 	const userAPIData = decodedToken.user.api_data.find(
			// 		(d) => d.host === 'pixeldrain'
			// 	);
			// }
		}
		if (req.method === 'DELETE') {
			// if (req.query.pixeldrain === 'delete-file') {
			// 	const decodedToken = await getToken({ req });
			// 	const userAPIData = decodedToken.user.api_data.find(
			// 		(d) => d.host === 'pixeldrain'
			// 	);
			// }
			// if (req.query.pixeldrain === 'delete-folder') {
			// 	const decodedToken = await getToken({ req });
			// 	const userAPIData = decodedToken.user.api_data.find(
			// 		(d) => d.host === 'pixeldrain'
			// 	);
			// }
		}
		return res.status(200).json({ success: false });
	} catch (error) {
		return res.status(200).json(error);
	}
}
