import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { APIKeyData } from '../../lib/types/types';
import {
	Button,
	FormControl,
	FormGroup,
	Input,
	InputLabel,
} from '@mui/material';
import { Box } from '@mui/system';

const dataTemplate = [
	{
		host: 'gofile',
		api_key: '',
	},
	{
		host: 'pixeldrain',
		api_key: '',
	},
	{
		host: 'mixdrop',
		api_key: '',
		email: '',
	},
	{
		host: 'anonfiles',
		api_key: '',
	},
];

const Account = () => {
	const { data: user } = useSession();
	const [keysData, setKeysData] = useState<APIKeyData[]>(dataTemplate);

	const getUserData = async () => {
		try {
			const res = await axios.get('/api/user/account-data');
			setKeysData(res.data.api_data);
		} catch (error) {
			console.log(error);
		}
	};

	const handleChangeUserAPIKey = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, name, value } = e.target;
		const newState = keysData.map((item) =>
			item.host !== id.split('__')[0] ? item : { ...item, [name]: value }
		);
		setKeysData(newState);
	};

	const handleFormSubmit = async (hostName: string) => {
		try {
			const hostData = keysData.find((d) => d.host === hostName);
			const res = await axios.put('/api/user/account-data', hostData);
			setKeysData(res.data);
		} catch (error) {
			console.log(error);
		}
	};

	const handleDataDelete = async (hostName: string) => {
		try {
			const res = await axios.delete(`/api/user/account-data?host=${hostName}`);
			setKeysData(res.data);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getUserData();
	}, [user]);

	return dataTemplate.map((template, index) => {
		const renderArray = [];
		const filledData: APIKeyData = template;
		for (const [key, value] of Object.entries(template)) {
			const hostData = keysData.find((k) => k.host === template.host);
			if (hostData) {
				for (const k in template) {
					filledData[k] = hostData[k];
				}
			}
			if (key !== 'host') {
				renderArray.push(
					<FormControl key={key + index}>
						<InputLabel key={key + 'label'} htmlFor={key}>
							{filledData.host.charAt(0).toUpperCase() +
								filledData.host.slice(1)}{' '}
							{key.replace('_', ' ')}:
						</InputLabel>
						<Input
							sx={{ m: 2 }}
							key={key + 'input'}
							id={filledData.host + '__' + key}
							name={key}
							type={key === 'email' ? 'email' : 'text'}
							inputProps={{ minLength: 4, maxLength: 32 }}
							value={value}
							onChange={handleChangeUserAPIKey}
							placeholder={`${value} ${key.replace('_', ' ')}`}
						/>
					</FormControl>
				);
			}
		}
		return (
			<FormGroup sx={{ width: '500px' }} key={index}>
				<Box
					sx={{
						my: 1,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<h3>
						{filledData.host.charAt(0).toUpperCase() + filledData.host.slice(1)}{' '}
						credentials
					</h3>
					<div>
						<Button
							type='button'
							onClick={() => handleFormSubmit(filledData.host)}
						>
							Save
						</Button>
						<Button
							type='button'
							onClick={() => handleDataDelete(filledData.host)}
						>
							Delete
						</Button>
					</div>
				</Box>
				{renderArray}
			</FormGroup>
		);
	});
};

export default Account;
