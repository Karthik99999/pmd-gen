<script lang="ts">
	import { onMount } from 'svelte';
	import { loadImage } from '$lib/utils';

	interface PasswordSymbolProps {
		char: string;
	}
	let { char }: PasswordSymbolProps = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	onMount(async () => {
		if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', 'p', 'm', 'd', 'x'].includes(char.charAt(0)) || !['f', 'h', 'w', 'e', 's'].includes(char.charAt(1))) return;

		ctx = canvas.getContext('2d')!;

		const symbols: { [k: string]: string } = {
			f: 'fire',
			h: 'heart',
			w: 'water',
			e: 'emerald',
			s: 'star',
		};
		const symbol = await loadImage(`/rtdx-password/${symbols[char.charAt(1)]}.png`);
		ctx.drawImage(symbol, 0, 0, 64, 64);

		const character = await loadImage(`/rtdx-password/${char.charAt(0)}.png`);
		let extraXOffset = 0;
		switch (char.charAt(0)) {
			case 'm':
				extraXOffset = 1.08;
				break;
			case 'x':
				extraXOffset = 0.48;
				break;
		}
		ctx.drawImage(character, 15.6 + extraXOffset, 16.8, 30, 30);
	});
</script>

<canvas bind:this={canvas} width="64" height="64"></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
