type ParticleStyle = string | CanvasImageSource;

type Position = [number, number];

interface Particle {
	dead: boolean;
	life: number;
	delay: number;
	x: number;
	y: number;
	angle: number;
	da: number;
	dx: number;
	dy: number;
	w: number;
	h: number;
	gy: number;
	xw: number;
	style: ParticleStyle;
	opacity?: number;
}

type OnCreateParticle = (p: Particle) => Particle;

type OnUpdateParticle = (p: Particle, dt: number) => void;

export type { OnCreateParticle, OnUpdateParticle, Particle, ParticleStyle, Position };
