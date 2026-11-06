<script lang="ts">
	import { RTDX } from '$lib/generators';
	import PasswordImage from '../PasswordImage.svelte';
	import PasswordSymbol from '../PasswordSymbol.svelte';
	import PasswordScanner from '../PasswordScanner.svelte';

	let rescuePassword = $state('');
	let scanWarning = $state('');

	function onscan(password: string, valid: boolean) {
		rescuePassword = password;
		scanWarning = valid ? '' : 'Some symbols could not be read correctly, please compare them with your screen and fix them.';
	}
	let team = $state('pmd-gen');
	let revivalPassword = $state('');

	function generate() {
		try {
			revivalPassword = RTDX.generateRevival(rescuePassword, team);
		} catch (e) {
			alert(e);
		}
	}
</script>

<svelte:head>
	<title>PMD Gen | Rescue Team DX Revival Password Generator</title>
</svelte:head>

<h4>Rescue Team DX Revival Password Generator</h4>

<div class="form-group">
	<div class="text-center">
		<PasswordScanner {onscan}></PasswordScanner>
	</div>
	{#if scanWarning}
		<div class="alert alert-warning">{scanWarning}</div>
	{/if}
	<PasswordImage password={rescuePassword} type="rescue" showCopyButton={false}></PasswordImage>
	{#each ['f', 'h', 'w', 'e', 's'] as symbol}
		<div class="text-center">
			{#each ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'p', 'm', 'd', 'x'] as letter}
				{@const char = letter + symbol}
				{#if char === 'xs'}
					<button class="btn btn-light btn-password" aria-label="delete" onclick={() => (rescuePassword = rescuePassword.slice(0, -2))}>
						<i class="bi bi-backspace-fill" style="font-size: 5vmin;"></i>
					</button>
				{:else}
					<button class="btn btn-light btn-password" aria-label={char} onclick={() => (rescuePassword.length < 60 && (rescuePassword += char))}>
						<PasswordSymbol {char}></PasswordSymbol>
					</button>
				{/if}
			{/each}
		</div>
	{/each}
</div>
<div class="form-group">
	<label for="team">Team name (that will "rescue" you):</label>
	<input type="text" class="form-control" id="team" maxlength="12" placeholder="Poképals" bind:value={team} />
</div>
<button class="btn btn-primary" onclick={generate}>Generate</button>
<PasswordImage password={revivalPassword} type="revival"></PasswordImage>

<style>
	.btn-password {
		padding: 0 0 !important;
		margin: 2px !important;
		width: 8vmin;
		height: 8vmin;
		touch-action: manipulation;
	}
</style>
