import type { OnCreateParticle, Particle, ParticleStyle, Position } from '$lib/utils/types';

import { BOUNDARY, DEG_TO_RAD, ROTATION_SPEED } from '$lib/utils/constants';
import { random } from '$lib/utils/random';

interface CreateParticleOptions {
	context: CanvasRenderingContext2D;
	origin: Position | undefined;
	force: number;
	angle: number;
	spread: number;
	styles: readonly ParticleStyle[];
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
	const STYLE = styles[Math.floor(random(styles.length))];
	let da = random(90, -90);

	if (origin) {
		// Generate a confetti burst effect using the provided origin coordinates
		positionX = origin[0];
		positionY = origin[1];
		vx = random(force, 5);
		vy = random(force, 5);
		dir = random(angle + spread / 2, angle - spread / 2) * DEG_TO_RAD;
		da *= 2;
	} else {
		// If no origin is provided, confetti falls from the top edge of the canvas
		positionX = random(context.canvas.width);
		positionY = random(-BOUNDARY);
		vx = random(5);
		vy = random(5, 1);
		dir = random(180) * DEG_TO_RAD;
	}

	const DX = Math.cos(dir);
	const DY = Math.sin(dir);

	const IS_SIZED_STYLE = STYLE instanceof HTMLCanvasElement || STYLE instanceof HTMLImageElement;

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
		w: IS_SIZED_STYLE ? STYLE.width : random(18, 10),
		h: IS_SIZED_STYLE ? STYLE.height : random(6, 4),
		gy: random(4.5, 2),
		xw: random(6, 1),
		style: STYLE,
		opacity: 1,
	};

	if (onCreate) {
		const AUTO_W = particle.w;
		const AUTO_H = particle.h;
		particle = onCreate(particle);

		if (IS_SIZED_STYLE) {
			const IS_W_CHANGED = particle.w !== AUTO_W;
			const IS_H_CHANGED = particle.h !== AUTO_H;
			const ASPECT = AUTO_W / AUTO_H;

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
