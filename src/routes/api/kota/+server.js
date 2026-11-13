import { json } from '@sveltejs/kit';
import { findAllKotaAsal, findAllKotaTujuan } from '$lib/server/repositories/kota';

export async function GET() {
	const [kota_asal, kota_tujuan] = await Promise.all([
		findAllKotaAsal(),
		findAllKotaTujuan()
	]);

	return json({
		data: {
			kota_asal,
			kota_tujuan
		}
	});
}
