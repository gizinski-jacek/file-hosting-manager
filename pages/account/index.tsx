import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { APIKeyData } from '../../lib/types/types';
import { Button, FormControl, Input, InputLabel } from '@mui/material';
import { Box } from '@mui/system';
import { defaultKeysDataValues } from '../../lib/defaults';
import { useRouter } from 'next/router';

const Account = () => {
	const { data: user } = useSession();
	const [keysData, setKeysData] = useState<APIKeyData[]>(defaultKeysDataValues);
	const router = useRouter();

	const aggregateData = useCallback((data: APIKeyData[]) => {
		const filledData = [];
		defaultKeysDataValues.forEach((entry) => {
			for (const key of Object.keys(entry)) {
				const userKeyData = data.find((d) => d.host === entry.host);
				for (const k in entry) {
					if (k !== 'host') {
						if (userKeyData) {
							entry[k] = userKeyData[k];
						} else {
							entry[k] = '';
						}
					}
				}
			}
			filledData.push(entry);
		});
		setKeysData(filledData);
	}, []);

	const getUserKeysData = useCallback(async () => {
		try {
			const res = await axios.get('/api/user/account-data');
			aggregateData(res.data as APIKeyData[]);
		} catch (error) {
			console.log(error);
		}
	}, [aggregateData]);

	const handleChangeUserAPIKey = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		hostName: string
	) => {
		const { name, value } = e.target;
		if (keysData.find((d) => d.host === hostName)) {
			const newState = keysData.map((item) =>
				item.host !== hostName ? item : { ...item, [name]: value }
			);
			setKeysData(newState);
		} else {
			const data = {
				host: hostName,
				api_key: '',
				[name]: value,
			};
			setKeysData((prevState) => [...prevState, data]);
		}
	};

	const handleFormSubmit = async (hostName: string) => {
		try {
			const hostData = keysData.find((d) => d.host === hostName);
			const res = await axios.put('/api/user/account-data', hostData);
			aggregateData(res.data as APIKeyData[]);
		} catch (error) {
			console.log(error);
		}
	};

	const handleDataDelete = async (hostName: string) => {
		try {
			const res = await axios.delete(`/api/user/account-data?host=${hostName}`);
			aggregateData(res.data as APIKeyData[]);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getUserKeysData();
		// if (user) {
		// 	getUserKeysData();
		// } else {
		// 	router.push('/');
		// }
	}, [user, getUserKeysData, router]);

	return keysData.map((data, i) => {
		return (
			<FormControl sx={{ width: '500px' }} key={i}>
				<Box
					sx={{
						my: 1,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<h3>
						{data.host.charAt(0).toUpperCase() + data.host.slice(1)} credentials
					</h3>
					<Box>
						<Button type='button' onClick={() => handleFormSubmit(data.host)}>
							Save
						</Button>
						<Button type='button' onClick={() => handleDataDelete(data.host)}>
							Delete
						</Button>
					</Box>
				</Box>
				{Object.entries(data).map(([key, value], index) => {
					if (key === 'host') {
						return;
					}
					return (
						<FormControl key={key + index}>
							<InputLabel key={key + 'label'} htmlFor={key}>
								{data.host.charAt(0).toUpperCase() + data.host.slice(1)}{' '}
								{key.replace('_', ' ')}:
							</InputLabel>
							<Input
								sx={{ m: 2 }}
								key={key + 'input'}
								id={data.host + '__' + key}
								name={key}
								type={key === 'email' ? 'email' : 'text'}
								inputProps={{ minLength: 4, maxLength: 32 }}
								value={value}
								onChange={(e) => handleChangeUserAPIKey(e, data.host)}
								placeholder={`${value} ${key.replace('_', ' ')}`}
							/>
						</FormControl>
					);
				})}
			</FormControl>
		);
	});
};

export default Account;
