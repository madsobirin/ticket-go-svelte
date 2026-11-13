import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireRole } from '$lib/server/guard';
import { operatorUbahStatus } from '$lib/server/services/pemesanan';

const schema = z.object({
	status: z.enum(['Lunas', 'Belum Bayar'], {
		message: 'Status harus berupa "Lunas" atau "Belum Bayar"'
	})
});

export async function PATCH(event) {
	requireRole(event, 'operator');
	const id = Number(event.params.id);

	if (!id || isNaN(id)) {
		return json({ error: { code: 'INVALID_ID', message: 'ID pesanan tidak valid' } }, { status: 400 });
	}

	let body;
	try {
		body = await event.request.json();
	} catch {
		return json({ error: { code: 'INVALID_JSON', message: 'Request tidak valid' } }, { status: 400 });
	}

	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.errors[0]?.message ?? 'Data tidak valid';
		return json({ error: { code: 'VALIDATION', message } }, { status: 400 });
	}

	try {
		const result = await operatorUbahStatus({
			id_pesan: id,
			newStatus: parsed.data.status
		});
		return json({ data: result });
	} catch (err) {
		const status = err.status || 500;
		return json({ error: { code: 'STATUS_TRANSITION_ERROR', message: err.message } }, { status });
	}
}
