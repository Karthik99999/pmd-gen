package rtdx

// dotnet seeded rng implementation
// For test cases
// https://docs.microsoft.com/en-us/dotnet/api/system.random.-ctor?view=netframework-4.8#System_Random__ctor_System_Int32_
// Based off
// https://github.com/mid-kid/pmdrtdx_passwords/blob/26e067a42dc2bf62cd45522ee95fabdbd5b95630/password.py#L7
type rng struct {
	i1    int
	i2    int
	state []int
}

// NewRNG creates a new instance of the rng struct
func NewRNG(seed int) *rng {
	rng := &rng{}
	seed = 0x9A4EC86 - seed
	rng.state = make([]int, 56)
	rng.state[0] = 0
	rng.state[55] = seed

	rng.i1 = 0
	rng.i2 = 31 // 21 for normal use cases

	value := 1
	for x := 1; x < 55; x++ {
		rng.state[(x*21)%55] = value
		temp := seed - value
		seed = value
		value = ((temp >> 31) & 0x7FFFFFFF) + temp
	}

	for x := 0; x < 4; x++ {
		for x := 0; x < 56; x++ {
			index := (((x + 30) & 0xFF) % 55) + 1
			temp := rng.state[x] - rng.state[index]
			rng.state[x] = ((temp >> 31) & 0x7FFFFFFF) + temp
		}
	}
	return rng
}

// NextInt advances the rng
func (r *rng) NextInt() int {
	r.i1++
	r.i2++
	if r.i1 > 55 {
		r.i1 = 1
	}
	if r.i2 > 55 {
		r.i2 = 1
	}
	result := r.state[r.i1] - r.state[r.i2]
	if result < 0 {
		result += 0x7FFFFFFF
	}
	r.state[r.i1] = result
	return result
}
