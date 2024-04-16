import { bitpack, BitstreamReader } from '../bitstream';
import { checksum, RNG, symbols } from './utils';
import Data from './data';

function sanitizePassword(password: string): string[] {
	const split = password.toLowerCase().replace(/\s/g, '').match(/.{2}/g);
	if (split?.length !== 30) throw new Error('Password must be exactly 30 symbols long');
	for (let symbol of split) {
		if (!symbols.includes(symbol)) {
			throw new Error(`Invalid symbol: ${symbol}`);
		}
	}
	return split;
}

function unshuffle(code: string[]): string[] {
	const shuffledIndexes = [
		3, 27, 13, 21, 12, 9, 7, 4, 6, 17, 19, 16, 28, 29, 23, 20, 11, 0, 1, 22, 24, 14, 8, 2, 15, 25, 10, 5, 18, 26,
	];
	const unshuffled = [];
	for (let i = 0; i < 30; i++) {
		unshuffled[i] = code[shuffledIndexes[i]];
	}
	return unshuffled;
}

function symbolsToBits(password: string[]): number[] {
	return password.map((symbol) => symbols.indexOf(symbol));
}

function decrypt(code: number[]): number[] {
	const newcode = code.slice(0, 2);
	const seed = code[0] | (code[1] << 8);
	const rng = new RNG(seed);
	for (const c of code.slice(2)) {
		const rand = rng.next();
		newcode.push((c - rand) & 0xff);
	}
	const remain = 8 - ((code.length * 8) % 6);
	newcode[newcode.length - 1] &= (1 << remain) - 1;
	return newcode;
}

function getReviveValue(bytes: string): number {
	let sum = 0xffffffffn;
	for (const byte of new TextEncoder().encode(bytes)) {
		sum = BigInt(Data.crc32table[Number(sum & 0xffn) ^ byte]) ^ (sum >> 8n);
	}
	return Number((sum ^ 0xffffffffn) & 0x3fffffffn);
}

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

type RescueData = PasswordData & { type: 0 };
type RevivalData = Omit<PasswordData, 'dungeon' | 'floor' | 'pokemon' | 'gender' | 'reward' | 'unknown2'> & { type: 1 };

export function deserialize(password: string): RescueData | RevivalData {
	const sanitized = sanitizePassword(password);
	const unshuffled = unshuffle(sanitized);
	const bits = symbolsToBits(unshuffled);
	const bitpacked = bitpack(bits, 6, 8);
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

		const bits = symbolsToBits(sanitized);
		const charcode = bits.map((b) => Data.charmap[b]).join('');
		const revive = getReviveValue(charcode);

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
