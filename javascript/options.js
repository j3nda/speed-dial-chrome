// Repopulate form with previously selected options
function restoreOptions() {
	$('#default_folder_id').val(localStorage["default_folder_id"]);
	$('#dial_columns').val(localStorage["dial_columns"]);
	$('#dial_width').val(localStorage["dial_width"]);
	$('#force_http').attr('checked', (localStorage["force_http"] == 'true'));
	$('#show_advanced').attr('checked', (localStorage["show_advanced"] == 'true'));
	$('#show_new_entry').attr('checked', (localStorage["show_new_entry"] == 'true'));
	$('#show_folder_list').attr('checked', (localStorage["show_folder_list"] == 'true'));
	$('#thumbnail_url').val(localStorage["thumbnail_url"]);
}

// Saves value of checkbox to local storage
function saveCheckbox(name) {
	localStorage[name] = ($('#' + name).is(':checked') ? 'true' : 'false');
}

// Write selected options back to local storage
function saveOptions() {
	localStorage["default_folder_id"] = $('#folder_list :selected').val();
	localStorage["dial_columns"] = $('#dial_columns :selected').val();
	localStorage["dial_width"] = $('#dial_width :selected').val();
	saveCheckbox('force_http');
	saveCheckbox('show_advanced');
	saveCheckbox('show_new_entry');
	saveCheckbox('show_folder_list');
	localStorage["thumbnail_url"] = $('#thumbnail_url').val();

	window.location = "newtab.html";
}

$(document).ready(function() {
	initialise();
	restoreOptions();
	generateFolderList();

	$("#save").bind("click", function() {
		saveOptions();
	});

	$("#show_advanced").bind('change', function() {
		if ($(this).is(':checked')) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});

	loadSetting($('#advanced'), localStorage['show_advanced']);
});

