<script lang="ts">
	import { RTDX } from '$lib/generators';
	import { createForm } from 'felte';
	import PasswordImage from '../PasswordImage.svelte';

	let dungeonIndex = $state(1);
	const dungeon = $derived(RTDX.data.dungeons.get(dungeonIndex));
	let password = $state('');

	const { form } = createForm({
		transform: (values: any) => ({
			...values,
			dungeon: parseInt(values.dungeon),
			pokemon: parseInt(values.pokemon),
			reward: parseInt(values.reward),
		}),
		onSubmit(values) {
			try {
				password = RTDX.generateRescue(values);
			} catch (e) {
				alert(e);
			}
		},
	});
</script>

<svelte:head>
	<title>PMD Gen | Rescue Team DX Friend Rescue Password Generator</title>
</svelte:head>

<h4>Rescue Team DX Friend Rescue Generator</h4>

<form use:form>
	<div class="form-group">
		<label for="team">Team name:</label>
		<input type="text" class="form-control" id="team" name="team" maxlength="12" placeholder="Poképals" value="pmd-gen" required />
	</div>
	<div class="form-group">
		<label for="dungeon">Dungeon:</label>
		<select class="form-control" id="dungeon" name="dungeon" bind:value={dungeonIndex} required>
			{#each RTDX.data.dungeons.all(true) as dungeon}
				<option value={dungeon.index}>{dungeon.name}</option>
			{/each}
		</select>
	</div>
	<div class="form-group">
		<label for="floor">Floor:</label>
		<input type="number" class="form-control" id="floor" name="floor" min="1" max={dungeon.floors} placeholder="1-{dungeon.floors}" required />
	</div>
	<div class="form-group">
		<label for="pokemon">Pokémon:</label>
		<select class="form-control" id="pokemon" name="pokemon" required>
			{#each RTDX.data.pokemon.all(true) as pokemon}
				<option value={pokemon.index}>{pokemon.name}</option>
			{/each}
		</select>
	</div>
	<div class="form-group">
		<label for="reward">Reward:</label>
		<select class="form-control" id="reward" name="reward" required>
			<option value="3">Deluxe</option>
			<option value="2">Special</option>
			<option value="1">Regular</option>
		</select>
	</div>
	<button type="submit" class="btn btn-primary">Generate</button>
</form>
<PasswordImage {password} type="rescue" />
