'use client';

export default function TeamJoinSkeleton() {
	return (
		<div className="p-6 max-w-md mx-auto animate-pulse">
			<h1 className="text-xl font-bold text-center mb-6 bg-gray-300 rounded w-32 h-6 mx-auto"></h1>
			<div className="flex flex-col gap-4">
				<div className="h-10 bg-gray-300 rounded"></div>

				<div className="h-10 bg-gray-300 rounded"></div>

				<div className="h-10 bg-gray-400 rounded"></div>
			</div>
		</div>
	);
}
