// Generates a list of all folders under chrome bookmarks
function generateFolderList() {
	if (localStorage.getItem("show_folder_list") === "true" || window.location.pathname === "/options.html") {
		var folderList = [];
		var openList = [];

		chrome.bookmarks.getTree(function(rootNode) {
			// Never more than 2 root nodes, push both Bookmarks Bar & Other Bookmarks into array
			openList.push(rootNode[0].children[0]);
			openList.push(rootNode[0].children[1]);

			var node = openList.pop();
			while (node !== undefined) {
				if (!node.hasOwnProperty("url")) {
					if (node.parentId === "0") {
						node.path = ""; // Root element, so it has no parent and we don't need to show the path
					}
					node.path += node.title;
					for (var child in node.children) {
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
				return a.path.localeCompare(b.path);
			});

			var folder_id = getStartingFolder();
			var folderListHtml = "";

			for (var item in folderList) {
				folderListHtml += '<option' + ' value="' + folderList[item].id + '">' + folderList[item].path + '</option>';
			}
			$("#folder_list").html(folderListHtml).val(folder_id).show();

			$("#folder_list").on("change", function() {
				window.location.hash = $("#folder_list").val();
			});
		});
	}
}

function getStartingFolder() {
	var folderId = localStorage.getItem("default_folder_id");

	// Allow the url to specify the folder as well
	if (window.location.hash !== "") {
		folderId = window.location.hash.substring(1);
	}

	return folderId;
}

// Create default localStorage values if they don't already exist
function createDefaults() {
	var default_values = {
		background_color: "#cccccc",
		custom_icon_data: "{}",
		default_folder_id: 1,
		dial_columns: 6,
		dial_width: 70,
		drag_and_drop: "true",
		enable_sync: "false",
		folder_color: "#888888",
		force_http: "true",
		show_advanced: "false",
		show_folder_list: "true",
		show_new_entry: "true",
		show_options_gear: "true",
		show_subfolder_icons: "true",
		thumbnailing_service: "http://immediatenet.com/t/l3?Size=1280x1024&URL=[URL]"
	}
	for (var name in default_values) {
		// Create and default a localStorage parameter if it doesn't already exist
		if (localStorage.getItem(name) === null) {
			localStorage.setItem(name, default_values[name]);
		}
	}
}

// Initialisation routines for all pages
function initialize() {
	createDefaults();
	document.body.style.backgroundColor = localStorage.getItem("background_color");
	generateFolderList();
}
