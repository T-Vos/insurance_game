import { Choice, Round } from '@/lib/types';
import { LucidePlus } from 'lucide-react';
import { ChoiceEditor } from './ChoicesEditor';

type ChoicesListProps = {
	editingChoices: Choice[] | null;
	handleUpdateChoice: (
		choiceIndex: Choice['choice_index'],
		newChoiceData: Partial<Choice>
	) => void;
	handleRemoveChoice: (choiceId: string) => void;
	handleAddChoice: () => void;
	roundChoices: Round[];
};

export const ChoicesList = ({
	editingChoices,
	handleUpdateChoice,
	handleRemoveChoice,
	handleAddChoice,
	roundChoices,
}: ChoicesListProps) => {
	return (
		<div className="mt-8">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-xl font-bold text-gray-300">
					Keuzes voor deze ronde
				</h3>
				<button
					onClick={handleAddChoice}
					className="flex cursor-pointer items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
				>
					<LucidePlus size={18} />
					<span>Keuze toevoegen</span>
				</button>
			</div>

			{editingChoices && editingChoices.length > 0 ? (
				editingChoices.map((choice, choiceIndex) => (
					<ChoiceEditor
						key={choice.id}
						choice={choice}
						choiceIndex={choiceIndex}
						handleUpdateChoice={handleUpdateChoice}
						handleRemoveChoice={handleRemoveChoice}
						roundChoices={roundChoices}
					/>
				))
			) : (
				<>Nog geen keuzes</>
			)}
		</div>
	);
};
