type ParticleStyle = string | HTMLImageElement;

type Position = [number, number];

type Particle = {
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
};

type OnCreateParticle = (p: Particle) => Particle;

type OnUpdateParticle = (p: Particle, dt: number) => void;

export type { ParticleStyle, Position, Particle, OnCreateParticle, OnUpdateParticle };
