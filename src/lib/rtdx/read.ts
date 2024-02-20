import { BitstreamReader } from '../bitstream';
import { checksum, crc32, RNG, symbols } from './utils';
import { Data } from './data';

/**
 * Splits code string into array
 */
function splitCode(code: string): string[] {
	code = code.replace(' ', '').toLowerCase();
	let codeToSplit = '';
	for (let i = 0; i < code.length; i += 2) {
		codeToSplit += code.slice(i, i+2) + ' ';
	}
	return codeToSplit.trim().split(' ');
}

/** 
 * Unshuffles the password symbols
 */
function unshuffle(code: string[]): string[] {
	const unshuffledIndex = [
        3, 27, 13, 21, 12, 9, 7, 4, 6, 17, 19, 16, 28, 29, 23, 20, 11, 0, 1, 22, 24, 14, 8, 2, 15, 25, 10, 5, 18, 26,
    ];
	const unshuffled: string[] = [];
	for (let i = 0; i < 30; i++) {
		unshuffled[i] = code[unshuffledIndex[i]];
	}
	return unshuffled;
}

/**
 * Converts symbols to indexes 0-63
 */
function toIndexes(code: string[]): number[] {
	const indexes: number[] = [];
	for (let i = 0; i < code.length; i++) {
		for (let j = 0; j < symbols.length; j++) {
			if (symbols[j] === code[i]) {
				indexes[i] = j;
			}
		}
	}
	return indexes;
}

/**
 * Bitpacks the code
 */
function bitpack(indexes: number[]): number[] {
	const newCode: number[] = [];
	const reader = new BitstreamReader(indexes, 6);
	while (reader.remaining()) {
		newCode.push(reader.read(8));
	}
	return newCode;
}

/**
 * Decrypt the code by using the same rng method used to encrypt
 */
function decrypt(code: number[]): number[] {
	const newcode = code.slice(0, 2);
	const seed = code[0] | code[1] << 8;
	const rng = new RNG(seed);
	for (const c of code.slice(2)) {
		const rand = rng.next();
		newcode.push((c - rand) & 0xFF);
	}
	const remain = 8 - (code.length * 8 % 6);
	newcode[newcode.length - 1] &= (1 << remain) - 1;
	return newcode;
}

/**
 * Data structure of a password
 */
interface PasswordData {
	password: string;
	inclChecksum: number;
	calcChecksum: number;
	timestamp: number;
	unknown1: number;
	team: number[];
	dungeon: number;
	floor: number;
	pokemon: number;
	gender: number;
	reward: number;
	unknown2: number;
	revive: number;
}

type RescueData = PasswordData & {type: 0};
type RevivalData = Omit<PasswordData, 'dungeon' | 'floor' | 'pokemon' | 'gender' | 'reward' | 'unknown2'> & {type: 1};

/**
 * Deserializes a password and returns relevant data
 * for internal use. Use read() to get human-readable data.
 * @param password Password as a string of letters and numbers
 * to represent the icons from the game. The letter or number
 * on the icon should come first, then a letter represnting the
 * shape on the icon should come right after.
 * 
 * Fire - F
 * 
 * Heart - H
 * 
 * Water Drop - W
 * 
 * Emerald - E
 * 
 * Star - S
 * 
 * For example, a 1 on top of a water drop should be 1W.
 */
