/*
* Generation and maintenence of the speed dial interface
*/

// Adds a new bookmark to chrome, and displays it on the speed dial
function addBookmark(title, url) {
	var hash = buildBookmarkHash(title, url);
	hash.parentId = $('#folder_list :selected').val();
	chrome.bookmarks.create(hash, function() {});
}

// Adds a bookmark onto the speed dial. Takes a chrome bookmark node object.
function addSpeedDialEntry(bookmark) {
	if (bookmark.hasOwnProperty('url')) {
		$("#dial").append(getEntryHtml(bookmark));
		var entry = $('#' + bookmark.id);

		entry.find('.edit').click(function() {
			openReveal('Edit Bookmark: ' + bookmark.title, bookmark.title, bookmark.url, bookmark.id);
			return false;
		});

		entry.find('.remove').click(function() {
			if (confirm("Are you sure you want to remove this bookmark?")) {
				removeBookmark(bookmark.id);
			}

			return false;
		});

		scaleSpeedDialEntry(entry);
	}

	$("#new_entry").appendTo($('#dial'));  // Keep the new entry button at the end of the dial
}

function buildBookmarkHash(title, url) {
	if (title.length === 0 || url.length === 0) {
		return;
	}

	// Chrome won't create bookmarks without HTTP
	if (url.indexOf("http") !== 0) {
		url = 'http://' + url;
	}

	return {'title': title, 'url': url};
}

function calculateScale() {
	var dialColumns = parseInt(localStorage["dial_columns"]);
	var dialWidth = parseInt(localStorage['dial_width']);

	var borderWidth = 14;
	var minDialWidth = 140 * dialColumns;
	var minEntryWidth = 140 - borderWidth;

	var adjustedDialWidth = parseInt($(window).width() * 0.01 * dialWidth);
	var entryWidth = parseInt(adjustedDialWidth / dialColumns - borderWidth);
	entryWidth = (entryWidth < minEntryWidth ? minEntryWidth : entryWidth);
	var entryHeight = parseInt(entryWidth * 0.75);  // height = 3/4 width

	$('#dial').css('min-width', minDialWidth);
	$('#dial').css('width', adjustedDialWidth);
	$('#entry_height').val(entryHeight);
	$('#entry_width').val(entryWidth);
}

// Removes all entries under the dial
function clearSpeedDial() {
	$(".entry").each(function() {
		$(this).remove();
	});
}

// Creates event handlers to respond to changes to Chromes bookmarks (which don't happen through the dial)
function createChromeEventHandlers() {
	chrome.bookmarks.onRemoved.addListener(function(id, info) {
		removeSpeedDialEntry(id);
	});

	chrome.bookmarks.onCreated.addListener(function(id, bookmark) {
		if (bookmark.parentId == $('#dial').attr('name')) {
			addSpeedDialEntry(bookmark);
		}
	});
}

function createNewEntryButton() {
	entryHtml =	'<div class="entry"  id="new_entry">' +
						'<div>&nbsp;</div>' +
					'</div>'

	$("#dial").append(entryHtml);

	$("#new_entry").click(function() {
		openReveal('New Bookmark', '', '', '');
	});
}

/* Retrieve the bookmarks bar node and use it to generate speed dials */
function createSpeedDial(folderId) {
	clearSpeedDial();
	createNewEntryButton();

	$("#dial").attr('name', folderId);
	$('#folder_list').css('display', localStorage['show_folder_list']);  // Check options and make the folder list visible
	$('#new_entry').css('display', localStorage["new_entry"]);  // Check options and make the new entry button visible

	chrome.bookmarks.getSubTree(folderId, function(node) {
		var folder = {'folderId': folderId, 'folderName': node[0].title, 'folderNode': node[0]};

		calculateScale();
		scaleSpeedDialEntry($('#new_entry'));

		for ( var index in folder.folderNode.children) {
			addSpeedDialEntry(folder.folderNode.children[index]);
		}

		createChromeEventHandlers();
	});

	$("#dial").dragsort({
		dragSelector: ".entry",
		dragSelectorExclude: '#new_entry',
        	dragEnd: updateBookmarksOrder,
        	placeHolderTemplate: '<div class="entry"></div>'
	});
}

