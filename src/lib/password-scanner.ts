/**
 * Reads an RTDX password from a picture of the password card, fully locally with plain pixel processing.
 *
 * The picture must already be cropped to the card (the camera guide takes care of that) and
 * resized to CARD_WIDTH x CARD_HEIGHT, the same coordinate system as `static/rtdx-password/rescue.png`.
 * Every cell is then at a known position, so there is no need for any detection or perspective handling:
 * - the glyph (1-9, P, M, D, X) is matched against the glyph PNGs (white fill and dark outline)
 * - the shape (fire, heart, water, emerald, star) is matched by the colors around the glyph against the shape PNGs
 */
import { deserialize } from './generators/rtdx/read';

export const CARD_WIDTH = 967;
export const CARD_HEIGHT = 254;
const CELL_SIZE = 53;
/** Size glyphs are drawn at within a cell, same as PasswordImage.svelte */
const GLYPH_SIZE = 25;

export const SHAPES = ['f', 'h', 'w', 'e', 's'] as const;
export const GLYPHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'p', 'm', 'd', 'x'] as const;

export interface RGBAImage {
	data: Uint8ClampedArray;
	width: number;
	height: number;
}

interface GlyphTemplate {
	glyph: string;
	/** Pixel offsets (in cell pixels) from the center of the white fill, and their brightness */
	dx: Float32Array;
	dy: Float32Array;
	values: Float32Array;
	mean: number;
	norm: number;
}

export interface References {
	shapes: { shape: string; hist: Float32Array }[];
	glyphs: GlyphTemplate[];
}

export interface ScanResult {
	/** Best guess, 30 symbols of 2 characters each (shorter if some glyph was not found) */
	password: string;
	/** Whether the password passes the checksum */
	valid: boolean;
}

type RGB = [number, number, number];

const HUE_BINS = 24;
/** Fraction of the icon size, around its center, used to sample the shape colors */
const SHAPE_RADIUS = 0.36;
/** Pixels this close (0-1) to the card or cell background colors are ignored when sampling the shape colors */
const BACKGROUND_DISTANCE = 0.18;
/** Misalignment tolerated when matching glyphs, around each starting point */
const GLYPH_SHIFT = 4;
const GLYPH_SCALES = [0.92, 1, 1.08];

/** Top-left corner of the cell i (0-29), same layout as PasswordImage.svelte */
function cellOrigin(i: number): [number, number] {
	const pos = i % 15;
	const x = 71 + pos * 54 + Math.floor(pos / 5) * 8.5;
	const y = 71 + (i >= 15 ? 69 : 0) + (pos >= 5 && pos <= 9 ? 8.5 : 0);
	return [x, y];
}

function hsv(data: Uint8ClampedArray, idx: number): RGB {
	const r = data[idx] / 255;
	const g = data[idx + 1] / 255;
	const b = data[idx + 2] / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;
	let h = 0;
	if (d > 0) {
		if (max === r) h = ((g - b) / d + 6) % 6;
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
	}
	return [h * 60, max === 0 ? 0 : d / max, max];
}

function luminance(img: RGBAImage): Float32Array {
	const lum = new Float32Array(img.width * img.height);
	for (let i = 0; i < lum.length; i++) {
		lum[i] = (img.data[i * 4] * 0.299 + img.data[i * 4 + 1] * 0.587 + img.data[i * 4 + 2] * 0.114) / 255;
	}
	return lum;
}

function medianColor(img: RGBAImage, pixels: Iterable<[number, number]>): RGB {
	const channels: number[][] = [[], [], []];
	for (const [x, y] of pixels) {
		if (x < 0 || y < 0 || x >= img.width || y >= img.height) continue;
		const idx = (y * img.width + x) * 4;
		for (let c = 0; c < 3; c++) channels[c].push(img.data[idx + c]);
	}
	return channels.map((v) => v.sort((a, b) => a - b)[v.length >> 1] ?? 0) as RGB;
}

function colorDistance(data: Uint8ClampedArray, idx: number, color: RGB): number {
	return Math.hypot(data[idx] - color[0], data[idx + 1] - color[1], data[idx + 2] - color[2]) / 255;
}

/**
 * White balance using the brightest pixels as reference, since glyphs and texts are pure white.
 * Corrects color casts and dark captures from the camera.
 */
