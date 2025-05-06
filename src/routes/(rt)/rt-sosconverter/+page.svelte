<script lang="ts">
	import { base } from '$app/paths';
	import { RT } from '$lib/generators';

	let sosInput = $state('');
	let aokResult = $state('');
	let aokInput = $state('');
	let itemReward = $state(0);
	let thankYouResult = $state('');

	function formatPassword(password: string) {
		if (!password) return '';
		password = password.replace(/\s/g, '');
		const splitPassword = password.matchAll(/(.{1,5})(.{1,8})(.{1,5})/g);
		if (splitPassword) {
			password = '';
			for (const match of splitPassword) {
				password += match.slice(1).join(' ') + '\n';
			}
		}
		return password;
	}

	function convertSOS() {
		try {
			aokResult = formatPassword(RT.convertSOSToAOK(sosInput));
			sosInput = formatPassword(sosInput);
		} catch (e) {
			alert(e);
		}
	}

	function convertAOK() {
		try {
			thankYouResult = formatPassword(RT.convertAOKToThankYou(aokInput, itemReward));
			aokInput = formatPassword(aokInput);
		} catch (e) {
			alert(e);
		}
	}
</script>

<svelte:head>
	<title>PMD Gen | Rescue Team SOS to A-OK Mail Converter</title>
</svelte:head>

<center>
	<a class="text-decoration-none" href="{base}/"><i class="bi bi-house-fill"></i> Home</a>
</center>

<h4>Rescue Team SOS Converter</h4>
<ul>
	<li>For the male sign (♂), you may use "#"</li>
	<li>For the female sign (♀), you may use "%"</li>
	<li>For the ellipsis (…), you may use "."</li>
</ul>

<div class="mb-3">
	<div class="form-group">
		<label for="sos">SOS to A-OK:</label>
		<textarea class="form-control" rows="3" bind:value={sosInput}></textarea>
	</div>
	<button class="btn btn-primary" onclick={convertSOS}>Convert</button>
</div>
<textarea class="form-control" rows="3" readonly bind:value={aokResult}></textarea>

<div class="mt-3 mb-3">
	<div class="form-group">
		<label for="sos">A-OK to Thank-You:</label>
		<textarea class="form-control" rows="3" bind:value={aokInput}></textarea>
	</div>
	<div class="form-group">
		<label for="item-reward">Item reward:</label>
		<select class="form-control" id="item-reward" bind:value={itemReward}>
			<option selected value></option>
			{#each RT.data.items.all(true) as item}
				<option value={item.index}>{item.name}</option>
			{/each}
		</select>
	</div>
	<button class="btn btn-primary" onclick={convertAOK}>Convert</button>
</div>
<textarea class="form-control" rows="3" readonly bind:value={thankYouResult}></textarea>

<style>
	textarea {
		resize: none;
		overflow: hidden;
		font-family: monospace;
	}
</style>
