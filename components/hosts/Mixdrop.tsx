import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
	Box,
	Breadcrumbs,
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
	Typography,
} from '@mui/material';
import { Cancel, Folder, Refresh } from '@mui/icons-material';
import { MixdropFile, MixdropFolder } from '../../lib/types/types';
import FileDataWrapperMD from '../../lib/wrappers/FileDataWrapperMD';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	minWidth: 300,
	width: '75%',
	maxWidth: 600,
	minHeight: 300,
	height: '75%',
	maxHeight: 600,
	bgcolor: 'white',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
	display: 'flex',
	flexDirection: 'column',
};

const Mixdrop = () => {
	const [filesData, setFilesData] = useState<MixdropFile[]>([]);
	const [foldersData, setFoldersData] = useState<MixdropFolder[]>([]);
	const [selectedFolder, setSelectedFolder] = useState('root');
	const [breadcrumbs, setBreadcrumbs] = useState<MixdropFolder[]>([
		{ id: 'root', title: 'My Files' },
	]);
	const [openFilesFormModal, setOpenFilesFormModal] = useState(false);
	const [openFolderFormModal, setOpenFolderFormModal] = useState(false);
	const [createFolderInput, setCreateFolderInput] = useState('');
	const [uploadData, setUploadData] = useState<File[]>([]);
	const [formErrors, setFormErrors] = useState<string[]>([]);
	const [checkedFilesIds, setCheckedFilesIds] = useState<string[]>([]);
	const [fetching, setFetching] = useState(false);

	const fileRef = useRef<HTMLInputElement>(null);

	const handleDataFetch = useCallback(async () => {
		setFetching(true);
		try {
			const res =
				selectedFolder === 'root'
					? await axios.get('/api/host/mixdrop/get-user-files-and-folders', {
							withCredentials: true,
					  })
					: await axios.get(
							`/api/host/mixdrop/get-single-folder?id=${selectedFolder}`
					  );
			setCheckedFilesIds([]);
			setFilesData(res.data.files || res.data);
			setFoldersData(res.data.folders || res.data);
			setFetching(false);
		} catch (error: any) {
			console.error(error);
			setSelectedFolder('root');
			setBreadcrumbs([{ id: 'root', title: 'My Files' }]);
			setCheckedFilesIds([]);
			setFilesData([]);
			setFoldersData([]);
			setFetching(false);
		}
	}, [selectedFolder]);

	const handleDownloadSingleFile = async (fileId: string, fileName: string) => {
		// find API request to download file !!!
		// try {
		// 	const res = await axios.get(
		// 		`/api/host/mixdrop/download-single-file?id=${fileId}`,
		// 		{ responseType: 'blob' }
		// 	);
		// 	const fileURL = window.URL.createObjectURL(new Blob([res.data]));
		// 	const link = document.createElement('a');
		// 	link.href = fileURL;
		// 	link.setAttribute('download', fileName);
		// 	document.body.appendChild(link);
		// 	link.click();
		// 	return;
		// } catch (error: any) {
		// 	console.error(error);
		// }
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
		setFormErrors([]);
		const target = e.target as HTMLInputElement;
		const files = target.files as FileList;
		const errorsArray = [];
		if (!files) {
			return;
		}
		if (files.length > 500) {
			errorsArray.push('Max number of files to upload is 500');
		}
		for (let i = 0; i < files.length; i++) {
			if (files[i].name.length > 255) {
				errorsArray.push('Max file name is 255 characters');
				break;
			}
		}
		if (errorsArray.length > 0) {
			setFormErrors(errorsArray);
			return;
		}
		setUploadData((prevState) => [...prevState, ...Array.from(files)]);
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
				setFormErrors(['No files selected']);
				return;
			}
			const uploadFormData = new FormData();
			if (selectedFolder !== 'root') {
				uploadFormData.append('folder', selectedFolder);
			}
			uploadData.forEach(async (file, index) => {
				uploadFormData.append('file_' + index, file);
			});
			const res = await axios.post(
				`/api/host/mixdrop/add-files`,
				uploadFormData,
				{ withCredentials: true }
			);
			if (res.status === 200) {
				handleResetFormsAndErrors();
				handleCloseFilesFormModal();
				handleDataFetch();
			}
		} catch (error: any) {
			console.error(error);
		}
	};

	const handleCreateFolder = async () => {
		try {
			if (!createFolderInput) {
				setFormErrors(['No folder name provided']);
				return;
			}
			const uploadFormData = new FormData();
			if (selectedFolder !== 'root') {
				uploadFormData.append('parent', selectedFolder);
			}
			uploadFormData.append('folder', createFolderInput);
			const res = await axios.post(
				`/api/host/mixdrop/create-folder`,
				uploadFormData,
				{ withCredentials: true }
			);
			if (res.status === 200) {
				handleResetFormsAndErrors();
				handleCloseFolderFormModal();
				handleDataFetch();
			}
		} catch (error: any) {
			console.error(error);
		}
	};

	const toggleAllFilesCheckbox = () => {
		if (filesData.length === 0) {
			return;
		}
		if (checkedFilesIds.length === filesData.length) {
			setCheckedFilesIds([]);
		} else {
			setCheckedFilesIds(filesData.map((file) => file.fileref));
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
		// try {
		// 	if (checkedFilesIds.length === 0) {
		// 		return;
		// 	}
		// 	const res = await axios.get('/api/host/mixdrop/download-multiple-files', {
		// 		params: { files: checkedFilesIds },
		// 	});
		// 	res.data.forEach((file: File) => {
		// 		const fileURL = window.URL.createObjectURL(new Blob([file]));
		// 		const link = document.createElement('a');
		// 		link.href = fileURL;
		// 		link.setAttribute('download', file.name);
		// 		document.body.appendChild(link);
		// 		link.click();
		// 		return;
		// 	});
		// } catch (error: any) {
		// 	console.error(error);
		// }
	};

	const handleAddSelectedToNewFolder = async () => {
		// try {
		// 	if (checkedFilesIds.length === 0 || !createFolderInput) {
		//		setFormErrors(['No folder name provided']);
		// 		return;
		// 	}
		// 	const formData = new FormData();
		// 	checkedFilesIds.forEach((id, index) => {
		// 		formData.append('id_' + index, id);
		// 	});
		// 	formData.append('folder', createFolderInput);
		// 	const res = await axios.post(
		// 		'/api/host/mixdrop/add-multiple-files-to-folder',
		// 		formData
		// 	);
		// 	if (res.status === 200) {
		// 		setCheckedFilesIds([]);
		// 		handleCloseFolderFormModal();
		// 		handleFetchData();
		// 	}
		// } catch (error: any) {
		// 	console.error(error);
		// }
	};

	const handleDeleteFiles = async () => {
		// find API request to delete file !!!
		// try {
		// 	const res = await axios.delete('/api/host/mixdrop/delete-files', {
		// 		data: checkedFilesIds,
		// 	});
		// 	if (res.status === 200) {
		// 		if (
		// 			filesData.length === checkedFilesIds.length &&
		// 			selectedFolder !== 'root'
		// 		) {
		// 			setSelectedFolder('root');
		// 		}
		// 		setCheckedFilesIds([]);
		// 		handleDataFetch();
		// 	}
		// } catch (error: any) {
		// 	console.error(error);
		// }
	};

	const handleFolderChange = (folder: MixdropFolder) => {
		setSelectedFolder(folder.id);
		setBreadcrumbs((prevState) => [...prevState, folder]);
	};

	const handleFolderChangeByBreadcrumb = (folder: MixdropFolder) => {
		const folderIndex = breadcrumbs.findIndex((b) => b.id === folder.id);
		const newState = breadcrumbs.slice(0, folderIndex + 1);
		setSelectedFolder(folder.id);
		setBreadcrumbs(newState);
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
		setFormErrors([]);
	};

	useEffect(() => {
		handleDataFetch();
	}, [selectedFolder, handleDataFetch]);

	return (
		<>
			<Box sx={{ m: 2, display: 'flex', alignItems: 'center' }}>
				{fetching ? (
					<CircularProgress size={24} sx={{ m: 1 }} />
				) : (
					<Refresh sx={{ cursor: 'pointer', m: 1 }} onClick={handleDataFetch} />
				)}
				<Breadcrumbs sx={{ display: 'flex', m: 1, mx: 2 }}>
					{breadcrumbs.map((folder, index) =>
						index + 1 === breadcrumbs.length ? (
							<Box key={folder.id}>
								<Typography variant='button'>{folder.title}</Typography>
							</Box>
						) : (
							<Box
								key={folder.id}
								sx={{ cursor: 'pointer' }}
								onClick={() => handleFolderChangeByBreadcrumb(folder)}
							>
								<Typography variant='button' color='green'>
									{folder.title}
								</Typography>
							</Box>
						)
					)}
				</Breadcrumbs>
				<Box>
					<Button type='button' onClick={handleOpenFilesFormModal}>
						Upload files
					</Button>
					<Button type='button' onClick={handleOpenFolderFormModal}>
						Create folder
					</Button>
					{checkedFilesIds.length > 0 ? (
						<>
							<Button type='button' onClick={handleDownloadSelectedFiles}>
								Download files
							</Button>
							<Button type='button' onClick={handleDeleteFiles}>
								Delete files
							</Button>
						</>
					) : null}
					<Modal open={openFilesFormModal} onClose={handleCloseFilesFormModal}>
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
									<ListItem key={file.name + index} sx={{ p: 0.5 }}>
										{file.name}
										<Button
											type='button'
											sx={{ ml: 'auto', minWidth: 'unset', p: 0 }}
											onClick={() => handleRemoveSingleFile(file.name)}
										>
											<Cancel />
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
								{formErrors.map((message, index) => (
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
						<Box
							sx={{
								...style,
								minHeight: 'unset',
								height: 'unset',
								maxHeight: 200,
								minWidth: 'unset',
								width: 300,
								maxWidth: 'unset',
							}}
						>
							<FormControl>
								<FormControl sx={{ my: 2 }}>
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
								{formErrors.map((message, index) => (
									<FormHelperText sx={{ mx: 1, color: 'red' }} key={index}>
										{message}
									</FormHelperText>
								))}
								<Button type='button' onClick={handleCreateFolder}>
									Create folder
								</Button>
							</FormControl>
						</Box>
					</Modal>
				</Box>
			</Box>
			<Box sx={{ m: 2 }}>
				<Grid container sx={{ alignItems: 'center' }}>
					<Grid item xs={'auto'}>
						<FormControl>
							<FormGroup>
								<Checkbox
									sx={{ p: 0.5, mr: 1 }}
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
					<Grid item xs={true} sx={{ textAlign: 'start' }}>
						Name
					</Grid>
					<Grid item xs={2} sx={{ textAlign: 'end' }}>
						Upload date
					</Grid>
					<Grid item xs={1} sx={{ textAlign: 'end' }}>
						Size
					</Grid>
					<Grid item xs={1} sx={{ textAlign: 'end' }}>
						Downloads
					</Grid>
					<Grid item xs={1} sx={{ textAlign: 'end' }}>
						Views
					</Grid>
				</Grid>
			</Box>
			<Box sx={{ m: 2 }}>
				{foldersData.map((folder) => (
					<Grid container key={folder.id} id={folder.id}>
						{/* <Grid item xs={'auto'}>
							<FormControl>
								<FormGroup>
									<Checkbox
										sx={{ p: 0.5, mr: 1 }}
										size='small'
										color='error'
										value={data.id}
										checked={checkboxState}
										onChange={(e) => handleCheckbox(e)}
									/>
								</FormGroup>
							</FormControl>
						</Grid> */}
						<Grid
							item
							xs={true}
							sx={{
								display: 'flex',
								alignItems: 'center',
							}}
							key={folder.id}
						>
							<Folder sx={{ m: 0.5, mr: 1 }} />
							<Box
								sx={{ cursor: 'pointer' }}
								onClick={() => handleFolderChange(folder)}
							>
								{folder.title}
							</Box>
						</Grid>
					</Grid>
				))}
				{filesData.map((file) => (
					<FileDataWrapperMD
						key={file.fileref}
						data={file}
						getFile={handleDownloadSingleFile}
						checkboxState={checkedFilesIds.includes(file.fileref)}
						handleCheckbox={handleCheckboxToggle}
					/>
				))}
			</Box>
		</>
	);
};

export default Mixdrop;
