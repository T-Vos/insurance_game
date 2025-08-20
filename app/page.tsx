import Link from 'next/link';

export default function HomePage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-gray-100">
			<div className="bg-white p-8 rounded shadow-md flex flex-col gap-6 w-80">
				<h1 className="text-2xl font-bold text-center">Welcome</h1>
				<Link
					href="/admin/login"
					className="bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 transition"
				>
					Login as Admin
				</Link>
				<Link
					href="/team/join"
					className="bg-green-600 text-white py-2 rounded text-center hover:bg-green-700 transition"
				>
					Login as Team
				</Link>
			</div>
		</main>
	);
}
