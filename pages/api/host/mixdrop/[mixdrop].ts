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
	const query = req.query.mixdrop;
	const userKeyData: APIKeyData | null =
		session && session.user
			? await getUserKeyFromDB(session.user._id, 'mixdrop')
			: tempUserToken
			? getUserKeyFromToken(tempUserToken, 'mixdrop')
			: null;
	if (userKeyData) {
		const credentials = {
			params: {
				email: userKeyData.email,
				key: userKeyData.api_key,
			},
		} as { params: { email: string; key: string; parent?: string } };
		if (method === 'GET') {
			if (query === 'get-user-files-and-folders') {
				try {
					const apiRes = await axios.get(
						'https://api.mixdrop.co/folderlist',
						credentials
					);
					if (!apiRes.data.success) throw new Error(apiRes.data.result.msg);
					return res.status(200).json(apiRes.data.result);
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
					const apiRes = await axios.get(
						'https://api.mixdrop.co/folderlist',
						credentials
					);
					if (!apiRes.data.success) throw new Error(apiRes.data.result.msg);
					return res.status(200).json(apiRes.data.result);
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
					// find API request to download file !!!
					const { id } = req.query;
					const apiRes = await axios.get(
						`https://mixdrop.com/api/file/${id}?download`,
						{ responseType: 'blob' }
					);
					if (!apiRes.data.success) throw new Error(apiRes.data.result.msg);
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
					// find API request to download file !!!
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
									axios.get(`https://mixdrop.com/api/file/${id}?download`, {
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
			if (query === 'add-files') {
				try {
					// Vercel max payload size is 4mb. !!!
					// Find a way to pipe file directly to API post request
					// without writing file to host machine
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
					if (fieldsData.parent) {
						credentials.params.parent = fieldsData.parent;
					}
					const promiseArray = filesArray.map(async (file) =>
						axios.post('https://ul.mixdrop.co/api', file, credentials)
					);
					await Promise.all(promiseArray);
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
			if (query === 'create-folder') {
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
										reject(new Error('No folder name'));
									}
									if (Object.keys(fieldsData).length === 0) {
										reject(new Error('No folder name'));
									}
									resolve({ fieldsData });
								}
							);
						});
					if (fieldsData.parent) {
						credentials.params.parent = fieldsData.parent;
					}
					await axios.get('https://api.mixdrop.co/foldercreate', credentials);
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
					const idList = [];
					for (const [key, value] of Object.entries(fieldsData)) {
						if (key === 'folder') {
							break;
						}
						idList.push({ id: value });
					}
					await axios.post(
						'https://mixdrop.com/api/list',
						{
							title: fieldsData.folder,
							anonymous: false,
							files: idList,
						},
						{
							headers: {
								Authorization: `Basic ${btoa(':' + userKeyData.api_key)}`,
							},
						}
					);
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
		if (method === 'DELETE') {
			// find API request to delete file !!!
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
						axios.delete(
							`https://api.mixdrop.co/fileinfo?ref=${id}`,
							credentials
						)
					);
					await Promise.all(promiseArray);
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
		}
	} else {
		return res.status(401).end();
	}
}
