// Repopulate form with previously selected options
function restoreOptions() {
	$("#background_color")[0].value = localStorage.getItem("background_color");
	$("#custom_icon_data")[0].value = localStorage.getItem("custom_icon_data");
	$("#folder_list")[0].value = localStorage.getItem("default_folder_id");
	$("#dial_columns")[0].value = localStorage.getItem("dial_columns");
	$("#dial_width")[0].value = localStorage.getItem("dial_width");
	$("#drag_and_drop")[0].checked = localStorage.getItem("drag_and_drop") === "true";
	$("#enable_sync")[0].checked = localStorage.getItem("enable_sync") === "true";
	$("#folder_color")[0].value = localStorage.getItem("folder_color");
	$("#force_http")[0].checked = localStorage.getItem("force_http") === "true";
	$("#show_advanced")[0].checked = localStorage.getItem("show_advanced") === "true";
	$("#show_folder_list")[0].checked = localStorage.getItem("show_folder_list") === "true";
	$("#show_new_entry")[0].checked = localStorage.getItem("show_new_entry") === "true";
	$("#show_options_gear")[0].checked = localStorage.getItem("show_options_gear") === "true";
	$("#show_subfolder_icons")[0].checked = localStorage.getItem("show_subfolder_icons") === "true";
	$("#thumbnailing_service")[0].value = localStorage.getItem("thumbnailing_service");
}

// Write selected options back to local storage
function saveOptions() {
	localStorage.setItem("background_color", $("#background_color")[0].value);
	localStorage.setItem("custom_icon_data", JSON.stringify(JSON.parse($("#custom_icon_data")[0].value)));
	localStorage.setItem("default_folder_id", $("#folder_list")[0].value);
	localStorage.setItem("dial_columns", $("#dial_columns")[0].value);
	localStorage.setItem("dial_width", $("#dial_width")[0].value);
	localStorage.setItem("drag_and_drop", $("#drag_and_drop")[0].checked);
	localStorage.setItem("enable_sync", $("#enable_sync")[0].checked);
	localStorage.setItem("folder_color", $("#folder_color")[0].value);
	localStorage.setItem("force_http", $("#force_http")[0].checked);
	localStorage.setItem("show_advanced", $("#show_advanced")[0].checked);
	localStorage.setItem("show_folder_list", $("#show_folder_list")[0].checked);
	localStorage.setItem("show_new_entry", $("#show_new_entry")[0].checked);
	localStorage.setItem("show_options_gear", $("#show_options_gear")[0].checked);
	localStorage.setItem("show_subfolder_icons", $("#show_subfolder_icons")[0].checked);
	localStorage.setItem("thumbnailing_service", $("#thumbnailing_service")[0].value);

	if (localStorage.getItem("enable_sync") === "true") {
		syncToStorage();
	}

	window.location = "newtab.html";
}

document.addEventListener("DOMContentLoaded", function() {
	initialize();
	restoreOptions();

	$("#save").on("click", function() {
		try { // Just validate and make sure everything is good to save
			JSON.parse($("#custom_icon_data").val());
			saveOptions();
		} catch (e) {
			alert("The JSON you entered is not valid, try again.\nThe error message was: " + e);
		}
	});
	$("#cancel").on("click", function() {
		window.location = "newtab.html";
	});

	// If the Esc key is pressed go back to the new tab page
	$(document.body).on("keyup", function(e) {
		if (e.which === 27) {
			window.location = "newtab.html";
		}
	});

	$("#background_color").on("change", function() {
		$("body").css("background-color", $("#background_color").val());
	});

	$("#enable_sync").on("click", function() {
		if (this.checked) {
			chrome.storage.sync.getBytesInUse(null, function (bytes) {
				if (bytes > 0) {
					if (confirm("You have previously synchronized data!!\n"+
					"Do you want to overwrite your current local settings with your previously saved remote settings?")) {
						restoreFromSync();
					}
				}
			});
		}
	});

	if (localStorage.getItem("show_advanced") === "false") {
		$("#advanced").hide();
	}
	$("#show_advanced").on("click", function() {
		if (this.checked) {
			$("#advanced").show();
		} else {
			$("#advanced").hide();
		}
	});

	$("#custom_icon_data").on("keydown", function (e) {
		if (e.which === 13) {
			$("#save").trigger("click");
		}
	});

	$("#reset_local_settings").on("click", function() {
		if (confirm("Are you sure you want to reset all local values you have changed back to their defaults?")) {
			localStorage.clear();
			createDefaults();
			window.location.reload();
		}
	});

	$("#reset_synced_settings").on("click", function() {
		if (confirm("Are you sure you want to delete all previously synchronized data to start fresh?")) {
			chrome.storage.sync.clear();
		}
	});
});
