// Repopulate form with previously selected options
function restoreOptions() {
	$("#dial_columns").val(localStorage.getItem("dial_columns"));
	$("#dial_width").val(localStorage.getItem("dial_width"));
	$("#default_folder_id").val(localStorage.getItem("default_folder_id"));
	$("#background_color").val(localStorage.getItem("background_color"));
	$("#show_new_entry")[0].checked = localStorage.getItem("show_new_entry") === "true";
	$("#show_folder_list")[0].checked = localStorage.getItem("show_folder_list") === "true";
	$("#drag_and_drop")[0].checked = localStorage.getItem("drag_and_drop") === "true";
	$("#show_options_gear")[0].checked = localStorage.getItem("show_options_gear") === "true";
	$("#show_subfolder_icons")[0].checked = localStorage.getItem("show_subfolder_icons") === "true";
	$("#folder_color").val(localStorage.getItem("folder_color"));
	$("#enable_sync")[0].checked = localStorage.getItem("enable_sync") === "true";
	$("#show_advanced")[0].checked = localStorage.getItem("show_advanced") === "true";
	$("#force_http")[0].checked = localStorage.getItem("force_http") === "true";
	$("#thumbnailing_service").val(localStorage.getItem("thumbnailing_service"));
}

// Saves value of checkbox to local storage
function saveCheckbox(name) {
	localStorage.setItem(name, ($("#" + name)[0].checked ? "true" : "false"));
}

// Write selected options back to local storage
function saveOptions() {
	localStorage.setItem("background_color", $("#background_color").val());
	localStorage.setItem("default_folder_id", $("#folder_list").val());
	localStorage.setItem("dial_columns", $("#dial_columns").val());
	localStorage.setItem("dial_width", $("#dial_width").val());
	localStorage.setItem("folder_color", $("#folder_color").val());
	localStorage.setItem("icon_urls", JSON.stringify(JSON.parse($("textarea").val())));
	localStorage.setItem("thumbnailing_service", $("#thumbnailing_service").val());

	saveCheckbox("drag_and_drop");
	saveCheckbox("enable_sync");
	saveCheckbox("force_http");
	saveCheckbox("show_advanced");
	saveCheckbox("show_new_entry");
	saveCheckbox("show_folder_list");
	saveCheckbox("show_options_gear");
	saveCheckbox("show_subfolder_icons");

	if (localStorage.getItem("enable_sync") === "true") {
		syncToStorage();
	}

	window.location = "newtab.html";
}

document.addEventListener("DOMContentLoaded", function() {
	initialize();
	restoreOptions();
	generateFolderList();

	$("#save").click(function() {
		saveOptions();
	});
	$("#cancel").click(function() {
		window.location = "newtab.html";
	});

	// If the Esc key is pressed go back to the new tab page
	$("html").keyup(function(e) {
		if (e.which === 27) {
			window.location = "newtab.html";
		}
	});	

	$("#background_color").val(localStorage.getItem("background_color"));
	$("#background_color").on("change", function() {
		$("body").css("background-color", $("#background_color").val());
	});

	if (localStorage.getItem("show_advanced") === "true") {
		$("#advanced").show();
	}
	$("#show_advanced").click(function() {
		$("#advanced").toggle();
	});

	$("textarea").val(localStorage.getItem("icon_urls"));
	$("textarea").keydown(function (e) {
		if (e.which === 13) {
			saveOptions();
			alert("Settings saved!");
		}
	});

	$("#reset_to_default").click(function() {
		if (confirm("Are you sure you want to reset ALL values you have changed back to their defaults?")) {
			localStorage.clear();
			createDefaults();
			window.location.reload();
		}
	});
});
