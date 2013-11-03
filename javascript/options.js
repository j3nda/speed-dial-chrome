// Repopulate form with previously selected options
function restoreOptions() {
	$("#background_color").val(localStorage.getItem("background_color"));
	$("#default_folder_id").val(localStorage.getItem("default_folder_id"));
	$("#dial_columns").val(localStorage.getItem("dial_columns"));
	$("#dial_width").val(localStorage.getItem("dial_width"));
	$("#force_http").prop("checked", (localStorage.getItem("force_http") === "true"));
	$("#drag_and_drop").prop("checked", (localStorage.getItem("drag_and_drop") === "true"));
	$("#show_advanced").prop("checked", (localStorage.getItem("show_advanced") === "true"));
	$("#show_new_entry").prop("checked", (localStorage.getItem("show_new_entry") === "true"));
	$("#show_folder_list").prop("checked", (localStorage.getItem("show_folder_list") === "true"));
	$("#show_subfolder_icons").prop("checked", (localStorage.getItem("show_subfolder_icons") === "true"));
	$("#folder_color").val(localStorage.getItem("folder_color"));
	$("#immediatenet_url").val(localStorage.getItem("immediatenet_url"));
}

// Saves value of checkbox to local storage
function saveCheckbox(name) {
	localStorage.setItem(name, ($("#" + name).prop("checked") ? "true" : "false"));
}

// Write selected options back to local storage
function saveOptions() {
	localStorage.setItem("background_color", $("#background_color").val());
	localStorage.setItem("default_folder_id", $("#folder_list option:selected").val());
	localStorage.setItem("dial_columns", $("#dial_columns option:selected").val());
	localStorage.setItem("dial_width", $("#dial_width option:selected").val());
	saveCheckbox("drag_and_drop");
	saveCheckbox("force_http");
	saveCheckbox("show_advanced");
	saveCheckbox("show_new_entry");
	saveCheckbox("show_folder_list");
	saveCheckbox("show_subfolder_icons");
	localStorage.setItem("folder_color", $("#folder_color").val());
	localStorage.setItem("icon_urls", JSON.stringify(JSON.parse($("textarea").val())));
	localStorage.setItem("immediatenet_url", $("#immediatenet_url").val());

	window.location = "newtab.html";
}

$(document).ready(function() {
	initialise();
	restoreOptions();
	generateFolderList();

	$("#save").bind("click", function() {
		saveOptions();
	});

	$("#background_color").bind("change", function() {
		$("body").css("background-color", $("#background_color").val());
	});

	if ($("#show_subfolder_icons").prop("checked")) {
		$(".folder_color_row").show();
	} else {
		$(".folder_color_row").hide();
	}
	$("#show_subfolder_icons").bind("click", function() {
		$(".folder_color_row").toggle();
	});

	$("#show_advanced").bind("change", function() {
		if ($(this).prop("checked")) {
			$("#advanced").show();
		} else {
			$("#advanced").hide();
		}
	});

	$("textarea").val(localStorage.getItem("icon_urls"));
	$("textarea").keydown(function (event) {
		var keypressed = event.keyCode || event.which;
		if (keypressed === 13) {
			saveOptions();
			alert("Settings saved!");
		}
	});

	loadSetting($("#advanced"), localStorage.getItem("show_advanced"));
});

