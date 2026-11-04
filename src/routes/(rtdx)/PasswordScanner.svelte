<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { base } from '$app/paths';
	import { loadImage } from '$lib/utils';
	import { buildReferences, scanPassword, CARD_HEIGHT, CARD_WIDTH, GLYPHS, type References, type ScanResult } from '$lib/password-scanner';

	interface PasswordScannerProps {
		/** Called with the read password, and whether it passes the checksum */
		onscan: (password: string, valid: boolean) => void;
	}
	let { onscan }: PasswordScannerProps = $props();

	const SHAPE_FILES: Record<string, string> = { f: 'fire', h: 'heart', w: 'water', e: 'emerald', s: 'star' };
	const SCAN_INTERVAL = 250;

	let open = $state(false);
	let error = $state('');
	let video: HTMLVideoElement | undefined = $state();
	let guide: HTMLDivElement | undefined = $state();

	let stream: MediaStream | null = null;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let references: Promise<References> | null = null;
	let ctx: CanvasRenderingContext2D | null = null;
	let lastResult: ScanResult | null = null;

	async function getImageData(path: string): Promise<ImageData> {
		const img = await loadImage(path);
		const canvas = document.createElement('canvas');
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;
		const context = canvas.getContext('2d')!;
		context.drawImage(img, 0, 0);
		return context.getImageData(0, 0, canvas.width, canvas.height);
	}

	async function loadReferences(): Promise<References> {
		const shapes = Object.fromEntries(await Promise.all(Object.entries(SHAPE_FILES).map(async ([shape, file]) => [shape, await getImageData(`/rtdx-password/${file}.png`)])));
		const glyphs = Object.fromEntries(await Promise.all(GLYPHS.map(async (glyph) => [glyph, await getImageData(`/rtdx-password/${glyph}.png`)])));
		return buildReferences(shapes, glyphs);
	}

	async function start() {
		error = '';
		lastResult = null;
		open = true;
		await tick();
		try {
			references ??= loadReferences();
			if (!window.isSecureContext) throw new Error('the camera is only available on secure pages (https:// or localhost)');
			if (!navigator.mediaDevices?.getUserMedia) throw new Error('camera not supported by this browser');
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
				audio: false,
			});
			if (!open) return stop();
			video!.srcObject = stream;
			await video!.play();
			timer = setTimeout(scanLoop, SCAN_INTERVAL);
		} catch (e) {
			error = `Could not open the camera: ${e instanceof Error ? e.message : e}`;
		}
	}

	function stop() {
		clearTimeout(timer);
		stream?.getTracks().forEach((track) => track.stop());
		stream = null;
		open = false;
	}

	/** Draws the part of the video under the guide frame into a CARD_WIDTH x CARD_HEIGHT image */
	function captureCard(): ImageData | null {
		if (!video || !guide || !video.videoWidth) return null;
		if (!ctx) {
			const canvas = document.createElement('canvas');
			canvas.width = CARD_WIDTH;
			canvas.height = CARD_HEIGHT;
			ctx = canvas.getContext('2d', { willReadFrequently: true })!;
		}
		// The video is displayed with object-fit: cover, so it is scaled and centered
		const videoRect = video.getBoundingClientRect();
		const guideRect = guide.getBoundingClientRect();
		const scale = Math.max(videoRect.width / video.videoWidth, videoRect.height / video.videoHeight);
		const offsetX = (videoRect.width - video.videoWidth * scale) / 2;
		const offsetY = (videoRect.height - video.videoHeight * scale) / 2;
		const sx = (guideRect.left - videoRect.left - offsetX) / scale;
		const sy = (guideRect.top - videoRect.top - offsetY) / scale;
		ctx.drawImage(video, sx, sy, guideRect.width / scale, guideRect.height / scale, 0, 0, CARD_WIDTH, CARD_HEIGHT);
		return ctx.getImageData(0, 0, CARD_WIDTH, CARD_HEIGHT);
	}

	async function scanLoop() {
		const card = captureCard();
		if (card) {
			const result = scanPassword(card, await references!);
			if (!open) return;
			// Require two identical valid reads in a row, so a misread that passes the checksum by chance is not accepted
			if (result.valid && lastResult?.valid && result.password === lastResult.password) {
				finish(result);
				return;
			}
			lastResult = result;
		}
		timer = setTimeout(scanLoop, SCAN_INTERVAL);
	}

	/** Uses the current reading even if not valid, so it can be fixed manually */
	async function capture() {
		const card = captureCard();
		if (!card) return;
		finish(scanPassword(card, await references!));
	}

	function finish(result: ScanResult) {
		stop();
		onscan(result.password, result.valid);
	}

	onDestroy(stop);
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && stop()} />

<button class="btn btn-secondary mb-2" onclick={start}>
	<i class="bi bi-camera-fill"></i> Scan with camera
</button>

{#if open}
	<div class="scanner" role="dialog" aria-modal="true" aria-label="Scan password with camera">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video bind:this={video} playsinline muted></video>
		<div class="guide" bind:this={guide}>
			<img src="{base}/rtdx-password/rescue.png" alt="" />
		</div>
		<div class="hint">
			{#if error}
				<span class="text-warning">{error}</span>
			{:else}
				Fit the password card inside the frame, it will be read automatically
			{/if}
		</div>
		<div class="controls">
			<button class="btn btn-light" onclick={stop}>Cancel</button>
			<button class="btn btn-primary" onclick={capture} disabled={!!error}>Capture</button>
		</div>
	</div>
{/if}

<style>
	.scanner {
		position: fixed;
		inset: 0;
		z-index: 2000;
		background: #000;
		overflow: hidden;
	}

	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.guide {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(94vw, 70vh * 967 / 254);
		aspect-ratio: 967 / 254;
		/* Outline instead of border so the box is exactly the card area that gets captured */
		outline: 2px solid rgba(255, 255, 255, 0.85);
		border-radius: 6px;
		/* Darkens everything outside the frame */
		box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.55);
	}

	.guide img {
		width: 100%;
		height: 100%;
		opacity: 0.35;
	}

	.hint {
		position: absolute;
		top: 1rem;
		left: 1rem;
		right: 1rem;
		color: #fff;
		text-align: center;
	}

	.controls {
		position: absolute;
		bottom: 1.5rem;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
</style>
