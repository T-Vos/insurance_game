import { Choice, Round } from '@/lib/types';
import { LucidePlus } from 'lucide-react';
import { ChoiceEditor } from './ChoicesEditor';

type ChoicesListProps = {
	editingChoices: Choice[];
	handleUpdateChoice: (
		choiceIndex: number,
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
					className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
				>
					<LucidePlus size={18} />
					<span>Keuze toevoegen</span>
				</button>
			</div>

			{editingChoices.map((choice, choiceIndex) => (
				<ChoiceEditor
					key={choice.id}
					choice={choice}
					choiceIndex={choiceIndex}
					handleUpdateChoice={handleUpdateChoice}
					handleRemoveChoice={handleRemoveChoice}
					roundChoices={roundChoices}
				/>
			))}
		</div>
	);
};
