var query = window.location.search
var params = new URLSearchParams(query)

function drawPassword(password) {
  password = password.replace(/\s/g, "").match(/.{1,2}/g)
  var canvas = document.getElementById("password")
  var ctx = canvas.getContext("2d")
  // Load images into variables
  var background
  if (params.get("type") == 0) {
    background = document.getElementById("rescue_bg")
  } else {
    background = document.getElementById("revival_bg")
  }
  console.log(background)
  var fire = document.getElementById("fire")
  var heart = document.getElementById("heart")
  var water = document.getElementById("water")
  var emerald = document.getElementById("emerald")
  var star = document.getElementById("star")

  // Draw background
  ctx.drawImage(background, 0, 0, 912, 233)
  // Setup text font/color
  ctx.font = "bold 20px Arial"
  ctx.fillStyle = "white"
  ctx.lineWidth = 1

  function drawSymbol(char, x, y) {
    // Select symbol based on character
    var symbols = {
      "f": fire,
      "h": heart,
      "w": water,
      "e": emerald,
      "s": star
    }
    symbols[char.charAt(1)].addEventListener("load", ctx.drawImage(symbols[char.charAt(1)], x, y, 40, 40))
    var xc = x + 10
    var yc = y + 10
    var character = document.getElementById(char.charAt(0))
    character.addEventListener("load", ctx.drawImage(character, xc, yc, 20, 20))
  }
  // First row
  drawSymbol(password[0], 68, 70)
  drawSymbol(password[1], 118, 70)
  drawSymbol(password[2], 169, 70)
  drawSymbol(password[3], 220, 70)
  drawSymbol(password[4], 270, 70)
  drawSymbol(password[5], 329, 80)
  drawSymbol(password[6], 380, 80)
  drawSymbol(password[7], 430, 80)
  drawSymbol(password[8], 480, 80)
  drawSymbol(password[9], 530, 80)
  drawSymbol(password[10], 590, 70)
  drawSymbol(password[11], 640, 70)
  drawSymbol(password[12], 690, 70)
  drawSymbol(password[13], 740, 70)
  drawSymbol(password[14], 790, 70)

  // Second row
  drawSymbol(password[15], 68, 135)
  drawSymbol(password[16], 118, 135)
  drawSymbol(password[17], 169, 135)
  drawSymbol(password[18], 220, 135)
  drawSymbol(password[19], 270, 135)
  drawSymbol(password[20], 329, 145)
  drawSymbol(password[21], 380, 145)
  drawSymbol(password[22], 430, 145)
  drawSymbol(password[23], 480, 145)
  drawSymbol(password[24], 530, 145)
  drawSymbol(password[25], 590, 135)
  drawSymbol(password[26], 640, 135)
  drawSymbol(password[27], 690, 135)
  drawSymbol(password[28], 740, 135)
  drawSymbol(password[29], 790, 135)
}

$(window).bind("load", function () {
  drawPassword(params.get("password"))
})
