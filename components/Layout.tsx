import { getSession, GetSessionParams, SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import Head from 'next/head';
import Nav from './Nav';
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
					</div>
				</ThemeContextProvider>
			</HostContextProvider>
		</SessionProvider>
	);
};

export const getServerSideProps = async (context: GetSessionParams) => {
	return {
		props: {
			session: await getSession(context),
		},
	};
};

export default Layout;
