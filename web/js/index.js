$(function() {
  $.getJSON("/data.json", function(data) {
    // Add dungeons to form
    var dungeonSelect = document.getElementById("rtdx-dungeons")
    var dungeons = data.dungeons.filter(d => d.valid === true && Number(d.const.slice(1)) < 46)
    dungeons.forEach(d => {
      var option = document.createElement("option")
      option.value = Number(d.const.slice(1))
      option.text = d.name
      dungeonSelect.add(option)
    })
    // Modify max floor depending on dungeon selected
    var floorInput = document.getElementById("rtdx-floor")
    dungeonSelect.addEventListener("change", function() {
      var maxFloors = data.dungeons[dungeonSelect.options[dungeonSelect.selectedIndex].value].floors
      floorInput.setAttribute("max", maxFloors)
    })
    // Prevent floor input from going above max
    floorInput.addEventListener("input", function() {
      if (floorInput.value > Number(floorInput.getAttribute("max"))) {
        floorInput.value = floorInput.getAttribute("max")
      }
      else if (floorInput.value < Number(floorInput.getAttribute("min")) && floorInput.value.replace(/\s/g, "") !== "") {
        floorInput.value = floorInput.getAttribute("min")
      }
    })
    // Add pokemon to form
    var pokemonSelect = document.getElementById("rtdx-pokemon")
    var pokemon = data.pokemon.filter(p => p.valid === true)
    pokemon.forEach(p => {
      var option = document.createElement("option")
      option.value = data.pokemon.indexOf(data.pokemon.find(m => m["const"] === p["const"]))
      // Unown letters
      if (p.name === "Unown") {
        option.text = `${p.name} (${p.const.slice(7).replace("EXC", "!").replace("QUE", "?")})`
      }
      // Wurmples that evolve into silcoon and those that evolve into cascoon
      // are considered seperate pokemon
      else if (p.name === "Wurmple") {
        if (p.const.includes("KARA")) {
          option.text = "Wurmple (Silcoon)"
        }
        else {
          option.text = "Wurmple (Cascoon)"
        }
      }
      // Deoxys forms
      else if (p.name === "Deoxys") {
        if (p.const.slice(-1) === "A") {
          option.text = "Deoxys (Attack)"
        }
        else if (p.const.slice(-1) === "D") {
          option.text = "Deoxys (Defense)"
        }
        else if (p.const.slice(-1) === "S") {
          option.text = "Deoxys (Speed)"
        }
        else {
          option.text = "Deoxys (Normal)"
        }
      }
      // Shiny forms
      else if (p.const.includes("YOBI")) {
        option.text = `Shiny ${p.name}`
      }
      else {
        option.text = p.name
      }
      pokemonSelect.add(option)
    })
  })
})
