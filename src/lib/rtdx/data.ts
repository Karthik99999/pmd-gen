/**
 * Handles accessing of Pokemon/Dungeon data from the ROM data.
 */

import RomData from './romdata';

interface PokemonData {
	const: string;
	name: string;
	index: number;
	valid: boolean;
}

interface DungeonData {
	name: string;
	index: number;
	floors: number;
	ascending: boolean;
	valid: boolean;
}

/**
 * Transforms string into only numbers and lowercase letters
 */
function toID(str?: string): string {
	if (!str) return '';
	return str.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export const Data = {
	pokemon: {
		all: function () {
			const pokemonList: PokemonData[] = [];
			for (const [i, pokemon] of RomData.pokemon.entries()) {
				let pokemonName = pokemon.name;
				if (pokemonName === 'Unown') {
					pokemonName += ` (${pokemon.const.slice(7).replace('EXC', '!').replace('QUE', '?')})`;
				} else if (pokemonName === 'Deoxys') {
					switch (pokemon.const.slice(-1)) {
						case 'A':
							pokemonName += ' (Attack)';
							break;
						case 'D':
							pokemonName += ' (Defense)';
							break;
						case 'S':
							pokemonName += ' (Speed)';
							break;
						default:
							pokemonName += ' (Normal)';
					}
				} else if (pokemon.const.includes('YOBI')) {
					pokemonName += ' (Shiny)';
				}

				pokemonList.push({
					const: pokemon.const,
					name: pokemonName,
					index: i,
					valid: pokemon.valid,
				});
			}
			return pokemonList;
		},
		get: function (indexOrName: number | string) {
			let pokemon: PokemonData | undefined;
			if (typeof indexOrName === 'number') {
				pokemon = this.all().find((p) => p.valid && p.index === indexOrName);
			} else {
				pokemon = this.all().find((p) => p.valid && toID(p.name) === toID(indexOrName));
			}
			if (!pokemon) {
				pokemon = {
					const: '',
					name: '',
					index: 0,
					valid: false,
				};
			}
			return pokemon;
		},
	},

	dungeons: {
		all: function () {
			const dungeons: DungeonData[] = [];
			for (const [i, dungeon] of RomData.dungeons.entries()) {
				const index = parseInt(dungeon.const.slice(1));
				dungeons.push({
					name: dungeon.name,
					index,
					floors: dungeon.floors,
					ascending: dungeon.ascending,
					valid: dungeon.valid && index <= 45,
				});
			}
			return dungeons;
		},
		get: function (indexOrName: number | string) {
			let dungeon: DungeonData | undefined;
			if (typeof indexOrName === 'number') {
				dungeon = this.all().find((d) => d.valid && d.index === indexOrName);
			} else {
				dungeon = this.all().find((d) => d.valid && toID(d.name) === toID(indexOrName));
			}
			if (!dungeon) {
				dungeon = {
					name: '',
					index: 0,
					floors: 0,
					ascending: false,
					valid: false,
				};
			}
			return dungeon;
		},
	},

	charmap: RomData.charmap,
	charmap_text: RomData.charmap_text,
	crc32table: RomData.crc32table,
};