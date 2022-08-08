import { Button, Link } from '@mui/material';
import styles from '../styles/Nav.module.scss';

const Nav = () => {
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
				<Button size='small' variant='outlined' color='secondary'>
					Acc
				</Button>
				<Button size='small' variant='outlined' color='primary'>
					Toggle D/L Mode
				</Button>
			</div>
		</div>
	);
};

export default Nav;
