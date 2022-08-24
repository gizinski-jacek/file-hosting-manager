// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios, { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { APIKeyData } from '../../../../lib/types/types';
import { nextAuthOptions } from '../../auth/[...nextauth]';
import formidable from 'formidable-serverless';
import { getUserKeyFromDB, getUserKeyFromToken } from '../../../../lib/helpers';

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
	const session = await unstable_getServerSession(req, res, nextAuthOptions);
	if (req.method === 'GET') {
		if (req.query.pixeldrain === 'get-user-files') {
			if (session && session.user) {
				try {
					const userKey = await getUserKeyFromDB(
						session.user._id,
						'pixeldrain'
					);
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/files',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
							},
						}
					);
					return res.status(200).json(apiRes.data.files);
				} catch (error: any | Error) {
					if (error instanceof AxiosError) {
						return res
							.status(error?.response?.status || 404)
							.json(error?.response?.data || 'Unknown error');
					} else {
						return res
							.status(error.code || 404)
							.json(error.message || 'Unknown error');
					}
				}
			} else if (req.cookies.tempUserToken) {
				const userKey = getUserKeyFromToken(
					req.cookies.tempUserToken,
					'pixeldrain'
				);
				try {
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/files',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
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
			if (session && session.user) {
				try {
					const userKey: APIKeyData = await getUserKeyFromDB(
						session.user._id,
						'pixeldrain'
					);
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/lists',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
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
				const userKey = getUserKeyFromToken(
					req.cookies.tempUserToken,
					'pixeldrain'
				);
				try {
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/lists',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
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
				const resFiles = (await Promise.all(promiseArray)) as AxiosResponse[];
				const returnFiles: File[] = resFiles.map((r) => r.data.file);
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
			if (session && session.user) {
				const userKey: APIKeyData = await getUserKeyFromDB(
					session.user._id,
					'pixeldrain'
				);
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
											Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
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
												Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
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
				const userKey = getUserKeyFromToken(
					req.cookies.tempUserToken,
					'pixeldrain'
				);
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
										Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
									},
								}
							)
						);
						try {
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
												Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
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
			if (session && session.user) {
				const userKey: APIKeyData = await getUserKeyFromDB(
					session.user._id,
					'pixeldrain'
				);
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
											Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
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
				const userKey = getUserKeyFromToken(
					req.cookies.tempUserToken,
					'pixeldrain'
				);
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
										Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
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
			if (session && session.user) {
				const userKey: APIKeyData = await getUserKeyFromDB(
					session.user._id,
					'pixeldrain'
				);
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
										Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
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
				const userKey = getUserKeyFromToken(
					req.cookies.tempUserToken,
					'pixeldrain'
				);
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
						const idArray = [];
						for (const [key, id] of Object.entries(fieldsData)) {
							idArray.push(id);
						}
						const promiseArray = idArray.map((id) =>
							axios.delete(`https://pixeldrain.com/api/file/${id}`, {
								headers: {
									Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
								},
							})
						);
						try {
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
