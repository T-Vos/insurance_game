import React from 'react';
import { LucideRefreshCw } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

type HeaderProps = {
	GAME_ID: string;
	userId: string;
	setShowResetModal: (show: boolean) => void;
};

const Footer: React.FC<HeaderProps> = ({
	GAME_ID,
	userId,
	setShowResetModal,
}) => (
	<div className="w-full">
		<div className="bg-gray-800 rounded-lg p-4 mt-4 shadow-xl flex flex-col sm:flex-row items-center justify-between">
			<p className="text-sm font-mono break-all text-gray-500 mb-2 sm:mb-0">
				Game ID: <span className="font-bold">{GAME_ID}</span>
			</p>
			<p className="text-sm font-mono break-all text-gray-500 mb-2 sm:mb-0">
				User ID: <span className="font-bold">{userId}</span>
			</p>
			<div className="flex items-center space-x-9">
				<button
					onClick={() => setShowResetModal(true)}
					className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 transition duration-200"
				>
					<LucideRefreshCw size={16} />
					<span>Reset Scores</span>
				</button>
				<LogoutButton />
			</div>
		</div>
	</div>
);

export default Footer;
