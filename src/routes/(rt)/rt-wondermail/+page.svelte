<script lang="ts">
	import { base } from '$app/paths';
	import { RT } from '$lib/generators';
	import { createForm } from 'felte';

	let missionType = $state(0);
	let dungeonIndex = $state(0);
	let dungeon = $derived(RT.data.dungeons.get(dungeonIndex));
	let password = $state('');

	function formatPassword(password: string) {
		if (!password) return '';
		password = password.replace(/\s/g, '');
		const splitPassword = password.match(/.{1,4}/g);
		if (splitPassword) {
			password = `${splitPassword.slice(0, 3).join(' ')}\n${splitPassword.slice(3).join(' ')}`;
		}
		return password;
	}

	const { form } = createForm({
		transform: (values: any) => ({
			...values,
			missionType: parseInt(values.missionType),
			clientPokemon: parseInt(values.clientPokemon),
			targetPokemon: parseInt(values.targetPokemon),
			dungeon: parseInt(values.dungeon),
			itemToFindOrDeliver: parseInt(values.itemToFindOrDeliver),
			itemReward: parseInt(values.itemReward),
			friendAreaReward: parseInt(values.friendAreaReward),
		}),
		onSubmit(values) {
			try {
				password = formatPassword(RT.generateWonderMail(values));
			} catch (e) {
				alert(e);
			}
		},
	});
</script>

<svelte:head>
	<title>PMD Gen | Rescue Team Wonder Mail Generator</title>
</svelte:head>

<center>
	<a class="text-decoration-none" href="{base}/"><i class="bi bi-house-fill"></i> Home</a>
</center>

<h4>Rescue Team Wonder Mail Generator</h4>

<form class="mb-3" use:form>
	<div class="form-group">
		<label for="mission-type">Mission Type:</label>
		<select class="form-control" id="mission-type" name="missionType" bind:value={missionType} required>
			{#each RT.data.missionTypes as type, i}
				<option value={i}>{type}</option>
			{/each}
		</select>
	</div>
	<div class="form-group">
		<label for="client">Client:</label>
		<select class="form-control" id="client" name="clientPokemon" required>
			{#each RT.data.pokemon.all(true) as pokemon}
				<option value={pokemon.index}>{pokemon.name}</option>
			{/each}
		</select>
	</div>
	{#if missionType === 1 || missionType === 2}
		<div class="form-group">
			<label for="target">Other Pokémon:</label>
			<select class="form-control" id="target" name="targetPokemon">
				{#each RT.data.pokemon.all(true) as pokemon}
					<option value={pokemon.index}>{pokemon.name}</option>
				{/each}
			</select>
		</div>
	{/if}
	<div class="form-group">
		<label for="dungeon">Dungeon:</label>
		<select class="form-control" id="dungeon" name="dungeon" bind:value={dungeonIndex} required>
			{#each RT.data.dungeons.all(true) as dungeon}
				<option value={dungeon.index}>{dungeon.name}</option>
			{/each}
		</select>
	</div>
	<div class="form-group">
		<label for="floor">Floor:</label>
		<input type="number" class="form-control" id="floor" name="floor" min="1" max={dungeon.floors} placeholder="1-{dungeon.floors}" required />
	</div>
	{#if missionType === 3 || missionType === 4}
		<div class="form-group">
			<label for="item-to-find-or-deliver">Item to find/deliver:</label>
			<select class="form-control" id="item-to-find-or-deliver" name="itemToFindOrDeliver">
				{#if missionType === 3}
					{#each dungeon.items.map((i) => RT.data.items.get(i)) as item (item.index)}
						{#if item.valid}
							<option value={item.index}>{item.name}</option>
						{/if}
					{/each}
				{:else}
					{#each RT.data.items.all(true) as item}
						<option value={item.index}>{item.name}</option>
					{/each}
				{/if}
			</select>
		</div>
	{/if}
	<div class="form-group">
		<label for="item-reward">Item reward:</label>
		<input type="checkbox" id="money-reward" name="moneyReward" checked />
		<label for="money-reward">(+ Money)</label>
		<select class="form-control" id="item-reward" name="itemReward">
			<option selected value></option>
			{#each RT.data.items.all(true) as item}
				<option value={item.index}>{item.name}</option>
			{/each}
		</select>
	</div>
	<div class="form-group">
		<label for="friend-area-reward">Friend Area reward:</label>
		<select class="form-control" id="friend-area-reward" name="friendAreaReward">
			<option selected value></option>
			<option value="10">Mt. Moonview</option>
			<option value="14">Sky Blue Plains</option>
			<option value="35">Dragon Cave</option>
			<option value="36">Boulder Cave</option>
		</select>
	</div>
	<button type="submit" class="btn btn-primary">Generate</button>
</form>
<textarea class="form-control" id="password" rows="2" readonly bind:value={password}></textarea>

<style>
	textarea {
		resize: none;
		overflow: hidden;
		font-family: monospace;
	}
</style>
