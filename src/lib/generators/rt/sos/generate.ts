import { bitpack, BitstreamWriter } from '../../bitstream';
import { bitsToChars, checksum } from '../utils';
import { deserialize } from './read';
import Data from '../data';

function shuffle(password: string[]): string[] {
	const shuffledIndexes = [
		23, 16, 37, 45, 4, 41, 52, 1, 8, 39, 25, 36, 47, 0, 12, 3, 33, 20, 28, 9, 49, 53, 51, 31, 11, 2, 13, 14, 34, 5, 46,
		27, 17, 18, 19, 29, 38, 48, 22, 32, 42, 15, 6, 26, 30, 10, 44, 50, 35, 7, 40, 21, 43, 24,
	];
	const shuffled = [];
	for (let i = 0; i < shuffledIndexes.length; i++) {
		shuffled[i] = password[shuffledIndexes[i]];
	}
	return shuffled;
}

interface PasswordData {
	mailType: number;
	dungeon: number;
	floor: number;
	unknown1?: [number, number, number];
	pokemon: number;
	mailID?: number;
	nickname: number[];
	itemReward?: number;
	teamSeekingHelp: number;
	teamGivingHelp?: number;
	chancesRemaining: number;
}

function serialize(data: PasswordData) {
	const writer = new BitstreamWriter(8);
	writer.write(data.mailType, 4);
	writer.write(data.dungeon, 7);
	writer.write(data.floor, 7);
	if (data.unknown1) {
		for (const n of data.unknown1) writer.write(n, 8);
	} else {
		for (let i = 0; i < 3; i++) writer.write(0, 8);
	}
	writer.write(data.pokemon, 9);
	writer.write(data.mailID || 0, 32);
	for (let i = 0; i < 10; i++) {
		if (i < data.nickname.length) {
			writer.write(data.nickname[i], 8);
		} else {
			writer.write(0, 8);
		}
	}
	writer.write(data.mailType === 5 ? 1 : 0, 8); // Unknown 2
	writer.write(data.itemReward || 0, 8);
	writer.write(0, 8); // Unknown 3
	writer.write(data.teamSeekingHelp, 32);
	writer.write(data.teamGivingHelp || 0, 32);
	writer.write(data.chancesRemaining, 8);
	writer.write(0, 1); // Unknown 4
	writer.write(0, 4); // Pad to 33 bytes

	const code = writer.finish();
	code.unshift(checksum(code));
	const bits = bitpack(code, 8, 5);
	const chars = bitsToChars(bits);
	const shuffled = shuffle(chars);
	return shuffled.join('');
}

export function convertSOSToAOK(password: string) {
	const data = deserialize(password);
	if (data.inclChecksum !== data.calcChecksum) throw new Error('Invalid password');
	if (data.mailType !== 1) throw new Error('The given password is not an SOS Mail');

	data.mailType = 4;
	data.teamGivingHelp = data.teamSeekingHelp;
	data.chancesRemaining = Math.max(data.chancesRemaining - 1, 0);
	return serialize(data);
}

export function convertAOKToThankYou(password: string, itemReward = 0) {
	const data = deserialize(password);
	if (data.inclChecksum !== data.calcChecksum) throw new Error('Invalid password');
	if (data.mailType !== 4) throw new Error('The given password is not an A-OK Mail');
	if (itemReward && !Data.items.get(itemReward).valid) throw new Error('Invalid item reward');

	data.mailType = 5;
	data.itemReward = itemReward;
	return serialize(data);
}
