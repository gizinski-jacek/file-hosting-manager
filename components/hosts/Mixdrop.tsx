import {
	Button,
	FormControl,
	FormGroup,
	Input,
	InputLabel,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';

interface FormData {
	api_key: string;
	[key: string]: string;
}

interface Props extends FormData {
	host: string;
}

const Mixdrop = ({ api_data }: Props | undefined) => {
	const [formData, setFormData] = useState<FormData>({
		api_key: '',
		email: '',
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleFormSubmit = async () => {
		try {
			const res = await axios.post(
				'/api/user/key-update?host=mixdrop',
				formData,
				{
					withCredentials: true,
				}
			);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			{api_data ? (
				'render data'
			) : (
				<FormGroup>
					<FormControl>
						<InputLabel htmlFor='email'>Input your API email</InputLabel>
						<Input
							id='email'
							name='email'
							inputProps={{ minLength: 4, maxLength: 64 }}
							value={formData.email}
							onChange={handleInputChange}
							required
							placeholder='API email'
						/>
					</FormControl>
					<FormControl>
						<InputLabel htmlFor='api_key'>Input your API key</InputLabel>
						<Input
							id='api_key'
							name='api_key'
							inputProps={{ minLength: 4, maxLength: 64 }}
							value={formData.api_key}
							onChange={handleInputChange}
							required
							placeholder='API key'
						/>
					</FormControl>
					<Button type='button' onClick={handleFormSubmit}>
						Submit
					</Button>
				</FormGroup>
			)}
		</div>
	);
};

export default Mixdrop;