function deserialize(password: string): RescueData | RevivalData {
    const passwordArr = splitCode(password);
	const unshuffled = unshuffle(passwordArr);
	const indexes = toIndexes(unshuffled);
	const bitpacked = bitpack(indexes);
	const code = decrypt(bitpacked);

	const inclChecksum = code[0];
	const calcChecksum = checksum(code.slice(1));

	const reader = new BitstreamReader(code.slice(1), 8);
	const timestamp = reader.read(32);
	const type = reader.read(1);
	const unknown1 = reader.read(1);
	const team: number[] = [];
	for (let i = 0; i < 12; i++) {
		team.push(reader.read(9));
	}
	if (type === 0) {
		const dungeon = reader.read(7);
		const floor = reader.read(7);
		const pokemon = reader.read(11);
		const gender = reader.read(2);
		const reward = reader.read(2);
		const unknown2 = reader.read(1);

		const indexes = toIndexes(passwordArr);
		let charcode = '';
		for (const i of indexes) {
			charcode += Data.charmap[i];
		}
		const revive = crc32(charcode) & 0x3FFFFFFF;

		const data: RescueData = {
			password,
			inclChecksum,
			calcChecksum,
			timestamp,
			type,
			unknown1,
			team,
			dungeon,
			floor,
			pokemon,
			gender,
			reward,
			unknown2,
			revive,
		};
		return data;
	} else {
		const revive = reader.read(30);

		const data: RevivalData = {
			password,
			inclChecksum,
			calcChecksum,
			timestamp,
			type: 1,
			unknown1,
			team,
			revive,
		};
		return data;
	}
}

/**
 * Human-friendly data structure of rescue passwords
 */
interface PasswordInfo {
	password: string;
	valid: boolean;
	timestamp: number;
	teamName: string;
	dungeon: string;
	floor: string;
	pokemon: string;
	gender: 'Male' | 'Female' | 'Genderless';
	reward: 'Deluxe' | 'Special' | 'Regular';
	revive: number;
}

type RescueInfo = PasswordInfo & {type: 'Rescue'};
type RevivalInfo = Omit<PasswordInfo, 'dungeon' | 'floor' | 'pokemon' | 'gender' | 'reward'> & {type: 'Revival'};

/**
 * Parses the raw password data and returns relevant human-readable data
 */
function parseData(data: RescueData | RevivalData): RescueInfo | RevivalInfo {
	const valid = (data.inclChecksum === data.calcChecksum);
	let teamName = '';
	for (const i of data.team) {
		if (i === 0) break;
		if (i < 402) {
			teamName += Data.charmap_text[i];
		} else {
			teamName += '★';
		}
	}
	if (data.type === 0) {
		let dungeon = '';
		let floor = '';
		let pokemon = '';
		const dungeonData = Data.dungeons.get(data.dungeon);
		if (dungeonData.valid) {
			dungeon = dungeonData.name;
			floor = `${dungeonData.ascending ? '' : 'B'}${data.floor}F`;
		}
		const pokemonData = Data.pokemon.get(data.pokemon);
		if (pokemonData.valid) {
			pokemon = `${pokemonData.name}${pokemonData.const.startsWith('YOBI') ? ' (Shiny)' : ''}`;
		}
		const gender = data.gender === 0 ? 'Male' : data.gender === 1 ? 'Female' : 'Genderless';
		const reward = data.reward === 3 ? 'Deluxe' : data.reward === 2 ? 'Special' : 'Regular';

		const info: RescueInfo = {
			password: data.password,
			valid,
			timestamp: data.timestamp,
			type: 'Rescue',
			teamName,
			dungeon,
			floor,
			pokemon,
			gender,
			reward,
			revive: data.revive,
		};
		return info;
	} else if (data.type === 1) {
		const info: RevivalInfo = {
			password: data.password,
			valid,
			timestamp: data.timestamp,
			type: 'Revival',
			teamName,
			revive: data.revive,
		};
		return info;
	} else {
		// Empty data
		return {
			password: '',
			valid: false,
			timestamp: 0,
			type: 'Revival',
			teamName: '',
			revive: 0,
		};
	}
}
/**
 * Reads a password and returns human-readable data
 * @param password Password as a string of letters and numbers
 * to represent the icons from the game. The letter or number
 * on the icon should come first, then a letter represnting the
 * shape on the icon should come right after.
 * 
 * Fire - F
 * 
 * Heart - H
 * 
 * Water Drop - W
 * 
 * Emerald - E
 * 
 * Star - S
 * 
 * For example, a 1 on top of a water drop should be 1W.
 */
export function read(password: string): RescueInfo | RevivalInfo {
	const data = deserialize(password);
	const info = parseData(data);
	return info;
}
