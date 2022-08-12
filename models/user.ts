import mongoose from 'mongoose';
import 'mongoose-type-email';

const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		email: {
			type: Schema.Types.Email,
			minlength: 4,
			maxlength: 32,
			required: true,
			select: false,
		},
		username: { type: String, minlength: 2, maxlength: 32, required: true },
		password: {
			type: String,
			minlength: 4,
			maxlength: 128,
			required: true,
			select: false,
		},
		api_data: {
			type: [
				{
					host: {
						type: String,
						minlength: 4,
						maxlength: 32,
					},
					email: {
						type: Schema.Types.Email,
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
