const random = (max: number, min = 0) => Math.random() * (max - min) + min;

const coinFlip = () => Math.random() >= 0.5;

export { random, coinFlip };
