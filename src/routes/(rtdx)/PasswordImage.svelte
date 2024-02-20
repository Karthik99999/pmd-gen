<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	export let password: string;
	export let type: string;
	let canvas: HTMLCanvasElement;

	const loadImage = (src: string) => {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = `${base}/${src}`;
		})
	}

	onMount(async () => {
		const ctx = canvas.getContext('2d')!;

		const background = await loadImage(`/rtdx-password/${type}.png`);
		ctx.drawImage(background, 0, 0, 912, 233);

		const drawCharacter = async (char: string, x: number, y: number) => {
			const symbols: {[k: string]: string} = {
				"f": "fire",
				"h": "heart",
				"w": "water",
				"e": "emerald",
				"s": "star",
			}
			const symbol = await loadImage(`/rtdx-password/${symbols[char.charAt(1)]}.png`);
			ctx.drawImage(symbol, x, y, 40, 40);

			const xc = x + 10;
			const yc = y + 10;
			const character = await loadImage(`/rtdx-password/${char.charAt(0)}.png`);
			ctx.drawImage(character, xc, yc, 20, 20);
		};
		
		const characters = password.match(/.{1,2}/g)!;
		// First row
		drawCharacter(characters[0], 68, 70);
		drawCharacter(characters[1], 118, 70);
		drawCharacter(characters[2], 169, 70);
		drawCharacter(characters[3], 220, 70);
		drawCharacter(characters[4], 270, 70);
		drawCharacter(characters[5], 329, 78);
		drawCharacter(characters[6], 380, 78);
		drawCharacter(characters[7], 430, 78);
		drawCharacter(characters[8], 480, 78);
		drawCharacter(characters[9], 532, 78);
		drawCharacter(characters[10], 590, 70);
		drawCharacter(characters[11], 641, 70);
		drawCharacter(characters[12], 691, 70);
		drawCharacter(characters[13], 742, 70);
		drawCharacter(characters[14], 793, 70);

		// Second row
		drawCharacter(characters[15], 68, 135);
		drawCharacter(characters[16], 118, 135);
		drawCharacter(characters[17], 169, 135);
		drawCharacter(characters[18], 220, 135);
		drawCharacter(characters[19], 270, 135);
		drawCharacter(characters[20], 329, 143);
		drawCharacter(characters[21], 380, 143);
		drawCharacter(characters[22], 430, 143);
		drawCharacter(characters[23], 480, 143);
		drawCharacter(characters[24], 532, 143);
		drawCharacter(characters[25], 590, 135);
		drawCharacter(characters[26], 641, 135);
		drawCharacter(characters[27], 691, 135);
		drawCharacter(characters[28], 742, 135);
		drawCharacter(characters[29], 793, 135);
	});
</script>

<style>
	canvas {
        width: 90%;
        height: 90%;
    }
</style>

<canvas bind:this={canvas} id="password" width="912" height="233" />