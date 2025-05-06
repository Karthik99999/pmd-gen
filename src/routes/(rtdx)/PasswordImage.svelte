<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { loadImage } from '$lib/utils';

	interface PasswordImageProps {
		password: string;
		type: 'revival' | 'rescue';
		showCopyButton?: boolean;
	}
	let { password, type, showCopyButton = true }: PasswordImageProps = $props();
	let previousPassword = '';

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

	async function drawCharacter(char: string, x: number, y: number) {
		ctx.clearRect(x, y, 53, 53);
		if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', 'p', 'm', 'd', 'x'].includes(char.charAt(0)) || !['f', 'h', 'w', 'e', 's'].includes(char.charAt(1))) return;

		const symbols: { [k: string]: string } = {
			f: 'fire',
			h: 'heart',
			w: 'water',
			e: 'emerald',
			s: 'star',
		};
		const symbol = await loadImage(`/rtdx-password/${symbols[char.charAt(1)]}.png`);
		ctx.drawImage(symbol, x, y, 53, 53);

		const character = await loadImage(`/rtdx-password/${char.charAt(0)}.png`);
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
		if (ctx) {
			if (password) {
				const characters = password.toLowerCase().match(/.{1,2}/g) || [];
				const previousCharacters = previousPassword.toLowerCase().match(/.{1,2}/g) || [];
				const changedIndexes = [];
				for (let i = 0; i < 30; i++) {
					if (characters[i] !== previousCharacters[i]) {
						changedIndexes.push(i);
					}
				}
				for (const i of changedIndexes) {
					const pos = i % 15;
					const x = 71 + pos * 54 + Math.floor(pos / 5) * 8.5;
					const y = 71 + (i >= 15 ? 69 : 0) + (pos >= 5 && pos <= 9 ? 8.5 : 0);
					drawCharacter(characters[i] || '', x, y);
				}
			} else {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
			previousPassword = password;
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
	<canvas style="background: url('{base}/rtdx-password/{type}.png') 100% 100% / 100% no-repeat;" bind:this={canvas} width="967" height="254"></canvas>
	{#if showCopyButton}
		<button id="copy-button" class="btn btn-secondary" data-toggle="tooltip" data-trigger="manual" title="Copied!" onclick={copyPassword} disabled={!password}>Copy Password Text</button>
	{/if}
</div>

<style>
	canvas {
		width: 100%;
		height: 100%;
		padding-top: 2%;
	}
</style>
