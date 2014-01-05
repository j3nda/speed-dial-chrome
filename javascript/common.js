// Generates a list of all folders under chrome bookmarks
function generateFolderList() {
	if (localStorage.getItem("show_folder_list") === "true" || window.location.pathname === "/options.html") {
		var folderList = [], openList = [], node, child;

		chrome.bookmarks.getTree(function(rootNode) {
			// Never more than 2 root nodes, push both Bookmarks Bar & Other Bookmarks into array
			openList.push(rootNode[0].children[0]);
			openList.push(rootNode[0].children[1]);

			while ((node = openList.pop()) !== undefined) {
				if (node.children !== undefined) {
					if (node.parentId === "0") {
						node.path = ""; // Root elements have no parent so we shouldn't show their path
					}
					node.path += node.title;
					while ((child = node.children.pop()) !== undefined) {
						if (child.children !== undefined) {
							child.path = node.path + "/";
							openList.push(child);
						}
					}
					folderList.push(node);
				}
			}

			folderList.sort(function(a, b) {
				return a.path.localeCompare(b.path);
			});

			var folderListHtml = $("<select>").prop({ "id": "folder_list" });
			folderList.forEach(function(item) {
				folderListHtml.append(new Option(item.path, item.id));
			});
			$("#folder").html(folderListHtml)
				.find("#folder_list").val(getStartingFolder()).on("change", function() {
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
		default_folder_id: "1",
		dial_columns: "6",
		dial_width: "70",
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
	};

	// Creates default localStorage values if they don't already exist
	Object.keys(default_values).forEach(function(name) {
		if (localStorage.getItem(name) === null) {
			localStorage.setItem(name, default_values[name]);
		}
	});
}

// Initialisation routines for all pages
function initialize() {
	createDefaults();
	document.body.style.backgroundColor = localStorage.getItem("background_color");
	generateFolderList();
}
