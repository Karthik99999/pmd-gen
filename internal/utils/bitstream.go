package utils

type bitstreamReader struct {
	bytes    []int
	bytesize int
	pos      int
	bits     int
	value    int
}

func NewBitstreamReader(bytes []int, bytesize int) *bitstreamReader {
	reader := &bitstreamReader{}
	reader.bytes = bytes
	reader.bytesize = bytesize
	reader.pos = 0
	reader.bits = 0
	reader.value = 0
	return reader
}

func (this *bitstreamReader) Remaining() bool {
	if this.pos < len(this.bytes) {
		return true
	}
	if this.bits > 0 {
		return true
	}
	return false
}

func (this *bitstreamReader) Read(count int) int {
	for this.bits < count {
		if this.pos >= len(this.bytes) {
			break
		}
		this.value |= (this.bytes[this.pos] & ((1 << this.bytesize) - 1)) << this.bits
		this.bits += this.bytesize
		this.pos++
	}

  ret := this.value & ((1 << count) - 1)
	this.value >>= count
	this.bits -= count
  return ret
}

type bitstreamWriter struct {
  bytes []int
  bytesize int
  bits int
  value int
}

func NewBitstreamWriter(bytesize int) *bitstreamWriter {
	writer := &bitstreamWriter{}
	writer.bytes = make([]int, 0)
	writer.bytesize = bytesize
	writer.bits = 0
	writer.value = 0
	return writer
}

func (this *bitstreamWriter) Finish() []int {
  if this.bits > 0 {
    this.bytes = append(this.bytes, this.value & ((1 << this.bytesize) - 1))
  }
  return this.bytes
}

func (this *bitstreamWriter) Write(value int, bits int) {
  this.value |= (value & ((1 << bits) - 1)) << this.bits
  this.bits += bits
  for this.bits >= this.bytesize {
    this.bytes = append(this.bytes, this.value & ((1 << this.bytesize) - 1))
    this.value >>= this.bytesize
    this.bits -= this.bytesize
  }
}
