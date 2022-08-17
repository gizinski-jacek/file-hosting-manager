import { Box, Button, IconButton, Link, Typography } from '@mui/material';
import { useState } from 'react';
import styles from '../styles/Nav.module.scss';
import SideMenu from './SideMenu';

const Nav = () => {
	return (
		<Box className={styles.nav} sx={{ display: 'flex', height: '64px' }}>
			<SideMenu />
		</Box>
	);
};

export default Nav;
