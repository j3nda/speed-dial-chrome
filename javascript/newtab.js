/*
* Generation and maintenence of the speed dial interface
*/


// Adds a bookmark onto the speed dial. Takes a chrome bookmark node object.
function addSpeedDialEntry(bookmark) {
	if (bookmark.hasOwnProperty('url')) {
		$("#dial").append(getEntryHtml(bookmark));

		$('#' + bookmark.id + '_edit').bind('click', function() {
			editBookmark(bookmark.id);
			return false;
		});

		$('#' + bookmark.id + '_remove').bind('click', function() {
			if (confirm("Are you sure you want to remove this dial?")) {
				removeBookmark(bookmark.id);
			}
			return false;
		});

		// User Interface effects)
		$('#' + bookmark.id + '_title').mouseover(function() {
			$('#' + bookmark.id + '_edit'  ).addClass('controls');
			$('#' + bookmark.id + '_remove').addClass('controls');
			return false;
		});

		$('#' + bookmark.id).mouseout(function() {
			$('#' + bookmark.id + '_edit'  ).removeClass('controls');
			$('#' + bookmark.id + '_remove').removeClass('controls');
			return false;
		});

		$('#' + bookmark.id + '_edit'  ).mouseover(function() { $('#' + bookmark.id + '_edit'  ).attr('title', "edit");    return false; });
		$('#' + bookmark.id + '_remove').mouseover(function() { $('#' + bookmark.id + '_remove').attr('title', "remove?"); return false; });
		$('#' + bookmark.id + '_title' ).mouseover(function() { $('#' + bookmark.id + '_title' ).attr('title', title);     return false; });
		$('#' + bookmark.id + '_edit'  ).mouseout(function() { $('#' + bookmark.id + '_edit'  ).attr('title', "");        return false; });
		$('#' + bookmark.id + '_remove').mouseout(function() { $('#' + bookmark.id + '_remove').attr('title', "");        return false; });

		$('#' + bookmark.id + '_title' ).mouseout(function() {
			$('#' + bookmark.id + '_title' ).attr('title', "");
			$('#' + bookmark.id + '_edit'  ).removeClass('controls');
			$('#' + bookmark.id + '_remove').removeClass('controls');
			return false;
		});

		scaleSpeedDialEntry($('#' + bookmark.id));
	}

	$("#new_entry").appendTo($('#dial'));  // Keep the new entry button at the end of the dial
}

function calculateScale() {
	var borderWidth = 14;

	var dialColumns = parseInt(localStorage["dial_columns"]);
	var dialWidth = parseInt(localStorage['dial_width']);

	var adjustedDialWidth = parseInt($(window).width() * 0.01 * dialWidth);
	var entryWidth = parseInt(adjustedDialWidth / dialColumns);
	var entryHeight = parseInt(entryWidth * 0.75);  // height = 3/4 width

	$('#dial').css('width', adjustedDialWidth);
	$('#entry_height').val(entryHeight - borderWidth);
	$('#entry_width').val(entryWidth - borderWidth);
}

// Removes all entries under the dial
function clearSpeedDial() {
	$(".entry").each(function() {
		if ($(this).attr('id') != 'new_entry') {
			$(this).remove();
		}
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

/* Retrieve the bookmarks bar node and use it to generate speed dials */
function createSpeedDial(folderId) {
	clearSpeedDial();

	chrome.bookmarks.getSubTree(folderId, function(node) {
		var folder = {'folderId': folderId, 'folderName': node[0].title, 'folderNode': node[0]};

		$("#dial").attr('name', folder.folderId);
		$('#folder_list').css('display', localStorage['show_folder_list']);  // Check options and make the folder list visible
		$('#new_entry').css('display', localStorage["new_entry"]);  // Check options and make the new entry button visible

		calculateScale();
		scaleSpeedDialEntry($('#new_entry'));

		for ( var index in folder.folderNode.children) {
			addSpeedDialEntry(folder.folderNode.children[index]);
		}

		createChromeEventHandlers();
	});
}

// Gets the HTML of the entry to be inserted into the dial
function getEntryHtml(bookmark) {
	var title   = bookmark.title;
	var url = bookmark.url;

	// Format the URL as needed
	if (localStorage['force_http'] == 'true') {
		url = url.replace('https', 'http');
	}

	entryHtml =	'<div class="entry" id="' + bookmark.id + '" index="' + bookmark.index + '">' +
						'<a href="' + url + '" class="bookmark">' +
							'<img src="' + localStorage['thumbnail_url'].replace('[URL]', url) + '" />' +
							'<div class="details">' +
								'<div id="' + bookmark.id + '_edit" class="edit">&nbsp;</div>' +
								'<div class="title">' + title + '</div>' +
								'<div id="' + bookmark.id + '_remove" class="remove">&nbsp;</div>' +
							'</div>' +
						'</a>' +
					'</div>';

	return entryHtml;
}

// Removes a bookmark entry from the speed dial
function removeSpeedDialEntry(id) {
	$('#' + id).remove();
}

// Scales a single speed dial entry to the specified size
function scaleSpeedDialEntry(entry) {
	var captionHeight = 25;

	var entryHeight = $('#entry_height').val();
	var entryWidth = $('#entry_width').val();

	entry.css('height', entryHeight);
	entry.css('min-width', entryWidth);
	entry.css('width', entryWidth);

	if (entry.attr('id') !== 'new_entry') {
		var title = entry.find('.title').text();
		entry.find('img').css('height', entryHeight - captionHeight);
		entry.find('.title').text(title);
	}
}

$(document).ready(function() {
	initialise();
	generateFolderList();

	var folder_id  = localStorage['folder'];
	var dfolder_id = localStorage['default_folder_id'];

	if (dfolder_id !== undefined || dfolder_id > 1) {
		folder_id = dfolder_id;

		try {
			chrome.bookmarks.get(folderId, function() {});
		} catch(e) {
			folder_id = '1';
		}
	}

	calculateScale();
	createSpeedDial(folder_id);

	$("#folder_list").bind('change', function() {
		createSpeedDial($("#folder_list option:selected").val());
	});

	$("#new_entry").click(function() {
		alert('hi!');
	});

	$(window).resize(function(){
		$('.entry').each(function(index) { scaleSpeedDialEntry($(this)); });
	});
});
