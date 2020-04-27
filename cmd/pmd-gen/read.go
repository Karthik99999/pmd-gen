package main

import (
	"fmt"
	"github.com/Karthik99999/pmd-gen/internal/romdata"
	"github.com/Karthik99999/pmd-gen/internal/utils"
	"math"
	"strings"
)

type RescueCode struct {
	code []string
}

func NewRescueCode(code string) *RescueCode {
	rescueCode := &RescueCode{}
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
func (this *RescueCode) unshuffle() []string {
	unshuffledIndex := []int{3, 27, 13, 21, 12, 9, 7, 4, 6, 17, 19, 16, 28, 29, 23, 20, 11, 0, 1, 22, 24, 14, 8, 2, 15, 25, 10, 5, 18, 26}
	unshuffled := make([]string, 30)
	for i := 0; i < len(unshuffledIndex); i++ {
		unshuffled[i] = this.code[unshuffledIndex[i]]
	}
	fmt.Println(unshuffled)
	return unshuffled
}

// convert symbols to indexes 0-63
// xs is not used in passwords due to 64 being a 7 bit number
func (this *RescueCode) to_indexes() []int {
	symbols := []string{"1f", "2f", "3f", "4f", "5f", "6f", "7f", "8f", "9f", "pf", "mf", "df", "xf",
		"1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "ph", "mh", "dh", "xh",
		"1w", "2w", "3w", "4w", "5w", "6w", "7w", "8w", "9w", "pw", "mw", "dw", "xw",
		"1e", "2e", "3e", "4e", "5e", "6e", "7e", "8e", "9e", "pe", "me", "de", "xe",
		"1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "ps", "ms", "ds"}
	indexes := make([]int, 30)
	unshuffled := this.unshuffle()
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
func (this *RescueCode) bitpack() []int {
	var newcode []int
	reader := utils.NewBitstreamReader(this.to_indexes(), 6)
	for {
		if !reader.Remaining() {
			break
		}
		newcode = append(newcode, reader.Read(8))
	}
	return newcode
}

// decrypt the code by using the same rng method used to encrypt
func (this *RescueCode) decrypt() []int {
	bitpacked := this.bitpack()
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
	calc := code[0]
	for i := 1; i < int(math.Floor(float64((len(code)-1)/2))*2); i += 2 {
		calc += code[i] | (code[i+1] << 8)
	}
	if len(code)%2 == 0 {
		calc += code[len(code)-1]
	}

	calc = ((calc >> 16) & 0xFFFF) + (calc & 0xFFFF)
	calc += calc >> 16
	calc = ((calc >> 8) & 0xFF) + (calc & 0xFF)
	calc += calc >> 8
	calc &= 0xFF
	calc ^= 0xFF
	return calc
}

func crc32(bytes string) int {
	sum := 0xFFFFFFFF
	for i := 0; i < len(bytes); i++ {
		fmt.Println(bytes[i])
		sum = romdata.GetRomData().Crc32Table[(sum&0xFF)^int(bytes[i])] ^ (sum >> 8)
	}
	return sum ^ 0xFFFFFFFF
}

type RescueInfo struct {
	Incl_Checksum int   `json:"incl_checksum"`
	Calc_Checksum int   `json:"calc_checksum"`
	Timestamp     int   `json:"timestamp"`
	Type          int   `json:"type"`
	Unknown1      int   `json:"unknown1"`
	Team          []int `json:"team"`
	Dungeon       int   `json:"dungeon"`
	Floor         int   `json:"floor"`
	Pokemon       int   `json:"pokemon"`
	Gender        int   `json:"gender"`
	Reward        int   `json:"reward"`
	Unknown2      int   `json:"unknown2"`
	Revive        int   `json:"revive"`
}

func (this *RescueCode) deserialize() *RescueInfo {
	code := this.decrypt()
	info := &RescueInfo{
		Incl_Checksum: code[0],
		Calc_Checksum: checksum(code[1:]),
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
		for i := 0; i < len(this.code); i++ {
			for j := 0; j < len(symbols); j++ {
				if symbols[j] == strings.ToLower(this.code[i]) {
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
