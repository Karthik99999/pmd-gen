<script lang="ts">
	import { base } from '$app/paths';
	import { RTDX } from '$lib';
	import PasswordImage from '../PasswordImage.svelte';

	let password: string;

	function generate(e: Event) {
		e.preventDefault();
		const team = (document.getElementById('team') as HTMLInputElement).value;
		const dungeon = parseInt((document.getElementById('dungeon') as HTMLSelectElement).value);
		const floor = parseInt((document.getElementById('floor') as HTMLInputElement).value);
		const pokemon = parseInt((document.getElementById('pokemon') as HTMLSelectElement).value);
		try {
			password = RTDX.generateRescue(dungeon, floor, team, pokemon);
		} catch {
			alert('There was an issue generating the password. Check your input for errors.');
		}
	}

	function changeMaxFloors(e: Event) {
		const dungeon = parseInt((document.getElementById('dungeon') as HTMLSelectElement).value);
		const maxFloors = RTDX.Data.dungeons.get(dungeon).floors;
		const floor = document.getElementById('floor') as HTMLInputElement;
		floor.max = maxFloors.toString();
		floor.placeholder = `1-${maxFloors}`;
	}
</script>

<center>
	<a class="btn btn-link" href={base}>Go back</a>
</center>

<form on:submit={generate}>
	<div class="form-group">
		<label for="team">Team name:</label>
		<input type="text" class="form-control" id="team" maxlength="12" placeholder="Poképals" value="pmd-gen" required />
	</div>
	<div class="form-group">
		<label for="dungeon">Dungeon:</label>
		<select class="form-control" id="dungeon" on:change={changeMaxFloors} required>
			{#each RTDX.Data.dungeons.all() as dungeon}
				{#if dungeon.valid}
					<option value={dungeon.index}>{dungeon.name}</option>
				{/if}
			{/each}
		</select>
	</div>
	<div class="form-group">
		<label for="floor">Floor:</label>
		<input type="number" class="form-control" id="floor" min="1" max="3" placeholder="1-3" required />
	</div>
	<div class="form-group">
		<label for="pokemon">Pokémon:</label>
		<select class="form-control" id="pokemon" required>
			{#each RTDX.Data.pokemon.all() as pokemon}
				{#if pokemon.valid}
					<option value={pokemon.index}>{pokemon.name}</option>
				{/if}
			{/each}
		</select>
	</div>
	<button type="submit" class="btn btn-primary">Generate</button>
</form>
{#key password}
	{#if password}
		<br />
		<center>
			<PasswordImage {password} type="rescue" />
		</center>
	{/if}
{/key}
