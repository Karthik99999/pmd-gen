import { BitstreamReader, BitstreamWriter } from '../bitstream';
import { symbols, checksum, RNG } from './utils';
import { read } from './read';
import { Data } from './data';

/**
 * Dhuffles the password symbols
 */
function shuffle(code: string[]): string[] {
	const unshuffledIndex = [
		3, 27, 13, 21, 12, 9, 7, 4, 6, 17, 19, 16, 28, 29, 23, 20, 11, 0, 1, 22, 24, 14, 8, 2, 15, 25, 10, 5, 18, 26,
	];
	const shuffled: string[] = [];
	for (let i = 0; i < 30; i++) {
		shuffled[unshuffledIndex[i]] = code[i];
	}
	return shuffled;
}

/**
 * Converts indexes to symbols
 */
function toSymbols(indexes: number[]): string[] {
	const code: string[] = [];
	for (const i of indexes) {
		code.push(symbols[i]);
	}
	return code;
}

/**
 * Unpacks the code
 */
function unpack(bitstream: number[]): number[] {
	const unpacked: number[] = [];
	const reader = new BitstreamReader(bitstream, 8);
	while (reader.remaining()) {
		unpacked.push(reader.read(6));
	}
	return unpacked;
}

/**
 * Encrypt the code using rng
 */
function encrypt(code: number[]): number[] {
	const newcode = code.slice(0, 2);
	const seed = code[0] | (code[1] << 8);
	const rng = new RNG(seed);
	for (const c of code.slice(2)) {
		const rand = rng.next();
		newcode.push((c + rand) & 0xff);
	}
	const remain = 8 - ((code.length * 8) % 6);
	newcode[newcode.length - 1] &= (1 << remain) - 1;
	return newcode;
}

/**
 * Data needed to generate a password
 */
interface PasswordData {
	timestamp: number;
	team: number[];
	dungeon: number;
	floor: number;
	pokemon: number;
	/**
	 * 0 = Male,
	 * 1 = Female,
	 * 2 = Genderless
	 */
	gender: 0 | 1 | 2;
	/**
	 * 1 = Regular,
	 * 2 = Special,
	 * 3 = Deluxe
	 */
	reward: 1 | 2 | 3;
	revive: number;
}

type RescueData = Omit<PasswordData, 'revive'> & { type: 0 };
type RevivalData = Omit<PasswordData, 'dungeon' | 'floor' | 'pokemon' | 'gender' | 'reward'> & { type: 1 };

function serialize(data: RescueData | RevivalData): string {
	const writer = new BitstreamWriter(8);
	writer.write(data.timestamp, 32);
	writer.write(data.type, 1);
	writer.write(0, 1); // Unknown, Can be either 0 or 1
	for (let i = 0; i < 12; i++) {
		if (i < data.team.length) {
			writer.write(data.team[i], 9);
		} else {
			writer.write(0, 9);
		}
	}
	if (data.type === 0) {
		writer.write(data.dungeon, 7);
		writer.write(data.floor, 7);
		writer.write(data.pokemon, 11);
		writer.write(data.gender, 2);
		writer.write(data.reward, 2);
		writer.write(0, 1); // Unknown, Can be either 0 or 1
	} else {
		writer.write(data.revive, 30);
	}

	const indexes = writer.finish();
	indexes.unshift(checksum(indexes));
	const encrypted = encrypt(indexes);
	const bitstream = unpack(encrypted);
	const symbols = toSymbols(bitstream);
	const code = shuffle(symbols);
	return code.join('');
}

/**
 * Generates a rescue password. The timestamp, gender of the pokemon being rescued, and the reward type
 * are all hardcoded, since you rarely would want to change them.
 */
export function generateRescue(
	dungeonNameOrIndex: string | number,
	floor: number,
	teamName = 'pmd-gen',
	pokemonNameOrIndex: string | number = 1
): string {
	if (teamName.length < 1 || teamName.length > 12) throw new Error('Team name must be between 1 and 12 characters');
	const team: number[] = [];
	for (const char of teamName) {
		const index = Data.charmap_text.indexOf(char);
		if (index < 0) {
			throw new Error(`Invalid character in team name: ${char}`);
		}
		team.push(index);
	}
	const dungeon = Data.dungeons.get(dungeonNameOrIndex);
	if (!dungeon) {
		throw new Error('Invalid dungeon');
	}
	if (floor < 1 || floor > dungeon.floors) {
		throw new Error('Invalid floor');
	}

	const pokemon = Data.pokemon.get(pokemonNameOrIndex);
	// It's probably best to let the user know the Pokemon name they sent was invalid, rather than going to the default
	if (!pokemon.valid) {
		throw new Error('Invalid Pokemon');
	}

	const data: RescueData = {
		timestamp: Math.round(Date.now() / 1000),
		type: 0,
		team,
		dungeon: dungeon.index,
		floor,
		pokemon: pokemon.index,
		gender: 0,
		reward: 3,
	};
	return serialize(data);
}

/**
 * Generates a revival password from a given rescue password.
 * @param password The rescue password to make a revival password for
 * @param teamName Defaults to "pmd-gen"
 */
export function generateRevival(password: string, teamName = 'pmd-gen'): string {
	const passwordData = read(password);
	if (!passwordData.valid) throw new Error('The provided rescue password was invalid');

	if (teamName.length < 1 || teamName.length > 12) throw new Error('Team name must be between 1 and 12 characters');
	const team: number[] = [];
	for (const char of teamName) {
		const index = Data.charmap_text.indexOf(char);
		if (index < 0) {
			throw new Error(`Invalid character in team name: ${char}`);
		}
		team.push(index);
	}

	const data: RevivalData = {
		timestamp: Math.round(Date.now() / 1000),
		type: 1,
		team,
		revive: passwordData.revive,
	};
	return serialize(data);
}
