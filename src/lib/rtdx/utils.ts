/**
 * Contains utility functions used by both the reading and generating logic
 */

import RomData from './romdata';

/** 
 * List of symbols
 * (xs is not included since it is never used in passwords)
 */
export const symbols = [
    '1f', '2f', '3f', '4f', '5f', '6f', '7f', '8f', '9f', 'pf', 'mf', 'df', 'xf',
	'1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'ph', 'mh', 'dh', 'xh',
	'1w', '2w', '3w', '4w', '5w', '6w', '7w', '8w', '9w', 'pw', 'mw', 'dw', 'xw',
	'1e', '2e', '3e', '4e', '5e', '6e', '7e', '8e', '9e', 'pe', 'me', 'de', 'xe',
	'1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'ps', 'ms', 'ds',
];

export function checksum(code: number[]): number {
	let sum = 0;
	for (const b of code) {
		sum += b;
	}
	const checksum = ~(sum + (sum >> 8)) & 0xFF;
	return checksum;
}

export function crc32(bytes: string): number {
	let sum = 0xFFFFFFFF;
	for (let i = 0; i < bytes.length; i++) {
		sum = RomData.crc32table[(sum & 0xFF) ^ Number(bytes[i])] ^ (sum >> 8);
	}
	return sum ^ 0xFFFFFFFF;
}

/** 
 * dotnet seeded rng implementation
 * 
 * For test cases
 * https://docs.microsoft.com/en-us/dotnet/api/system.random.-ctor?view=netframework-4.8#System_Random__ctor_System_Int32_
 * 
 * Based off
 * https://github.com/mid-kid/pmdrtdx_passwords/blob/26e067a42dc2bf62cd45522ee95fabdbd5b95630/password.py#L7
 */
export class RNG {
    i1: number;
    i2: number;
    state: number[];

    constructor(seed: number) {
        seed = 0x9A4EC86 - seed;
        this.state = [];
        this.state[0] = 0;
        this.state[55] = seed;

        this.i1 = 0;
        this.i2 = 31; // 21 for normal use cases

        let value = 1;
        for (let i = 1; i < 55; i++) {
            this.state[(i * 21) % 55] = value;
            const temp = seed - value;
            seed = value;
            value = ((temp >> 31) & 0x7FFFFFFF) + temp;
        }

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 56; j++) {
                const index = (((j + 30) & 0xFF) % 55) + 1;
                const temp = this.state[j] - this.state[index];
                this.state[j] = ((temp >> 31) & 0x7FFFFFFF) + temp;
            }
        }
    }
    /**
     * Advances the rng
     */
    next(): number {
        this.i1++;
        this.i2++;
        if (this.i1 > 55) {
            this.i1 = 1;
        }
        if (this.i2 > 55) {
            this.i2 = 1;
        }
        let result = this.state[this.i1] - this.state[this.i2];
        if (result < 0) {
            result += 0x7FFFFFFF;
        }
        this.state[this.i1] = result;
        return result;
    }
}
