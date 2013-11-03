// Create and default a localStorage parameter if it doesn't already exist
function defaultStorage(name, value) {
	if (localStorage.getItem(name) === null || localStorage.getItem(name) === undefined) {
		localStorage.setItem(name, value);
	}
}

// Generates a list of all folders under chrome bookmarks
function generateFolderList() {
	var folderList = [];
	var openList = [];

	chrome.bookmarks.getTree(function(rootNode) {
		var index = rootNode[0].children.length;
		while (index--) {
			openList.push(rootNode[0].children[index]);
		}

		var node = openList.pop();
		while (node !== null && node !== undefined) {
			if (!node.hasOwnProperty("url")) {
				if (node.path === undefined || node.parentId === "0") {
					node.path = ""; // Root element, so it has no parent and we don't need to show the path
				}
				node.path += node.title;
				var child = node.children.length;
				while (child--) {
					if (!node.children[child].hasOwnProperty("url")) {
						node.children[child].path = node.path + "/";
						openList.push(node.children[child]);
					}
				}
				folderList.push(node);
			}
			node = openList.pop();
		}

		folderList.sort(function(a, b) {
			return a.path.localeCompare(b.path)
		}).reverse();

		var folder_id = getStartingFolder();

		document.getElementById("folder_list").innerHTML = '<select id="folder_list"></select>';

		var html = "";
		var item = folderList.length;
		while (item--) {
			var selected = (folderList[item].id === folder_id) ? ' selected="selected"' : '';
			html += '<option' + selected + ' value="' + folderList[item].id + '">' + folderList[item].path + '</option>';
		}
		document.getElementById("folder_list").innerHTML = html;

		$("#folder_list").bind("change", function() {
			window.location.hash = $("#folder_list option:selected").val();
		});
	});
}

function getStartingFolder() {
	var folder_id = "1";
	var dfolder_id = localStorage.getItem("default_folder_id");

	if (dfolder_id !== undefined || dfolder_id > 1) {
		folder_id = dfolder_id;

		try {
			chrome.bookmarks.get(folder_id, function() {});
		} catch (e) {
			folder_id = "1";
		}
	}

	// Allow the url to specify the folder as well
	if (window.location.hash !== "") {
		folder_id = window.location.hash.substring(1);
	}

	return folder_id;
}

// Draws the new Dial and changes the selector menu
function setCurrentFolder(folder_id) {
	createSpeedDial(folder_id);
	$("folder_list").value = folder_id;
}

// Create default localStorage values on first run
function createDefaults() {
	defaultStorage("background_color", "#ccc");
	defaultStorage("default_folder_id", 1);
	defaultStorage("dial_columns", 6);
	defaultStorage("dial_width", 70);
	defaultStorage("force_http", "true");
	defaultStorage("drag_and_drop", "true");
	defaultStorage("show_advanced", "false");
	defaultStorage("show_new_entry", "true");
	defaultStorage("show_folder_list", "true");
	defaultStorage("show_subfolder_icons", "false");
	defaultStorage("folder_color", "#888");
	defaultStorage("icon_urls", "{}");
	defaultStorage("immediatenet_url", "http://immediatenet.com/t/l3?Size=1280x1024&URL=[URL]");
}

// Initialisation routines for all pages
function initialise() {
	if (localStorage.length === 0) {
		createDefaults();
	}
	$("body").css("background", localStorage.getItem("background_color"));
}

function loadSetting(element, setting) {
	if (setting === "true") {
		element.show();
	} else {
		element.hide();
	}
}
