import { useState } from 'react';
import { Team } from '@/lib/types';

interface TeamsConfigProps {
	teams: Team[];
	handleAddTeam: (teamName: string) => void;
	handleUpdateTeam: (id: Team['id'], updates: Partial<Team>) => void;
}

const TeamsConfig = ({
	teams,
	handleAddTeam,
	handleUpdateTeam,
}: TeamsConfigProps) => {
	const [newTeamName, setNewTeamName] = useState<string>('');
	const [editingTeamId, setEditingTeamId] = useState<Team['id'] | null>(null);
	const [editingName, setEditingName] = useState<string>('');

	const onAddTeam = () => {
		if (!newTeamName.trim()) return;
		handleAddTeam(newTeamName);
		setNewTeamName('');
	};

	const finishEditing = (teamId: Team['id']) => {
		if (editingName.trim()) {
			handleUpdateTeam(teamId, { teamName: editingName.trim() });
		}
		setEditingTeamId(null);
		setEditingName('');
	};

	return (
		<>
			{/* Add team section */}
			<div className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8">
				<h2 className="text-2xl font-semibold mb-4 text-teal-300">
					Add New Team
				</h2>
				<div className="flex space-x-4">
					<input
						type="text"
						value={newTeamName}
						onChange={(e) => setNewTeamName(e.target.value)}
						placeholder="Team Name"
						className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-gray-400"
					/>
					<button
						onClick={onAddTeam}
						className="px-6 py-2 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition duration-300 transform hover:scale-105"
					>
						Add Team
					</button>
				</div>
			</div>

			{/* Teams list */}
			<div className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8">
				<h2 className="text-2xl font-semibold mb-4 text-teal-300">Teams</h2>
				{teams.length === 0 ? (
					<p className="text-gray-400">
						No teams available. Please add a team.
					</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{teams.map((team) => (
							<div
								key={team.id}
								className="bg-gray-800 rounded-2xl p-6 shadow-xl border-t-4 border-gray-700"
							>
								{editingTeamId === team.id ? (
									<input
										type="text"
										value={editingName}
										autoFocus
										onChange={(e) => setEditingName(e.target.value)}
										onBlur={() => finishEditing(team.id)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') finishEditing(team.id);
											if (e.key === 'Escape') {
												setEditingTeamId(null);
												setEditingName('');
											}
										}}
										className="text-2xl font-semibold text-teal-300 bg-gray-700 rounded px-2 py-1 w-full"
									/>
								) : (
									<h3
										className="text-2xl font-semibold text-teal-300 cursor-pointer"
										onClick={() => {
											setEditingTeamId(team.id);
											setEditingName(team.teamName);
										}}
									>
										{team.teamName}
									</h3>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);
};

export default TeamsConfig;
