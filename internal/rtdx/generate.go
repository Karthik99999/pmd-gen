package rtdx

import (
	"strings"
	"time"

	"github.com/Karthik99999/pmd-gen/internal/romdata"
)

// rescueData contains info for a rescue/revival password
type rescueData struct {
	Timestamp int   `json:"timestamp"`
	Type      int   `json:"type"`
	Team      []int `json:"team"`
	Dungeon   int   `json:"dungeon"`
	Floor     int   `json:"floor"`
	Pokemon   int   `json:"pokemon"`
	Gender    int   `json:"gender"`
	Reward    int   `json:"reward"`
	Revive    int   `json:"revive"`
}

// NewRescueData creates a new instance of RescueData
func NewRescueData(pswdType int, teamName string, info ...int) *rescueData {
	data := &rescueData{}
	data.Timestamp = int(time.Now().Unix())
	data.Type = pswdType
	var team []int
	for i := 0; i < 12; i++ {
		if i < len(teamName) {
			team = append(team, strings.Index(romdata.GetRomData().CharmapText, string(teamName[i]))-394)
			// idk why I have to subtract 394 but it works
		} else {
			team = append(team, 0)
		}
	}
	data.Team = team

	if pswdType == 0 {
		data.Dungeon = info[0]
		data.Floor = info[1]
		data.Pokemon = info[2]
		data.Gender = info[3]
		data.Reward = info[4]
	} else {
		data.Revive = info[0]
	}

	return data
}

// shuffle password symbols
func shuffle(code []string) []string {
	unshuffledIndex := []int{3, 27, 13, 21, 12, 9, 7, 4, 6, 17, 19, 16, 28, 29, 23, 20, 11, 0, 1, 22, 24, 14, 8, 2, 15, 25, 10, 5, 18, 26}
	shuffled := make([]string, 30)
	for i := 0; i < len(unshuffledIndex); i++ {
		shuffled[unshuffledIndex[i]] = code[i]
	}
	return shuffled
}

// convert symbols to indexes 0-63
// xs is not used in passwords due to 64 being a 7 bit number
func toSymbols(bitstream []int) []string {
	symbols := []string{"1f", "2f", "3f", "4f", "5f", "6f", "7f", "8f", "9f", "pf", "mf", "df", "xf",
		"1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "ph", "mh", "dh", "xh",
		"1w", "2w", "3w", "4w", "5w", "6w", "7w", "8w", "9w", "pw", "mw", "dw", "xw",
		"1e", "2e", "3e", "4e", "5e", "6e", "7e", "8e", "9e", "pe", "me", "de", "xe",
		"1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "ps", "ms", "ds"}
	code := make([]string, 30)
	for i := 0; i < len(code); i++ {
		code[i] = symbols[bitstream[i]]
	}
	return code
}

// bitpack the code
func bitunpack(bytearr []int) []int {
	var bitstream []int
	reader := NewBitstreamReader(bytearr, 8)
	for reader.Remaining() {
		bitstream = append(bitstream, reader.Read(6))
	}
	return bitstream
}

// encrypt the code using rng
func encrypt(data []int) []int {
	encrypted := []int{data[0], data[1]}
	seed := data[0] | data[1]<<8
	rng := NewRNG(seed)
	for i := 2; i < len(data); i++ {
		rand := rng.NextInt()
		encrypted = append(encrypted, (data[i]+rand)&0xFF)
	}
	remain := 8 - (len(data) * 8 % 6)
	encrypted[len(encrypted)-1] &= (1 << remain) - 1
	return encrypted
}

func (rd *rescueData) Serialize() []string {
	writer := NewBitstreamWriter(8)
	writer.Write(rd.Timestamp, 32)
	writer.Write(rd.Type, 1)
	writer.Write(0, 1) // Unknown, Can be either 0 or 1
	for i := 0; i < 12; i++ {
		if i < len(rd.Team) {
			writer.Write(rd.Team[i], 9)
		} else {
			writer.Write(0, 9)
		}
	}
	if rd.Type == 0 {
		writer.Write(rd.Dungeon, 7)
		writer.Write(rd.Floor, 7)
		writer.Write(rd.Pokemon, 11)
		writer.Write(rd.Gender, 2)
		writer.Write(rd.Reward, 2)
		writer.Write(0, 1) // Unknown, Can be either 0 or 1
	} else {
		writer.Write(rd.Revive, 30)
	}

	data := writer.Finish()
	data = append([]int{checksum(data)}, data...)
	// Serealize data
	encrypted := encrypt(data)
	bitstream := bitunpack(encrypted)
	symbols := toSymbols(bitstream)
	code := shuffle(symbols)
	return code
}
