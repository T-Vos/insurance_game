import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import {
	initializeApp,
	getApps,
	cert,
	ServiceAccount,
} from 'firebase-admin/app';
import serviceAccount from '@/insurance-game-6fbbd-firebase-adminsdk-fbsvc-3b349b586e.json';

// Initialize firebase-admin only once
if (!getApps().length) {
	initializeApp({
		credential: cert(serviceAccount as ServiceAccount),
	});
}
export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (pathname.startsWith('/admin')) {
		const adminToken = req.cookies.get('adminToken')?.value;

		if (!adminToken) {
			return NextResponse.redirect(new URL('/admin/login', req.url));
		}

		try {
			// Verify the token on the server-side
			const decodedToken = await getAuth().verifyIdToken(adminToken);
			console.log('Decoded admin token:', decodedToken);
			// The token is valid, so the user is authenticated and authorized.
			return NextResponse.next();
		} catch (error) {
			// Token is invalid or expired, redirect to login.
			return NextResponse.redirect(new URL('/admin/login', req.url));
		}
	}

	if (pathname.startsWith('/team/') && !pathname.startsWith('/team/join')) {
		const teamSession = req.cookies.get('teamSession');
		if (!teamSession) {
			return NextResponse.redirect(new URL('/team/join', req.url));
		}
	}

	return NextResponse.next();
}
