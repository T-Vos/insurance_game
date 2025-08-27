'use client';

import { Suspense } from 'react';
import TeamJoinForm from './components/TeamJoinForm';
import TeamJoinSkeleton from './components/TeamJoinSkeleton';

export default function TeamJoinPage() {
	return (
		<Suspense fallback={<TeamJoinSkeleton />}>
			<TeamJoinForm />
		</Suspense>
	);
}
