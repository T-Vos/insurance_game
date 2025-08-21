// RevealedInfo.tsx

import * as Types from '@/lib/types';
import React from 'react';

interface RevealedInfoProps {
	teams: Types.Team[];
	currentRoundIndex: number;
	roundChoices: Types.Round[];
}

const RevealedInfo = ({
	teams,
	currentRoundIndex,
	roundChoices,
}: RevealedInfoProps) => {
	return (
		<div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-inner">
			<h2 className="text-2xl font-bold text-teal-400 mb-4">
				Revealed Information
			</h2>
			{teams.map((team) => (
				<div
					key={team.id}
					className="mb-6 border-b border-gray-700 pb-4 last:border-b-0"
				>
					<h3 className="text-xl font-semibold text-gray-300 mb-3">
						{team.teamName}
					</h3>
					{team.choices.length > 0 ? (
						team.choices
							.flatMap((chosenItem) => {
								const originalRound = roundChoices.find(
									(r) => r.round_id === chosenItem.round_id
								);
								const originalChoice = originalRound?.choices.find(
									(c) => c.id === chosenItem.choice_id
								);

								if (!originalChoice?.reveals) {
									return [];
								}

								return originalChoice.reveals.map((revealMessage, index) => {
									const revealRound =
										chosenItem.roundIndex + revealMessage.revealedInRounds;
									if (currentRoundIndex === revealRound) {
										return (
											<div
												key={`${team.id}-${chosenItem.choice_id}-${index}`}
												className="bg-gray-700 p-3 rounded-md mb-2"
											>
												<p className="text-gray-400 text-sm">
													From "{chosenItem.description}":
												</p>
												<p className="text-white font-medium italic mt-1">
													{revealMessage.text}
												</p>
											</div>
										);
									}
									return null;
								});
							})
							.filter(Boolean) // Filter out null values
					) : (
						<p className="text-gray-500 italic">No information revealed yet.</p>
					)}
				</div>
			))}
		</div>
	);
};

export default RevealedInfo;
