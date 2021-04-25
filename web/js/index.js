window.onload = function() {
	// Modify max floor depending on dungeon selected
	var dungeonSelect = document.getElementById("rtdx-dungeons")
	var floorInput = document.getElementById("rtdx-floor")
	dungeonSelect.addEventListener("change", function() {
		var maxFloors = dungeonSelect.options[dungeonSelect.selectedIndex].getAttribute("data-maxfloors")
		floorInput.setAttribute("max", maxFloors)
	})
	// Prevent floor input from going above max
	floorInput.addEventListener("input", function() {
		if (floorInput.value > Number(floorInput.getAttribute("max"))) {
			floorInput.value = floorInput.getAttribute("max")
		} else if (floorInput.value < Number(floorInput.getAttribute("min")) && floorInput.value.replace(/\s/g, "") !== "") {
			floorInput.value = floorInput.getAttribute("min")
		}
	})
	// Show/hide "advanced" options
	var advancedOptions = document.getElementById("advancedOptions")
	advancedOptions.addEventListener("click", function() {
		var team = document.getElementById("rescueTeam")
		var teamName = document.getElementById("rescueTeamName")
		var pokemon = document.getElementById("rtdx-pokemonlist")
		var genders = document.getElementById("rtdx-genders")
		if (advancedOptions.checked) {
			// show "advanced" options, as well as remove default team name    
			teamName.value = ""
			team.style.display = ""
			pokemon.style.display = ""
			genders.style.display = ""
		} else {
			// hide "advanced" options, and put default team name back
			teamName.value = "pmd-gen"
			team.style.display = "none"
			pokemon.style.display = "none"
			genders.style.display = "none"
		}
	})
}