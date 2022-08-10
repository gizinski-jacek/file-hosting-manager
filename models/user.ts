import mongoose from 'mongoose';
import 'mongoose-type-email';

const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		email: {
			type: Schema.Types.Email,
			minlength: 8,
			maxlength: 64,
			required: true,
			select: false,
		},
		username: { type: String, minlength: 2, maxlength: 32, required: true },
		password: {
			type: String,
			minlength: 8,
			maxlength: 64,
			required: true,
			select: false,
		},
	},
	{ timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
