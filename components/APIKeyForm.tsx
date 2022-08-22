import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	InputLabel,
} from '@mui/material';
import { useState } from 'react';
import { APIKeyData } from '../lib/types/types';

interface Props {
	formFields: APIKeyData;
	submitKey: (data: APIKeyData) => void;
}

const APIKeyForm = ({ formFields, submitKey }: Props) => {
	const [formData, setFormData] = useState<APIKeyData>(formFields);

	const handleKeyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSubmitKey = () => {
		submitKey(formData);
	};

	return (
		<FormControl>
			<FormLabel sx={{ my: 1 }}>
				<h2>
					{formData.host.charAt(0).toUpperCase() + formData.host.slice(1)}{' '}
					credentials required
				</h2>
			</FormLabel>
			{Object.entries(formData).map(([key, value], index) => {
				if (key === 'host') {
					return;
				}
				return (
					<FormControl key={index} sx={{ my: 1 }}>
						<InputLabel htmlFor={key}>
							Input your {key.replace('_', ' ')}
						</InputLabel>
						<Input
							id={key}
							name={key}
							inputProps={{ minLength: 4, maxLength: 64 }}
							value={value}
							onChange={handleKeyInputChange}
							required
							placeholder={key.replace('_', ' ')}
						/>
					</FormControl>
				);
			})}
			<Button type='button' onClick={handleSubmitKey}>
				Submit
			</Button>
		</FormControl>
	);
};

export default APIKeyForm;
