import type { GetServerSidePropsContext } from 'next';
import Pixeldrain from '../../../components/hosts/Pixeldrain';
import Mixdrop from '../../../components/hosts/Mixdrop';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box } from '@mui/material';
import { defaultKeysDataValues } from '../../../lib/defaults';
import { getSession, useSession } from 'next-auth/react';
import {
	APIKeyData,
	APIKeyExists,
	MongoUserModel,
	TempUserToken,
} from '../../../lib/types/types';
import connectMongo from '../../../lib/mongodb';
import User from '../../../models/user';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import APIKeyForm from '../../../components/APIKeyForm';

interface Props {
	keysData: APIKeyExists[];
}

const hostComponents: { [key: string]: any } = {
	pixeldrain: Pixeldrain,
	mixdrop: Mixdrop,
};

const Host = ({ keysData }: Props) => {
	const { data: user } = useSession();
	const [keyListStatus, setKeyListStatus] = useState<APIKeyExists[]>(keysData);
	const router = useRouter();
	const { host } = router.query as { host: string };

	const HostComponent = host ? hostComponents[host] : null;

	const handleKeyFormSubmit = async (data: APIKeyData) => {
		try {
			if (user) {
				const res = await axios.put('/api/user/account-data', data, {
					withCredentials: true,
				});
				if (res.status === 200) {
					handleUpdateKey(data);
				}
			} else {
				const res = await axios.put('/api/user/temp-user', data, {
					withCredentials: true,
				});
				if (res.status === 200) {
					handleUpdateKey(data);
				}
			}
		} catch (error: any) {
			console.error(error);
		}
	};

	const handleUpdateKey = (data: APIKeyData) => {
		const key: APIKeyExists = { host: data.host, has_key: true };
		const filtered = keyListStatus.filter((k) => k.host !== data.host);
		setKeyListStatus([...filtered, key]);
	};

	return (
		host && (
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
				{keyListStatus.find((k) => k.host === host) ? (
					<Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
						<HostComponent />
					</Box>
				) : (
					<Box sx={{ p: 5, textAlign: 'center' }}>
						<APIKeyForm
							formFields={
								defaultKeysDataValues.find((k) => k.host === host) as APIKeyData
							}
							submitKey={handleKeyFormSubmit}
						/>
					</Box>
				)}
			</Box>
		)
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

export default Host;
