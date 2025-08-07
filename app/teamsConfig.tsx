const TeamsConfig = (teams: any) => {
	return (
		<>
			<div className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8">
				<h2 className="text-2xl font-semibold mb-4 text-teal-300">
					Add New Team
				</h2>
				<div className="flex space-x-4">
					<input
						type="text"
						// value={newTeamName}
						// onChange={(e) => setNewTeamName(e.target.value)}
						placeholder="Team Name"
						className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-gray-400"
					/>
					<button
						// onClick={handleAddTeam}
						className="px-6 py-2 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition duration-300 transform hover:scale-105"
					>
						Add Team
					</button>
				</div>
			</div>
		</>
	);
};
export default TeamsConfig;
