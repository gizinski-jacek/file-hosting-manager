import { Button, Link } from '@mui/material';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import styles from '../styles/Nav.module.scss';

const Nav = () => {
	const { data: user } = useSession();

	return (
		<div className={styles.nav}>
			<div className={styles.left}>
				<Link href='/'>File Hosting Manager</Link>
			</div>
			<div className={styles.right}>
				<Button
					component='a'
					href='/dashboard'
					size='small'
					variant='outlined'
					color='warning'
				>
					Dashboard
				</Button>
				{user ? (
					<Button
						size='small'
						variant='outlined'
						color='secondary'
						onClick={() => signOut({ callbackUrl: '/' })}
					>
						Sign Out
					</Button>
				) : null}
				{user ? (
					<Button
						component='a'
						href='/account'
						size='small'
						variant='outlined'
						color='secondary'
					>
						{user?.user?.username}
					</Button>
				) : (
					<Button
						component='a'
						href='/'
						size='small'
						variant='outlined'
						color='secondary'
					>
						Sign In
					</Button>
				)}
				<Button size='small' variant='outlined' color='primary'>
					Toggle D/L Mode
				</Button>
			</div>
		</div>
	);
};

export default Nav;
