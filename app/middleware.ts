import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (pathname.startsWith('/admin')) {
		const adminToken = req.cookies.get('adminToken');
		if (!adminToken) {
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
