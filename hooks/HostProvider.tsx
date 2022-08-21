import { createContext, useState } from 'react';

interface Props {
	children: React.ReactNode;
}

type HostProps = {
	host: string | null;
	updateHost: (value: string | null) => void;
};

const HostContext = createContext<HostProps>({
	host: null,
	updateHost: (value) => null,
});

const HostContextProvider = ({ children }: Props) => {
	const [host, setHost] = useState<string | null>(null);

	const updateHost = (value: string | null) => {
		if (value) {
			setHost(value.toLowerCase());
		} else {
			setHost(value);
		}
	};

	return (
		<HostContext.Provider value={{ host, updateHost }}>
			{children}
		</HostContext.Provider>
	);
};

export { HostContext, HostContextProvider };
