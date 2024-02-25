<script lang="ts">
	import { base } from '$app/paths';
	import { RTDX } from '$lib/generators';
	import PasswordImage from '../PasswordImage.svelte';

	let rescuePassword = '';
	let team = 'pmd-gen';
	let revivalPassword: string;

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

<center>
	<a class="btn btn-link" href={base}>Go back</a>
</center>

<h4>Rescue Team DX Revival Password Generator</h4>

<p>The password should be entered with two charcters per symbol. The first character being the number/letter on top, and the second being the first letter of the shape.</p>
<p>F = Fire</p>
<p>H = Heart</p>
<p>W = Water</p>
<p>E = Emerald</p>
<p>S = Star</p>
<p>For example: "1f xh pw 4e 8s"</p>
<div class="form-group">
	<label for="password">Rescue password:</label>
	<textarea class="form-control" id="password" bind:value={rescuePassword} />
</div>
<div class="form-group">
	<label for="team">Team name (that will "rescue" you):</label>
	<input type="text" class="form-control" id="team" maxlength="12" placeholder="Poképals" bind:value={team} />
</div>
<button class="btn btn-primary" on:click={generate}>Generate</button>
<PasswordImage password={revivalPassword} type="revival" />
