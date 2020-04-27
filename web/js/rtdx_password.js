// Draw password after all images have loaded
window.onload = function() {
	// Get query terms from url
	var query = window.location.search
	var params = new URLSearchParams(query)
	// split url into array
	var password = params.get("password").replace(/\s/g, "").match(/.{1,2}/g)
	var canvas = document.getElementById("password")
	var ctx = canvas.getContext("2d")
	// Pick which background to use depending on password type
	var background
	if (params.get("type") == 0) {
		background = document.getElementById("rescue_bg")
	}
	else {
		background = document.getElementById("revival_bg")
	}

	// Draw background
	background.onload = ctx.drawImage(background, 0, 0, 912, 233)

	function drawSymbol(char, x, y) {
		// Select symbol based on character
		var symbols = {
			"f": document.getElementById("fire"),
			"h": document.getElementById("heart"),
			"w": document.getElementById("water"),
			"e": document.getElementById("emerald"),
			"s": document.getElementById("star")
		}
		symbols[char.charAt(1)].onload = ctx.drawImage(symbols[char.charAt(1)], x, y, 40, 40)
		var xc = x + 10
		var yc = y + 10
		var character = document.getElementById(char.charAt(0))
		character.onload = ctx.drawImage(character, xc, yc, 20, 20)
	}
	// First row
	drawSymbol(password[0], 68, 70)
	drawSymbol(password[1], 118, 70)
	drawSymbol(password[2], 169, 70)
	drawSymbol(password[3], 220, 70)
	drawSymbol(password[4], 270, 70)
	drawSymbol(password[5], 329, 78)
	drawSymbol(password[6], 380, 78)
	drawSymbol(password[7], 430, 78)
	drawSymbol(password[8], 480, 78)
	drawSymbol(password[9], 532, 78)
	drawSymbol(password[10], 590, 70)
	drawSymbol(password[11], 641, 70)
	drawSymbol(password[12], 691, 70)
	drawSymbol(password[13], 742, 70)
	drawSymbol(password[14], 793, 70)

	// Second row
	drawSymbol(password[15], 68, 135)
	drawSymbol(password[16], 118, 135)
	drawSymbol(password[17], 169, 135)
	drawSymbol(password[18], 220, 135)
	drawSymbol(password[19], 270, 135)
	drawSymbol(password[20], 329, 143)
	drawSymbol(password[21], 380, 143)
	drawSymbol(password[22], 430, 143)
	drawSymbol(password[23], 480, 143)
	drawSymbol(password[24], 532, 143)
	drawSymbol(password[25], 590, 135)
	drawSymbol(password[26], 641, 135)
	drawSymbol(password[27], 691, 135)
	drawSymbol(password[28], 742, 135)
	drawSymbol(password[29], 793, 135)
}
