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

export interface PixeldrainFile {
	abuse_reporter_name: string;
	abuse_type: string;
	allow_video_player: boolean;
	availability: string;
	availability_message: string;
	bandwith_used: number;
	bandwith_used_paid: number;
	can_edit: boolean;
	date_last_view: string;
	date_upload: string;
	download_speed_limit: number;
	downloads: number;
	hash_sha256: string;
	id: string;
	mime_type: string;
	name: string;
	show_ads: boolean;
	size: number;
	thumbnail_href: string;
	views: number;
}

export interface PixeldrainFolder {
	can_edit: boolean;
	date_created: string;
	file_count: number;
	id: string;
	title: string;
}

export interface MixdropFile {
	added: string;
	deleted: boolean;
	duration: string | null;
	fileref: string;
	isaudio: boolean;
	isvideo: boolean;
	size: string;
	status: string;
	subtitle: boolean;
	thumb: string | null;
	title: string;
	url: string;
}

export interface MixdropFolder {
	id: string;
	title: string;
}

export interface APIKeyData {
	host: string;
	api_key: string;
	email?: string;
}

export interface APIKeyExists {
	host: string;
	has_key: boolean;
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
