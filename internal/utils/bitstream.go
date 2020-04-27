package utils

type bitstreamReader struct {
	bytes    []int
	bytesize int
	pos      int
	bits     int
	value    int
}

// NewBitstreamReader returns a new instance of the bitstreamReader struct
func NewBitstreamReader(bytes []int, bytesize int) *bitstreamReader {
	reader := &bitstreamReader{}
	reader.bytes = bytes
	reader.bytesize = bytesize
	reader.pos = 0
	reader.bits = 0
	reader.value = 0
	return reader
}

// Remaining returns a boolean stating whether there is still
// something to read in the bitstream
func (br *bitstreamReader) Remaining() bool {
	if br.pos < len(br.bytes) {
		return true
	}
	if br.bits > 0 {
		return true
	}
	return false
}

// Read reads a given number of bits from the bitstream
func (br *bitstreamReader) Read(count int) int {
	for br.bits < count {
		if br.pos >= len(br.bytes) {
			break
		}
		br.value |= (br.bytes[br.pos] & ((1 << br.bytesize) - 1)) << br.bits
		br.bits += br.bytesize
		br.pos++
	}

	ret := br.value & ((1 << count) - 1)
	br.value >>= count
	br.bits -= count
	return ret
}

type bitstreamWriter struct {
	bytes    []int
	bytesize int
	bits     int
	value    int
}

// NewBitstreamWriter returns a new instance of the bitstreamWriter struct
func NewBitstreamWriter(bytesize int) *bitstreamWriter {
	writer := &bitstreamWriter{}
	writer.bytes = make([]int, 0)
	writer.bytesize = bytesize
	writer.bits = 0
	writer.value = 0
	return writer
}

// Finish returns the writen bitstream
func (bw *bitstreamWriter) Finish() []int {
	if bw.bits > 0 {
		bw.bytes = append(bw.bytes, bw.value&((1<<bw.bytesize)-1))
	}
	return bw.bytes
}

// Write writes the supplied value into the bitstream
// with the bit length being specified
func (bw *bitstreamWriter) Write(value int, bits int) {
	bw.value |= (value & ((1 << bits) - 1)) << bw.bits
	bw.bits += bits
	for bw.bits >= bw.bytesize {
		bw.bytes = append(bw.bytes, bw.value&((1<<bw.bytesize)-1))
		bw.value >>= bw.bytesize
		bw.bits -= bw.bytesize
	}
}
