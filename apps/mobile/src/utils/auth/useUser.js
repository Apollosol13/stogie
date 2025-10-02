import { useCallback } from 'react';
import { useAuth } from './useAuth';

export const useUser = () => {
	const { auth, isReady } = useAuth();
	
	// Debug what useAuth is returning
	console.log('👤 useUser: Auth state:', { auth, isReady });
	console.log('👤 useUser: Auth exists?', !!auth);
	console.log('👤 useUser: Auth.user exists?', !!auth?.user);
	
	const user = auth?.user || null;
	console.log('👤 useUser: Final user object:', user);
	
	const fetchUser = useCallback(async () => {
		return user;
	}, [user]);
	return { user, data: user, loading: !isReady, refetch: fetchUser };
};
export default useUser;
