import { CV_FILE_PATH } from '$env/static/private';
import { readFileSync } from 'fs';

export const prerender = true;

export function GET() {
	const file = readFileSync(CV_FILE_PATH);
	return new Response(file, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': 'inline; filename="shane_jaroch_cv.pdf"'
		}
	});
}
