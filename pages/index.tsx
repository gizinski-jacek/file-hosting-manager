import {
	Button,
	FormControl,
	FormGroup,
	FormHelperText,
	Input,
	InputLabel,
} from '@mui/material';
import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import styles from '../styles/Home.module.scss';
import axios from 'axios';
import { UserContext } from '../hooks/UserProvider';
import { useRouter } from 'next/router';

type LoginData = {
	login_username_or_email: string;
	login_password: string;
};

type SignUpData = {
	signup_email: string;
	signup_username: string;
	signup_password: string;
	signup_repeat_password: string;
};

const initialLoginValues = {
	login_username_or_email: '',
	login_password: '',
};

const initialSignUpValues = {
	signup_email: '',
	signup_username: '',
	signup_password: '',
	signup_repeat_password: '',
};

const Home: NextPage = () => {
	const { user, updateUser } = useContext(UserContext);
	const router = useRouter();

	const [loginForm, setLoginForm] = useState(true);
	const [loginData, setLoginData] = useState<LoginData>(initialLoginValues);
	const [signUpData, setSignUpData] = useState<SignUpData>(initialSignUpValues);
	const [loginFormError, setLoginFormError] =
		useState<LoginData>(initialLoginValues);
	const [signUpFormError, setSignUpFormError] =
		useState<SignUpData>(initialSignUpValues);

	useEffect(() => {
		(async () => {
			try {
				const res = await axios.get('/api/auth', { withCredentials: true });
				updateUser(res.data);
			} catch (error: any) {
				updateUser(null);
				router.push('/');
				console.error(error);
			}
		})();
	}, [router, updateUser]);

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
		for (const [key, value] of Object.entries(loginData)) {
			if (!value) {
				setLoginFormError((prevState) => ({
					...prevState,
					[key]: value,
				}));
				return;
			}
		}
		try {
			const res = await axios.post('/api/login', loginData);
			updateUser(res.data);
			router.push('/dashboard');
		} catch (error: any) {
			console.log(error.response.data);
			// setLoginFormError(error);
		}
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
				<h2>Welcome</h2>
			</div>
			{user ? null : (
				<div>
					<h2>Login</h2>
					<div>
						{loginForm ? (
							<FormGroup>
								<FormControl>
									<InputLabel htmlFor='login_username_or_email'>
										Username or Email
									</InputLabel>
									<Input
										id='login_username_or_email'
										name='login_username_or_email'
										type='text'
										inputProps={{ minLength: 4, maxLength: 32 }}
										value={loginData.login_username_or_email}
										onChange={handleLoginChange}
										placeholder='Username or Email'
										required
									/>
								</FormControl>
								<FormControl>
									<InputLabel htmlFor='login_password'>Password</InputLabel>
									<Input
										id='login_password'
										name='login_password'
										type='password'
										inputProps={{ minLength: 4, maxLength: 32 }}
										value={loginData.login_password}
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
									<InputLabel htmlFor='signup_email'>Email</InputLabel>
									<Input
										id='signup_email'
										name='signup_email'
										type='email'
										inputProps={{ minLength: 4, maxLength: 32 }}
										value={signUpData.signup_email}
										onChange={handleSignUpChange}
										placeholder='Email'
										required
									/>
									{/* <FormHelperText>{signUpFormError.signup_email}</FormHelperText> */}
								</FormControl>
								<FormControl>
									<InputLabel htmlFor='signup_username'>Username</InputLabel>
									<Input
										id='signup_username'
										name='signup_username'
										type='text'
										inputProps={{ minLength: 4, maxLength: 32 }}
										value={signUpData.signup_username}
										onChange={handleSignUpChange}
										placeholder='Username'
										required
									/>
								</FormControl>
								<FormControl>
									<InputLabel htmlFor='signup_password'>Password</InputLabel>
									<Input
										id='signup_password'
										name='signup_password'
										type='password'
										inputProps={{ minLength: 4, maxLength: 32 }}
										error={
											signUpData.signup_password ===
											signUpData.signup_repeat_password
												? false
												: true
										}
										value={signUpData.signup_password}
										onChange={handleSignUpChange}
										placeholder='Password'
										required
									/>
								</FormControl>
								<FormControl>
									<InputLabel htmlFor='signup_repeat_password'>
										Repeat Password
									</InputLabel>
									<Input
										id='signup_repeat_password'
										name='signup_repeat_password'
										type='password'
										inputProps={{ minLength: 4, maxLength: 32 }}
										error={
											signUpData.signup_password ===
											signUpData.signup_repeat_password
												? false
												: true
										}
										value={signUpData?.signup_repeat_password}
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
