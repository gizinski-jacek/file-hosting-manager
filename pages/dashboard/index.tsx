import { Button } from '@mui/material';
import type { NextPage } from 'next';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import styles from '../../styles/Dashboard.module.scss';
import Gofile from '../../components/hosts/Gofile';
import Pixeldrain from '../../components/hosts/Pixeldrain';
import Mixdrop from '../../components/hosts/Mixdrop';
import Anonfiles from '../../components/hosts/Anonfiles';

const Dashboard: NextPage = () => {
	const { data: user } = useSession();

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
					<Gofile
						api_data={user?.user?.api_data?.find(
							(d) => d.host === selectedFileHost
						)}
					/>
				) : selectedFileHost === 'pixeldrain' ? (
					<Pixeldrain
						api_data={user?.user?.api_data?.find(
							(d) => d.host === selectedFileHost
						)}
					/>
				) : selectedFileHost === 'mixdrop' ? (
					<Mixdrop
						api_data={user?.user?.api_data?.find(
							(d) => d.host === selectedFileHost
						)}
					/>
				) : selectedFileHost === 'anonfiles' ? (
					<Anonfiles
						api_data={user?.user?.api_data?.find(
							(d) => d.host === selectedFileHost
						)}
					/>
				) : (
					<div>Choose file host and provide API key to manage your files</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
