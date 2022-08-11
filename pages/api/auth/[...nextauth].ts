// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import nextAuth, { Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import connectMongo from '../../../lib/mongodb';
import User from '../../../models/user';
import bcryptjs from 'bcryptjs';

export default nextAuth({
	pages: {
		signIn: '/',
		signOut: '/',
		error: '/',
	},
	providers: [
		Credentials({
			id: 'credentials',
			name: 'Credentials',
			credentials: {
				username_or_email: { type: 'text' },
				password: { type: 'password' },
			},
			async authorize(credentials, req) {
				try {
					await connectMongo();
					if (!credentials) {
						return null;
					}
					const user = await User.findOne({
						$or: [
							{ email: credentials.username_or_email },
							{ username: credentials.username_or_email },
						],
					})
						.select('+password')
						.exec();
					if (!user) {
						return null;
					}
					const match = await bcryptjs.compare(
						credentials.password,
						user.password
					);
					if (!match) {
						return null;
					}
					const data = { ...user._doc };
					delete data.password;
					delete data.createdAt;
					delete data.updatedAt;
					return data;
				} catch (error) {
					return null;
				}
			},
		}),
	],
	session: {
		strategy: 'jwt',
		// maxAge: 30 * 24 * 60 * 60, // 30 days
		// updateAge: 24 * 60 * 60, // 24 hours
		maxAge: 5 * 60, // 5 minutes
		updateAge: 60, // 60 seconds
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user;
			}
			return token;
		},
		async session({ session, token }) {
			session.user = token.user;
			return session;
		},
	},
});
