import { Button, Grid } from '@mui/material';
import { PixeldrainFile } from '../types/types';

interface Props {
	data: PixeldrainFile;
	getFile: (fileId: string, fileName: string) => void;
	deleteFile: (fileId: string) => void;
}

const FileDataWrapper = ({ data, getFile, deleteFile }: Props) => {
	return (
		<Grid container alignItems={'center'} mx={2} id={data.id}>
			<Grid
				item
				xs={7}
				sx={{ display: 'flex' }}
				justifyContent='space-between'
				alignItems='center'
			>
				{data.name}
				<Grid item>
					<Button type='button' onClick={() => getFile(data.id, data.name)}>
						Download
					</Button>
					<Button
						component='a'
						href={`https://pixeldrain.com/u/${data.id}`}
						target='_blank'
					>
						Direct Link
					</Button>
					<Button type='button' onClick={() => deleteFile(data.id)}>
						Delete
					</Button>
				</Grid>
			</Grid>
			<Grid item xs={2} textAlign='end'>
				{data.date_upload}
			</Grid>
			<Grid item xs={1} textAlign='end'>
				{data.size}
			</Grid>
			<Grid item xs={1} textAlign='end'>
				{data.downloads}
			</Grid>
			<Grid item xs={1} textAlign='end'>
				{data.views}
			</Grid>
		</Grid>
	);
};

export default FileDataWrapper;