function whiteBalance(img: RGBAImage): RGBAImage {
	const { data } = img;
	const lum = luminance(img);
	const counts = new Uint32Array(256);
	for (const l of lum) counts[Math.round(l * 255)]++;
	let threshold = 255;
	for (let acc = 0; threshold > 0 && acc < lum.length * 0.01; threshold--) acc += counts[threshold];

	const sum = [0, 0, 0];
	let n = 0;
	for (let i = 0; i < lum.length; i++) {
		if (lum[i] * 255 < threshold) continue;
		for (let c = 0; c < 3; c++) sum[c] += data[i * 4 + c];
		n++;
	}
	const gains = sum.map((v) => Math.min(3, Math.max(1, (255 * n) / Math.max(v, 1))));

	const out = new Uint8ClampedArray(data.length);
	for (let i = 0; i < data.length; i += 4) {
		for (let c = 0; c < 3; c++) out[i + c] = data[i + c] * gains[c];
		out[i + 3] = data[i + 3];
	}
	return { data: out, width: img.width, height: img.height };
}

/** Hue histogram (weighted by saturation) of the colored pixels within a disk, ignoring the background colors */
function hueHistogram(
	img: RGBAImage,
	cx: number,
	cy: number,
	radius: number,
	exclude?: number[],
	backgrounds: RGB[] = []
): Float32Array {
	const hist = new Float32Array(HUE_BINS);
	for (let y = Math.max(0, Math.floor(cy - radius)); y <= Math.min(img.height - 1, Math.ceil(cy + radius)); y++) {
		for (let x = Math.max(0, Math.floor(cx - radius)); x <= Math.min(img.width - 1, Math.ceil(cx + radius)); x++) {
			if ((x - cx) ** 2 + (y - cy) ** 2 > radius ** 2) continue;
			if (exclude && x >= exclude[0] && x <= exclude[2] && y >= exclude[1] && y <= exclude[3]) continue;
			const idx = (y * img.width + x) * 4;
			if (img.data[idx + 3] < 128) continue;
			const [h, s, v] = hsv(img.data, idx);
			if (s < 0.3 || v < 0.35) continue;
			if (backgrounds.some((bg) => colorDistance(img.data, idx, bg) < BACKGROUND_DISTANCE)) continue;
			// Spread over the two closest bins so small hue shifts don't jump bins
			const pos = (h / 360) * HUE_BINS - 0.5;
			const bin = Math.floor(pos);
			const frac = pos - bin;
			hist[(bin + HUE_BINS) % HUE_BINS] += s * (1 - frac);
			hist[(bin + 1) % HUE_BINS] += s * frac;
		}
	}
	const sum = hist.reduce((a, b) => a + b, 0) || 1;
	return hist.map((v) => v / sum);
}

/** Bhattacharyya coefficient: 1 for identical histograms, 0 for disjoint ones */
function histSimilarity(a: Float32Array, b: Float32Array): number {
	let sum = 0;
	for (let i = 0; i < a.length; i++) sum += Math.sqrt(a[i] * b[i]);
	return sum;
}

/**
 * Finds the white fill of the glyph around the expected cell center: the biggest group of white pixels close to it.
 * Returns its bounding box, whose center is the actual icon center (glyphs are centered in their icon).
 */
