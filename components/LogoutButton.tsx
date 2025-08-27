import { getAuth, signOut } from 'firebase/auth';
import { LucideLogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
	const router = useRouter();
	const auth = getAuth();

	const handleLogout = async () => {
		try {
			await signOut(auth);
			router.push('/');
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	return (
		<button
			onClick={handleLogout}
			className="flex cursor-pointer items-center space-x-2 text-sm text-gray-400 hover:text-gray-200 transition duration-200"
		>
			<LucideLogOut size={16} />
			<span>Logout</span>
		</button>
	);
}
