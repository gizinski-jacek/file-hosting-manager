import { JwtPayload } from 'jsonwebtoken';

export interface UserModel {
	_id: string;
	username: string;
}

export interface MongoUserModel extends UserModel {
	email: string;
	password: string;
	api_data: {
		host: string;
		api_key: string;
		[key: string]: string;
	}[];
}

export interface UserSignInModel {
	email: string;
	username: string;
	password: string;
}

export interface UserSignUpModel extends UserSignInModel {
	repeat_password: string;
}

export interface TempUserToken extends JwtPayload {
	api_data: {
		host: string;
		api_key: string;
		[key: string]: string;
	}[];
}

export interface APIFormData {
	api_key: string;
	[key: string]: string;
}

export interface PixeldrainFile {
	id: string;
	name: string;
	date_upload: string;
	size: number;
	downloads: number;
	[key: string]: string | number;
}

export interface APIKeysData {
	host: string;
	api_key: string;
	[key: string]: string;
}

export interface SignInData {
	username_or_email: string;
	password: string;
}

export interface SignUpData {
	email: string;
	username: string;
	password: string;
	confirm_password: string;
}
