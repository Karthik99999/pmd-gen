// prettier-ignore
export const characters = [
    '?', '6', '7', 'N', 'P', 'R', '8', '9',
    'F', '0', '+', '…', 'S', 'T', 'X', 'Y',
    '4', '5', 'M', 'C', 'H', 'J', '-', 'K',
    '1', '2', '!', '♀', '3', 'Q', '♂', 'W',
];

export function checksum(code: number[]): number {
	let sum = 0;
	for (let i = 0; i < code.length; i++) {
		sum += code[i] + i + 1;
		sum &= 0xff;
	}
	return sum;
}
