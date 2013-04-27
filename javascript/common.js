/*
* Shared functions between newtab and options
*/

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

				if (node.path === undefined || node.parentId == "0")
					node.path = "";

				node.path += node.title;

				for (var child in node.children) {
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
			if (dfolder_id !== undefined || dfolder_id > 1) {
				folder_id = dfolder_id;
			}

		for (var item in folderList) {
			selected = (folderList[item].id == folder_id) ? ' selected="selected"' : '';
			$("#folder_list").append('<option' + selected + ' value="' + folderList[item].id + '">' + folderList[item].path + '</option>');
		}
	});
}

// Defaults the local storage options
function initialise() {
	defaultStorage('default_folder_id', 1);
	defaultStorage('dial_columns', 6);
	defaultStorage('dial_width', 90);
	defaultStorage('force_http', 'true');
	defaultStorage('folder', "1");
	defaultStorage('new_entry', 'block');
	defaultStorage('show_advanced', 'false');
	defaultStorage('show_folder_list', 'auto');
	defaultStorage('thumbnail_url', 'http://immediatenet.com/t/l?Size=1024x768&URL=[URL]');
}
