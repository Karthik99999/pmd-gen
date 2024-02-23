import { bitpack, BitstreamReader } from '../../bitstream';
import { sanitizePassword, charsToBits, checksum } from '../utils';

function unshuffle(password: string[]): string[] {
	const newPassword: string[] = [];
	const shuffledIndexes = [
		23, 16, 37, 45, 4, 41, 52, 1, 8, 39, 25, 36, 47, 0, 12, 3, 33, 20, 28, 9, 49, 53, 51, 31, 11, 2, 13, 14, 34, 5, 46,
		27, 17, 18, 19, 29, 38, 48, 22, 32, 42, 15, 6, 26, 30, 10, 44, 50, 35, 7, 40, 21, 43, 24,
	];
	for (let i = 0; i < shuffledIndexes.length; i++) {
		newPassword[shuffledIndexes[i]] = password[i];
	}
	return newPassword;
}

interface PasswordData {
	inclChecksum: number;
	calcChecksum: number;
	mailType: number;
	dungeon: number;
	floor: number;
	unknown1: [number, number, number];
	pokemon: number;
	mailID: number;
	nickname: number[];
	unknown2: number;
	itemReward: number;
	unknown3: number;
	teamSeekingHelp: number;
	teamGivingHelp: number;
	chancesRemaining: number;
	unknown4: number;
}

export function deserialize(password: string): PasswordData {
	const sanitized = sanitizePassword(password, 54);
	const shuffled = unshuffle(sanitized);
	const bits = charsToBits(shuffled);
	const code = bitpack(bits, 5, 8);

	const reader = new BitstreamReader(code.slice(1), 8);

	const inclChecksum = code[0];
	const calcChecksum = checksum(code.slice(1));

	const mailType = reader.read(4);
	const dungeon = reader.read(7);
	const floor = reader.read(7);
	const unknown1: [number, number, number] = [reader.read(8), reader.read(8), reader.read(8)];
	const pokemon = reader.read(9);
	const mailID = reader.read(32);
	const nickname = [];
	for (let i = 0; i < 10; i++) {
		nickname.push(reader.read(8));
	}
	const unknown2 = reader.read(8);
	const itemReward = reader.read(8);
	const unknown3 = reader.read(8);
	const teamSeekingHelp = reader.read(32);
	const teamGivingHelp = reader.read(32);
	const chancesRemaining = reader.read(8);
	const unknown4 = reader.read(1);

	const data: PasswordData = {
		inclChecksum,
		calcChecksum,
		mailType,
		dungeon,
		floor,
		unknown1,
		pokemon,
		mailID,
		nickname,
		unknown2,
		itemReward,
		unknown3,
		teamSeekingHelp,
		teamGivingHelp,
		chancesRemaining,
		unknown4,
	};
	return data;
}
