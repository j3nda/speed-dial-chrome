// Create and default a localStorage parameter if it doesn't already exist
function defaultStorage(name, value) {
	if (localStorage[name] === null || localStorage[name] === undefined) {
		localStorage[name] = value;
	}
}

// Generates a list of all folders under chrome bookmarks
function generateFolderList() {
	var folderList = [];
	var openList = [];

	chrome.bookmarks.getTree(function(rootNode) {
		for (var index in rootNode[0].children) {
			openList.push(rootNode[0].children[index]);
		}

		var node = openList.pop();

		while (node !== null && node !== undefined) {
			if (!node.hasOwnProperty('url')) {
				var hasBookmarks = false;

				if (node.path === undefined || node.parentId == "0") {
					node.path = "";  // Root element, so it has no parent and we don't need to show the path
				}

				node.path += node.title;

				for (var child in node.children) {
					if (node.children[child].hasOwnProperty('url')) {
						hasBookmarks = true;
					}

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

		var folder_id  = getStartingFolder();

		for (var item in folderList) {
			selected = (folderList[item].id == folder_id) ? ' selected="selected"' : '';
			$("#folder_list").append('<option' + selected + ' value="' + folderList[item].id + '">' + folderList[item].path + '</option>');
		}
	});
}

function getStartingFolder() {
	var folder_id = '1';
	var dfolder_id = localStorage['default_folder_id'];

	if (dfolder_id !== undefined || dfolder_id > 1) {
		folder_id = dfolder_id;

		try {
			chrome.bookmarks.get(folder_id, function() {});
		} catch(e) {
			folder_id = '1';
		}
	}

	// Allow the url to specify the folder as well
	if (window.location.hash !== "") {
		folder_id = window.location.hash.substring(1);
	}

	return folder_id;
}

// Initialisation routines for all pages
function initialise() {
	defaultStorage('background_color', '#ccc');
	defaultStorage('default_folder_id', 1);
	defaultStorage('dial_columns', 6);
	defaultStorage('dial_width', 70);
	defaultStorage('force_http', 'true');
	defaultStorage('drag_and_drop', 'true');
	defaultStorage('show_advanced', 'false');
	defaultStorage('show_new_entry', 'true');
	defaultStorage('show_folder_list', 'true');
	defaultStorage('show_subfolder_icons', 'false');
	defaultStorage('thumbnail_url', 'http://immediatenet.com/t/l3?Size=1280x1024&URL=[URL]');
	$('body').css('background', localStorage["background_color"]);
}

function loadSetting(element, setting) {
	if (setting == 'true') {
		element.show();
	} else {
		element.hide();
	}
}
