import { base } from '$app/paths';

export function loadImage(path: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = `${base}${path}`;
	});
}
