import React from 'react';
import LogoutButton from '@/components/LogoutButton';

type HeaderProps = {
	GAME_ID: string;
	userId: string;
};

const Footer: React.FC<HeaderProps> = ({ GAME_ID, userId }) => (
	<div className="w-full">
		<div className="bg-gray-800 rounded-lg p-4 mt-4 shadow-xl flex flex-col sm:flex-row items-center justify-between">
			<p className="text-sm font-mono break-all text-gray-500 mb-2 sm:mb-0">
				Game ID: <span className="font-bold">{GAME_ID}</span>
			</p>
			<p className="text-sm font-mono break-all text-gray-500 mb-2 sm:mb-0">
				User ID: <span className="font-bold">{userId}</span>
			</p>
			<div className="flex items-center space-x-9">
				<LogoutButton />
			</div>
		</div>
	</div>
);

export default Footer;
