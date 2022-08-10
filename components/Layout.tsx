import styles from '../styles/Layout.module.scss';
import Head from 'next/head';
import Nav from './Nav';
import Footer from './Footer';
import { UserProvider } from '../hooks/UserProvider';

const Layout = ({ children }: React.PropsWithChildren) => {
	return (
		<UserProvider>
			<div className={styles.container}>
				<Head>
					<title>File Hosting Manager</title>
					<meta name='description' content='File Hosting Manager' />
					<link rel='icon' href='/favicon.ico' />
				</Head>
				<Nav />
				<main className={styles.main}>{children}</main>
				<Footer />
			</div>
		</UserProvider>
	);
};

export default Layout;
