import RomData from './romdata';

interface PokemonData {
	name: string;
	index: number;
	valid: boolean;
}

interface DungeonData {
	name: string;
	index: number;
	floors: number;
	items: number[];
	difficulties: number[];
	valid: boolean;
}

interface ItemData {
	name: string;
	index: number;
	valid: boolean;
}

/**
 * Transforms string into only numbers and lowercase letters
 */
function toID(str?: string): string {
	if (!str) return '';
	return str.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const Data = {
	pokemon: {
		all(validOnly = false): PokemonData[] {
			return RomData.pokemon.map((p, index) => ({ ...p, index })).filter((p) => !validOnly || p.valid);
		},
		get(indexOrName: number | string) {
			let pokemon: PokemonData | undefined;
			if (typeof indexOrName === 'number') {
				const data = this.all()[indexOrName];
				if (data) {
					pokemon = {
						name: data.name,
						index: indexOrName,
						valid: data.valid,
					};
				}
			} else {
				const index = this.all().findIndex((p) => toID(p.name) === toID(indexOrName));
				if (index >= 0) {
					const data = this.all()[index];
					pokemon = {
						name: data.name,
						index,
						valid: data.valid,
					};
				}
			}
			if (!pokemon) {
				pokemon = {
					name: '',
					index: -1,
					valid: false,
				};
			}
			return pokemon;
		},
	},
	dungeons: {
		all(validOnly = false): DungeonData[] {
			return RomData.dungeons.map((d, index) => ({ ...d, index })).filter((d) => !validOnly || d.valid);
		},
		get(indexOrName: number | string) {
			let dungeon: DungeonData | undefined;
			if (typeof indexOrName === 'number') {
				const data = this.all()[indexOrName];
				if (data) {
					dungeon = {
						name: data.name,
						index: indexOrName,
						floors: data.floors,
						items: data.items,
						difficulties: data.difficulties,
						valid: data.valid,
					};
				}
			} else {
				const index = this.all().findIndex((d) => toID(d.name) === toID(indexOrName));
				if (index >= 0) {
					const data = this.all()[index];
					dungeon = {
						name: data.name,
						index,
						floors: data.floors,
						items: data.items,
						difficulties: data.difficulties,
						valid: data.valid,
					};
				}
			}
			if (!dungeon) {
				dungeon = {
					name: '',
					index: -1,
					floors: 0,
					items: [],
					difficulties: [],
					valid: false,
				};
			}
			return dungeon;
		},
		getDifficulty(dungeon: DungeonData, floor: number, missionType: number) {
			if (!dungeon.difficulties.length || floor < 1 || floor > dungeon.floors) return 0;
			const baseDifficulty = dungeon.difficulties[floor - 1];
			if (!baseDifficulty) return 0;
			let difficulty = baseDifficulty;
			if (missionType === 2) difficulty += 2;
			difficulty = Math.min(difficulty, 15);
			difficulty = Math.floor(difficulty / 2);
			difficulty = Math.min(difficulty, 6);
			return difficulty;
		},
	},
	items: {
		all(validOnly = false): ItemData[] {
			return RomData.items.map((i, index) => ({ ...i, index })).filter((i) => !validOnly || i.valid);
		},
		get(indexOrName: number | string) {
			let item: ItemData | undefined;
			if (typeof indexOrName === 'number') {
				const data = this.all()[indexOrName];
				if (data) {
					item = {
						name: data.name,
						index: indexOrName,
						valid: data.valid,
					};
				}
			} else {
				const index = this.all().findIndex((i) => toID(i.name) === toID(indexOrName));
				if (index >= 0) {
					const data = this.all()[index];
					item = {
						name: data.name,
						index,
						valid: data.valid,
					};
				}
			}
			if (!item) {
				item = {
					name: '',
					index: -1,
					valid: false,
				};
			}
			return item;
		},
	},
	missionTypes: ['Help me', 'Find someone', 'Escort', 'Find item', 'Deliver item'],
};
export default Data;
