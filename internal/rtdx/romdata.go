package rtdx

import (
	"encoding/json"
	"io/ioutil"
)

type romdata struct {
	Charmap     string `json:"charmap"`
	CharmapText string `json:"charmap_text"`
	Crc32Table  []int  `json:"crc32table"`
	Dungeons    []struct {
		Ascending bool   `json:"ascending"`
		Const     string `json:"const"`
		Floors    int    `json:"floors"`
		Name      string `json:"name"`
		Valid     bool   `json:"valid"`
	} `json:"dungeons"`
	Genders []struct {
		Const string `json:"const"`
		Name  string `json:"name"`
		Valid bool   `json:"valid"`
	} `json:"genders"`
	Pokemon []struct {
		Const string `json:"const"`
		Name  string `json:"name"`
		Valid bool   `json:"valid"`
	} `json:"pokemon"`
	Rewards []struct {
		Const string `json:"const"`
		Name  string `json:"name"`
		Valid bool   `json:"valid"`
	} `json:"rewards"`
}

// GetRomData reads the json file containing game data
// and returns the romdata struct containing said data
func GetRomData() *romdata {
	file, _ := ioutil.ReadFile("internal/rtdx/data.json")
	data := &romdata{}
	_ = json.Unmarshal(file, &data)
	return data
}
