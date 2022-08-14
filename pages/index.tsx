import type { NextPage } from 'next';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import axios, { AxiosResponse } from 'axios';
import {
	Button,
	FormControl,
	FormGroup,
	FormHelperText,
	Input,
	InputLabel,
} from '@mui/material';
import styles from '../styles/Home.module.scss';
import { SignInData, SignUpData } from '../lib/types/types';

const initialSignInValues = {
	username_or_email: '',
	password: '',
};

const initialSignUpValues = {
	email: '',
	username: '',
	password: '',
	confirm_password: '',
};

const Home: NextPage = () => {
	const { data: user } = useSession();

	const router = useRouter();

	const [showForm, setShowForm] = useState('signIn');
	const [signInData, setSignInData] = useState<SignInData>(initialSignInValues);
	const [signUpData, setSignUpData] = useState<SignUpData>(initialSignUpValues);
	const [forgotPasswordData, setForgotPasswordData] = useState('');
	const [signInFormError, setSignInFormError] = useState<string[]>([]);
	const [signUpFormError, setSignUpFormError] = useState<string[]>([]);
	const [forgotPasswordError, setForgotPasswordError] = useState<string[]>([]);

	const handleFormChange = (value: string) => {
		setSignInData(initialSignInValues);
		setSignUpData(initialSignUpValues);
		setForgotPasswordData('');
		setShowForm(value);
	};

	const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setSignInData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setSignUpData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSignInSubmit = async () => {
		const res = await signIn('credentials', {
			...signInData,
			redirect: false,
		});
		if (!res) {
			setSignInFormError((prevState) => ['Sign In error']);
			return;
		}
		if (res.ok) {
			router.push('/dashboard');
		} else {
			setSignInFormError((prevState) => ['Check credentials']);
		}
	};

	const handleSignUpSubmit = async () => {
		try {
			const res: AxiosResponse = await axios.post('/api/signup', signUpData);
			setSignInData(initialSignInValues);
			setSignUpData(initialSignUpValues);
			setShowForm('signIn');
		} catch (error: any) {
			setSignUpFormError((prevState) => [...error.response.data]);
		}
	};

	const handleFormError = () => {};

	return (
		<div className={styles.container}>
			<div>
				<h2>Welcome {user?.user?.username}</h2>
			</div>
			{user ? null : (
				<div>
					{showForm === 'signIn' ? (
						<FormGroup>
							<h2>Sign In</h2>
							<FormControl sx={{ m: 1 }}>
								<InputLabel htmlFor='username_or_email'>
									Username or Email
								</InputLabel>
								<Input
									id='username_or_email'
									name='username_or_email'
									type='text'
									inputProps={{ minLength: 4, maxLength: 32 }}
									value={signInData.username_or_email}
									onChange={handleSignInChange}
									placeholder='Username or Email'
									required
								/>
							</FormControl>
							<FormControl sx={{ m: 1 }}>
								<InputLabel htmlFor='password'>Password</InputLabel>
								<Input
									id='password'
									name='password'
									type='password'
									inputProps={{ minLength: 4, maxLength: 32 }}
									value={signInData.password}
									onChange={handleSignInChange}
									placeholder='Password'
									required
								/>
							</FormControl>
							{signInFormError?.map((e, index) => (
								<FormHelperText sx={{ color: 'red' }} key={index}>
									{e}
								</FormHelperText>
							))}
							{signInFormError ? (
								<FormHelperText
									sx={{ cursor: 'pointer', color: 'orange' }}
									onClick={() => handleFormChange('forgotPassword')}
								>
									Forgot password?
								</FormHelperText>
							) : null}
							<Button type='button' onClick={handleSignInSubmit}>
								Sign In
							</Button>
							<FormControl>
								<FormHelperText>Need an account?</FormHelperText>
								<Button
									type='button'
									onClick={() => handleFormChange('signUp')}
								>
									Sign Up
								</Button>
							</FormControl>
						</FormGroup>
					) : showForm === 'signUp' ? (
						<FormGroup>
							<h2>Sign Up</h2>
							<FormControl required>
								<InputLabel htmlFor='email'>Email</InputLabel>
								<Input
									id='email'
									name='email'
									type='email'
									inputProps={{ minLength: 4, maxLength: 32 }}
									value={signUpData.email}
									onChange={handleSignUpChange}
									placeholder='Email'
									required
								/>
							</FormControl>
							<FormControl required>
								<InputLabel htmlFor='username'>Username</InputLabel>
								<Input
									id='username'
									name='username'
									type='text'
									inputProps={{ minLength: 4, maxLength: 32 }}
									value={signUpData.username}
									onChange={handleSignUpChange}
									placeholder='Username'
									required
								/>
							</FormControl>
							<FormControl>
								<InputLabel htmlFor='password'>Password</InputLabel>
								<Input
									id='password'
									name='password'
									type='password'
									inputProps={{ minLength: 4, maxLength: 32 }}
									error={
										signUpData.password === signUpData.confirm_password
											? false
											: true
									}
									value={signUpData.password}
									onChange={handleSignUpChange}
									placeholder='Password'
									required
								/>
							</FormControl>
							<FormControl>
								<InputLabel htmlFor='confirm_password'>
									Confirm Password
								</InputLabel>
								<Input
									id='confirm_password'
									name='confirm_password'
									type='password'
									inputProps={{ minLength: 4, maxLength: 32 }}
									error={
										signUpData.password === signUpData.confirm_password
											? false
											: true
									}
									value={signUpData?.confirm_password}
									onChange={handleSignUpChange}
									placeholder='Confirm Password'
									required
								/>
							</FormControl>
							{signUpFormError?.map((e, index) => (
								<FormHelperText sx={{ color: 'red' }} key={index}>
									{e}
								</FormHelperText>
							))}
							<Button type='button' onClick={handleSignUpSubmit}>
								Register
							</Button>
							<FormControl>
								<FormHelperText>Forgot password?</FormHelperText>
								<Button
									type='button'
									onClick={() => handleFormChange('forgotPassword')}
								>
									Recover Account
								</Button>
								<FormHelperText>Already have an account?</FormHelperText>
								<Button
									type='button'
									onClick={() => handleFormChange('signIn')}
								>
									Sign In
								</Button>
							</FormControl>
						</FormGroup>
					) : showForm === 'forgotPassword' ? (
						<FormGroup>
							<h2>Recover Account</h2>
							<FormControl sx={{ m: 1 }}>
								<InputLabel htmlFor='username_or_email'>
									Username or Email
								</InputLabel>
								<Input
									id='username_or_email'
									name='username_or_email'
									type='text'
									inputProps={{ minLength: 4, maxLength: 32 }}
									value={forgotPasswordData}
									onChange={handleSignInChange}
									placeholder='Username or Email'
									required
								/>
							</FormControl>
							{forgotPasswordError?.map((e, index) => (
								<FormHelperText sx={{ color: 'red' }} key={index}>
									{e}
								</FormHelperText>
							))}
							<FormControl>
								<FormHelperText>Remember password?</FormHelperText>
								<Button
									type='button'
									onClick={() => handleFormChange('signIn')}
								>
									Sign In
								</Button>
								<FormHelperText>Need an account?</FormHelperText>
								<Button
									type='button'
									onClick={() => handleFormChange('signUp')}
								>
									Sign Up
								</Button>
							</FormControl>
						</FormGroup>
					) : null}
				</div>
			)}
		</div>
	);
};

export default Home;
