function random(max: number, min = 0): number {
	if (!Number.isFinite(max) || !Number.isFinite(min)) {
		throw new Error('random() requires finite numbers');
	}

	if (min > max) {
		throw new Error(`random() requires min (${String(min)}) <= max (${String(max)})`);
	}

	return Math.random() * (max - min) + min;
}

function coinFlip(): boolean {
	return Math.random() >= 0.5;
}

export { coinFlip, random };
