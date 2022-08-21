import type { NextPage } from 'next';
import styles from '../../styles/Dashboard.module.scss';
import Gofile from '../../components/hosts/Gofile';
import Pixeldrain from '../../components/hosts/Pixeldrain';
import Mixdrop from '../../components/hosts/Mixdrop';
import Anonfiles from '../../components/hosts/Anonfiles';
import { HostContext } from '../../hooks/HostProvider';
import { useContext } from 'react';
import { Box, Button, Grid } from '@mui/material';
import { supportedHostList } from '../../lib/defaults';

const Dashboard: NextPage = () => {
	const { host, updateHost } = useContext(HostContext);

	return (
		<Box
			sx={{
				flex: 1,
				mt: '64px',
				ml: '64px',
				height: 'calc(100vh - 64px)',
				maxHeight: 'calc(100vh - 64px)',
				width: 'calc(100vw - 64px)',
				maxWidth: 'calc(100vw - 64px)',
				overflow: 'hidden',
			}}
		>
			{host ? (
				<Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
					{host == 'gofile' ? (
						<Gofile />
					) : host == 'pixeldrain' ? (
						<Pixeldrain />
					) : host == 'mixdrop' ? (
						<Mixdrop />
					) : host == 'anonfiles' ? (
						<Anonfiles />
					) : null}
				</Box>
			) : (
				<Box sx={{ mx: 'auto', maxWidth: '75%' }}>
					<Box sx={{ m: 2, textAlign: 'center' }}>
						<h2>
							Select file host and provide API credentials to manage your files
						</h2>
					</Box>
					<Grid container p={2}>
						{supportedHostList.map((host, index) => {
							return (
								<Grid key={index} item xs={3} sx={{ textAlign: 'center' }}>
									<Button onClick={() => updateHost(host)}>{host}</Button>
								</Grid>
							);
						})}
					</Grid>
				</Box>
			)}
		</Box>
	);
};

export default Dashboard;
