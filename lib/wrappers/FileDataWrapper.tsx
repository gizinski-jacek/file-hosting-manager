import { Button, Checkbox, FormControl, FormGroup, Grid } from '@mui/material';
import { PixeldrainFile } from '../types/types';

interface Props {
	data: PixeldrainFile;
	getFile: (fileId: string, fileName: string) => void;
	checkboxState: boolean;
	handleCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileDataWrapper = ({
	data,
	getFile,
	checkboxState,
	handleCheckbox,
}: Props) => {
	return (
		<Grid container alignItems={'center'} mx={2} id={data.id}>
			<Grid item>
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
				xs={7}
				sx={{ display: 'flex' }}
				justifyContent='space-between'
				alignItems='center'
			>
				<Grid item xs={7} textAlign='start'>
					{data.name}
				</Grid>
				<Grid item>
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
