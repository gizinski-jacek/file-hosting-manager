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
import { PixeldrainFile, PixeldrainFolder } from '../../lib/types/types';
import FileDataWrapperPD from '../../lib/wrappers/FileDataWrapperPD';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 500,
	height: 500,
	bgcolor: 'white',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
	display: 'flex',
	flexDirection: 'column',
};

const Pixeldrain = () => {
	const [filesData, setFilesData] = useState<PixeldrainFile[]>([]);
	const [foldersData, setFoldersData] = useState<PixeldrainFolder[]>([]);
	const [selectedFolder, setSelectedFolder] = useState('root');
	const [openFilesFormModal, setOpenFilesFormModal] = useState(false);
	const [openFolderFormModal, setOpenFolderFormModal] = useState(false);
	const [createFolderInput, setCreateFolderInput] = useState('');
	const [uploadData, setUploadData] = useState<File[]>([]);
	const [uploadErrors, setUploadErrors] = useState<string[]>([]);
	const [checkedFilesIds, setCheckedFilesIds] = useState<string[]>([]);
	const [fetching, setFetching] = useState(false);

	const fileRef = useRef<HTMLInputElement>(null);
	const checkboxRef = useRef<HTMLInputElement>(null);

	const handleGetMainData = useCallback(async () => {
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
			setFetching(false);
		} catch (error) {
			console.log(error);
		}
	}, []);

	const handleGetFolderFilesData = useCallback(async (value: string) => {
		try {
			const res = await axios.get(
				`/api/host/mixdrop/get-single-folder?id=${value}`
			);
			setFilesData(res.data);
			setFetching(false);
		} catch (error) {
			console.log(error);
		}
	}, []);

	const handleFetchData = useCallback(async () => {
		setFetching(true);
		setTimeout(() => {
			if (selectedFolder === 'root') {
				handleGetMainData();
			} else {
				handleGetFolderFilesData(selectedFolder);
			}
		}, 1000);
	}, [selectedFolder, handleGetMainData, handleGetFolderFilesData]);

	const handleDownloadSingleFile = async (fileId: string, fileName: string) => {
		try {
			const res = await axios.get(
				`/api/host/pixeldrain/download-single-file?id=${fileId}`,
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
				handleResetFormsAndErrors();
				handleCloseFilesFormModal();
				handleFetchData();
			}
		} catch (error) {
			console.log(error);
		}
	};

	const toggleAllFilesCheckbox = () => {
		if (filesData.length === 0) {
			return;
		}
		if (checkedFilesIds.length === filesData.length) {
			setCheckedFilesIds([]);
		} else {
			setCheckedFilesIds(filesData.map((file) => file.id));
		}
	};

	const handleCheckboxToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			setCheckedFilesIds((prevState) => [...prevState, e.target.value]);
		} else {
			setCheckedFilesIds((prevState) =>
				prevState.filter((s) => s !== e.target.value)
			);
		}
	};
	const handleDownloadSelectedFiles = async () => {
		try {
			if (checkedFilesIds.length === 0) {
				return;
			}
			const res = await axios.get(
				'/api/host/pixeldrain/download-multiple-files',
				{ params: { files: checkedFilesIds } }
			);
			res.data.forEach((file) => {
				setTimeout(() => {
					const fileURL = window.URL.createObjectURL(new Blob([file]));
					const link = document.createElement('a');
					link.href = fileURL;
					link.setAttribute('download', file.file.name);
					document.body.appendChild(link);
					link.click();
					return;
				}, 500);
			});
		} catch (error) {
			console.log(error);
		}
	};

	const handleAddSelectedToNewFolder = async () => {
		try {
			if (checkedFilesIds.length === 0 || !createFolderInput) {
				return;
			}
			const formData = new FormData();
			checkedFilesIds.forEach((id, index) => {
				formData.append('id_' + index, id);
			});
			formData.append('folder', createFolderInput);
			const res = await axios.post(
				'/api/host/pixeldrain/add-multiple-files-to-folder',
				formData
			);
			if (res.status === 200) {
				setCheckedFilesIds([]);
				handleCloseFolderFormModal();
				handleFetchData();
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleDeleteFiles = async () => {
		try {
			const res = await axios.delete('/api/host/pixeldrain/delete-files', {
				data: checkedFilesIds,
			});
			if (res.status === 200) {
				if (
					filesData.length === checkedFilesIds.length &&
					selectedFolder !== 'root'
				) {
					setSelectedFolder('root');
				}
				setCheckedFilesIds([]);
				handleFetchData();
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleFolderChange = (e: SelectChangeEvent<string>) => {
		setSelectedFolder(e.target.value);
	};

	const handleOpenFilesFormModal = () => {
		setOpenFilesFormModal(true);
	};

	const handleCloseFilesFormModal = () => {
		setOpenFilesFormModal(false);
		handleResetFormsAndErrors();
	};

	const handleOpenFolderFormModal = () => {
		setOpenFolderFormModal(true);
	};

	const handleCloseFolderFormModal = () => {
		setOpenFolderFormModal(false);
		handleResetFormsAndErrors();
	};

	const handleResetFormsAndErrors = () => {
		setUploadData([]);
		setCreateFolderInput('');
		setUploadErrors([]);
	};

	useEffect(() => {
		handleFetchData();
	}, [handleFetchData]);

	useEffect(() => {
		handleFetchData();
	}, [selectedFolder, handleFetchData]);

	return (
		<>
			<Grid container sx={{ p: 2, alignItems: 'center' }}>
				<Grid item xs={'auto'} p={1}>
					{fetching ? (
						<CircularProgress size={24} />
					) : (
						<Refresh sx={{ cursor: 'pointer' }} onClick={handleFetchData} />
					)}
				</Grid>
				<Grid item xs={'auto'}>
					<FormControl sx={{ mx: 1, display: 'flex' }} size='small'>
						<InputLabel htmlFor='folder'>Folder</InputLabel>
						<Select
							native={true}
							id='folder'
							value={selectedFolder}
							label='Folder'
							onChange={(e) => handleFolderChange(e)}
						>
							<option value='root'>root</option>
							{foldersData.map((folder) => (
								<option key={folder.id} value={folder.id}>
									{folder.title}
								</option>
							))}
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={'auto'}>
					<Box sx={{ mx: 1 }}>
						<Button type='button' onClick={handleOpenFilesFormModal}>
							Upload files
						</Button>
						{checkedFilesIds.length > 0 ? (
							<>
								<Button type='button' onClick={handleOpenFolderFormModal}>
									Add selected files to new folder
								</Button>
								<Button type='button' onClick={handleDownloadSelectedFiles}>
									Download selected files
								</Button>
								<Button type='button' onClick={handleDeleteFiles}>
									Delete selected files
								</Button>
							</>
						) : null}
						<Modal
							open={openFilesFormModal}
							onClose={handleCloseFilesFormModal}
						>
							<Box sx={style}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
									<Button type='button' onClick={clickSelectFiles}>
										Add Files
									</Button>
									<Button type='button' onClick={handleClearFileList}>
										Clear List
									</Button>
								</Box>
								<List sx={{ flex: 1, overflow: 'auto' }}>
									{uploadData.map((file, index) => (
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
									))}
								</List>
								<FormControl>
									<FormControl sx={{ display: 'none' }}>
										<InputLabel htmlFor='upload_files'>Add files</InputLabel>
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
									<FormControl sx={{ my: 1 }}>
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
									{uploadErrors.map((message, index) => (
										<FormHelperText sx={{ mx: 1, color: 'red' }} key={index}>
											{message}
										</FormHelperText>
									))}
									<Button type='button' onClick={handleUploadFiles}>
										Upload Files
									</Button>
								</FormControl>
							</Box>
						</Modal>
						<Modal
							open={openFolderFormModal}
							onClose={handleCloseFolderFormModal}
						>
							<Box sx={style}>
								<FormControl>
									<FormControl sx={{ my: 1 }}>
										<InputLabel htmlFor='create_folder'>
											New folder name
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
									{uploadErrors.map((message, index) => (
										<FormHelperText sx={{ mx: 1, color: 'red' }} key={index}>
											{message}
										</FormHelperText>
									))}
									<Button type='button' onClick={handleAddSelectedToNewFolder}>
										Add files to new folder
									</Button>
								</FormControl>
							</Box>
						</Modal>
					</Box>
				</Grid>
			</Grid>
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
									filesData.length === checkedFilesIds.length
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
				{filesData.map((file) => (
					<FileDataWrapperPD
						key={file.id}
						data={file}
						getFile={handleDownloadSingleFile}
						checkboxState={checkedFilesIds.includes(file.id)}
						handleCheckbox={handleCheckboxToggle}
					/>
				))}
			</Grid>
		</>
	);
};

export default Pixeldrain;
