function addNewEntryButton(entryArray) {
	var newEntry = $('<div class="entry" id="new_entry" title="Add New"><div><span class="foundicon-plus"></span></div></div>');
	newEntry.on("click", function() {
		showBookmarkEntryForm("New Bookmark or Folder", "", "", "new_entry");
	});
	entryArray.push(newEntry);
}

function addSpeedDialEntry(bookmark, entryArray) {
	if (bookmark.url !== undefined) {
		var entry = $('<div id="' + bookmark.id + '" class="entry">' +
						'<a class="bookmark" href="' + bookmark.url + '" title="' + bookmark.title + '">' +
							'<div class="image"></div>' +
							'<table class="details"><tbody><tr>' +
								'<td class="edit" title="Edit"><span class="foundicon-edit"></span></td>' +
								'<td class="title">' + bookmark.title + '</td>' +
								'<td class="remove" title="Remove"><span class="foundicon-remove"></span></td></tr></tbody>' +
							'</table>' +
						'</a>' +
					'</div>');

		entry.find(".image").css("background-image", "url(" + getThumbnailUrl(bookmark) + ")");
		entry.find(".edit").on("click", function(event) {
			event.preventDefault();
			showBookmarkEntryForm("Edit Bookmark: " + bookmark.title, bookmark.title, bookmark.url, bookmark.id);
		});
		entry.find(".remove").on("click", function(event) {
			event.preventDefault();
			if (confirm("Are you sure you want to remove this bookmark?")) {
				removeBookmark(bookmark);
			}
		});

		//If custom icon for the URL exists, evaluates to true & centers it on the dial
		if (JSON.parse(localStorage.getItem("custom_icon_data"))[bookmark.url]) {
			entry.find(".image").css({ "background-size": "contain", "background-position": "center" });
		}

		entryArray.push(entry);
	}

	if (bookmark.children !== undefined && localStorage.getItem("show_subfolder_icons") === "true") {
		var entry = $('<div class="entry" id="' + bookmark.id + '">' +
						'<a class="bookmark" href="newtab.html#' + bookmark.id + '" title="' + bookmark.title + '" >' +
							'<div class="image"><span class="foundicon-folder"></span></div>' +
							'<table class="details"><tbody><tr>' +
								'<td class="edit" title="Edit"><span class="foundicon-edit"></span></td>' +
								'<td class="title"><div>' + bookmark.title + '</div></td>' +
								'<td class="remove" title="Remove"><span class="foundicon-remove"></span></td></tr></tbody>' +
							'</table>' +
						'</a>' +
					'</div>');

		entry.find(".edit").on("click", function(event) {
			event.preventDefault();
			showBookmarkEntryForm("Edit Folder: " + bookmark.title, bookmark.title, bookmark.url, bookmark.id);
		});
		entry.find(".remove").on("click", function(event) {
			event.preventDefault();
			if (confirm("Are you sure you want to remove this folder including all of it's bookmarks?")) {
				removeFolder(bookmark.id);
			}
		});

		entry.find(".foundicon-folder").css("color", localStorage.getItem("folder_color"));

		entryArray.push(entry);
	}
}

// Figures out how big the dial and its elements should be
// Needs to be called before the dial and entries are created
function calculateSpeedDialSize() {
	var dialColumns = localStorage.getItem("dial_columns");
	var dialWidth = localStorage.getItem("dial_width");

	var borderWidth = 14;
	var minEntryWidth = 120 - borderWidth;
	var adjustedDialWidth = window.innerWidth * (dialWidth / 100);
	var entryWidth = adjustedDialWidth / dialColumns - borderWidth;

	if (entryWidth < minEntryWidth) {
		entryWidth = minEntryWidth;
		adjustedDialWidth = (adjustedDialWidth / (minEntryWidth + borderWidth)) * (minEntryWidth + borderWidth);
	}
	$("#dial").prop("entryWidth", entryWidth|0).css("width", adjustedDialWidth|0);
}

/* Retrieve the bookmarks bar node and use it to generate speed dials */
function createSpeedDial(folderId) {
	// sets the new folderId and removes all entries before populating new view
	$("#dial").prop("folderId", folderId).find(".entry").remove();
	calculateSpeedDialSize();

	chrome.bookmarks.getSubTree(folderId, function(node) {
		// Loop over bookmarks in folder and add to the dial
		var entryArray = [];
		(node[0].children).forEach(function(dial) {
			addSpeedDialEntry(dial, entryArray);
		});

		// Adds the + button to the dom only if enabled
		if (localStorage.getItem("show_new_entry") === "true") {
			addNewEntryButton(entryArray);
		}

		scaleSpeedDialEntries(entryArray); // scale all entries once before adding to the dial
		$("#dial").html(entryArray); // Batch add all the entries to the dial at once
		alignVertical();

		// Show the options gear icon only if enabled and doesn't already exist
		if (localStorage.getItem("show_options_gear") === "true" && $("#options").children().length === 0) {
			$("#options").append($("<a>").prop({"className":"foundicon-settings", "href":"options.html", "title":"Options"}));
		}

		if (localStorage.getItem("drag_and_drop") === "true") {
			$("#dial").sortable({
				distance: 20,
				forcePlaceholderSize: true,
				cursor: "move",
				containment: "document",
				tolerance: "pointer",
				items: ".entry:not(#new_entry)",
				stop: function() {
					updateBookmarksOrder();
				}
			});
		}
	});
}

