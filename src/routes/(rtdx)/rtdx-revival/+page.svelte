<script lang="ts">
	import { base } from '$app/paths';
	import { RTDX } from '$lib';
	import PasswordImage from '../PasswordImage.svelte';

	let password: string;

	function generate(e: Event) {
		e.preventDefault();
		const pswd = (document.getElementById('password') as HTMLInputElement).value;
		const team = (document.getElementById('team') as HTMLInputElement).value;
		try {
			password = RTDX.generateRevival(pswd, team);
		} catch {
			alert('Invalid rescue password. Check your input for errors.');
		}
	}
</script>

<center>
	<a class="btn btn-link" href={base}>Go back</a>
</center>

<p>The password should be entered with two charcters per symbol. The first character being the number/letter on top, and the second being the first letter of the shape.</p>
<p>F = Fire</p>
<p>H = Heart</p>
<p>W = Water</p>
<p>E = Emerald</p>
<p>S = Star</p>
<p>For example: "1f xh pw 4e 8s"</p>
<form on:submit={generate}>
	<div class="form-group">
		<label for="password">Rescue password:</label>
		<textarea class="form-control" id="password" required></textarea>
	</div>
	<div class="form-group">
		<label for="team">Team name (that will "rescue" you):</label>
		<input type="text" class="form-control" id="team" maxlength="12" placeholder="Poképals" value="pmd-gen" required />
	</div>
	<button type="submit" class="btn btn-primary">Generate</button>
</form>
{#if password}
	<PasswordImage {password} type="revival" />
{/if}
