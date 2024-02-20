/**
 * based off
 * https://github.com/mid-kid/pmdrtdx_passwords/blob/master/password.py#L44
 */
export class BitstreamReader {
    bytes: bigint[];
    bytesize: bigint;
    pos: number;
    bits: bigint;
    value: bigint;
    constructor(bytes: number[], bytesize: number) {
        this.bytes = [];
        for (const byte of bytes) {
            this.bytes.push(BigInt(byte));
        }
        this.bytesize = BigInt(bytesize);
        this.pos = 0;
        this.bits = 0n;
        this.value = 0n;
    }

    remaining(): boolean {
        if (this.pos < this.bytes.length) return true;
        if (this.bits > 0n) return true;
        return false;
    }

    read(count: number | bigint): number {
        if (typeof count === 'number') count = BigInt(count);
        while (this.bits < count) {
            if (this.pos >= this.bytes.length) break;
            this.value |= (this.bytes[this.pos] & ((1n << this.bytesize) - 1n)) << this.bits;
            this.bits += this.bytesize;
            this.pos++;
        }
        const ret = this.value & ((1n << count) - 1n);
        this.value >>= count;
        this.bits -= count;
        return Number(ret);
    }
}

/**
 * based off
 * https://github.com/mid-kid/pmdrtdx_passwords/blob/master/password.py#L72
 */
export class BitstreamWriter {
    bytes: number[];
    bytesize: bigint;
    bits: bigint;
    value: bigint;
    constructor(bytesize: number) {
        this.bytes = [];
        this.bytesize = BigInt(bytesize);
        this.bits = 0n;
        this.value = 0n;
    }

    finish(): number[] {
        if (this.bits > 0) this.bytes.push(Number(this.value & ((1n << this.bytesize) - 1n)));
        return this.bytes;
    }

    write(value: number | bigint, bits: number | bigint): void {
        if (typeof value === 'number') value = BigInt(value);
        if (typeof bits === 'number') bits = BigInt(bits);
        this.value |= (value & ((1n << bits) - 1n)) << this.bits;
        this.bits += bits;
        while (this.bits >= this.bytesize) {
            this.bytes.push(Number(this.value & ((1n << this.bytesize) - 1n)));
            this.value >>= this.bytesize;
            this.bits -= this.bytesize;
        }
    }
}
