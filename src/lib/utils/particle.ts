import type { OnCreateParticle, Particle, ParticleStyle, Position } from './types';

import { BOUNDARY, DEG_TO_RAD, ROTATION_SPEED } from './constants';
import { random } from './random';

const createParticle = (
	context: CanvasRenderingContext2D,
	origin: Position | undefined,
	force: number,
	angle: number,
	spread: number,
	styles: ParticleStyle[],
	onCreate?: OnCreateParticle,
) => {
	let dir: number;
	let x: number;
	let y: number;
	let vx: number;
	let vy: number;
	const STYLE = styles[Math.floor(random(styles.length))];
	let da = random(90, -90);

	if (origin) {
		// Generate a confetti burst effect using the provided origin coordinates
		x = origin[0];
		y = origin[1];
		vx = random(force, 5);
		vy = random(force, 5);
		dir = random(angle + spread / 2, angle - spread / 2) * DEG_TO_RAD;
		da *= 2;
	} else {
		// If no origin is provided, confetti falls from the top edge of the canvas
		x = random(context.canvas.width);
		y = random(-BOUNDARY);
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
		x,
		y,
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
};

const renderParticle = (context: CanvasRenderingContext2D, p: Particle) => {
	const ANGLE_IN_RADIANS = p.angle * DEG_TO_RAD;
	const COS = Math.cos(ANGLE_IN_RADIANS);
	const SIN = Math.sin(ANGLE_IN_RADIANS);
	context.setTransform(COS, SIN, -SIN, COS, p.x, p.y);
	if (p.style instanceof HTMLImageElement) {
		context.drawImage(p.style, -p.style.width / 2, -p.style.height / 2);
	} else {
		context.fillStyle = p.style;
		context.fillRect(p.w * -0.5, p.h * -0.5, p.w, p.h);
	}
	context.setTransform(1, 0, 0, 1, 0, 0);
};

const updateParticle = (p: Particle, dt: number) => {
	p.life += dt;
	if (p.dead || p.life < p.delay) return;
	const FRAME_SCALE = dt * 60;
	p.angle += p.da * dt * ROTATION_SPEED;
	p.dy += p.gy * dt * ROTATION_SPEED;
	p.dx += (3 * Math.sin(p.life * p.xw) + Math.sin(p.life * p.xw * 2.3)) * dt;
	const DRAG = 0.98 ** FRAME_SCALE;
	p.dx *= DRAG;
	p.dy *= DRAG;
	p.x += p.dx * FRAME_SCALE;
	p.y += p.dy * FRAME_SCALE;
};

const isOutOfBounds = (p: Particle, canvasWidth: number, canvasHeight: number) => {
	return p.x < -BOUNDARY || p.x > canvasWidth + BOUNDARY || p.y > canvasHeight + BOUNDARY;
};

export { createParticle, renderParticle, updateParticle, isOutOfBounds };
