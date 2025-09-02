import * as admin from 'firebase-admin';

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert({
			type: process.env.FIREBASE_type,
			projectId: process.env.FIREBASE_project_id,
			privateKeyId: process.env.FIREBASE_private_key_id,
			privateKey: process.env.FIREBASE_private_key?.replace(/\\n/g, '\n'),
			clientEmail: process.env.FIREBASE_client_email,
			clientId: process.env.FIREBASE_client_id,
			authUri: process.env.FIREBASE_auth_uri,
			tokenUri: process.env.FIREBASE_token_uri,
			authProviderX509CertUrl: process.env.FIREBASE_auth_provider_x509_cert_url,
			clientC509CertUrl: process.env.FIREBASE_client_x509_cert_url,
			universeDomain: process.env.FIREBASE_universe_domain,
		} as admin.ServiceAccount),
	});
}

export const adminDb = admin.firestore();
