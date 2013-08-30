/*
* Methods which interface with chrome's bookmark API
*/

// Adds a new bookmark to chrome, and displays it on the speed dial
function addBookmark(title, url) {
	var hash = buildBookmarkHash(title, url);

	if (hash !== undefined) {
		hash.parentId = $("#folder_list :selected").val();

		chrome.bookmarks.create(hash, function(result) {
			addSpeedDialEntry(result);
			generateFolderList();
			createSpeedDial(getStartingFolder());
		});
	} else {
		alert("- Adding a new Folder only requires a Title \n- Adding a new Bookmark requires both a Title and a URL");
	}
}

function buildBookmarkHash(title, url) {
	if (title.length === 0) {
		return undefined;
	}

	// Chrome won't create bookmarks without HTTP
	if (url.indexOf("http") !== 0 && url.length !== 0) {
		url = "http://" + url;
	}
	return {
		"title": title,
		"url": url
	};
}

// Deletes a bookmarks and removes it from the speed dial
function removeBookmark(id) {
	chrome.bookmarks.remove(id, function() {
		removeSpeedDialEntry(id);
	});
}

// Deletes an entire folder tree and removes it from the speed dial
function removeFolder(id) {
	chrome.bookmarks.removeTree(id, function() {
		removeSpeedDialEntry(id);
		generateFolderList();
	});
}

function updateBookmark(id, title, url) {
	var hash = buildBookmarkHash(title, url);

	if (hash !== undefined) {
		chrome.bookmarks.update(id, hash, function(result) {
			updateSpeedDialEntry(result);
		});
	} else {
		alert("Editing an existing Bookmark requires both a Title and a URL");
	}
}

function updateBookmarksOrder() {
	$("#new_entry").appendTo($("#dial")); // Keep the new entry button at the end of the dial
	$(".entry").not("#new_entry").each(function(index) {
		if (parseInt($(this).prop("index")) !== index) {
			chrome.bookmarks.move($(this).prop("id"), {
				"parentId": $("#dial").prop("folder"),
				"index": index
			});
			$(this).prop("index", index);
		}
	});
}
