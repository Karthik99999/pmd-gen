<script lang="ts">
	import { base } from '$app/paths';
	import { RT } from '$lib/generators';

	let password: string;
	$: {
		const splitPassword = password?.match(/.{1,4}/g);
		if (splitPassword) {
			password = `${splitPassword.slice(0, 3).join(' ')}\n${splitPassword.slice(3).join(' ')}`;
		}
	}

	function generate(e: Event) {
		e.preventDefault();
		const missionType = parseInt((document.getElementById('missionType') as HTMLSelectElement).value);
		const client = parseInt((document.getElementById('client') as HTMLSelectElement).value);
		const target = parseInt((document.getElementById('target') as HTMLSelectElement).value);
		const dungeon = parseInt((document.getElementById('dungeon') as HTMLSelectElement).value);
		const floor = parseInt((document.getElementById('floor') as HTMLInputElement).value);
		const itemToFindOrDeliver = parseInt((document.getElementById('itemToFindOrDeliver') as HTMLSelectElement).value);
		const itemReward = parseInt((document.getElementById('itemReward') as HTMLSelectElement).value);
		const moneyReward = (document.getElementById('moneyReward') as HTMLInputElement).checked;
		const friendAreaReward = parseInt((document.getElementById('friendAreaReward') as HTMLSelectElement).value);
		try {
			password = RT.generateWonderMail(missionType, client, target, dungeon, floor, itemToFindOrDeliver, itemReward, moneyReward, friendAreaReward);
		} catch (e) {
			alert(e);
		}
	}

	function changeMissionType() {
		const missionType = parseInt((document.getElementById('missionType') as HTMLSelectElement).value);
		const target = document.getElementById('target') as HTMLSelectElement;
		const itemToFindOrDeliver = document.getElementById('itemToFindOrDeliver') as HTMLSelectElement;
		if (missionType === 1 || missionType === 2) {
			target.value = '1';
			target.required = true;
			target.closest('div')!.hidden = false;
		} else {
			target.value = '';
			target.required = false;
			target.closest('div')!.hidden = true;
		}
		if (missionType === 3 || missionType === 4) {
			itemToFindOrDeliver.required = true;
			itemToFindOrDeliver.closest('div')!.hidden = false;
			updateDungeonItems();
		} else {
			itemToFindOrDeliver.value = '';
			itemToFindOrDeliver.required = false;
			itemToFindOrDeliver.closest('div')!.hidden = true;
		}
	}

	function changeDungeon() {
		const dungeonIndex = parseInt((document.getElementById('dungeon') as HTMLSelectElement).value);
		const floor = document.getElementById('floor') as HTMLInputElement;

		const dungeon = RT.data.dungeons.get(dungeonIndex);
		floor.max = dungeon.floors.toString();
		floor.placeholder = `1-${dungeon.floors}`;

		updateDungeonItems();
	}

	function updateDungeonItems() {
		const missionType = parseInt((document.getElementById('missionType') as HTMLSelectElement).value);
		const dungeonIndex = parseInt((document.getElementById('dungeon') as HTMLSelectElement).value);
		const itemToFindOrDeliver = document.getElementById('itemToFindOrDeliver') as HTMLSelectElement;

		const dungeon = RT.data.dungeons.get(dungeonIndex);
		itemToFindOrDeliver.innerHTML = '';
		if (missionType === 3) {
			for (const item of dungeon.items.map((i) => RT.data.items.get(i))) {
				if (item.valid) {
					const option = document.createElement('option');
					option.value = item.index.toString();
					option.textContent = item.name;
					itemToFindOrDeliver.add(option);
				}
			}
		} else if (missionType === 4) {
			for (const item of RT.data.items.all()) {
				if (item.valid) {
					const option = document.createElement('option');
					option.value = item.index.toString();
					option.textContent = item.name;
					itemToFindOrDeliver.add(option);
				}
			}
		}
	}
</script>

<svelte:head>
	<title>PMD Gen | Rescue Team Wonder Mail Generator</title>
</svelte:head>

<center>
	<a class="btn btn-link" href={base}>Go back</a>
</center>

<h4>Rescue Team Wonder Mail Generator</h4>

<form on:submit={generate}>
	<div class="form-group">
		<label for="missionType">Mission Type:</label>
		<select class="form-control" id="missionType" on:change={changeMissionType} required>
			{#each RT.data.missionTypes as type, i}
				<option value={i}>{type}</option>
			{/each}
		</select>
	</div>
	<div class="form-group">
		<label for="client">Client:</label>
		<select class="form-control" id="client" required>
			{#each RT.data.pokemon.all() as pokemon}
				{#if pokemon.valid}
					<option value={pokemon.index}>{pokemon.name}</option>
				{/if}
			{/each}
		</select>
	</div>
	<div class="form-group" hidden>
		<label for="target">Other Pokémon:</label>
		<select class="form-control" id="target">
			{#each RT.data.pokemon.all() as pokemon}
				{#if pokemon.valid}
					<option value={pokemon.index}>{pokemon.name}</option>
				{/if}
			{/each}
		</select>
	</div>
	<div class="form-group">
		<label for="dungeon">Dungeon:</label>
		<select class="form-control" id="dungeon" on:change={changeDungeon} required>
			{#each RT.data.dungeons.all() as dungeon}
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
	<div class="form-group" hidden>
		<label for="itemToFindOrDeliver">Item to find/deliver:</label>
		<select class="form-control" id="itemToFindOrDeliver">
			<option value="55">Oran Berry</option>
			<option value="66">Pecha Berry</option>
		</select>
	</div>
	<div class="form-group">
		<label for="itemReward">Item reward:</label>
		<input type="checkbox" id="moneyReward" checked />
		<label for="moneyReward">(+ Money)</label>
		<select class="form-control" id="itemReward">
			<option selected value></option>
			{#each RT.data.items.all() as item}
				{#if item.valid}
					<option value={item.index}>{item.name}</option>
				{/if}
			{/each}
		</select>
	</div>
	<div class="form-group">
		<label for="friendAreaReward">Friend Area reward:</label>
		<select class="form-control" id="friendAreaReward">
			<option selected value></option>
			<option value="10">Mt. Moonview</option>
			<option value="14">Sky Blue Plains</option>
			<option value="35">Dragon Cave</option>
			<option value="36">Boulder Cave</option>
		</select>
	</div>
	<button type="submit" class="btn btn-primary">Generate</button>
</form>
<br />
<textarea class="form-control" id="password" rows="3" readonly>{password || ''}</textarea>

<style>
	textarea {
		resize: none;
		font-family: monospace;
	}
</style>