function getDefaultFolder() {
	var folder_id = localStorage['folder'];
	var dfolder_id = localStorage['default_folder_id'];

	if (dfolder_id !== undefined || dfolder_id > 1) {
		folder_id = dfolder_id;

		try {
			chrome.bookmarks.get(folder_id, function() {});
		} catch(e) {
			folder_id = '1';
		}
	}

	return folder_id;
}

// Gets the HTML of the entry to be inserted into the dial
function getEntryHtml(bookmark) {
	var title   = bookmark.title;
	var url = bookmark.url;

	// Format the URL as needed
	if (localStorage['force_http'] == 'true') {
		url = url.replace('https', 'http');
	}

	entryHtml =	'<div class="entry" id="' + bookmark.id + '">' +
						'<a href="' + url + '" class="bookmark" alt="' + title + '">' +
							'<img src="' + getThumbnailUrl(url) + '" />' +
							'<table class="details">' +
								'<tr>' +
									'<td class="edit" title="Edit">&nbsp;</td>' +
									'<td class="title">' + title + '</td>' +
									'<td class="remove" title="Remove">&nbsp;</td>' +
								'</tr>' +
							'</div>' +
						'</a>' +
					'</div>';

	return entryHtml;
}

function getThumbnailUrl(url) {
	return localStorage['thumbnail_url'].replace('[URL]', url);
}

function openReveal(heading, title, url, target) {
	form = $('#bookmark_form');
	form.find('h1').text(heading);
	form.find('.title').val(title);
	form.find('.url').val(url);
	form.find('.target').val(target);
	form.reveal();

	form.find('.title').focus();
}

// Deletes a bookmarks and removes it from the speed dial
function removeBookmark(id) {
	chrome.bookmarks.remove(id, function() {
		removeSpeedDialEntry(id);
	});
}

// Removes a bookmark entry from the speed dial
function removeSpeedDialEntry(id) {
	$('#' + id).remove();
}

// Scales a single speed dial entry to the specified size
function scaleSpeedDialEntry(entry) {
	var captionHeight = 20;

	var entryHeight = $('#entry_height').val();
	var entryWidth = $('#entry_width').val();

	entry.css('height', entryHeight);
	entry.css('width', entryWidth);

	if (entry.attr('id') !== 'new_entry') {
		var title = entry.find('.bookmark').attr('alt');
		var titleLimit = entryWidth / 10;

		if (title.length > titleLimit) {
			title = title.substr(0, titleLimit - 3) + '...';
		}

		entry.find('img').css('height', entryHeight - captionHeight);
		entry.find('.title').text(title);
	}
}

function updateBookmark(id, title, url) {
	chrome.bookmarks.update(id, buildBookmarkHash(title, url), function() {
		$('#' + id).find('img').attr('src', getThumbnailUrl(url))
	});
}

function updateBookmarksOrder() {
	$("#new_entry").appendTo($('#dial'));  // Keep the new entry button at the end of the dial

	$(".entry").not("#new_entry").each(function(index) {
		if (parseInt($(this).attr('index')) != index) {
			chrome.bookmarks.move($(this).attr('id'), {'parentId': $("#dial").attr('name'), 'index': index});
			$(this).attr('index', index);
		}
	});
}

$(document).ready(function() {
	initialise();
	generateFolderList();
	createSpeedDial(getDefaultFolder());

	$('#bookmark_form .title, #bookmark_form .url').keyup(function(e) {
 		if (e.which === 13) {
 			$('#bookmark_form button').trigger('click');
 		}
	});

	$('#bookmark_form button').click(function () {
		var target = $('#bookmark_form .target').val();
		var title = $('#bookmark_form .title').val();
		var url = $('#bookmark_form .url').val();

		if (target.length > 0) {
			updateBookmark(target, title, url);
		} else {
			addBookmark(title, url);
		}
	});

	$("#folder_list").bind('change', function() {
		createSpeedDial($("#folder_list option:selected").val());
	});

	$(window).resize(function() {
		calculateScale();

		$('.entry').each(function(index) {
			scaleSpeedDialEntry($(this));
		});
	});
});
