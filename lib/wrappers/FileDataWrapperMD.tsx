import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormGroup,
	Grid,
} from '@mui/material';
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
		<Grid container alignItems={'center'} id={data.fileref}>
			<Grid item xs={'auto'}>
				<FormControl>
					<FormGroup>
						<Checkbox
							sx={{ p: 0.5, mr: 1 }}
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
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Box sx={{ flex: 1, textAlign: 'start' }}>{data.title}</Box>
				<Box>
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
				</Box>
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
