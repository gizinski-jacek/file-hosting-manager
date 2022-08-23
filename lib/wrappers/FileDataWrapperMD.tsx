import { Button, Checkbox, FormControl, FormGroup, Grid } from '@mui/material';
import { MixdropFile } from '../types/types';

interface Props {
	data: MixdropFile;
	getFile: (fileId: string, fileName: string) => void;
	checkboxState: boolean;
	handleCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileDataWrapperMD = ({
	data,
	getFile,
	checkboxState,
	handleCheckbox,
}: Props) => {
	return (
		<Grid container alignItems={'center'} mx={2} id={data.fileref}>
			<Grid item xs={'auto'}>
				<FormControl>
					<FormGroup>
						<Checkbox
							size='small'
							color='error'
							value={data.fileref}
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
					{data.title}
				</Grid>
				<Grid item xs={'auto'}>
					<Button
						type='button'
						size='small'
						onClick={() => getFile(data.fileref, data.title)}
					>
						Download
					</Button>
					<Button component='a' size='small' href={data.url} target='_blank'>
						Direct Link
					</Button>
				</Grid>
			</Grid>
			<Grid item xs={2} sx={{ px: 1, textAlign: 'end' }}>
				{new Date(Number(data.added)).toLocaleDateString(undefined, {
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
		</Grid>
	);
};

export default FileDataWrapperMD;
