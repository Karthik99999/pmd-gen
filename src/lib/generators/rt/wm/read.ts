import { bitpack, BitstreamReader } from '../../bitstream';
import { sanitizePassword, charsToBits, checksum } from '../utils';

function unshuffle(password: string[]): string[] {
	const shuffledIndexes = [12, 20, 9, 17, 4, 15, 1, 23, 3, 7, 19, 14, 0, 5, 21, 6, 8, 18, 11, 2, 10, 13, 22, 16];
	const unshuffled = [];
	for (let i = 0; i < shuffledIndexes.length; i++) {
		unshuffled[shuffledIndexes[i]] = password[i];
	}
	return unshuffled;
}

interface WonderMailData {
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

function deserialize(password: string): WonderMailData {
	const sanitized = sanitizePassword(password, 24);
	const unshuffled = unshuffle(sanitized);
	const bits = charsToBits(unshuffled);
	const code = bitpack(bits, 5, 8);

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

	const data: WonderMailData = {
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
