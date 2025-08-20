import { redis } from "bun";

type Policy = {
	rate: number;
	burst: number;
	windowMs: number;
};

export async function isNewTokenAllowed(key: string, p: Policy) {
	const now = Date.now();
	const windowKey = `${key}:${Math.floor(now / p.windowMs)}`;

	const count = await redis.incr(windowKey);
	if (count === 1) {
		await redis.expire(windowKey, p.windowMs + 50);
	}

	return count <= p.rate + p.burst;
}
