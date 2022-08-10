import { createContext, ReactNode, useCallback, useState } from 'react';
import lodash from 'lodash';

interface User {
	_id: string;
	username: string;
}

type ContextProps = {
	user: User | null;
	updateUser: (userData: User | null) => void;
};

interface Props {
	children?: ReactNode;
}

const UserContext = createContext<ContextProps>({
	user: null,
	updateUser: (userData) => null,
});

const UserProvider: React.FC<Props> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);

	const updateUser = useCallback(
		(userData: User | null) => {
			if (!lodash.isEqual(user, userData)) {
				setUser(userData);
			}
		},
		[user]
	);

	return (
		<UserContext.Provider value={{ user, updateUser }}>
			{children}
		</UserContext.Provider>
	);
};

export { UserContext, UserProvider };
