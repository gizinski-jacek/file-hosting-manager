import type { NextPage } from 'next';
import styles from '../../styles/Dashboard.module.scss';
import Gofile from '../../components/hosts/Gofile';
import Pixeldrain from '../../components/hosts/Pixeldrain';
import Mixdrop from '../../components/hosts/Mixdrop';
import Anonfiles from '../../components/hosts/Anonfiles';
import { HostContext } from '../../hooks/HostProvider';
import { useContext } from 'react';

const Dashboard: NextPage = () => {
	const { host } = useContext(HostContext);

	return (
		<div className={styles.dashboard}>
			<div className={styles.contents}>
				{host == 'gofile' ? (
					<Gofile />
				) : host == 'pixeldrain' ? (
					<Pixeldrain />
				) : host == 'mixdrop' ? (
					<Mixdrop />
				) : host == 'anonfiles' ? (
					<Anonfiles />
				) : (
					<div>Choose file host and provide API key to manage your files</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
