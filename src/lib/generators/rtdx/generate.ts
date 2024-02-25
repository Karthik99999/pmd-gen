import { bitpack, BitstreamWriter } from '../bitstream';
import { symbols, checksum, RNG } from './utils';
import { deserialize } from './read';
import Data from './data';

function shuffle(code: string[]): string[] {
	const shuffledIndexes = [
		3, 27, 13, 21, 12, 9, 7, 4, 6, 17, 19, 16, 28, 29, 23, 20, 11, 0, 1, 22, 24, 14, 8, 2, 15, 25, 10, 5, 18, 26,
	];
	const shuffled = [];
	for (let i = 0; i < 30; i++) {
		shuffled[shuffledIndexes[i]] = code[i];
	}
	return shuffled;
}

function bitsToSymbols(bits: number[]): string[] {
	return bits.map((i) => symbols[i]);
}

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

interface PasswordData {
	timestamp: number;
	team: number[];
	dungeon: number;
	floor: number;
	pokemon: number;
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
		writer.write(0, 2); // Gender
		writer.write(data.reward, 2);
		writer.write(0, 1); // Unknown, Can be either 0 or 1
	} else {
		writer.write(data.revive, 30);
	}

	const code = writer.finish();
	code.unshift(checksum(code));
	const encrypted = encrypt(code);
	const bitstream = bitpack(encrypted, 8, 6);
	const bits = bitsToSymbols(bitstream);
	const shuffled = shuffle(bits);
	return shuffled.join('');
}

export function generateRescue(data: { team: string; dungeon: number; floor: number; pokemon: number }): string {
	if (data.team.length < 1 || data.team.length > 12) throw new Error('Team name must be between 1 and 12 characters');
	const team: number[] = [];
	for (const char of data.team) {
		const index = Data.charmap_text.indexOf(char);
		if (index < 0) {
			throw new Error(`Invalid character in team name: ${char}`);
		}
		team.push(index);
	}
	const dungeonData = Data.dungeons.get(data.dungeon);
	if (!dungeonData.valid) {
		throw new Error('Invalid dungeon');
	}
	if (data.floor < 1 || data.floor > dungeonData.floors) {
		throw new Error('Invalid floor');
	}

	if (!Data.pokemon.get(data.pokemon).valid) {
		throw new Error('Invalid Pokemon');
	}

	const rescueData: RescueData = {
		timestamp: Math.round(Date.now() / 1000),
		type: 0,
		team,
		dungeon: data.dungeon,
		floor: data.floor,
		pokemon: data.pokemon,
		reward: 3,
	};
	return serialize(rescueData);
}

export function generateRevival(password: string, teamName: string): string {
	const data = deserialize(password);
	if (data.inclChecksum !== data.calcChecksum) throw new Error('The provided rescue password was invalid');

	if (teamName.length < 1 || teamName.length > 12) throw new Error('Team name must be between 1 and 12 characters');
	const team: number[] = [];
	for (const char of teamName) {
		const index = Data.charmap_text.indexOf(char);
		if (index < 0) {
			throw new Error(`Invalid character in team name: ${char}`);
		}
		team.push(index);
	}

	const revivalData: RevivalData = {
		timestamp: Math.round(Date.now() / 1000),
		type: 1,
		team,
		revive: data.revive,
	};
	return serialize(revivalData);
}
