package main

import (
	"github.com/Karthik99999/pmd-gen/internal/romdata"
	"github.com/Karthik99999/pmd-gen/internal/utils"
	"strings"
)

type rescueCode struct {
	code []string
}

// NewRescueCode returns a new instance of the rescueCode struct
func NewRescueCode(code string) *rescueCode {
	rescueCode := &rescueCode{}
	code = strings.ReplaceAll(code, " ", "")
	var codef string
	for i := 0; i < len(code); i += 2 {
		codef += string(code[i:i+2] + " ")
	}
	codef = strings.TrimSpace(codef)
	rescueCode.code = strings.Split(codef, " ")
	return rescueCode
}

// unshuffled password symbols
func (rc *rescueCode) unshuffle() []string {
	unshuffledIndex := []int{3, 27, 13, 21, 12, 9, 7, 4, 6, 17, 19, 16, 28, 29, 23, 20, 11, 0, 1, 22, 24, 14, 8, 2, 15, 25, 10, 5, 18, 26}
	unshuffled := make([]string, 30)
	for i := 0; i < len(unshuffledIndex); i++ {
		unshuffled[i] = rc.code[unshuffledIndex[i]]
	}
	return unshuffled
}

// convert symbols to indexes 0-63
// xs is not used in passwords due to 64 being a 7 bit number
func (rc *rescueCode) toIndexes() []int {
	symbols := []string{"1f", "2f", "3f", "4f", "5f", "6f", "7f", "8f", "9f", "pf", "mf", "df", "xf",
		"1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "ph", "mh", "dh", "xh",
		"1w", "2w", "3w", "4w", "5w", "6w", "7w", "8w", "9w", "pw", "mw", "dw", "xw",
		"1e", "2e", "3e", "4e", "5e", "6e", "7e", "8e", "9e", "pe", "me", "de", "xe",
		"1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "ps", "ms", "ds"}
	indexes := make([]int, 30)
	unshuffled := rc.unshuffle()
	for i := 0; i < len(unshuffled); i++ {
		for j := 0; j < len(symbols); j++ {
			if symbols[j] == strings.ToLower(unshuffled[i]) {
				indexes[i] = j
			}
		}
	}
	return indexes
}

// bitpack the code
func (rc *rescueCode) bitpack() []int {
	var newcode []int
	reader := utils.NewBitstreamReader(rc.toIndexes(), 6)
	for reader.Remaining() {
		newcode = append(newcode, reader.Read(8))
	}
	return newcode
}

// decrypt the code by using the same rng method used to encrypt
func (rc *rescueCode) decrypt() []int {
	bitpacked := rc.bitpack()
	newcode := []int{bitpacked[0], bitpacked[1]}
	seed := bitpacked[0] | bitpacked[1]<<8
	rng := utils.NewRNG(seed)
	for i := 2; i < len(bitpacked); i++ {
		rand := rng.NextInt()
		newcode = append(newcode, (bitpacked[i]-rand)&0xFF)
	}
	remain := 8 - (len(bitpacked) * 8 % 6)
	newcode[len(newcode)-1] &= (1 << remain) - 1
	return newcode
}

// calculate checksum
func checksum(code []int) int {
	var sum int
	for _, b := range code {
		sum += b
	}
	checksum := ^(sum + (sum >> 8)) & 0xFF
	return checksum
}

func crc32(bytes string) int {
	sum := 0xFFFFFFFF
	for i := 0; i < len(bytes); i++ {
		sum = romdata.GetRomData().Crc32Table[(sum&0xFF)^int(bytes[i])] ^ (sum >> 8)
	}
	return sum ^ 0xFFFFFFFF
}

type rescueInfo struct {
	InclChecksum int   `json:"incl_checksum"`
	CalcChecksum int   `json:"calc_checksum"`
	Timestamp    int   `json:"timestamp"`
	Type         int   `json:"type"`
	Unknown1     int   `json:"unknown1"`
	Team         []int `json:"team"`
	Dungeon      int   `json:"dungeon"`
	Floor        int   `json:"floor"`
	Pokemon      int   `json:"pokemon"`
	Gender       int   `json:"gender"`
	Reward       int   `json:"reward"`
	Unknown2     int   `json:"unknown2"`
	Revive       int   `json:"revive"`
}

func (rc *rescueCode) deserialize() *rescueInfo {
	code := rc.decrypt()
	info := &rescueInfo{
		InclChecksum: code[0],
		CalcChecksum: checksum(code[1:]),
	}

	reader := utils.NewBitstreamReader(code[1:], 8)
	info.Timestamp = reader.Read(32)
	info.Type = reader.Read(1)
	info.Unknown1 = reader.Read(1)
	var team []int
	for i := 0; i < 12; i++ {
		team = append(team, reader.Read(9))
	}
	info.Team = team
	if info.Type == 0 {
		info.Dungeon = reader.Read(7)
		info.Floor = reader.Read(7)
		info.Pokemon = reader.Read(11)
		info.Gender = reader.Read(2)
		info.Reward = reader.Read(2)
		info.Unknown2 = reader.Read(1)

		symbols := []string{"1f", "2f", "3f", "4f", "5f", "6f", "7f", "8f", "9f", "pf", "mf", "df", "xf",
			"1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "ph", "mh", "dh", "xh",
			"1w", "2w", "3w", "4w", "5w", "6w", "7w", "8w", "9w", "pw", "mw", "dw", "xw",
			"1e", "2e", "3e", "4e", "5e", "6e", "7e", "8e", "9e", "pe", "me", "de", "xe",
			"1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "ps", "ms", "ds"}
		indexes := make([]int, 30)
		for i := 0; i < len(rc.code); i++ {
			for j := 0; j < len(symbols); j++ {
				if symbols[j] == strings.ToLower(rc.code[i]) {
					indexes[i] = j
				}
			}
		}
		charcode := ""
		for _, x := range indexes {
			charcode += string([]rune(romdata.GetRomData().Charmap)[x])
		}
		info.Revive = crc32(charcode) & 0x3FFFFFFF
	} else {
		info.Revive = reader.Read(30)
	}

	return info
}
