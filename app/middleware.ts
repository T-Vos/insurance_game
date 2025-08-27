import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import {
	initializeApp,
	getApps,
	cert,
	ServiceAccount,
} from 'firebase-admin/app';

const projectId =
	process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_PROJECT_ID;

if (!getApps().length) {
	initializeApp({
		credential: cert({
			projectId: projectId,
			clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
			privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
		}),
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
