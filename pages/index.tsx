import {
	Button,
	FormControl,
	FormGroup,
	FormHelperText,
	Input,
	InputLabel,
} from '@mui/material';
import type { NextPage } from 'next';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import axios from 'axios';
import styles from '../styles/Home.module.scss';

type LoginData = {
	username_or_email: string;
	password: string;
};

type SignUpData = {
	email: string;
	username: string;
	password: string;
	repeat_password: string;
};

const initialLoginValues = {
	username_or_email: '',
	password: '',
};

const initialSignUpValues = {
	email: '',
	username: '',
	password: '',
	repeat_password: '',
};

const Home: NextPage = () => {
	const { data: user } = useSession();

	const [loginForm, setLoginForm] = useState(true);
	const [loginData, setLoginData] = useState<LoginData>(initialLoginValues);
	const [signUpData, setSignUpData] = useState<SignUpData>(initialSignUpValues);
	const [loginFormError, setLoginFormError] =
		useState<LoginData>(initialLoginValues);
	const [signUpFormError, setSignUpFormError] =
		useState<SignUpData>(initialSignUpValues);

	const handleFormChange = () => {
		setLoginData(initialLoginValues);
		setSignUpData(initialSignUpValues);
		setLoginForm((prevState) => !prevState);
	};

	const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setLoginData((prevState) => ({
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

	const handleLoginSubmit = async () => {
		// for (const [key, value] of Object.entries(loginData)) {
		// 	if (!value) {
		// 		setLoginFormError((prevState) => ({
		// 			...prevState,
		// 			[key]: value,
		// 		}));
		// 		return;
		// 	}
		// }
		signIn('credentials', {
			...loginData,
			redirect: false,
			callbackUrl: '/dashboard',
		});
		// try {
		// 	const res = await axios.post('/api/auth/login', loginData);
		// 	updateUser(res.data);
		// 	router.push('/dashboard');
		// } catch (error: any) {
		// 	console.log(error.response.data);
		// 	// setLoginFormError(error);
		// }
	};

	const handleSignUpSubmit = async () => {
		for (const [key, value] of Object.entries(signUpData)) {
			if (!value) {
				setSignUpFormError((prevState) => ({
					...prevState,
					[key]: value,
				}));
				return;
			}
		}
		try {
			await axios.post('/api/signup', signUpData);
			setLoginData(initialLoginValues);
			setSignUpData(initialSignUpValues);
			setLoginForm(true);
		} catch (error: any) {
			console.log(error.response.data);
			// setSignUpFormError(error);
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
					<h2>Login</h2>
					<div>
						{loginForm ? (
							<FormGroup>
								<FormControl>
									<InputLabel htmlFor='username_or_email'>
										Username or Email
									</InputLabel>
									<Input
										id='login_username_or_email'
										name='username_or_email'
										type='text'
										inputProps={{ minLength: 4, maxLength: 32 }}
										value={loginData.username_or_email}
										onChange={handleLoginChange}
										placeholder='Username or Email'
										required
									/>
								</FormControl>
								<FormControl>
									<InputLabel htmlFor='password'>Password</InputLabel>
									<Input
										id='login_password'
										name='password'
										type='password'
										inputProps={{ minLength: 4, maxLength: 32 }}
										value={loginData.password}
										onChange={handleLoginChange}
										placeholder='Password'
										required
									/>
								</FormControl>
								<FormHelperText>Forgot password?</FormHelperText>
								<Button onClick={handleLoginSubmit}>Login</Button>
								<FormControl>
									<FormHelperText>Need an account?</FormHelperText>
									<Button type='submit' onClick={handleFormChange}>
										Sign Up
									</Button>
								</FormControl>
							</FormGroup>
						) : (
							<FormGroup>
								<FormControl>
									<InputLabel htmlFor='email'>Email</InputLabel>
									<Input
										id='signup_email'
										name='email'
										type='email'
										inputProps={{ minLength: 4, maxLength: 32 }}
										value={signUpData.email}
										onChange={handleSignUpChange}
										placeholder='Email'
										required
									/>
									{/* <FormHelperText>{signUpFormError.email}</FormHelperText> */}
								</FormControl>
								<FormControl>
									<InputLabel htmlFor='username'>Username</InputLabel>
									<Input
										id='signup_username'
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
										id='signup_password'
										name='password'
										type='password'
										inputProps={{ minLength: 4, maxLength: 32 }}
										error={
											signUpData.password === signUpData.repeat_password
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
									<InputLabel htmlFor='repeat_password'>
										Repeat Password
									</InputLabel>
									<Input
										id='signup_repeat_password'
										name='repeat_password'
										type='password'
										inputProps={{ minLength: 4, maxLength: 32 }}
										error={
											signUpData.password === signUpData.repeat_password
												? false
												: true
										}
										value={signUpData?.repeat_password}
										onChange={handleSignUpChange}
										placeholder='Repeat Password'
										required
									/>
								</FormControl>
								<Button onClick={handleSignUpSubmit}>Register</Button>
								<FormControl>
									<FormHelperText>Already have an account?</FormHelperText>
									<Button type='submit' onClick={handleFormChange}>
										Sign In
									</Button>
								</FormControl>
							</FormGroup>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Home;
