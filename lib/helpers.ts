import User from '../models/user';
import connectMongo from './mongodb';
import { APIKeyData, MongoUserModel, TempUserToken } from './types/types';
import jwt from 'jsonwebtoken';

export const getUserKeyFromDB = async (
	userId: string,
	host: string
): Promise<APIKeyData> => {
	if (!userId) {
		const error = new Error('User Id not provided');
		error.code = 401;
		throw error;
	}
	if (!host) {
		const error = new Error('Host not provided');
		error.code = 401;
		throw error;
	}
	await connectMongo();
	const user: MongoUserModel = await User.findById(userId)
		.select('+api_data')
		.exec();
	if (!user) {
		const error = new Error('User not found');
		error.code = 401;
		throw error;
	}
	const userAPIData = user.api_data.find((d) => d.host === host);
	if (!userAPIData) {
		const error = new Error('No api data');
		error.code = 401;
		throw error;
	}
	if (!userAPIData.api_key) {
		const error = new Error('No api key');
		error.code = 401;
		throw error;
	}
	return userAPIData;
};

export const getUserKeyFromToken = (
	token: string,
	host: string
): APIKeyData => {
	if (!process.env.JWT_STRATEGY_SECRET) {
		const error = new Error('Server error');
		error.code = 404;
		throw error;
	}
	const decodedToken = jwt.verify(
		token,
		process.env.JWT_STRATEGY_SECRET
	) as TempUserToken;
	const userAPIData = decodedToken.api_data.find(
		(d: APIKeyData) => d.host === host
	);
	if (!userAPIData) {
		const error = new Error('No api data');
		error.code = 401;
		throw error;
	}
	if (!userAPIData.api_key) {
		const error = new Error('No api key');
		error.code = 401;
		throw error;
	}
	return userAPIData;
};
