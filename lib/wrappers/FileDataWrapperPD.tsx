import { Button, Checkbox, FormControl, FormGroup, Grid } from '@mui/material';
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
		<Grid container alignItems={'center'} mx={2} id={data.id}>
			<Grid item xs={'auto'}>
				<FormControl>
					<FormGroup>
						<Checkbox
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
					px: 1,
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Grid item xs={true} textAlign='start'>
					{data.name}
				</Grid>
				<Grid item xs={'auto'}>
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
				</Grid>
			</Grid>
			<Grid item xs={2} sx={{ px: 1, textAlign: 'end' }}>
				{new Date(data.date_upload).toLocaleDateString(undefined, {
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
				})}
			</Grid>
			<Grid item xs={1} sx={{ px: 1, textAlign: 'end' }}>
				{data.size} B
			</Grid>
			<Grid item xs={1} sx={{ px: 1, textAlign: 'end' }}>
				{data.downloads}
			</Grid>
			<Grid item xs={1} sx={{ px: 1, textAlign: 'end' }}>
				{data.views}
			</Grid>
		</Grid>
	);
};

export default FileDataWrapperPD;
