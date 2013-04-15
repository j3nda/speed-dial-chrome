function defaultStorage(name, value) {
    if (localStorage[name] == null || localStorage[name] == undefined)
        localStorage[name] = value;
}

// Defaults the local storage options
function initialise() {
    defaultStorage('columns', 6);
    defaultStorage('force_http', 'true');
    defaultStorage('folder', "1");
    defaultStorage('new_entry', 'block');
    defaultStorage('show_advanced', 'true');
    defaultStorage('show_folder_list', 'auto');
    defaultStorage('thumbnail_url', 'http://immediatenet.com/t/l?Size=1024x768&URL=[URL]');
    defaultStorage('width', 70);
}

// Repopulate form with previously selected options
function restoreOptions() {
    $('#columns').val(localStorage["columns"])
    $('#force_http').attr('checked', (localStorage["force_http"] == 'true'));
    $('#new_entry').attr('checked', (localStorage["new_entry"] == 'block'));
    $('#show_advanced').attr('checked', (localStorage["show_advanced"] == 'true'));
    $('#show_folder_list').attr('checked', (localStorage["show_folder_list"] == 'auto'));
    $('#thumbnail_url').val(localStorage["thumbnail_url"]);
    $('#width').val(localStorage["width"]);
}

// Saves value of checkbox to local storage
function saveCheckbox(name, checked, unchecked) {
    localStorage[name] = ($('#' + name).is(':checked') ? checked : unchecked);
}

// Write selected options back to local storage
function saveOptions() {
    localStorage["columns"] = $('#columns :selected').val();
    saveCheckbox('force_http', 'true', 'false');
    saveCheckbox('new_entry', 'block', 'none');
    saveCheckbox('show_advanced', 'true', 'false');
    saveCheckbox('show_folder_list', 'auto', 'none');
    localStorage["thumbnail_url"] = $('#thumbnail_url').val();
    localStorage["width"] = $('#width :selected').val();

    // Direct back to the tab page to see new options in action
    window.location = "newtab.html"
}

$(document).ready(function() {
    initialise();
    restoreOptions();

    $("#save").bind("click", function() {
        saveOptions();
    });

    $("#show_advanced").bind('change', function() {
        $('#advanced').css('display', ($(this).is(':checked') ? 'inline' : 'none'));
    });

    $('#advanced').css('display', (localStorage['show_advanced'] == 'true' ? 'inline' : 'none'));
});


