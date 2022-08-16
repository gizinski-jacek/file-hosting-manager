import { useCallback, useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import {
	Button,
	FormControl,
	FormGroup,
	Grid,
	Input,
	InputLabel,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { APIFormData, PixeldrainFile } from '../../lib/types/types';
import { useSession } from 'next-auth/react';

const Pixeldrain = () => {
	const { data: user } = useSession();
	const [userHasAPIKey, setUserHasAPIKey] = useState(false);
	const [formData, setFormData] = useState<APIFormData>({
		host: 'pixeldrain',
		api_key: '',
	});
	const [filesData, setFilesData] = useState<PixeldrainFile[]>();
	const [foldersData, setFoldersData] = useState<PixeldrainFile[]>();
	const [selectedFolder, setSelectedFolder] = useState('root');

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleFormSubmit = async () => {
		try {
			if (user) {
				await axios.put('/api/user/account-data', formData, {
					withCredentials: true,
				});
			} else {
				await axios.post('/api/user/temp-user', formData, {
					withCredentials: true,
				});
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleGetMainData = async () => {
		try {
			const res: AxiosResponse[] = await axios.all([
				axios.get('/api/host/pixeldrain/get-user-files', {
					withCredentials: true,
				}),
				axios.get('/api/host/pixeldrain/get-user-folders', {
					withCredentials: true,
				}),
			]);
			setFilesData(res[0].data);
			setFoldersData(res[1].data);
		} catch (error) {
			console.log(error);
		}
	};

	const handleGetFolderFilesData = useCallback(async () => {
		try {
			if (userHasAPIKey) {
				if (selectedFolder === 'root') {
					handleGetMainData();
				} else {
					const res: AxiosResponse = await axios.get(
						`/api/host/pixeldrain/get-single-folder?id=${selectedFolder}`
					);
					setFilesData(res.data);
				}
			}
		} catch (error) {
			console.log(error);
		}
	}, [selectedFolder, userHasAPIKey]);

	const handleGetSingleFileData = async (fileId: string, fileName: string) => {
		try {
			const res: AxiosResponse = await axios.get(
				`/api/host/pixeldrain/get-single-file?id=${fileId}`,
				{ responseType: 'blob' }
			);
			const fileURL = window.URL.createObjectURL(new Blob([res.data]));
			const link = document.createElement('a');
			link.href = fileURL;
			link.setAttribute('download', fileName);
			document.body.appendChild(link);
			link.click();
			return;
		} catch (error) {
			console.log(error);
		}
	};

	const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedFolder(e.target.value);
	};

	useEffect(() => {
		(async () => {
			try {
				const res = await axios.get('/api/user/has-key?host=pixeldrain', {
					withCredentials: true,
				});
				setUserHasAPIKey(res.data);
			} catch (error) {
				console.log(error);
			}
		})();
	}, []);

	useEffect(() => {
		if (userHasAPIKey) {
			handleGetMainData();
		}
	}, [userHasAPIKey]);

	useEffect(() => {
		handleGetFolderFilesData();
	}, [selectedFolder, handleGetFolderFilesData]);

	return (
		<div>
			{userHasAPIKey ? (
				<div className='main'>
					<Grid container p={2}>
						<Refresh
							sx={{ mx: 1, cursor: 'pointer' }}
							onClick={handleGetFolderFilesData}
						>
							123
						</Refresh>
						<FormControl sx={{ mx: 1 }}>
							<InputLabel htmlFor='folder'>Change folder</InputLabel>
							<select
								id='folder'
								value={selectedFolder}
								onChange={(e) => handleFolderChange(e)}
							>
								<option value='root'>root</option>
								{foldersData?.map((folder) => {
									return (
										<option key={folder.id} value={folder.id}>
											{folder.title}
										</option>
									);
								})}
							</select>
						</FormControl>
					</Grid>
					<div>
						<Grid container p={2}>
							<Grid item xs={7} textAlign='start'>
								Name
							</Grid>
							<Grid item xs={2} textAlign='end'>
								Created
							</Grid>
							<Grid item xs={1} textAlign='end'>
								Size
							</Grid>
							<Grid item xs={1} textAlign='end'>
								Downloads
							</Grid>
							<Grid item xs={1} textAlign='end'>
								Views
							</Grid>
						</Grid>
						<Grid container>
							{filesData?.map((file) => {
								return (
									<Grid
										container
										alignItems={'center'}
										mx={2}
										key={file.id}
										id={file.id}
									>
										<Grid
											item
											xs={7}
											sx={{ display: 'flex' }}
											justifyContent='space-between'
											alignItems='center'
										>
											{file.name}
											<Grid item>
												<Button
													type='button'
													onClick={() =>
														handleGetSingleFileData(file.id, file.name)
													}
												>
													Download
												</Button>
												<Button
													component='a'
													href={`https://pixeldrain.com/u/${file.id}`}
													target='_blank'
												>
													Direct Link
												</Button>
											</Grid>
										</Grid>
										<Grid item xs={2} textAlign='end'>
											{file.date_upload}
										</Grid>
										<Grid item xs={1} textAlign='end'>
											{file.size}
										</Grid>
										<Grid item xs={1} textAlign='end'>
											{file.downloads}
										</Grid>
										<Grid item xs={1} textAlign='end'>
											{file.views}
										</Grid>
									</Grid>
								);
							})}
						</Grid>
					</div>
				</div>
			) : (
				<FormGroup>
					<h2>Pixeldrain credentials required</h2>
					<FormControl>
						<InputLabel htmlFor='api_key'>Input your API key</InputLabel>
						<Input
							id='api_key'
							name='api_key'
							inputProps={{ minLength: 4, maxLength: 64 }}
							value={formData.api_key}
							onChange={handleInputChange}
							required
							placeholder='API key'
						/>
					</FormControl>
					<Button type='button' onClick={handleFormSubmit}>
						Submit
					</Button>
				</FormGroup>
			)}
		</div>
	);
};

export default Pixeldrain;