function getThumbnailUrl(bookmark) {
	if (JSON.parse(localStorage.getItem("custom_icon_data"))[bookmark.url]) {
		return JSON.parse(localStorage.getItem("custom_icon_data"))[bookmark.url];
	}
	if (localStorage.getItem("force_http") === "true") {
		bookmark.url = bookmark.url.replace("https", "http");
	}
	return localStorage.getItem("thumbnailing_service").replace("[URL]", bookmark.url);
}

// Scales a single speed dial entry to the specified size
function scaleSpeedDialEntries(entryArray) {
	var entryWidth = $("#dial").prop("entryWidth");
	var entryHeight = entryWidth*0.75|0;

	entryArray.forEach(function(entry) {
		var current = $(entry);
		current.css({ "height": entryHeight, "width": entryWidth });
		// 50 = width of edit + delete buttons(18px each) + 14 (size of fixed size boarderWidth)
		current.find(".title").css("max-width", entryWidth - 50);
		current.find(".image").css("height", entryHeight - 20);
		current.find(".foundicon-folder").css({ "font-size": entryWidth*0.5|0, "top": entryWidth*0.05|0 });
		current.find(".foundicon-plus").css({ "font-size": entryWidth*0.3|0, "top": entryWidth*0.18|0 });
	});
}

function showBookmarkEntryForm(heading, title, url, target) {
	var form = $("#bookmark_form");

	form.find("h1").text(heading);
	form.find(".title").prop("value", title);
	form.find(".url").prop("value", url);
	// Must clear parsed .icon property before setting it, .val seemed to hide it
	form.find(".icon").prop("value", "").prop("value", JSON.parse(localStorage.getItem("custom_icon_data"))[url]);
	form.prop("target", target);

	// Selectors to hide URL & custom icon fields when editing a folder name
	if (form.find("h1").text().indexOf("Edit Folder") > -1) {
		form.find("p").eq(1).hide();
		form.find("p").eq(2).hide();
	}
	// Selectors to hide the cusom icon field when adding a new entry
	if (form.find("h1").text().indexOf("New") > -1) {
		form.find("p").eq(2).hide();
	}

	form.reveal();
	form.find(".title").focus();
	form.on("reveal:close", function() {
		form.find("p").show();
	});
}

function updateCustomIcon(url, old_url) {
	var icon_object = JSON.parse(localStorage.getItem("custom_icon_data"));
	var icon_url = $("#bookmark_form .icon").prop("value").trim();

	if (url !== old_url) {
		delete icon_object[old_url];
	} // Makes sure thumbnail URL changes along with the bookmark

	if (icon_url.length === 0 || url.trim().length === 0) {
		delete icon_object[url];
		delete icon_object[old_url];
	} // Cleans out any empty entries from localStorage

	icon_object[url] = icon_url;

	localStorage.setItem("custom_icon_data", JSON.stringify(icon_object));
	if (localStorage.getItem("enable_sync") === "true") {
		syncToStorage();
	}
	createSpeedDial(getStartingFolder());
}

function alignVertical() {
	var dial = $("#dial");
	dial.css("padding-top", "");
	if (localStorage.getItem("show_folder_list") === "true") {
		dial.css("padding-top", ((window.innerHeight - dial.height())/2)-50|0);
	} else {
		dial.css("padding-top", (window.innerHeight - dial.height())/2|0);
	}
}

document.addEventListener("DOMContentLoaded", function() {
	initialize();
	createSpeedDial(getStartingFolder());

	$("#bookmark_form .title, #bookmark_form .url, #bookmark_form .icon").on("keydown", function(e) {
		if (e.which === 13) {
			$("#bookmark_form button").trigger("click");
		}
	});

	$("#bookmark_form button").on("click", function() {
		var target = $("#bookmark_form").prop("target");
		var title = $("#bookmark_form .title").prop("value").trim();
		var url = $("#bookmark_form .url").prop("value").trim();

		if (target === "new_entry") {
			addBookmark(title, url);
		} else {
			updateBookmark(target, title, url);
		}
	});

	// Navigates to the entry corresponding to the single digit number between 1-9
	$(document.body).on("keypress", function(e) {
		// Prevents navigation while typing numbers in #bookmark_form input fields
		if (document.activeElement.type !== "text") {
			var key = String.fromCharCode(e.which);
			if (key >= 1 && key <= 9) {
				if ($('.bookmark').eq(key-1).length !== 0) {
					window.location = $('.bookmark').get(key-1).href;
				}
			}
			// Navigates to options page when letter "o"(options) or "s"(settings) is pressed.
			if (key === "o" || key === "s") {
				window.location = "options.html";
			}
		}
	});

	$(window).on("resize", function() {
		calculateSpeedDialSize();
		scaleSpeedDialEntries($(".entry").toArray());
		alignVertical();
	});

	// Change the current dial if the page hash changes
	$(window).on("hashchange", function() {
		createSpeedDial(getStartingFolder());
	});

	// Load the .css that refrences the .woff font file asynchronously in an ajax request, halves render speed of dial
	$.ajax({ success: function() {
		$("head").append('<link type="text/css" rel="stylesheet" href="css/general_foundicons.css" />');
	}});
});
