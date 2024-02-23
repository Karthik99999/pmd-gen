import { BitstreamReader } from '../../bitstream';
import { characters, checksum } from '../utils';

/**
 * Convert password string to array, then
 * validates that all characters of the password are valid
 * and replaces common unicode characters with the less common ones
 * (m,# -> ♂ | f,% -> ♀ | . -> …)
 */
function sanitizePassword(password: string): string[] {
	password = password.replace(/\s/g, '');
	if (password.length !== 24) throw new Error('Password must be exatly 24 characters long');
	const sanitized: string[] = [];
	for (let char of password) {
		char = char.replace('.', '…').replace('m', '♂').replace('#', '♂').replace('f', '♀').replace('%', '♀');

		if (characters.includes(char)) {
			sanitized.push(char);
		} else {
			throw new Error(`Invalid character: ${char}`);
		}
	}
	return sanitized;
}

/**
 * Unshuffles the 24 character password based on a predefined lookup table
 */
function unshuffle(password: string[]): string[] {
	const newPassword: string[] = [];
	const shuffledIndexes = [12, 20, 9, 17, 4, 15, 1, 23, 3, 7, 19, 14, 0, 5, 21, 6, 8, 18, 11, 2, 10, 13, 22, 16];
	for (let i = 0; i < shuffledIndexes.length; i++) {
		newPassword[shuffledIndexes[i]] = password[i];
	}
	return newPassword;
}

/**
 * Converts individual characters of the password to a 5 byte number
 */
function charsToBits(password: string[]): number[] {
	return password.map((char) => characters.indexOf(char));
}

/**
 * Bitpack bits into 8 bytes
 */
function bitpack(bits: number[]): number[] {
	const newCode: number[] = [];
	const reader = new BitstreamReader(bits, 5);
	while (reader.remaining()) {
		newCode.push(reader.read(8));
	}
	return newCode;
}

/**
 * Data structure of a wondermail
 */
interface WondermailData {
	inclChecksum: number;
	calcChecksum: number;
	mailType: number;
	missionType: number;
	unknown1: number;
	client: number;
	target: number;
	itemToFindOrDeliver: number;
	rewardType: number;
	itemReward: number;
	friendAreaReward: number;
	messageTitle: number;
	messageBody: [number, number];
	dungeon: number;
	floor: number;
}

function deserialize(password: string): WondermailData {
	const sanitized = sanitizePassword(password);
	const unshuffled = unshuffle(sanitized);
	const bits = charsToBits(unshuffled);
	const code = bitpack(bits);

	const reader = new BitstreamReader(code.slice(1), 8);

	const inclChecksum = code[0];
	const calcChecksum = checksum(code.slice(1));

	const mailType = reader.read(4);
	const missionType = reader.read(3);
	const unknown1 = reader.read(4);
	const client = reader.read(9);
	const target = reader.read(9);
	const itemToFindOrDeliver = reader.read(8);
	const rewardType = reader.read(4);
	const itemReward = reader.read(8);
	const friendAreaReward = reader.read(6);
	const messageTitle = reader.read(8);
	const messageBody: [number, number] = [reader.read(8), reader.read(8)];
	const dungeon = reader.read(7);
	const floor = reader.read(7);

	const data: WondermailData = {
		inclChecksum,
		calcChecksum,
		mailType,
		missionType,
		unknown1,
		client,
		target,
		itemToFindOrDeliver,
		rewardType,
		itemReward,
		friendAreaReward,
		messageTitle,
		messageBody,
		dungeon,
		floor,
	};
	return data;
}
