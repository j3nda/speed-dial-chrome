// Repopulate form with previously selected options
function restoreOptions() {
	$('#default_folder_id').val(localStorage["default_folder_id"]);
	$('#dial_columns').val(localStorage["dial_columns"]);
	$('#dial_width').val(localStorage["dial_width"]);
	$('#background_color').val(localStorage["background_color"]);
	$('#force_http').attr('checked', (localStorage["force_http"] == 'true'));
	$('#drag_and_drop').attr('checked', (localStorage["drag_and_drop"] == 'true'));
	$('#show_advanced').attr('checked', (localStorage["show_advanced"] == 'true'));
	$('#show_new_entry').attr('checked', (localStorage["show_new_entry"] == 'true'));
	$('#show_folder_list').attr('checked', (localStorage["show_folder_list"] == 'true'));
	$('#show_subfolder_icons').attr('checked', (localStorage["show_subfolder_icons"] == 'true'));
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
	localStorage["background_color"] = $('#background_color').val();
	saveCheckbox('drag_and_drop');
	saveCheckbox('force_http');
	saveCheckbox('show_advanced');
	saveCheckbox('show_new_entry');
	saveCheckbox('show_folder_list');
	saveCheckbox('show_subfolder_icons');
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
	
    $("#background_color").bind('change', function() {
        $("body").css("background-color",$("#background_color").val());
    });
    
	$("#show_advanced").bind('change', function() {
		if ($(this).is(':checked')) {
			$('#advanced').show();
		} else {
			$('#advanced').hide();
		}
	});

	loadSetting($('#advanced'), localStorage['show_advanced']);
});

