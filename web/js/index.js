window.onload = function() {
	// Set timestamps
	var timestamps = document.querySelectorAll('[name="timestamp"]')
	for (var timestamp of timestamps) {
		timestamp.value = Math.floor(Date.now() / 1000)
	}
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
		var team = document.getElementById("rtdx-rescue-team")
		var teamName = document.getElementById("rtdx-rescue-team-name")
		var pokemon = document.getElementById("rtdx-pokemon")
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