import { Choice, Round } from '@/lib/types';
import { LucidePlus } from 'lucide-react';
import { ChoiceEditor } from './ChoicesEditor';

type ChoicesListProps = {
	editingChoices: Choice[] | null;
	allChoices: Choice[];
	allRounds: Round[];
	onAddChoice: () => void;
	onRemoveChoice: (choiceId: string) => void;
	onSaveChoice: (updatedChoice: Choice) => void;
};

export const ChoicesList = ({
	editingChoices,
	allChoices,
	allRounds,
	onAddChoice,
	onRemoveChoice,
	onSaveChoice,
}: ChoicesListProps) => {
	return (
		<div className="mt-8">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-xl font-bold text-gray-300">
					Keuzes voor deze ronde
				</h3>
				<button
					onClick={onAddChoice}
					className="flex cursor-pointer items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
				>
					<LucidePlus size={18} />
					<span>Keuze toevoegen</span>
				</button>
			</div>

			{editingChoices && editingChoices.length > 0 ? (
				editingChoices.map((choice) => (
					<ChoiceEditor
						key={choice.id}
						choice={choice}
						allChoices={allChoices}
						allRounds={allRounds}
						onSave={onSaveChoice}
						onRemove={onRemoveChoice}
					/>
				))
			) : (
				<>Nog geen keuzes</>
			)}
		</div>
	);
};
