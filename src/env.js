import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

export const variables = defineEnvVars({
	DB_HOST: { schema: z.string().default('127.0.0.1') },
	DB_USER: { schema: z.string().default('travel') },
	DB_PASSWORD: { schema: z.string().default('travel123') },
	DB_NAME: { schema: z.string().default('db_tiket') },
	SESSION_SECRET: { schema: z.string().default('super_secret_session_key_ticket_go_2026') }
});
