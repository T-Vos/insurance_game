import React from 'react';

const Page: React.FC = () => {
	return (
		<div className="bg-purple-200 flex items-center justify-center min-h-screen">
			<div className="bg-white rounded-xl shadow-lg p-6 w-80">
				<div className="flex justify-between items-center text-gray-600 mb-4">
					<button className="text-xl">&larr;</button>
					<span className="text-sm font-semibold">18</span>
					<button className="text-xl">&#8942;</button>
				</div>

				<div className="text-center text-sm text-gray-500 mb-2">
					Question <span className="font-semibold text-gray-700">13/20</span>
				</div>

				<p className="text-lg font-medium text-gray-800 mb-6">
					How many students in your className ___ from Korea?
				</p>

				<form className="space-y-3">
					<input type="text" />
					<input type="text" />
					<input type="text" />
					<input type="text" />
					<input type="text" />
					<input type="text" />
				</form>
			</div>
		</div>
	);
};

export default Page;
