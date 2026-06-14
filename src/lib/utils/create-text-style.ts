interface CreateTextStyleOptions {
	fontSize?: number;
	fontFamily?: string;
	color?: string;
}

/**
 * Renders text or emoji to an offscreen HTMLCanvasElement for use as a ParticleStyle.
 * The returned canvas can be passed directly in the `styles` array of any confetti component
 * and can be mixed with color strings. Particle dimensions are automatically sized to match
 * the canvas dimensions — no `onCreate` callback is needed for sizing.
 *
 * @param text - Text or emoji to render.
 * @param options - Optional font and color configuration.
 * @param options.fontSize [24] - Font size in pixels.
 * @param options.fontFamily ['sans-serif'] - Font family for text rendering.
 * @param options.color [undefined] - Fill color for text characters. Defaults to black when omitted. Emoji use their native colors regardless of this value.
 * @returns An HTMLCanvasElement containing the rendered text.
 */
function createTextStyle(text: string, options?: CreateTextStyleOptions): HTMLCanvasElement {
	if (text.length === 0) {
		throw new Error('createTextStyle requires a non-empty text string');
	}

	const { fontSize = 24, fontFamily = 'sans-serif', color } = options ?? {};

	if (!Number.isFinite(fontSize) || fontSize <= 0) {
		throw new Error('createTextStyle fontSize must be a finite positive number');
	}

	const CANVAS = document.createElement('canvas');
	const CONTEXT = CANVAS.getContext('2d');

	if (!CONTEXT) {
		throw new Error('Failed to get canvas 2D context for text style');
	}

	const FONT = `${String(fontSize)}px ${fontFamily}`;
	CONTEXT.font = FONT;

	const METRICS = CONTEXT.measureText(text);
	const WIDTH = Math.ceil(METRICS.width);
	const HEIGHT = Math.ceil(METRICS.actualBoundingBoxAscent + METRICS.actualBoundingBoxDescent);

	CANVAS.width = WIDTH;
	CANVAS.height = HEIGHT;

	CONTEXT.font = FONT;
	CONTEXT.textBaseline = 'top';

	if (color != null) {
		CONTEXT.fillStyle = color;
	}

	CONTEXT.fillText(text, 0, 0);

	return CANVAS;
}

export type { CreateTextStyleOptions };

export { createTextStyle };
