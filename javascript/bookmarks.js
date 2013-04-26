/*
* Manipulations of chrome's bookmark storage
*/


// Adds a new bookmark to chrome, and displays it on the speed dial
function addBookmark(title, url) {
	if (title.length === 0 || url.length === 0)
		return;

	// Chrome won't create bookmarks without HTTP
	if (url.indexOf("http") !== 0)
		url = 'http://' + url;

	var folder_id  = localStorage['folder'];
	var dfolder_id = localStorage['default_folder_id'];

	if (dfolder_id !== undefined || dfolder_id > 1) {
		folder_id = dfolder_id;
	}

	chrome.bookmarks.create({'parentId': folder_id, 'title': title, 'url': url}, function() {});
}

// Deletes a bookmarks and removes it from the speed dial
function removeBookmark(id) {
	chrome.bookmarks.remove(id, function() {
		removeSpeedDialEntry(id);
	});
}
