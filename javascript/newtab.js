function addNewEntryButton() {
	entryHtml =	'<div class="entry"  id="new_entry">' +
						'<div>&nbsp;</div>' +
					'</div>';

	$("#dial").append(entryHtml);

	$("#new_entry").click(function() {
		showBookmarkEntryForm('New Bookmark', '', '', '');
	});

	scaleSpeedDialEntry($('#new_entry'));
}

function addSpeedDialEntry(bookmark) {
	if (bookmark.hasOwnProperty('title') && bookmark.hasOwnProperty('url')) {
		$("#dial").append(getEntryHtml(bookmark));
		var entry = $('#' + bookmark.id);

		entry.find('.edit').click(function(event) {
			event.preventDefault();
			showBookmarkEntryForm('Edit Bookmark: ' + bookmark.title, bookmark.title, bookmark.url, bookmark.id);
		});

		entry.find('.remove').click(function(event) {
			event.preventDefault();

			if (confirm("Are you sure you want to remove this bookmark?")) {
				removeBookmark(bookmark.id);
			}
		});

		scaleSpeedDialEntry(entry);
		$("#new_entry").appendTo($('#dial'));  // Keep the new entry button at the end of the dial
	}
	else if (bookmark.hasOwnProperty('children') && localStorage['show_subfolder_icons']=='true') {
		entryHtml =	'<div class="entry" id="' + bookmark.id + '">' +
						'<a class="bookmark" href="newtab.html#' + bookmark.id + '" title="' + bookmark.title + '" >' +
							'<div class="imgwrapper"><span class="foldericon foundicon-folder"></span></div>' +
							'<table class="details">' +
								'<tr>' +
									'<td class="edit" title="Edit">&nbsp;<span class="foundicon-edit"></span></td>' +
									'<td class="title"><div>' + bookmark.title + '</div></td>' +
									'<td class="remove" title="Remove"><div class="foundicon-remove"></div>&nbsp;</td>' +
								'</tr>' +
							'</div>' +
						'</a>' +
					'</div>';
		$("#dial").append(entryHtml);
		var entry = $('#' + bookmark.id);
		scaleSpeedDialEntry(entry);
		$("#new_entry").appendTo($('#dial'));  // Keep the new entry button at the end of the dial

	}
}

// Figures out how big the dial and its elements should be
// Needs to be called before the dial and entries are created
function calculateSpeedDialSize() {
	var dialColumns = parseInt(localStorage["dial_columns"]);
	var dialWidth = parseInt(localStorage['dial_width']);

	var borderWidth = 14;
	var minDialWidth = 120 * dialColumns;
	var minEntryWidth = 120 - borderWidth;

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

/* Retrieve the bookmarks bar node and use it to generate speed dials */
function createSpeedDial(folderId) {
	clearSpeedDial();

	chrome.bookmarks.getSubTree(folderId, function(node) {
		var folder = {'folderId': folderId, 'folderName': node[0].title, 'folderNode': node[0]};

		calculateSpeedDialSize();
		addNewEntryButton();

		$("#dial").attr('folder', folderId);
		loadSetting($('#new_entry'), localStorage['show_new_entry'])
		loadSetting($('#folder_list'), localStorage['show_folder_list'])

		for ( var index in folder.folderNode.children) {
			addSpeedDialEntry(folder.folderNode.children[index]);
		}

		if (localStorage['drag_and_drop'] == 'true') {
			// distance 20 - dont drag the bookmark until the cursor has moved 20 pixels
			// forcePlaceHolderSize true - make a placeholder between the bookmarks when dragging
			// containment parent - dont let the user drag a bookmark out of the container
			// tolerance pointer - move the dragged bookmark to the spot under the cursor
			// items "> div:not(.new_entry)" - drag all objects on the top level exept for new_entry
			$("#dial").sortable({distance:20, forcePlaceholderSize: true, containment: "parent",tolerance: "pointer",items: "> div:not(#new_entry)", stop:function(evebt,ui) {updateBookmarksOrder()} });
		}
	});
}

// Gets the HTML of the entry to be inserted into the dial
function getEntryHtml(bookmark) {
	entryHtml =	'<div class="entry" id="' + bookmark.id + '">' +
						'<a class="bookmark" href="' + bookmark.url + '" title="' + bookmark.title + '" >' +
							'<div class="imgwrapper"><img src="'+ getThumbnailUrl(bookmark.url) + '" /></div>' +
							'<table class="details">' +
								'<tr>' +
									'<td class="edit" title="Edit">&nbsp;<span class="foundicon-edit"></span></td>' +
									'<td class="title"><div>' + bookmark.title + '</div></td>' +
									'<td class="remove" title="Remove"><div class="foundicon-remove"></div>&nbsp;</td>' +
								'</tr>' +
							'</div>' +
						'</a>' +
					'</div>';

	return entryHtml;
}

function getThumbnailUrl(url) {
	if (localStorage['force_http'] == 'true') {
		url = url.replace('https', 'http');
	}

	return localStorage['thumbnail_url'].replace('[URL]', url);
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
		var title = entry.find('.bookmark').attr('title');
		var titleLimit = entryWidth / 10;

		if (title.length > titleLimit) {
			title = title.substr(0, titleLimit - 3) + '...';
		}

		entry.find('.imgwrapper').css('height', entryHeight - captionHeight);
		entry.find('.title').text(title);
	}
}

function showBookmarkEntryForm(heading, title, url, target) {
	var form = $('#bookmark_form');
	form.find('h1').text(heading);
	form.find('.title').val(title);
	form.find('.url').val(url);
	form.find('.target').val(target);
	form.reveal({
		animation: 'fade',
	 	animationspeed: 100
	 });

	form.find('.title').focus();
}

function updateSpeedDialEntry(bookmark) {
	var entry = $('#' + bookmark.id);

	entry.find('img').attr('src', getThumbnailUrl(bookmark.url));
	entry.find('.bookmark').attr('href', bookmark.url);
	entry.find('.bookmark').attr('title', bookmark.title);
	entry.find('.title').text(bookmark.title);

	entry.find('.edit').unbind('click');
	entry.find('.edit').click(function() {
		openReveal('Edit Bookmark: ' + bookmark.title, bookmark.title, bookmark.url, bookmark.id);
		return false;
	});
}

$(document).ready(function() {
	initialise();
	generateFolderList();
	createSpeedDial(getStartingFolder());

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
		window.location.hash = $("#folder_list option:selected").val() ;
	});

	$(window).resize(function() {
		calculateSpeedDialSize();

		$('.entry').each(function(index) {
			scaleSpeedDialEntry($(this));
		});
	});

	// Change the current dial if the page hash changes
	$(window).bind("hashchange",function(event) {
		setCurrentFolder(getStartingFolder());
	});
});

// Draws the new Dial and changes the selector menu
function setCurrentFolder(folder_id) {
	createSpeedDial(folder_id);
	document.getElementById("folder_list").value = folder_id;
}