import { bitpack, BitstreamWriter } from '../../bitstream';
import { bitsToChars, checksum } from '../utils';
import Data from '../data';

function shuffle(password: string[]): string[] {
	const newPassword: string[] = [];
	const shuffledIndexes = [12, 20, 9, 17, 4, 15, 1, 23, 3, 7, 19, 14, 0, 5, 21, 6, 8, 18, 11, 2, 10, 13, 22, 16];
	for (let i = 0; i < shuffledIndexes.length; i++) {
		newPassword[i] = password[shuffledIndexes[i]];
	}
	return newPassword;
}

interface WonderMailData {
	missionType: number;
	clientPokemon: number;
	targetPokemon: number;
	itemToFindOrDeliver?: number;
	rewardType: number;
	itemReward?: number;
	friendAreaReward?: number;
	dungeon: number;
	floor: number;
}

export function serialize(data: WonderMailData) {
	const writer = new BitstreamWriter(8);
	writer.write(5, 4); // Mail type
	writer.write(data.missionType, 3);
	writer.write(0, 4); // Unknown
	writer.write(data.clientPokemon, 9);
	writer.write(data.targetPokemon || data.clientPokemon, 9);
	writer.write(data.itemToFindOrDeliver || 9, 8);
	writer.write(data.rewardType, 4);
	writer.write(data.itemReward || 9, 8);
	writer.write(data.friendAreaReward || 0, 6);
	for (let i = 0; i < 3; i++) writer.write(255, 8); // Flavor text
	writer.write(data.dungeon, 7);
	writer.write(data.floor, 7);
	writer.write(0, 19); // Pad to 14 bytes

	const code = writer.finish();
	code.unshift(checksum(code));
	const bits = bitpack(code, 8, 5);
	const chars = bitsToChars(bits);
	const shuffled = shuffle(chars);
	return shuffled.join('');
}

export function generateWonderMail(
	missionType: number,
	clientPokemon: number,
	targetPokemon: number,
	dungeon: number,
	floor: number,
	itemToFindOrDeliver?: number,
	itemReward?: number,
	moneyReward?: boolean,
	friendAreaReward?: number
) {
	if (!Data.pokemon.get(clientPokemon).valid) throw new Error('Invalid client Pokemon');
	if (missionType === 1 || missionType === 2) {
		if (!Data.pokemon.get(targetPokemon).valid) throw new Error('Invalid target Pokemon');
	}

	const dungeonData = Data.dungeons.get(dungeon);
	if (!dungeonData.valid) throw new Error('Invalid dungeon');
	if (floor < 1 || floor > dungeonData.floors) throw new Error('Invalid floor');

	if (missionType === 3 || missionType === 4) {
		if (!itemToFindOrDeliver) throw new Error('Item to find/deliver is required for this mission type');
		const itemToFindOrDeliverData = Data.items.get(itemToFindOrDeliver);
		if (
			!itemToFindOrDeliverData.valid ||
			(missionType === 3 && !dungeonData.items.includes(itemToFindOrDeliverData.index))
		) {
			throw new Error('Invalid item to find/deliver');
		}
	} else {
		itemToFindOrDeliver = 9;
	}

	if (itemReward && !Data.items.get(itemReward).valid) throw new Error('Invalid item reward');
	if (friendAreaReward) {
		if (![10, 14, 35, 36].includes(friendAreaReward)) throw new Error('Invalid Friend Area reward');
		if (Data.dungeons.getDifficulty(dungeonData, floor, missionType) === 0) {
			throw new Error('The mission must have at least D difficulty to recieve a Friend Area reward');
		}
	}

	let rewardType = 5;
	if (friendAreaReward) {
		rewardType = 9;
		itemReward = 9;
	} else if (itemReward) {
		rewardType = moneyReward ? 6 : 8;
		friendAreaReward = 0;
	}

	const data: WonderMailData = {
		missionType,
		clientPokemon,
		targetPokemon,
		itemToFindOrDeliver,
		rewardType,
		itemReward,
		friendAreaReward,
		dungeon,
		floor,
	};
	return serialize(data);
}
