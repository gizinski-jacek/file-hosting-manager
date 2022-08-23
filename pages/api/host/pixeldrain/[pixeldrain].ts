// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios, { AxiosError } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import connectMongo from '../../../../lib/mongodb';
import { MongoUserModel, TempUserToken } from '../../../../lib/types/types';
import User from '../../../../models/user';
import { nextAuthOptions } from '../../auth/[...nextauth]';
import jwt from 'jsonwebtoken';
import formidable from 'formidable-serverless';

export const config = {
	api: {
		bodyParser: false,
		externalResolver: true,
	},
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'GET') {
		if (req.query.pixeldrain === 'get-user-files') {
			const session = await unstable_getServerSession(
				req,
				res,
				nextAuthOptions
			);
			if (session && session.user) {
				try {
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
				} catch (error) {
					if (error instanceof AxiosError) {
					} else {
						return res.status(404).json('Unknown error');
					}
				}
			} else if (req.cookies.tempUserToken) {
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
				try {
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/files',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
							},
						}
					);
					return res.status(200).json(apiRes.data.files);
				} catch (error) {
					if (error instanceof AxiosError) {
						return res
							.status(error?.response?.status || 404)
							.json(error?.response?.data || 'Unknown error');
					} else {
						return res.status(404).json('Unknown error');
					}
				}
			} else {
				return res.status(401).end();
			}
		}
		if (req.query.pixeldrain === 'get-user-folders') {
			const session = await unstable_getServerSession(
				req,
				res,
				nextAuthOptions
			);
			if (session && session.user) {
				try {
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
				} catch (error) {
					if (error instanceof AxiosError) {
						return res
							.status(error?.response?.status || 404)
							.json(error?.response?.data || 'Unknown error');
					} else {
						return res.status(404).json('Unknown error');
					}
				}
			} else if (req.cookies.tempUserToken) {
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
				try {
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/lists',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
							},
						}
					);
					return res.status(200).json(apiRes.data.lists);
				} catch (error) {
					if (error instanceof AxiosError) {
						return res
							.status(error?.response?.status || 404)
							.json(error?.response?.data || 'Unknown error');
					} else {
						return res.status(404).json('Unknown error');
					}
				}
			} else {
				return res.status(401).end();
			}
		}
		if (req.query.pixeldrain === 'download-single-file') {
			try {
				const apiRes = await axios.get(
					`https://pixeldrain.com/api/file/${req.query.id}?download`,
					{ responseType: 'blob' }
				);
				return res.status(200).json(apiRes.data);
			} catch (error) {
				if (error instanceof AxiosError) {
					return res
						.status(error?.response?.status || 404)
						.json(error?.response?.data || 'Unknown error');
				} else {
					return res.status(404).json('Unknown error');
				}
			}
		}
		if (req.query.pixeldrain === 'download-multiple-files') {
			try {
				let filesIdArray: string[] = [];
				if (typeof req.query['files[]'] === 'string') {
					filesIdArray = [req.query['files[]']];
				} else if (Array.isArray(req.query['files[]'])) {
					filesIdArray = req.query['files[]'];
				}
				const promiseArray = filesIdArray.map((id, index) => {
					return new Promise((resolve, reject) => {
						setTimeout(() => {
							return resolve(
								axios.get(`https://pixeldrain.com/api/file/${id}?download`, {
									responseType: 'blob',
								})
							);
						}, 500 * index);
					});
				});
				const resFiles = await Promise.all(promiseArray);
				const returnFiles = resFiles.map((file) => file.data);
				return res.status(200).json(returnFiles);
			} catch (error) {
				if (error instanceof AxiosError) {
					return res
						.status(error?.response?.status || 404)
						.json(error?.response?.data || 'Unknown error');
				} else {
					return res.status(404).json('Unknown error');
				}
			}
		}
		if (req.query.pixeldrain === 'get-single-folder') {
			try {
				const apiRes = await axios.get(
					`https://pixeldrain.com/api/list/${req.query.id}`
				);
				return res.status(200).json(apiRes.data.files);
			} catch (error) {
				if (error instanceof AxiosError) {
					return res
						.status(error?.response?.status || 404)
						.json(error?.response?.data || 'Unknown error');
				} else {
					return res.status(404).json('Unknown error');
				}
			}
		}
	}
	if (req.method === 'POST') {
		if (req.query.pixeldrain === 'add-file') {
			const session = await unstable_getServerSession(
				req,
				res,
				nextAuthOptions
			);
			if (session && session.user) {
				const form = new formidable.IncomingForm();
				form.parse(
					req,
					async (
						error: Error,
						fieldsData: { [key: string]: string },
						filesData: { [key: string]: File }
					) => {
						if (error) {
							return res.status(404).json(error);
						}
						if (!filesData) {
							return res.status(404).json('No files selected');
						}
						if (Object.keys(filesData).length === 0) {
							return res.status(404).json('No files selected');
						}
						try {
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
							const filesArray = [];
							for (const [key, file] of Object.entries(filesData)) {
								filesArray.push(file);
							}
							const promiseArray = filesArray.map((file) =>
								axios.put(
									`https://pixeldrain.com/api/file/${file.name}`,
									{ file: file },
									{
										headers: {
											Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
										},
									}
								)
							);
							const resFiles = await Promise.all(promiseArray);
							if (fieldsData.folder) {
								const filesIdArray = resFiles.map((r) => r.data);
								try {
									await axios.post(
										'https://pixeldrain.com/api/list',
										{
											title: fieldsData.folder,
											anonymous: false,
											files: filesIdArray,
										},
										{
											headers: {
												Authorization: `Basic ${btoa(
													':' + userAPIData.api_key
												)}`,
											},
										}
									);
								} catch (error) {
									if (error instanceof AxiosError) {
										return res
											.status(error?.response?.status || 404)
											.json(error?.response?.data || 'Unknown error');
									} else {
										return res.status(404).json('Unknown error');
									}
								}
							}
							return res.status(200).json({ success: true });
						} catch (error) {
							if (error instanceof AxiosError) {
								return res
									.status(error?.response?.status || 404)
									.json(error?.response?.data || 'Unknown error');
							} else {
								return res.status(404).json('Unknown error');
							}
						}
					}
				);
			} else if (req.cookies.tempUserToken) {
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
				const form = new formidable.IncomingForm();
				form.parse(
					req,
					async (
						error: Error,
						fieldsData: { [key: string]: string },
						filesData: { [key: string]: File }
					) => {
						if (error) {
							return res.status(404).json(error);
						}
						if (!filesData) {
							return res.status(200).json({ success: false });
						}
						if (Object.keys(filesData).length === 0) {
							return res.status(404).json('No files selected');
						}
						try {
							const filesArray = [];
							for (const [key, file] of Object.entries(filesData)) {
								filesArray.push(file);
							}
							const promiseArray = filesArray.map((file) =>
								axios.put(
									`https://pixeldrain.com/api/file/${file.name}`,
									{ file: file },
									{
										headers: {
											Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
										},
									}
								)
							);
							const resFiles = await Promise.all(promiseArray);
							if (fieldsData.folder) {
								const filesIdArray = resFiles.map((r) => r.data);
								try {
									await axios.post(
										'https://pixeldrain.com/api/list',
										{
											title: fieldsData.folder,
											anonymous: false,
											files: filesIdArray,
										},
										{
											headers: {
												Authorization: `Basic ${btoa(
													':' + userAPIData.api_key
												)}`,
											},
										}
									);
								} catch (error) {
									if (error instanceof AxiosError) {
										return res
											.status(error?.response?.status || 404)
											.json(error?.response?.data || 'Unknown error');
									} else {
										return res.status(404).json('Unknown error');
									}
								}
							}
							return res.status(200).json({ success: true });
						} catch (error) {
							if (error instanceof AxiosError) {
								return res
									.status(error?.response?.status || 404)
									.json(error?.response?.data || 'Unknown error');
							} else {
								return res.status(404).json('Unknown error');
							}
						}
					}
				);
			} else {
				return res.status(401).end();
			}
		}
		if (req.query.pixeldrain === 'add-multiple-files-to-folder') {
			const session = await unstable_getServerSession(
				req,
				res,
				nextAuthOptions
			);
			if (session && session.user) {
				const form = new formidable.IncomingForm();
				form.parse(
					req,
					async (
						error: Error,
						fieldsData: { [key: string]: string },
						filesData: { [key: string]: File }
					) => {
						if (error) {
							return res.status(404).json(error);
						}
						if (!fieldsData && !filesData) {
							return res.status(200).json({ success: false });
						}
						if (
							Object.entries(fieldsData).some(([key, value]) => value === '')
						) {
							return res.status(404).json('No folder name or files selected');
						}
						const idList = [];
						for (const [key, value] of Object.entries(fieldsData)) {
							if (key === 'folder') {
								break;
							}
							idList.push({ id: value });
						}
						try {
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
							try {
								await axios.post(
									'https://pixeldrain.com/api/list',
									{
										title: fieldsData.folder,
										anonymous: false,
										files: idList,
									},
									{
										headers: {
											Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
										},
									}
								);
							} catch (error) {
								if (error instanceof AxiosError) {
									return res
										.status(error?.response?.status || 404)
										.json(error?.response?.data || 'Unknown error');
								} else {
									return res.status(404).json('Unknown error');
								}
							}
							return res.status(200).json({ success: true });
						} catch (error) {
							if (error instanceof AxiosError) {
								return res
									.status(error?.response?.status || 404)
									.json(error?.response?.data || 'Unknown error');
							} else {
								return res.status(404).json('Unknown error');
							}
						}
					}
				);
			} else if (req.cookies.tempUserToken) {
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
				const form = new formidable.IncomingForm();
				form.parse(
					req,
					async (
						error: Error,
						fieldsData: { [key: string]: string },
						filesData: { [key: string]: File }
					) => {
						if (error) {
							return res.status(404).json(error);
						}
						if (!fieldsData && !filesData) {
							return res.status(200).json({ success: false });
						}
						if (
							Object.entries(fieldsData).some(([key, value]) => value === '')
						) {
							return res.status(404).json('No folder name or files selected');
						}
						const idList = [];
						for (const [key, value] of Object.entries(fieldsData)) {
							if (key === 'folder') {
								break;
							}
							idList.push({ id: value });
						}
						try {
							await axios.post(
								'https://pixeldrain.com/api/list',
								{
									title: fieldsData.folder,
									anonymous: false,
									files: idList,
								},
								{
									headers: {
										Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
									},
								}
							);
						} catch (error) {
							if (error instanceof AxiosError) {
								return res
									.status(error?.response?.status || 404)
									.json(error?.response?.data || 'Unknown error');
							} else {
								return res.status(404).json('Unknown error');
							}
						}
					}
				);
			} else {
				return res.status(401).end();
			}
		}
	}
	if (req.method === 'DELETE') {
		if (req.query.pixeldrain === 'delete-files') {
			const session = await unstable_getServerSession(
				req,
				res,
				nextAuthOptions
			);
			if (session && session.user) {
				const form = new formidable.IncomingForm();
				form.parse(
					req,
					async (
						error: Error,
						fieldsData: { [key: string]: string },
						filesData: { [key: string]: File }
					) => {
						if (error) {
							return res.status(404).json(error);
						}
						if (!fieldsData) {
							return res.status(404).json('No files selected');
						}
						if (Object.keys(fieldsData).length === 0) {
							return res.status(404).json('No files selected');
						}
						try {
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
							const idArray = [];
							for (const [key, id] of Object.entries(fieldsData)) {
								idArray.push(id);
							}
							const promiseArray = idArray.map((id) =>
								axios.delete(`https://pixeldrain.com/api/file/${id}`, {
									headers: {
										Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
									},
								})
							);
							await Promise.all(promiseArray);
							return res.status(200).json({ success: true });
						} catch (error) {
							if (error instanceof AxiosError) {
								return res
									.status(error?.response?.status || 404)
									.json(error?.response?.data || 'Unknown error');
							} else {
								return res.status(404).json('Unknown error');
							}
						}
					}
				);
			} else if (req.cookies.tempUserToken) {
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
				const form = new formidable.IncomingForm();
				form.parse(
					req,
					async (
						error: Error,
						fieldsData: { [key: string]: string },
						filesData: { [key: string]: File }
					) => {
						if (error) {
							return res.status(404).json(error);
						}
						if (!fieldsData) {
							return res.status(404).json('No files selected');
						}
						if (Object.keys(fieldsData).length === 0) {
							return res.status(404).json('No files selected');
						}
						try {
							const idArray = [];
							for (const [key, id] of Object.entries(fieldsData)) {
								idArray.push(id);
							}
							const promiseArray = idArray.map((id) =>
								axios.delete(`https://pixeldrain.com/api/file/${id}`, {
									headers: {
										Authorization: `Basic ${btoa(':' + userAPIData.api_key)}`,
									},
								})
							);
							await Promise.all(promiseArray);
							return res.status(200).json({ success: true });
						} catch (error) {
							if (error instanceof AxiosError) {
								return res
									.status(error?.response?.status || 404)
									.json(error?.response?.data || 'Unknown error');
							} else {
								return res.status(404).json('Unknown error');
							}
						}
					}
				);
			} else {
				return res.status(401).end();
			}
		}
	}
}
