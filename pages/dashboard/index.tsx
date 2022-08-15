import { Button } from '@mui/material';
import type { NextPage } from 'next';
import { useState } from 'react';
import styles from '../../styles/Dashboard.module.scss';
import Gofile from '../../components/hosts/Gofile';
import Pixeldrain from '../../components/hosts/Pixeldrain';
import Mixdrop from '../../components/hosts/Mixdrop';
import Anonfiles from '../../components/hosts/Anonfiles';

const Dashboard: NextPage = () => {
	const [selectedFileHost, setSelectedFileHost] = useState('');

	const handleFileHostChange = (e: React.MouseEvent<HTMLButtonElement>) => {
		const value = (e.target as HTMLButtonElement).value;
		setSelectedFileHost(value);
	};

	return (
		<div className={styles.dashboard}>
			<div className={styles.social_media_controls}>
				<Button
					size='small'
					variant='outlined'
					color='primary'
					value='gofile'
					onClick={(e) => handleFileHostChange(e)}
				>
					Gofile
				</Button>
				<Button
					size='small'
					variant='outlined'
					color='info'
					value='pixeldrain'
					onClick={(e) => handleFileHostChange(e)}
				>
					Pixeldrain
				</Button>
				<Button
					size='small'
					variant='outlined'
					color='secondary'
					value='mixdrop'
					onClick={(e) => handleFileHostChange(e)}
				>
					Mixdrop
				</Button>
				<Button
					size='small'
					variant='outlined'
					color='warning'
					value='anonfiles'
					onClick={(e) => handleFileHostChange(e)}
				>
					Anonfiles
				</Button>
			</div>
			<div className={styles.contents}>
				{selectedFileHost === 'gofile' ? (
					<Gofile />
				) : selectedFileHost === 'pixeldrain' ? (
					<Pixeldrain />
				) : selectedFileHost === 'mixdrop' ? (
					<Mixdrop />
				) : selectedFileHost === 'anonfiles' ? (
					<Anonfiles />
				) : (
					<div>Choose file host and provide API key to manage your files</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
