<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let { password, type }: {
		password: string;
		type: 'revival' | 'rescue';
	} = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let copyButton: any;
	let copyButtonTimeout: number;
	onMount(() => {
		ctx = canvas.getContext('2d')!;
		// @ts-ignore
		copyButton = window.$('#copy-button');
		copyButton.tooltip();
	});

	function loadImage(name: string) {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = `${base}/rtdx-password/${name}.png`;
		});
	}

	async function drawCharacter(char: string, x: number, y: number) {
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
	}

	$effect(() => {
		if (ctx && password) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			const characters = password.toLowerCase().match(/.{1,2}/g)!;
			for (let i = 0; i < 30; i++) {
				const pos = i % 15;
				const x = 71 + pos * 54 + Math.floor(pos / 5) * 8.5;
				const y = 71 + (i >= 15 ? 69 : 0) + (pos >= 5 && pos <= 9 ? 8.5 : 0);
				drawCharacter(characters[i], x, y);
			}
		}
	});

	async function copyPassword() {
		await navigator.clipboard.writeText(password);
		copyButton.tooltip('show');
		clearTimeout(copyButtonTimeout);
		copyButtonTimeout = setTimeout(() => copyButton.tooltip('hide'), 1500);
	}
</script>

<div class="text-center">
	<canvas style="background: url('{base}/rtdx-password/{type}.png') 100% 100% / 100% no-repeat;" bind:this={canvas} id="password" width="967" height="254"></canvas>
	<button id="copy-button" class="btn btn-secondary" data-toggle="tooltip" data-trigger="manual" title="Copied!" onclick={copyPassword} disabled={!password}>Copy Password Text</button>
</div>

<style>
	canvas {
		width: 100%;
		height: 100%;
		padding-top: 2%;
	}
</style>
