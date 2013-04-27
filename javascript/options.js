/*
* Manages user selected options
*/


// Repopulate form with previously selected options
function restoreOptions() {
	$('#default_folder_id').val(localStorage["default_folder_id"]);
	$('#dial_columns').val(localStorage["dial_columns"]);
	$('#dial_width').val(localStorage["dial_width"]);
	$('#force_http').attr('checked', (localStorage["force_http"] == 'true'));
	$('#new_entry').attr('checked', (localStorage["new_entry"] == 'block'));
	$('#show_advanced').attr('checked', (localStorage["show_advanced"] == 'true'));
	$('#show_folder_list').attr('checked', (localStorage["show_folder_list"] == 'auto'));
	$('#thumbnail_url').val(localStorage["thumbnail_url"]);
}

// Saves value of checkbox to local storage
function saveCheckbox(name, checked, unchecked) {
	localStorage[name] = ($('#' + name).is(':checked') ? checked : unchecked);
}

// Write selected options back to local storage
function saveOptions() {
	localStorage["default_folder_id"] = $('#folder_list :selected').val();
	localStorage["dial_columns"] = $('#dial_columns :selected').val();
	localStorage["dial_width"] = $('#dial_width :selected').val();
	saveCheckbox('force_http', 'true', 'false');
	saveCheckbox('new_entry', 'block', 'none');
	saveCheckbox('show_advanced', 'true', 'false');
	saveCheckbox('show_folder_list', 'auto', 'none');
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
		$('#advanced').css('display', ($(this).is(':checked') ? 'inline' : 'none'));
	});

	$('#advanced').css('display', (localStorage['show_advanced'] == 'true' ? 'inline' : 'none'));
});

