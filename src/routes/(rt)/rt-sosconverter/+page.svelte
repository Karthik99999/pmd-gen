<script lang="ts">
	import { base } from '$app/paths';
	import { RT } from '$lib/generators';

	let sosInput: string;
	let aokResult: string;
	let aokInput: string;
	let itemReward: number;
	let thankYouResult: string;

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
	<a class="btn btn-link" href={base}>Go back</a>
</center>

<h4>Rescue Team SOS Converter</h4>
<ul>
	<li>For the male sign (♂), you may use "m" or "#"</li>
	<li>For the female sign (♀), you may use "f" or "%"</li>
	<li>For the ellipsis (…), you may use "."</li>
</ul>

<h6>SOS to A-OK</h6>
<textarea class="form-control" rows="3" bind:value={sosInput} />
<button class="btn btn-primary" on:click={convertSOS}>Convert</button>
<textarea class="form-control" rows="3" readonly>{aokResult || ''}</textarea>

<h6>A-OK to Thank-You</h6>
<textarea class="form-control" rows="3" bind:value={aokInput} />
<label for="item-reward">Item reward:</label>
<select class="form-control" id="item-reward" bind:value={itemReward}>
	<option selected value></option>
	{#each RT.data.items.all() as item}
		{#if item.valid}
			<option value={item.index}>{item.name}</option>
		{/if}
	{/each}
</select>
<button class="btn btn-primary" on:click={convertAOK}>Convert</button>
<textarea class="form-control" rows="3" readonly>{thankYouResult || ''}</textarea>

<style>
	textarea {
		resize: none;
		overflow: hidden;
		font-family: monospace;
	}

	button,
	select,
	textarea {
		margin-bottom: 2%;
	}
</style>
