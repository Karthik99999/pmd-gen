// prettier-ignore
const characters = [
    '?', '6', '7', 'N', 'P', 'R', '8', '9',
    'F', '0', '+', '…', 'S', 'T', 'X', 'Y',
    '4', '5', 'M', 'C', 'H', 'J', '-', 'K',
    '1', '2', '!', '♀', '3', 'Q', '♂', 'W',
];

/**
 * Convert password string to array, then
 * validates that all characters of the password are valid
 * and replaces common unicode characters with the less common ones
 * (# -> ♂ | % -> ♀ | . -> …)
 */
export function sanitizePassword(password: string, length: number): string[] {
	password = password.toUpperCase().replace(/\s/g, '');
	if (password.length !== length) throw new Error(`Password must be exactly ${length} characters long`);
	const sanitized: string[] = [];
	for (let char of password) {
		char = char.replace(/\./g, '…').replace(/#/g, '♂').replace(/%/g, '♀');

		if (characters.includes(char)) {
			sanitized.push(char);
		} else {
			throw new Error(`Invalid character: ${char}`);
		}
	}
	return sanitized;
}

export function charsToBits(password: string[]): number[] {
	return password.map((char) => characters.indexOf(char));
}

export function bitsToChars(code: number[]): string[] {
	return code.map((num) => characters[num]);
}

export function checksum(code: number[]): number {
	let sum = 0;
	for (let i = 0; i < code.length; i++) {
		sum += code[i] + i + 1;
		sum &= 0xff;
	}
	return sum;
}
