import type { GetServerSidePropsContext } from 'next';
import { useState } from 'react';
import { Box, Button, Grid } from '@mui/material';
import { supportedHostList } from '../../lib/defaults';
import { getSession } from 'next-auth/react';
import {
	APIKeyExists,
	MongoUserModel,
	TempUserToken,
} from '../../lib/types/types';
import connectMongo from '../../lib/mongodb';
import User from '../../models/user';
import jwt from 'jsonwebtoken';

interface Props {
	keysData: APIKeyExists[];
}

const Dashboard = ({ keysData }: Props) => {
	const [keyListStatus, setKeyListStatus] = useState<APIKeyExists[]>(keysData);

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
			<Box sx={{ mx: 'auto', maxWidth: '75%' }}>
				<Box sx={{ m: 2, textAlign: 'center' }}>
					<h2>
						Select file host and provide API credentials to manage your files
					</h2>
				</Box>
				<Grid container p={2}>
					{supportedHostList.map((host, index) => (
						<Grid key={index} item xs={3} sx={{ textAlign: 'center' }}>
							<Button
								type='button'
								variant='contained'
								component='a'
								href={`dashboard/${host}`}
								color={
									keyListStatus.find((k) => k.host === host)
										? 'success'
										: 'warning'
								}
							>
								{host}
							</Button>
						</Grid>
					))}
				</Grid>
			</Box>
		</Box>
	);
};

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	let keysData: APIKeyExists[] = [];
	try {
		const session = await getSession(context);
		if (session && session.user) {
			await connectMongo();
			const user: MongoUserModel = await User.findById(session.user._id)
				.lean()
				.select('+api_data')
				.exec();
			if (!user || !user.api_data) {
				return;
			}
			keysData = user.api_data.map((item) => {
				const keyStatus = { host: item.host, has_key: true };
				for (const [key, value] of Object.entries(item)) {
					if (!value) {
						keyStatus.has_key = false;
						break;
					}
				}
				return keyStatus;
			});
		} else if (context.req.cookies.tempUserToken) {
			if (!process.env.JWT_STRATEGY_SECRET) {
				return;
			}
			const decodedToken = jwt.verify(
				context.req.cookies.tempUserToken,
				process.env.JWT_STRATEGY_SECRET
			) as TempUserToken;
			keysData = decodedToken.api_data.map((item) => {
				const keyStatus = { host: item.host, has_key: true };
				for (const [key, value] of Object.entries(item)) {
					if (!value) {
						keyStatus.has_key = false;
						break;
					}
				}
				return keyStatus;
			});
		}
		return {
			props: { keysData },
		};
	} catch (error: any) {
		console.error(error);
		return {
			props: { keysData },
		};
	}
};

export default Dashboard;
