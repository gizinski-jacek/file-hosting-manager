import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormGroup,
	Grid,
} from '@mui/material';
import { PixeldrainFile } from '../types/types';

interface Props {
	data: PixeldrainFile;
	getFile: (fileId: string, fileName: string) => void;
	checkboxState: boolean;
	handleCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileDataWrapperPD = ({
	data,
	getFile,
	checkboxState,
	handleCheckbox,
}: Props) => {
	return (
		<Grid container alignItems={'center'} id={data.id}>
			<Grid item xs={'auto'}>
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
			</Grid>
			<Grid
				item
				xs={true}
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Box sx={{ flex: 1, textAlign: 'start' }}>{data.name}</Box>
				<Box>
					<Button
						type='button'
						size='small'
						onClick={() => getFile(data.id, data.name)}
					>
						Download
					</Button>
					<Button
						component='a'
						size='small'
						href={`https://pixeldrain.com/u/${data.id}`}
						target='_blank'
					>
						Direct Link
					</Button>
				</Box>
			</Grid>
			<Grid item xs={2} sx={{ textAlign: 'end' }}>
				{new Date(data.date_upload).toLocaleDateString(undefined, {
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
				})}
			</Grid>
			<Grid item xs={1} sx={{ textAlign: 'end' }}>
				{data.size} B
			</Grid>
			<Grid item xs={1} sx={{ textAlign: 'end' }}>
				{data.downloads}
			</Grid>
			<Grid item xs={1} sx={{ textAlign: 'end' }}>
				{data.views}
			</Grid>
		</Grid>
	);
};

export default FileDataWrapperPD;
