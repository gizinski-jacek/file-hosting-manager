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
		if (req.query.mixdrop === 'get-user-files-and-folders') {
			if (session && session.user) {
				try {
					const userKey: APIKeyData = await getUserKeyFromDB(
						session.user._id,
						'mixdrop'
					);
					const config = {
						params: {
							email: userKey.email,
							key: userKey.api_key,
						},
					};
					const apiRes = await axios.get(
						'https://api.mixdrop.co/folderlist',
						config
					);
					return res.status(200).json(apiRes.data.result);
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
					'mixdrop'
				);
				const config = {
					params: {
						email: userKey.email,
						key: userKey.api_key,
					},
				};
				try {
					const apiRes = await axios.get(
						'https://api.mixdrop.co/folderlist',
						config
					);
					return res.status(200).json(apiRes.data.result);
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
		if (req.query.mixdrop === 'get-single-folder') {
			if (session && session.user) {
				try {
					const userKey: APIKeyData = await getUserKeyFromDB(
						session.user._id,
						'mixdrop'
					);
					const config = {
						params: {
							email: userKey.email,
							key: userKey.api_key,
						},
					};
					const apiRes = await axios.get(
						'https://api.mixdrop.co/folderlist',
						config
					);
					return res.status(200).json(apiRes.data.result);
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
					'mixdrop'
				);
				const config = {
					params: {
						email: userKey.email,
						key: userKey.api_key,
						id: req.query.id,
					},
				};
				try {
					const apiRes = await axios.get(
						'https://api.mixdrop.co/folderlist',
						config
					);
					return res.status(200).json(apiRes.data.result);
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
		// if (req.query.mixdrop === 'download-single-file') {
		// 	try {
		// 		const apiRes = await axios.get(
		// 			`https://mixdrop.com/api/file/${req.query.id}?download`,
		// 			{ responseType: 'blob' }
		// 		);
		// 		return res.status(200).json(apiRes.data);
		// 	} catch (error) {
		// 		if (error instanceof AxiosError) {
		// 			return res
		// 				.status(error?.response?.status || 404)
		// 				.json(error?.response?.data || 'Unknown error');
		// 		} else {
		// 			return res.status(404).json('Unknown error');
		// 		}
		// 	}
		// }
		// if (req.query.mixdrop === 'download-multiple-files') {
		// 	try {
		// 		let filesIdArray: string[] = [];
		// 		if (typeof req.query['files[]'] === 'string') {
		// 			filesIdArray = [req.query['files[]']];
		// 		} else if (Array.isArray(req.query['files[]'])) {
		// 			filesIdArray = req.query['files[]'];
		// 		}
		// 		const promiseArray = filesIdArray.map((id, index) => {
		// 			return new Promise((resolve, reject) => {
		// 				setTimeout(() => {
		// 					return resolve(
		// 						axios.get(`https://mixdrop.com/api/file/${id}?download`, {
		// 							responseType: 'blob',
		// 						})
		// 					);
		// 				}, 500 * index);
		// 			});
		// 		});
		// 		const resFiles = (await Promise.all(promiseArray)) as AxiosResponse[];
		// 		const returnFiles: File[] = resFiles.map((r) => r.data.file);
		// 		return res.status(200).json(returnFiles);
		// 	} catch (error) {
		// 		if (error instanceof AxiosError) {
		// 			return res
		// 				.status(error?.response?.status || 404)
		// 				.json(error?.response?.data || 'Unknown error');
		// 		} else {
		// 			return res.status(404).json('Unknown error');
		// 		}
		// 	}
		// }
	}
	if (req.method === 'POST') {
		if (req.query.mixdrop === 'add-files') {
			if (session && session.user) {
				const userKey: APIKeyData = await getUserKeyFromDB(
					session.user._id,
					'mixdrop'
				);
				const form = new formidable.IncomingForm();
				const { fieldsData, filesData } = await new Promise(
					(resolve, reject) => {
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
					}
				);
				const filesArray = [];
				for (const [key, file] of Object.entries(filesData)) {
					filesArray.push(file);
				}
				const config = {
					params: {
						email: userKey.email,
						key: userKey.api_key,
					},
				};
				if (fieldsData.parent) {
					config.params.parent = fieldsData.parent;
				}
				const promiseArray = filesArray.map((file) =>
					axios.post('https://ul.mixdrop.co/api', file, config)
				);
				try {
					const resAPI = await Promise.all(promiseArray);
					console.log(resAPI[0].data);
					return res.status(401).json({ success: false });
					return res.status(200).json({ success: true });
				} catch (error) {
					console.log(error);
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
					'mixdrop'
				);
				const form = new formidable.IncomingForm();
				const { fieldsData, filesData } = await new Promise(
					(resolve, reject) => {
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
					}
				);
				const filesArray = [];
				for (const [key, file] of Object.entries(filesData)) {
					filesArray.push(file);
				}
				const config = {
					params: {
						email: userKey.email,
						key: userKey.api_key,
					},
				};
				if (fieldsData.parent) {
					config.params.parent = fieldsData.parent;
				}
				const promiseArray = filesArray.map((file) =>
					axios.post('https://ul.mixdrop.co/api', file, config)
				);
				try {
					const resAPI = await Promise.all(promiseArray);
					console.log(resAPI[0].data);
					return res.status(401).json({ success: false });
					return res.status(200).json({ success: true });
				} catch (error) {
					console.log(error);
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
		if (req.query.mixdrop === 'create-folder') {
			if (session && session.user) {
				const userKey: APIKeyData = await getUserKeyFromDB(
					session.user._id,
					'mixdrop'
				);
				const form = new formidable.IncomingForm();
				const { fieldsData } = await new Promise((resolve, reject) => {
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
				const config = {
					params: {
						email: userKey.email,
						key: userKey.api_key,
						title: fieldsData.folder,
					},
				};
				if (fieldsData.parent) {
					config.params.parent = fieldsData.parent;
				}
				try {
					await axios.get('https://api.mixdrop.co/foldercreate', config);
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
			} else if (req.cookies.tempUserToken) {
				const userKey = getUserKeyFromToken(
					req.cookies.tempUserToken,
					'mixdrop'
				);
				const form = new formidable.IncomingForm();
				const { fieldsData } = await new Promise((resolve, reject) => {
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
				const config = {
					params: {
						email: userKey.email,
						key: userKey.api_key,
						title: fieldsData.folder,
					},
				};
				if (fieldsData.parent) {
					config.params.parent = fieldsData.parent;
				}
				try {
					await axios.get('https://api.mixdrop.co/foldercreate', config);
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
			} else {
				return res.status(401).end();
			}
		}
		// if (req.query.mixdrop === 'add-multiple-files-to-folder') {
		// 	if (session && session.user) {
		// 		const userKey: APIKeyData = await getUserKeyFromDB(
		// 			session.user._id,
		// 			'mixdrop'
		// 		);
		// 		const form = new formidable.IncomingForm();
		// 		const { fieldsData } = await new Promise((resolve, reject) => {
		// 			form.parse(
		// 				req,
		// 				(
		// 					error: Error,
		// 					fieldsData: { [key: string]: string },
		// 					filesData: { [key: string]: File }
		// 				) => {
		// 					if (error) {
		// 						reject({ error });
		// 					}
		// 					if (!fieldsData) {
		// 						reject(new Error('No folder name or files selected'));
		// 					}
		// 					if (Object.keys(fieldsData).length === 0) {
		// 						reject(new Error('No folder name or files selected'));
		// 					}
		// 					resolve({ fieldsData });
		// 				}
		// 			);
		// 		});
		// 		const idList = [];
		// 		for (const [key, value] of Object.entries(fieldsData)) {
		// 			if (key === 'folder') {
		// 				break;
		// 			}
		// 			idList.push({ id: value });
		// 		}
		// 		try {
		// 			try {
		// 				await axios.post(
		// 					'https://mixdrop.com/api/list',
		// 					{
		// 						title: fieldsData.folder,
		// 						anonymous: false,
		// 						files: idList,
		// 					},
		// 					{
		// 						headers: {
		// 							Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
		// 						},
		// 					}
		// 				);
		// 			} catch (error) {
		// 				if (error instanceof AxiosError) {
		// 					return res
		// 						.status(error?.response?.status || 404)
		// 						.json(error?.response?.data || 'Unknown error');
		// 				} else {
		// 					return res.status(404).json('Unknown error');
		// 				}
		// 			}
		// 			return res.status(200).json({ success: true });
		// 		} catch (error) {
		// 			if (error instanceof AxiosError) {
		// 				return res
		// 					.status(error?.response?.status || 404)
		// 					.json(error?.response?.data || 'Unknown error');
		// 			} else {
		// 				return res.status(404).json('Unknown error');
		// 			}
		// 		}
		// 	} else if (req.cookies.tempUserToken) {
		// 		const userKey = getUserKeyFromToken(
		// 			req.cookies.tempUserToken,
		// 			'mixdrop'
		// 		);
		// 		const form = new formidable.IncomingForm();
		// 		const { fieldsData } = await new Promise((resolve, reject) => {
		// 			form.parse(
		// 				req,
		// 				(
		// 					error: Error,
		// 					fieldsData: { [key: string]: string },
		// 					filesData: { [key: string]: File }
		// 				) => {
		// 					if (error) {
		// 						reject({ error });
		// 					}
		// 					if (!fieldsData) {
		// 						reject(new Error('No folder name or files selected'));
		// 					}
		// 					if (Object.keys(fieldsData).length === 0) {
		// 						reject(new Error('No folder name or files selected'));
		// 					}
		// 					resolve({ fieldsData });
		// 				}
		// 			);
		// 		});
		// 		const idList = [];
		// 		for (const [key, value] of Object.entries(fieldsData)) {
		// 			if (key === 'folder') {
		// 				break;
		// 			}
		// 			idList.push({ id: value });
		// 		}
		// 		try {
		// 			await axios.post(
		// 				'https://mixdrop.com/api/list',
		// 				{
		// 					title: fieldsData.folder,
		// 					anonymous: false,
		// 					files: idList,
		// 				},
		// 				{
		// 					headers: {
		// 						Authorization: `Basic ${btoa(':' + userKey.api_key)}`,
		// 					},
		// 				}
		// 			);
		// 		} catch (error) {
		// 			if (error instanceof AxiosError) {
		// 				return res
		// 					.status(error?.response?.status || 404)
		// 					.json(error?.response?.data || 'Unknown error');
		// 			} else {
		// 				return res.status(404).json('Unknown error');
		// 			}
		// 		}
		// 	} else {
		// 		return res.status(401).end();
		// 	}
		// }
	}
	if (req.method === 'DELETE') {
		// if (req.query.mixdrop === 'delete-files') {
		// 	if (session && session.user) {
		// 		const userKey: APIKeyData = await getUserKeyFromDB(
		// 			session.user._id,
		// 			'mixdrop'
		// 		);
		// 		const form = new formidable.IncomingForm();
		// 		const { fieldsData } = await new Promise((resolve, reject) => {
		// 			form.parse(
		// 				req,
		// 				(
		// 					error: Error,
		// 					fieldsData: { [key: string]: string },
		// 					filesData: { [key: string]: File }
		// 				) => {
		// 					if (error) {
		// 						reject({ error });
		// 					}
		// 					if (!fieldsData) {
		// 						reject(new Error('No files selected'));
		// 					}
		// 					if (Object.keys(fieldsData).length === 0) {
		// 						reject(new Error('No files selected'));
		// 					}
		// 					resolve({ fieldsData });
		// 				}
		// 			);
		// 		});
		// 		const config = {
		// 			params: {
		// 				email: userKey.email,
		// 				key: userKey.api_key,
		// 			},
		// 		};
		// 		const idArray = [];
		// 		for (const [key, id] of Object.entries(fieldsData)) {
		// 			idArray.push(id);
		// 		}
		// 		// const promiseArray = idArray.map((id) =>
		// 		// 	axios.delete(`https://api.mixdrop.co/fileinfo?ref=${id}`, config)
		// 		// );
		// 		try {
		// 			const ress = await Promise.all(promiseArray);
		// 			console.log(ress.data);
		// 			return res.status(200).json({ success: true });
		// 		} catch (error) {
		// 			console.log(error);
		// 			if (error instanceof AxiosError) {
		// 				return res
		// 					.status(error?.response?.status || 404)
		// 					.json(error?.response?.data || 'Unknown error');
		// 			} else {
		// 				return res.status(404).json('Unknown error');
		// 			}
		// 		}
		// 	} else if (req.cookies.tempUserToken) {
		// 		const userKey = getUserKeyFromToken(
		// 			req.cookies.tempUserToken,
		// 			'mixdrop'
		// 		);
		// 		const form = new formidable.IncomingForm();
		// 		const { fieldsData } = await new Promise((resolve, reject) => {
		// 			form.parse(
		// 				req,
		// 				(
		// 					error: Error,
		// 					fieldsData: { [key: string]: string },
		// 					filesData: { [key: string]: File }
		// 				) => {
		// 					if (error) {
		// 						reject({ error });
		// 					}
		// 					if (!fieldsData) {
		// 						reject(new Error('No files selected'));
		// 					}
		// 					if (Object.keys(fieldsData).length === 0) {
		// 						reject(new Error('No files selected'));
		// 					}
		// 					resolve({ fieldsData });
		// 				}
		// 			);
		// 		});
		// 		const config = {
		// 			params: {
		// 				email: userKey.email,
		// 				key: userKey.api_key,
		// 			},
		// 		};
		// 		const idArray = [];
		// 		for (const [key, id] of Object.entries(fieldsData)) {
		// 			idArray.push(id);
		// 		}
		// 		// const promiseArray = idArray.map((id) =>
		// 		// 	axios.delete(`https://api.mixdrop.co/fileinfo?ref=${id}`, config)
		// 		// );
		// 		try {
		// 			await Promise.all(promiseArray);
		// 			return res.status(200).json({ success: true });
		// 		} catch (error) {
		// 			if (error instanceof AxiosError) {
		// 				return res
		// 					.status(error?.response?.status || 404)
		// 					.json(error?.response?.data || 'Unknown error');
		// 			} else {
		// 				return res.status(404).json('Unknown error');
		// 			}
		// 		}
		// 	} else {
		// 		return res.status(401).end();
		// 	}
		// }
	}
}
