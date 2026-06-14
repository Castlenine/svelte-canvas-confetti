import type {
	OnCreateParticle,
	Particle,
	ParticleStyle,
	ParticleStyleConfig,
	ParticleStyleEntry,
	Position,
} from '$lib/utils/types';

import { BOUNDARY, DEG_TO_RAD, ROTATION_SPEED } from '$lib/utils/constants';
import { random } from '$lib/utils/random';

function isStyleConfig(entry: ParticleStyleEntry): entry is ParticleStyleConfig {
	return (
		typeof entry === 'object' && !(entry instanceof HTMLElement) && !(entry instanceof SVGElement) && 'style' in entry
	);
}

interface ResolvedSize {
	w: number;
	h: number;
	sizeConfigured: boolean;
}

function resolveParticleSize(
	style: ParticleStyle,
	configW: number | undefined,
	configH: number | undefined,
): ResolvedSize {
	if (style instanceof HTMLCanvasElement || style instanceof HTMLImageElement) {
		const ASPECT = style.height > 0 ? style.width / style.height : 1;

		if (configW != null && configH != null) return { w: configW, h: configH, sizeConfigured: true };
		if (configW != null) return { w: configW, h: configW / ASPECT, sizeConfigured: true };
		if (configH != null) return { w: configH * ASPECT, h: configH, sizeConfigured: true };

		return { w: style.width, h: style.height, sizeConfigured: false };
	}

	return {
		w: configW ?? random(18, 10),
		h: configH ?? random(6, 4),
		sizeConfigured: configW != null || configH != null,
	};
}

interface CreateParticleOptions {
	context: CanvasRenderingContext2D;
	origin: Position | undefined;
	force: number;
	angle: number;
	spread: number;
	styles: readonly ParticleStyleEntry[];
	onCreate?: OnCreateParticle;
}

function createParticle(options: CreateParticleOptions): Particle {
	const { context, origin, force, angle, spread, styles, onCreate } = options;

	if (styles.length === 0) {
		throw new Error('styles array must contain at least one ParticleStyle');
	}

	let dir: number;
	let positionX: number;
	let positionY: number;
	let vx: number;
	let vy: number;

	const ENTRY = styles[Math.floor(random(styles.length))];
	const IS_CONFIG = isStyleConfig(ENTRY);
	const STYLE = IS_CONFIG ? ENTRY.style : ENTRY;
	const CONFIG_W = IS_CONFIG ? ENTRY.w : undefined;
	const CONFIG_H = IS_CONFIG ? ENTRY.h : undefined;

	let da = random(90, -90);

	if (origin) {
		positionX = origin[0];
		positionY = origin[1];
		vx = random(force, 5);
		vy = random(force, 5);
		dir = random(angle + spread / 2, angle - spread / 2) * DEG_TO_RAD;
		da *= 2;
	} else {
		positionX = random(context.canvas.width);
		positionY = random(-BOUNDARY);
		vx = random(5);
		vy = random(5, 1);
		dir = random(180) * DEG_TO_RAD;
	}

	const DX = Math.cos(dir);
	const DY = Math.sin(dir);
	const SIZE = resolveParticleSize(STYLE, CONFIG_W, CONFIG_H);

	let particle: Particle = {
		dead: false,
		life: 0,
		delay: 0,
		x: positionX,
		y: positionY,
		angle: random(360),
		da,
		dx: DX * vx,
		dy: DY * vy,
		w: SIZE.w,
		h: SIZE.h,
		gy: random(4.5, 2),
		xw: random(6, 1),
		style: STYLE,
		opacity: 1,
		sizeConfigured: SIZE.sizeConfigured || undefined,
	};

	if (onCreate) {
		const AUTO_W = particle.w;
		const AUTO_H = particle.h;
		const RESULT = onCreate(particle);

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive: user callback may violate its type signature at runtime
		if (RESULT == null || typeof RESULT !== 'object') {
			throw new Error('onCreate callback must return a Particle object');
		}

		particle = RESULT;

		if (STYLE instanceof HTMLCanvasElement || STYLE instanceof HTMLImageElement) {
			const IS_W_CHANGED = particle.w !== AUTO_W;
			const IS_H_CHANGED = particle.h !== AUTO_H;
			const ASPECT = AUTO_H > 0 ? AUTO_W / AUTO_H : 1;

			if (IS_W_CHANGED && !IS_H_CHANGED) {
				particle.h = particle.w / ASPECT;
			} else if (!IS_W_CHANGED && IS_H_CHANGED) {
				particle.w = particle.h * ASPECT;
			}
		}
	}

	return particle;
}

function renderParticle(context: CanvasRenderingContext2D, particle: Particle): void {
	const ANGLE_IN_RADIANS = particle.angle * DEG_TO_RAD;
	const COS = Math.cos(ANGLE_IN_RADIANS);
	const SIN = Math.sin(ANGLE_IN_RADIANS);
	context.setTransform(COS, SIN, -SIN, COS, particle.x, particle.y);
	context.globalAlpha = particle.opacity ?? 1;

	if (typeof particle.style === 'string') {
		context.fillStyle = particle.style;
		context.fillRect(particle.w * -0.5, particle.h * -0.5, particle.w, particle.h);
	} else {
		context.drawImage(particle.style, -particle.w / 2, -particle.h / 2, particle.w, particle.h);
	}

	context.globalAlpha = 1;
	context.setTransform(1, 0, 0, 1, 0, 0);
}

function updateParticle(particle: Particle, dt: number): void {
	particle.life += dt;

	if (particle.dead || particle.life < particle.delay) return;
	const FRAME_SCALE = dt * 60;
	particle.angle += particle.da * dt * ROTATION_SPEED;
	particle.dy += particle.gy * dt * ROTATION_SPEED;
	particle.dx += (3 * Math.sin(particle.life * particle.xw) + Math.sin(particle.life * particle.xw * 2.3)) * dt;
	const DRAG = 0.98 ** FRAME_SCALE;
	particle.dx *= DRAG;
	particle.dy *= DRAG;
	particle.x += particle.dx * FRAME_SCALE;
	particle.y += particle.dy * FRAME_SCALE;
}

function isOutOfBounds(particle: Particle, canvasWidth: number, canvasHeight: number): boolean {
	return particle.x < -BOUNDARY || particle.x > canvasWidth + BOUNDARY || particle.y > canvasHeight + BOUNDARY;
}

export type { CreateParticleOptions };

export { createParticle, isOutOfBounds, renderParticle, updateParticle };
