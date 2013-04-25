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
	defaultStorage('show_advanced', 'false');
	defaultStorage('show_folder_list', 'auto');
	defaultStorage('default_folder_id', 1);
	defaultStorage('thumbnail_url', 'http://immediatenet.com/t/l?Size=1024x768&URL=[URL]');
	defaultStorage('width', 70);
}


// Repopulate form with previously selected options
function restoreOptions() {
	$('#columns').val(localStorage["columns"]);
	$('#force_http').attr('checked', (localStorage["force_http"] == 'true'));
	$('#new_entry').attr('checked', (localStorage["new_entry"] == 'block'));
	$('#show_advanced').attr('checked', (localStorage["show_advanced"] == 'true'));
	$('#show_folder_list').attr('checked', (localStorage["show_folder_list"] == 'auto'));
	$('#default_folder_id').val(localStorage["default_folder_id"]);
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
	localStorage["default_folder_id"] = $('#default_folder_id').val();
	localStorage["thumbnail_url"] = $('#thumbnail_url').val();
	localStorage["width"] = $('#width :selected').val();

	// Direct back to the tab page to see new options in action
	window.location = "newtab.html"
}


function generateFolderList() {
	var folderList = new Array();
	var openList = new Array();

	chrome.bookmarks.getTree(function(rootNode) {
		for (index in rootNode[0].children) {
			openList.push(rootNode[0].children[index]);
		}

		var node = openList.pop();

		while (node != null) {
			if (!node.hasOwnProperty('url')) {
				var hasBookmarks = false;

				if (node.path == undefined || node.parentId == "0")
					node.path = "";

				node.path += node.title

				for (child in node.children) {
					if (node.children[child].hasOwnProperty('url'))
						hasBookmarks = true;

					node.children[child].path = node.path + '/';
					openList.push(node.children[child]);
				}

				if (hasBookmarks) {
					folderList.push(node);
				}
			}

			node = openList.pop();
		}

		folderList.sort(function (a, b) {
			var aName = a.path.toLowerCase();
			var bName = b.path.toLowerCase();
			return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
		});

		var folder_id  = localStorage['folder'];
		var dfolder_id = localStorage['default_folder_id'];
			if (dfolder_id != undefined || dfolder_id > 1) {
				folder_id = dfolder_id;
			}

		for (index in folderList) {
			if (folderList[index].id == folder_id) { //folderList[index].path.toLowerCase() == 'bookmarks bar') {
				selected = ' selected="selected"';

			} else {
				selected = '';
			}

			$("#default_folder_list").append('<option' + selected + ' value="' + folderList[index].id + '">' + folderList[index].path + '</option>');
		}
	});
}


$(document).ready(function() {
	initialise();
	restoreOptions();
	generateFolderList();

	$("#save").bind("click", function() {
		saveOptions();
	});

	$("#default_folder_list").bind('change', function() {
		$('#default_folder_id').val($(this).val());
	});

	$("#show_advanced").bind('change', function() {
		$('#advanced').css('display', ($(this).is(':checked') ? 'inline' : 'none'));
	});

	$('#advanced').css('display', (localStorage['show_advanced'] == 'true' ? 'inline' : 'none'));
});

