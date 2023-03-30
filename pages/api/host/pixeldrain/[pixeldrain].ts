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
	const { tempUserToken } = req.cookies;
	const { method } = req;
	const query = req.query.pixeldrain;
	const userKeyData: APIKeyData | null =
		session && session.user
			? await getUserKeyFromDB(session.user._id, 'pixeldrain')
			: tempUserToken
			? getUserKeyFromToken(tempUserToken, 'pixeldrain')
			: null;
	if (userKeyData) {
		if (method === 'GET') {
			if (query === 'get-user-files') {
				try {
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/files',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userKeyData.api_key)}`,
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
						return res.status(404).json('Unknown error');
					}
				}
			}
			if (query === 'get-user-folders') {
				try {
					const apiRes = await axios.get(
						'https://pixeldrain.com/api/user/lists',
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userKeyData.api_key)}`,
							},
						}
					);
					return res.status(200).json(apiRes.data.lists);
				} catch (error: any) {
					if (error instanceof AxiosError) {
						return res
							.status(error?.response?.status || 404)
							.json(error?.response?.data || 'Unknown error');
					} else {
						return res.status(404).json('Unknown error');
					}
				}
			}
			if (query === 'get-single-folder') {
				try {
					const { id } = req.query;
					const apiRes = await axios.get(
						`https://pixeldrain.com/api/list/${id}`
					);
					return res.status(200).json(apiRes.data.files || []);
				} catch (error: any) {
					if (error instanceof AxiosError) {
						return res
							.status(error?.response?.status || 404)
							.json(error?.response?.data || 'Unknown error');
					} else {
						return res.status(404).json('Unknown error');
					}
				}
			}
			if (query === 'download-single-file') {
				try {
					const { id } = req.query;
					const apiRes = await axios.get(
						`https://pixeldrain.com/api/file/${id}?download`,
						{ responseType: 'blob' }
					);
					return res.status(200).json(apiRes.data);
				} catch (error: any) {
					if (error instanceof AxiosError) {
						return res
							.status(error?.response?.status || 404)
							.json(error?.response?.data || 'Unknown error');
					} else {
						return res.status(404).json('Unknown error');
					}
				}
			}
			if (query === 'download-multiple-files') {
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
				} catch (error: any) {
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
		if (method === 'POST') {
			// Needs fixing, sends file info, not the file itself.
			if (query === 'add-files') {
				try {
					const form = new formidable.IncomingForm();
					const {
						fieldsData,
						filesData,
					}: {
						fieldsData: { [key: string]: string };
						filesData: { [key: string]: File };
					} = await new Promise((resolve, reject) => {
						form.parse(
							req,
							(
								error: Error,
								fieldsData: { [key: string]: string },
								filesData: { [key: string]: File }
							) => {
								if (error) {
									reject({ error });
								}
								if (!filesData) {
									reject(new Error('No files selected'));
								}
								if (Object.keys(filesData).length === 0) {
									reject(new Error('No files selected'));
								}
								resolve({ fieldsData, filesData });
							}
						);
					});
					const filesArray = [];
					for (const [key, file] of Object.entries(filesData)) {
						filesArray.push(file);
					}
					const promiseArray = filesArray.map(async (file) =>
						axios.put(`https://pixeldrain.com/api/file/${file.name}`, file, {
							headers: {
								Authorization: `Basic ${btoa(':' + userKeyData.api_key)}`,
							},
						})
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
										Authorization: `Basic ${btoa(':' + userKeyData.api_key)}`,
									},
								}
							);
						} catch (error: any) {
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
				} catch (error: any) {
					console.error(error);
					if (error instanceof AxiosError) {
						return res
							.status(error?.response?.status || 404)
							.json(error?.response?.data || 'Unknown error');
					} else {
						return res.status(404).json('Unknown error');
					}
				}
			}
			if (query === 'add-multiple-files-to-folder') {
				try {
					const form = new formidable.IncomingForm();
					const { fieldsData }: { fieldsData: { [key: string]: string } } =
						await new Promise((resolve, reject) => {
							form.parse(
								req,
								(
									error: Error,
									fieldsData: { [key: string]: string },
									filesData: { [key: string]: File }
								) => {
									if (error) {
										reject({ error });
									}
									if (!fieldsData) {
										reject(new Error('No folder name or files selected'));
									}
									if (Object.keys(fieldsData).length === 0) {
										reject(new Error('No folder name or files selected'));
									}
									resolve({ fieldsData });
								}
							);
						});
					const filesIdList = [];
					for (const [key, value] of Object.entries(fieldsData)) {
						if (key === 'folder') {
							continue;
						}
						filesIdList.push({ id: value });
					}
					const apiRes = await axios.post(
						'https://pixeldrain.com/api/list',
						{
							title: fieldsData.folder,
							anonymous: false,
							files: filesIdList,
						},
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userKeyData.api_key)}`,
							},
						}
					);
					return res.status(200).json(apiRes.data.id);
				} catch (error: any) {
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
		if (method === 'DELETE') {
			if (query === 'delete-folder') {
				try {
					const { id } = req.query;
					await axios.delete(`https://pixeldrain.com/api/list/${id}`, {
						headers: {
							Authorization: `Basic ${btoa(':' + userKeyData.api_key)}`,
						},
					});
					return res.status(200).json({ success: true });
				} catch (error: any) {
					if (error instanceof AxiosError) {
						return res
							.status(error?.response?.status || 404)
							.json(error?.response?.data || 'Unknown error');
					} else {
						return res.status(404).json('Unknown error');
					}
				}
			}
			if (query === 'delete-files') {
				try {
					const form = new formidable.IncomingForm();
					const { fieldsData }: { fieldsData: { [key: string]: string } } =
						await new Promise((resolve, reject) => {
							form.parse(
								req,
								(
									error: Error,
									fieldsData: { [key: string]: string },
									filesData: { [key: string]: File }
								) => {
									if (error) {
										reject({ error });
									}
									if (!fieldsData) {
										reject(new Error('No files selected'));
									}
									if (Object.keys(fieldsData).length === 0) {
										reject(new Error('No files selected'));
									}
									resolve({ fieldsData });
								}
							);
						});
					const filesIdArray = [];
					for (const [key, id] of Object.entries(fieldsData)) {
						filesIdArray.push(id);
					}
					const promiseArray = filesIdArray.map((id) =>
						axios.delete(`https://pixeldrain.com/api/file/${id}`, {
							headers: {
								Authorization: `Basic ${btoa(':' + userKeyData.api_key)}`,
							},
						})
					);
					await Promise.all(promiseArray);
					return res.status(200).json({ success: true });
				} catch (error: any) {
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
	} else {
		return res.status(401).end();
	}
}