function findGlyph(img: RGBAImage, cx: number, cy: number): number[] | null {
	const half = CELL_SIZE * 0.6;
	const x0 = Math.max(0, Math.round(cx - half));
	const y0 = Math.max(0, Math.round(cy - half));
	const x1 = Math.min(img.width - 1, Math.round(cx + half));
	const y1 = Math.min(img.height - 1, Math.round(cy + half));
	const w = x1 - x0 + 1;
	const h = y1 - y0 + 1;

	// Threshold relative to the brightest pixels in the window, so it works with different exposures
	const values = new Float32Array(w * h);
	const sats = new Float32Array(w * h);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const [, s, v] = hsv(img.data, ((y + y0) * img.width + x + x0) * 4);
			values[y * w + x] = v;
			sats[y * w + x] = s;
		}
	}
	const bright = Float32Array.from(values).sort()[Math.floor(values.length * 0.97)];
	const white = new Uint8Array(w * h);
	for (let i = 0; i < w * h; i++) {
		white[i] = values[i] > bright * 0.8 && sats[i] < 0.2 ? 1 : 0;
	}

	// Connected components (4-neighbourhood)
	const visited = new Uint8Array(w * h);
	const stack: number[] = [];
	let best: { score: number; bbox: number[] } | null = null;
	for (let start = 0; start < w * h; start++) {
		if (!white[start] || visited[start]) continue;
		visited[start] = 1;
		stack.push(start);
		let count = 0;
		let sx = 0;
		let sy = 0;
		const bbox = [w, h, -1, -1];
		while (stack.length) {
			const p = stack.pop()!;
			const px = p % w;
			const py = (p - px) / w;
			count++;
			sx += px;
			sy += py;
			bbox[0] = Math.min(bbox[0], px);
			bbox[1] = Math.min(bbox[1], py);
			bbox[2] = Math.max(bbox[2], px);
			bbox[3] = Math.max(bbox[3], py);
			const neighbours = [px > 0 ? p - 1 : -1, px < w - 1 ? p + 1 : -1, py > 0 ? p - w : -1, py < h - 1 ? p + w : -1];
			for (const n of neighbours) {
				if (n >= 0 && white[n] && !visited[n]) {
					visited[n] = 1;
					stack.push(n);
				}
			}
		}
		const dist2 = (sx / count + x0 - cx) ** 2 + (sy / count + y0 - cy) ** 2;
		const score = count / (1 + dist2 / (CELL_SIZE * 0.25) ** 2);
		if (!best || score > best.score) best = { score, bbox };
	}
	if (!best) return null;
	const [bx0, by0, bx1, by1] = best.bbox;
	return [x0 + bx0, y0 + by0, x0 + bx1, y0 + by1];
}

/** Normalized cross-correlation (-1 to 1) of a glyph template placed at (cx, cy) */
function correlate(
	lum: Float32Array,
	width: number,
	height: number,
	cx: number,
	cy: number,
	scale: number,
	t: GlyphTemplate
): number {
	const n = t.values.length;
	let sum = 0;
	let sum2 = 0;
	let cross = 0;
	for (let k = 0; k < n; k++) {
		const x = Math.min(width - 1, Math.max(0, Math.round(cx + t.dx[k] * scale)));
		const y = Math.min(height - 1, Math.max(0, Math.round(cy + t.dy[k] * scale)));
		const v = lum[y * width + x];
		sum += v;
		sum2 += v * v;
		cross += v * t.values[k];
	}
	const norm = Math.sqrt(sum2 - (sum * sum) / n);
	return norm < 1e-6 ? -1 : (cross - t.mean * sum) / (norm * t.norm);
}

/**
 * Best correlation of a glyph template around the starting points, trying shifts (coarse to fine) and scales,
 * to tolerate misalignments and glyphs only partially found
 */
function matchGlyph(
	lum: Float32Array,
	width: number,
	height: number,
	starts: [number, number][],
	t: GlyphTemplate
): number {
	let best = -1;
	for (const scale of GLYPH_SCALES) {
		let bestPos = starts[0];
		let bestScale = -1;
		for (const [cx, cy] of starts) {
			for (let sy = -GLYPH_SHIFT; sy <= GLYPH_SHIFT; sy += 2) {
				for (let sx = -GLYPH_SHIFT; sx <= GLYPH_SHIFT; sx += 2) {
					const score = correlate(lum, width, height, cx + sx, cy + sy, scale, t);
					if (score > bestScale) [bestScale, bestPos] = [score, [cx + sx, cy + sy]];
				}
			}
		}
		const [bx, by] = bestPos;
		for (let sy = -1; sy <= 1; sy++) {
			for (let sx = -1; sx <= 1; sx++) {
				bestScale = Math.max(bestScale, correlate(lum, width, height, bx + sx, by + sy, scale, t));
			}
		}
		best = Math.max(best, bestScale);
	}
	return best;
}

/**
 * Builds the references from the same images used to draw the passwords
 * @param shapes shape images (fire.png, heart.png...) keyed by shape letter (f, h, w, e, s)
 * @param glyphs glyph images (1.png, p.png...) keyed by glyph character
 */
