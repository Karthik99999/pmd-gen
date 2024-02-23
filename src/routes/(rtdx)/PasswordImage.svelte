<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let mounted = false;
	onMount(() => (mounted = true));

	export let password: string;
	export let type: string;
	let canvas: HTMLCanvasElement;

	const loadImage = (name: string) => {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = `${base}/rtdx-password/${name}.png`;
		});
	};

	const drawPassword = async () => {
		const ctx = canvas.getContext('2d')!;

		const background = await loadImage(type);
		ctx.drawImage(background, 0, 0, 967, 254);

		const drawCharacter = async (char: string, x: number, y: number) => {
			const symbols: { [k: string]: string } = {
				f: 'fire',
				h: 'heart',
				w: 'water',
				e: 'emerald',
				s: 'star',
			};
			const symbol = await loadImage(symbols[char.charAt(1)]);
			ctx.drawImage(symbol, x, y, 53, 53);

			const character = await loadImage(char.charAt(0));
			let extraXOffset = 0;
			switch (char.charAt(0)) {
				case 'm':
					extraXOffset = 0.9;
					break;
				case 'x':
					extraXOffset = 0.4;
					break;
			}
			ctx.drawImage(character, x + 13 + extraXOffset, y + 14, 25, 25);
		};

		const characters = password.toLowerCase().match(/.{1,2}/g)!;
		for (let i = 0; i < 30; i++) {
			const pos = i % 15;
			const x = 71 + pos * 54 + Math.floor(pos / 5) * 8.5;
			const y = 71 + (i >= 15 ? 69 : 0) + (pos >= 5 && pos <= 9 ? 8.5 : 0);
			drawCharacter(characters[i], x, y);
		}
	};

	$: if (password && mounted) drawPassword();
</script>

<canvas bind:this={canvas} id="password" width="967" height="254" />

<style>
	canvas {
		width: 100%;
		height: 100%;
		text-align: center;
		padding-top: 2%;
	}
</style>
