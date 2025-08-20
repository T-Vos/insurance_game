export function getTeamSession(): string | null {
	if (typeof document === 'undefined') return null;
	const match = document.cookie.match(/teamSession=([^;]+)/);
	return match ? match[1] : null;
}
