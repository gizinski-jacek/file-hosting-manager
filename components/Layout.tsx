import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import Head from 'next/head';
import Nav from './Nav';
import Footer from './Footer';
import styles from '../styles/Layout.module.scss';
import { HostContextProvider } from '../hooks/HostProvider';
import { ThemeContextProvider } from '../hooks/ThemeProvider';

interface Props {
	children: React.ReactNode;
	session: Session;
}

const Layout = ({ children, session }: Props) => {
	return (
		<SessionProvider session={session}>
			<HostContextProvider>
				<ThemeContextProvider>
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
				</ThemeContextProvider>
			</HostContextProvider>
		</SessionProvider>
	);
};

export default Layout;
