export function getTeamSession() {
	const cookies = document.cookie
		.split('; ')
		.find((row) => row.startsWith('teamSession='));
	if (!cookies) return null;
	try {
		return JSON.parse(cookies.split('=')[1]);
	} catch (e) {
		return null;
	}
}
