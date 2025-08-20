const CustomConfirmationModal = ({
	message,
	onConfirm,
	onCancel,
}: {
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}) => (
	<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
		<div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
			<p className="text-white text-lg font-semibold mb-4">{message}</p>
			<div className="flex justify-end space-x-4">
				<button
					onClick={onCancel}
					className="px-4 py-2 rounded-lg text-gray-400 border border-gray-600 hover:bg-gray-700 transition"
				>
					Cancel
				</button>
				<button
					onClick={onConfirm}
					className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
);
export default CustomConfirmationModal;
