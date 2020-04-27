package main

import (
	"github.com/Karthik99999/pmd-gen/internal/romdata"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

func getPort() string {
	p := os.Getenv("PORT")
	if p != "" {
		return ":" + p
	}
	return ":8000"
}

func main() {
	r := gin.Default()
	r.LoadHTMLFiles("web/index.html", "web/rtdx-password.html", "web/error.html")
	r.Static("/css", "web/css")
	r.Static("/images", "web/images")
	r.Static("/js", "web/js")
	r.StaticFile("/favicon.ico", "web/favicon.ico")
	r.StaticFile("/data.json", "internal/romdata/data.json")

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})
	r.GET("/generate", func(c *gin.Context) {
		var team []int
		teamName := c.Query("team")
		for i := 0; i < 12; i++ {
			if i < len(teamName) {
				team = append(team, strings.Index(romdata.GetRomData().CharmapText, string(teamName[i]))-394)
				// idk why I have to subtract 394 but it works
			} else {
				team = append(team, 0)
			}
		}
		dungeon, _ := strconv.Atoi(c.Query("dungeon"))
		floor, _ := strconv.Atoi(c.Query("floor"))
		pokemon, _ := strconv.Atoi(c.Query("pokemon"))
		gender, _ := strconv.Atoi(c.Query("gender"))
		reward, _ := strconv.Atoi(c.Query("reward"))
		data := RescueData{
			Timestamp: int(time.Now().Unix()),
			Type:      0,
			Team:      team,
			Dungeon:   dungeon,
			Floor:     floor,
			Pokemon:   pokemon,
			Gender:    gender,
			Reward:    reward,
		}
		code := data.serialize()
		var pswd string
		for _, c := range code {
			pswd += c
		}
		c.Redirect(http.StatusMovedPermanently, "/password?password="+pswd+"&type=0")
	})
	r.GET("/revival", func(c *gin.Context) {
		// Read password to get revival value
		password := c.Query("password")
		password = strings.ReplaceAll(password, " ", "")
		if len(password) != 60 || strings.Contains(strings.ToLower(password), "xs") {
			c.Redirect(http.StatusMovedPermanently, "/error")
		}
		rc := NewRescueCode(password)
		info := rc.deserialize()
		// go to error if password is not valid
		if info.Incl_Checksum != info.Calc_Checksum {
			c.Redirect(http.StatusMovedPermanently, "/error")
		}
		// Generate revival password
		var team []int
		teamName := c.Query("team")
		for i := 0; i < 12; i++ {
			if i < len(teamName) {
				team = append(team, strings.Index(romdata.GetRomData().CharmapText, string(teamName[i]))-394)
				// idk why I have to subtract 394 but it works
			} else {
				team = append(team, 0)
			}
		}
		data := RescueData{
			Timestamp: int(time.Now().Unix()),
			Type:      1,
			Team:      team,
			Revive:    info.Revive,
		}
		code := data.serialize()
		var pswd string
		for _, c := range code {
			pswd += c
		}
		c.Redirect(http.StatusMovedPermanently, "/password?password="+pswd+"&type=1")
	})
	r.GET("/error", func(c *gin.Context) {
		c.HTML(http.StatusOK, "error.html", gin.H{})
	})
	r.GET("/password", func(c *gin.Context) {
		c.HTML(http.StatusOK, "rtdx-password.html", gin.H{})
	})
	r.Run(getPort())
}
