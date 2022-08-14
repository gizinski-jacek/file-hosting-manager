import mongoose from 'mongoose';
import { MongoUserModel } from '../lib/types/types';
import validator from 'validator';

const Schema = mongoose.Schema;

const UserSchema = new Schema<MongoUserModel>(
	{
		email: {
			type: String,
			minlength: 4,
			maxlength: 32,
			trim: true,
			unique: true,
			required: true,
			select: false,
			validate: [validator.isEmail, 'Provide valid email'],
		},
		username: { type: String, minlength: 2, maxlength: 32, required: true },
		password: {
			type: String,
			minlength: 4,
			maxlength: 128,
			trim: true,
			unique: true,
			required: true,
			select: false,
		},
		api_data: {
			select: false,
			type: [
				{
					host: {
						type: String,
						minlength: 4,
						maxlength: 32,
					},
					api_key: { type: String, minlength: 8, maxlength: 128 },
				},
			],
		},
	},
	{ timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