export function buildReferences(shapes: Record<string, RGBAImage>, glyphs: Record<string, RGBAImage>): References {
	return {
		shapes: SHAPES.map((shape) => {
			const img = shapes[shape];
			return { shape, hist: hueHistogram(img, img.width / 2, img.height / 2, img.width * SHAPE_RADIUS) };
		}),
		glyphs: GLYPHS.map((glyph) => {
			const img = glyphs[glyph];
			const lum = luminance(img);
			// Center on the white fill, same as the bounding box found by findGlyph
			let [x0, y0, x1, y1] = [img.width, img.height, -1, -1];
			for (let y = 0; y < img.height; y++) {
				for (let x = 0; x < img.width; x++) {
					if (img.data[(y * img.width + x) * 4 + 3] > 128 && lum[y * img.width + x] > 0.5) {
						[x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
					}
				}
			}
			const scale = GLYPH_SIZE / img.width;
			const dx: number[] = [];
			const dy: number[] = [];
			const values: number[] = [];
			for (let y = 0; y < img.height; y++) {
				for (let x = 0; x < img.width; x++) {
					if (img.data[(y * img.width + x) * 4 + 3] <= 128) continue;
					dx.push((x - (x0 + x1) / 2) * scale);
					dy.push((y - (y0 + y1) / 2) * scale);
					values.push(lum[y * img.width + x]);
				}
			}
			const mean = values.reduce((a, b) => a + b, 0) / values.length;
			const norm = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0));
			return {
				glyph,
				dx: Float32Array.from(dx),
				dy: Float32Array.from(dy),
				values: Float32Array.from(values),
				mean,
				norm,
			};
		}),
	};
}

/** Best symbol for one cell, or null if there is no glyph */
function readCell(img: RGBAImage, lum: Float32Array, refs: References, i: number, cardColor: RGB): string | null {
	const [x, y] = cellOrigin(i);
	const bbox = findGlyph(img, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
	if (!bbox) return null;
	const cx = (bbox[0] + bbox[2]) / 2;
	const cy = (bbox[1] + bbox[3]) / 2;

	// The white fill can be split in pieces in blurry pictures, so also try from the expected center
	const starts: [number, number][] = [
		[cx, cy],
		[x + CELL_SIZE / 2, y + CELL_SIZE / 2],
	];
	const glyphScores = refs.glyphs.map((t) => ({
		glyph: t.glyph,
		score: matchGlyph(lum, img.width, img.height, starts, t),
	}));

	// The cell square color, from just inside its border
	const ring: [number, number][] = [];
	for (let k = 4; k < CELL_SIZE - 4; k++) {
		ring.push([Math.round(x + k), Math.round(y + 4)], [Math.round(x + k), Math.round(y + CELL_SIZE - 5)]);
		ring.push([Math.round(x + 4), Math.round(y + k)], [Math.round(x + CELL_SIZE - 5), Math.round(y + k)]);
	}
	const cellColor = medianColor(img, ring);
	// Ignore the glyph and its outline
	const pad = 3;
	const exclude = [bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, bbox[3] + pad];
	const hist = hueHistogram(img, cx, cy, CELL_SIZE * SHAPE_RADIUS, exclude, [cardColor, cellColor]);
	const shapeScores = refs.shapes.map((ref) => ({ shape: ref.shape, score: histSimilarity(hist, ref.hist) }));

	let best: { symbol: string; score: number } | null = null;
	for (const g of glyphScores) {
		for (const s of shapeScores) {
			const symbol = g.glyph + s.shape;
			if (symbol === 'xs') continue; // Never used in passwords
			if (!best || g.score + s.score > best.score) best = { symbol, score: g.score + s.score };
		}
	}
	return best!.symbol;
}

function isValid(password: string): boolean {
	try {
		const data = deserialize(password);
		return data.inclChecksum === data.calcChecksum;
	} catch {
		return false;
	}
}

/** Scans the 30 cells of a card image (CARD_WIDTH x CARD_HEIGHT) */
export function scanPassword(image: RGBAImage, refs: References): ScanResult {
	const img = whiteBalance(image);
	const lum = luminance(img);
	const cardPixels: [number, number][] = [];
	for (let y = 0; y < img.height; y += 4) for (let x = 0; x < img.width; x += 4) cardPixels.push([x, y]);
	const cardColor = medianColor(img, cardPixels);

	const symbols = Array.from({ length: 30 }, (_, i) => readCell(img, lum, refs, i, cardColor));
	const password = symbols.map((s) => s ?? '').join('');
	return { password, valid: symbols.every(Boolean) && isValid(password) };
}
