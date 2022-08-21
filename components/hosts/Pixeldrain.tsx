import { useCallback, useEffect, useRef, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import {
	Box,
	Button,
	Checkbox,
	CircularProgress,
	FormControl,
	FormGroup,
	FormHelperText,
	FormLabel,
	Grid,
	Input,
	InputLabel,
	List,
	ListItem,
	Modal,
	Select,
	SelectChangeEvent,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { APIFormData, PixeldrainFile } from '../../lib/types/types';
import { useSession } from 'next-auth/react';
import FileDataWrapper from '../../lib/wrappers/FileDataWrapper';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'white',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

const Pixeldrain = () => {
	const { data: user } = useSession();
	const [userHasAPIKey, setUserHasAPIKey] = useState(false);
	const [formData, setFormData] = useState<APIFormData>({
		host: 'pixeldrain',
		api_key: '',
	});
	const [filesData, setFilesData] = useState<PixeldrainFile[]>([]);
	const [foldersData, setFoldersData] = useState<PixeldrainFile[]>([]);
	const [selectedFolder, setSelectedFolder] = useState('root');
	const [openModal, setOpenModal] = useState(false);
	const [createFolderInput, setCreateFolderInput] = useState('');
	const [uploadData, setUploadData] = useState<File[]>([]);
	const [uploadErrors, setUploadErrors] = useState<string[]>([]);
	const [checkedFiles, setCheckedFiles] = useState<string[]>([]);
	const [fetching, setFetching] = useState(false);

	const fileRef = useRef<HTMLInputElement>(null);
	const checkboxRef = useRef<HTMLInputElement>(null);

	const handleKeyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleKeyFormSubmit = async () => {
		try {
			if (user) {
				const res = await axios.put('/api/user/account-data', formData, {
					withCredentials: true,
				});
				if (res.status === 200) {
					setUserHasAPIKey(true);
				}
			} else {
				const res = await axios.post('/api/user/temp-user', formData, {
					withCredentials: true,
				});
				if (res.status === 200) {
					setUserHasAPIKey(true);
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleGetMainData = async () => {
		try {
			setFetching(true);
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
			setFetching(false);
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
					setFetching(true);
					const res = await axios.get(
						`/api/host/pixeldrain/get-single-folder?id=${selectedFolder}`
					);
					setFilesData(res.data);
					setFetching(false);
				}
			}
		} catch (error) {
			console.log(error);
		}
	}, [selectedFolder, userHasAPIKey]);

	const handleGetSingleFile = async (fileId: string, fileName: string) => {
		try {
			const res = await axios.get(
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

	const handleFolderInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setCreateFolderInput(e.target.value);
	};

	const clickSelectFiles = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		fileRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUploadErrors([]);
		const target = e.target as HTMLInputElement;
		const files = target.files as FileList;
		const errorsArray = [];
		if (!files) {
			return;
		}
		if (files.length > 500) {
			errorsArray.push('Max number of files to opload is 500');
		}
		for (let i = 0; i < files.length; i++) {
			if (files[i].name.length > 255) {
				errorsArray.push('Max file name is 255 characters');
				break;
			}
		}
		if (errorsArray.length > 0) {
			setUploadErrors(errorsArray);
			return;
		}
		setUploadData((prevState) => [...prevState, ...files]);
	};

	const handleClearFileList = () => {
		setUploadData([]);
	};

	const handleRemoveSingleFile = (value: string) => {
		const newState = uploadData.filter((file) => file.name !== value);
		setUploadData(newState);
	};

	const handleUploadFiles = async () => {
		try {
			if (!uploadData) {
				return;
			}
			const uploadFormData = new FormData();
			if (createFolderInput) {
				uploadFormData.append('folder', createFolderInput);
			}
			uploadData.forEach((file, index) => {
				uploadFormData.append('file_' + index, file);
			});
			const res = await axios.post(
				`/api/host/pixeldrain/add-file`,
				uploadFormData,
				{ withCredentials: true }
			);
			if (res.status === 200) {
				handleCloseModal();
				handleGetFolderFilesData();
			}
		} catch (error) {
			console.log(error);
		}
	};

	const toggleAllFilesCheckbox = () => {
		if (filesData.length === 0) {
			return;
		}
		if (checkedFiles.length === filesData.length) {
			setCheckedFiles([]);
		} else {
			setCheckedFiles(filesData.map((file) => file.id));
		}
	};

	const handleCheckboxToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			setCheckedFiles((prevState) => [...prevState, e.target.value]);
		} else {
			setCheckedFiles((prevState) =>
				prevState.filter((s) => s !== e.target.value)
			);
		}
	};

	const handleDeleteFiles = async () => {
		try {
			const res = await axios.delete('/api/host/pixeldrain/delete-files', {
				data: checkedFiles,
			});
			if (res.status === 200) {
				if (
					filesData.length === checkedFiles.length &&
					selectedFolder !== 'root'
				) {
					setSelectedFolder('root');
					return;
				}
				setCheckedFiles([]);
				if (!checkboxRef.current) {
					return;
				}
				checkboxRef.current.checked = false;
				handleGetFolderFilesData();
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleFolderChange = (e: SelectChangeEvent<string>) => {
		setSelectedFolder(e.target.value);
	};

	const handleOpenModal = () => {
		setOpenModal(true);
	};

	const handleCloseModal = () => {
		setUploadData([]);
		setCreateFolderInput('');
		setOpenModal(false);
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
		<>
			{userHasAPIKey ? (
				<>
					<Grid container sx={{ p: 2, alignItems: 'center' }}>
						<Grid item xs={'auto'} p={1}>
							{fetching ? (
								<CircularProgress size={24} />
							) : (
								<Refresh
									sx={{ cursor: 'pointer' }}
									onClick={handleGetFolderFilesData}
								/>
							)}
						</Grid>
						<Grid item xs={'auto'}>
							<FormControl sx={{ mx: 1, display: 'flex' }}>
								<InputLabel htmlFor='folder'>Folder</InputLabel>
								<Select
									native={true}
									id='folder'
									value={selectedFolder}
									label='Folder'
									onChange={(e) => handleFolderChange(e)}
								>
									<option value='root'>root</option>
									{foldersData.map((folder) => {
										return (
											<option key={folder.id} value={folder.id}>
												{folder.title}
											</option>
										);
									})}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={'auto'}>
							<Box sx={{ mx: 1 }}>
								<Button type='button' onClick={handleOpenModal}>
									Upload Files
								</Button>
								<Button type='button' onClick={handleDeleteFiles}>
									Delete Selected Files
								</Button>
								<Modal open={openModal} onClose={handleCloseModal}>
									<Box sx={style}>
										<Box
											sx={{ display: 'flex', justifyContent: 'space-between' }}
										>
											<Button type='button' onClick={clickSelectFiles}>
												Add Files
											</Button>
											<Button type='button' onClick={handleClearFileList}>
												Clear List
											</Button>
										</Box>
										<List>
											{uploadData.map((file, index) => {
												return (
													<ListItem disablePadding key={file.name + index}>
														{file.name}
														<Button
															type='button'
															sx={{ ml: 'auto' }}
															onClick={() => handleRemoveSingleFile(file.name)}
														>
															X
														</Button>
													</ListItem>
												);
											})}
										</List>
										<FormControl>
											<FormControl>
												<InputLabel htmlFor='create_folder'>
													Add files to new folder?
												</InputLabel>
												<Input
													id='create_folder'
													name='create_folder'
													type='text'
													value={createFolderInput}
													onChange={(e) => handleFolderInputChange(e)}
													placeholder='Folder name'
												/>
											</FormControl>
											<FormControl sx={{ display: 'none' }}>
												<label htmlFor='upload_files'>Add files</label>
												<input
													ref={fileRef}
													id='upload_files'
													name='upload_files'
													type='file'
													multiple
													onChange={handleFileChange}
													required
												/>
											</FormControl>
											{uploadErrors.map((message, index) => (
												<FormHelperText
													sx={{ mx: 1, color: 'red' }}
													key={index}
												>
													{message}
												</FormHelperText>
											))}
											<Button type='button' onClick={handleUploadFiles}>
												Upload Files
											</Button>
										</FormControl>
									</Box>
								</Modal>
							</Box>
						</Grid>
					</Grid>
					<>
						<Grid container sx={{ p: 2, alignItems: 'center' }}>
							<Grid item xs={'auto'}>
								<FormControl>
									<FormGroup>
										<Checkbox
											ref={checkboxRef}
											color='error'
											size='small'
											checked={
												filesData.length > 0 &&
												filesData.length === checkedFiles.length
													? true
													: false
											}
											disabled={filesData.length === 0 ? true : false}
											onChange={toggleAllFilesCheckbox}
										/>
									</FormGroup>
								</FormControl>
							</Grid>
							<Grid item xs={true} sx={{ px: 1, textAlign: 'start' }}>
								Name
							</Grid>
							<Grid item xs={2} sx={{ px: 1, textAlign: 'end' }}>
								Upload date
							</Grid>
							<Grid item xs={1} sx={{ px: 1, textAlign: 'end' }}>
								Size
							</Grid>
							<Grid item xs={1} sx={{ px: 1, textAlign: 'end' }}>
								Downloads
							</Grid>
							<Grid item xs={1} sx={{ px: 1, textAlign: 'end' }}>
								Views
							</Grid>
						</Grid>
						<Grid container>
							{filesData.map((file) => {
								return (
									<FileDataWrapper
										key={file.id}
										data={file}
										getFile={handleGetSingleFile}
										checkboxState={checkedFiles.includes(file.id)}
										handleCheckbox={handleCheckboxToggle}
									/>
								);
							})}
						</Grid>
					</>
				</>
			) : (
				<FormControl>
					<FormLabel>
						<h2>Pixeldrain credentials required</h2>
					</FormLabel>
					<FormControl>
						<InputLabel htmlFor='api_key'>Input your API key</InputLabel>
						<Input
							id='api_key'
							name='api_key'
							inputProps={{ minLength: 4, maxLength: 64 }}
							value={formData.api_key}
							onChange={handleKeyInputChange}
							required
							placeholder='API key'
						/>
					</FormControl>
					<Button type='button' onClick={handleKeyFormSubmit}>
						Submit
					</Button>
				</FormControl>
			)}
		</>
	);
};

export const getServerSideProps = async ({ req, res }) => {
	console.log(1234);
	return {
		props: {}, // will be passed to the page component as props
	};
};

export default Pixeldrain;
