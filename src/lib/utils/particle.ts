import type { OnCreateParticle, Particle, ParticleStyle, Position } from './types';

import { BOUNDARY, DEG_TO_RAD, ROTATION_SPEED } from './constants';
import { random } from './random';

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
		w: random(18, 10),
		h: random(6, 4),
		gy: random(4.5, 2),
		xw: random(6, 1),
		style: STYLE,
	};

	if (onCreate) particle = onCreate(particle);

	return particle;
}

function renderParticle(context: CanvasRenderingContext2D, particle: Particle): void {
	const ANGLE_IN_RADIANS = particle.angle * DEG_TO_RAD;
	const COS = Math.cos(ANGLE_IN_RADIANS);
	const SIN = Math.sin(ANGLE_IN_RADIANS);
	context.setTransform(COS, SIN, -SIN, COS, particle.x, particle.y);

	if (particle.style instanceof HTMLImageElement) {
		context.drawImage(particle.style, -particle.style.width / 2, -particle.style.height / 2);
	} else {
		context.fillStyle = particle.style;
		context.fillRect(particle.w * -0.5, particle.h * -0.5, particle.w, particle.h);
	}

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
