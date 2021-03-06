package main

import (
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
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
	r.LoadHTMLFiles("web/index.html")
	r.Static("/css", "web/css")
	r.Static("/images", "web/images")
	r.Static("/js", "web/js")
	r.StaticFile("/favicon.ico", "web/favicon.ico")
	r.StaticFile("/data.json", "internal/romdata/data.json")
	r.StaticFile("/error.html", "web/error.html")
	r.StaticFile("/rtdx-password.html", "web/rtdx-password.html")

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})
	r.GET("/generate", func(c *gin.Context) {
		team := c.Query("team")
		dungeon, _ := strconv.Atoi(c.Query("dungeon"))
		floor, _ := strconv.Atoi(c.Query("floor"))
		pokemon, _ := strconv.Atoi(c.Query("pokemon"))
		gender, _ := strconv.Atoi(c.Query("gender"))
		reward, _ := strconv.Atoi(c.Query("reward"))
		data := NewRescueData(0, team, dungeon, floor, pokemon, gender, reward)
		code := data.serialize()
		var pswd string
		for _, c := range code {
			pswd += c
		}
		c.Redirect(http.StatusMovedPermanently, "/rtdx-password.html?password="+pswd+"&type=0")
	})
	r.GET("/revival", func(c *gin.Context) {
		// Read password to get revival value
		password := c.Query("password")
		password = strings.ReplaceAll(password, " ", "")
		if len(password) != 60 || strings.Contains(strings.ToLower(password), "xs") {
			c.Redirect(http.StatusMovedPermanently, "/error.html")
		}
		rc := NewRescueCode(password)
		info := rc.deserialize()
		// go to error if password is not valid
		if info.InclChecksum != info.CalcChecksum {
			c.Redirect(http.StatusMovedPermanently, "/error.html")
		}
		// Generate revival password
		data := NewRescueData(1, "pmd-gen", info.Revive)
		code := data.serialize()
		var pswd string
		for _, c := range code {
			pswd += c
		}
		c.Redirect(http.StatusMovedPermanently, "/rtdx-password.html?password="+pswd+"&type=1")
	})
	r.Run(getPort())
}
