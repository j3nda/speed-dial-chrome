function addNewEntryButton() {
	$("#dial").append('<div class="entry" id="new_entry" title="Add New"><div><i class="foundicon-plus"></i></div></div>');
	$("#new_entry").on("click", function() {
		showBookmarkEntryForm("New Bookmark or Folder", "", "", "");
	});
	scaleSpeedDialEntry($("#new_entry"));
}

function addSpeedDialEntry(bookmark) {
	if (bookmark.hasOwnProperty("title") && bookmark.hasOwnProperty("url")) {
		$("#dial").append('<div class="entry" id="' + bookmark.id + '">' +
							'<a class="bookmark" href="' + bookmark.url + '" title="' + bookmark.title + '">' +
								'<div class="image"></div>' +
								'<table class="details"><tbody><tr>' +
								'<td class="edit" title="Edit"><span class="foundicon-edit"></span></td>' +
								'<td class="title">' + bookmark.title + '</td>' +
								'<td class="remove" title="Remove"><div class="foundicon-remove"></div></td>' +
								'</tr></tbody></table>' +
							'</a>' +
						'</div>');

		var entry = $("#" + bookmark.id);
		entry.find(".image").css("background-image", "url(" + getThumbnailUrl(bookmark) + ")");
		entry.find(".edit").on("click", function(event) {
			event.preventDefault();
			showBookmarkEntryForm("Edit Bookmark: " + bookmark.title, bookmark.title, bookmark.url, bookmark.id);
		});
		entry.find(".remove").on("click", function(event) {
			event.preventDefault();
			if (confirm("Are you sure you want to remove this bookmark?")) {
				removeBookmark(bookmark.id);
				var old_url = entry.find(".bookmark").attr("href");
				updateCustomIcon("", old_url);
			}
		});

		//If custom icon for the URL exists, evaluates to true & centers it on the dial
		if (JSON.parse(localStorage.getItem("custom_icon_data"))[bookmark.url]) {
			entry.find(".image").css({
				"background-size": "contain",
				"background-position": "center"
			});
		}

		scaleSpeedDialEntry(entry);

	} else if (bookmark.hasOwnProperty("children") && localStorage.getItem("show_subfolder_icons") === "true") {
		$("#dial").append('<div class="entry" id="' + bookmark.id + '">' +
							'<a class="bookmark" href="newtab.html#' + bookmark.id + '" title="' + bookmark.title + '" >' +
								'<div class="image"><span class="foldericon foundicon-folder"></span></div>' +
								'<table class="details"><tbody><tr>' +
									'<td class="edit" title="Edit"><span class="foundicon-edit"></span></td>' +
									'<td class="title"><div>' + bookmark.title + '</div></td>' +
									'<td class="remove" title="Remove"><div class="foundicon-remove"></div></td></tr></tbody>' +
								'</table>' +
							'</a>' +
						'</div>');

		entry = $("#" + bookmark.id);
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

		scaleSpeedDialEntry(entry);
	}
}

// Figures out how big the dial and its elements should be
// Needs to be called before the dial and entries are created
function calculateSpeedDialSize() {
	var dialColumns = localStorage.getItem("dial_columns");
	var dialWidth = localStorage.getItem("dial_width");

	var borderWidth = 14;
	var minEntryWidth = 120 - borderWidth;
	var adjustedDialWidth = window.innerWidth * 0.01 * dialWidth |0;

	var entryWidth = adjustedDialWidth / dialColumns - borderWidth;
	if (entryWidth < minEntryWidth) {
		entryWidth = minEntryWidth;
		adjustedDialWidth = (adjustedDialWidth / (minEntryWidth + borderWidth)) * (minEntryWidth + borderWidth);
	}
	$("#dial").css("width", adjustedDialWidth|0 +"px");
	$("#dial").attr("entry-width", entryWidth|0)
}

/* Retrieve the bookmarks bar node and use it to generate speed dials */
function createSpeedDial(folderId) {
	// Removes all entries under the current view and sets the new folderId
	$("#dial").attr("folder", folderId).html("");
	calculateSpeedDialSize();

	chrome.bookmarks.getSubTree(folderId, function(node) {
		var folder = {
			"folderId": folderId,
			"folderName": node[0].title,
			"folderNode": node[0]
		};

		// Loop over bookmarks in folder and add to the dial
		for (var i = 0; i < folder.folderNode.children.length; i++) {
			addSpeedDialEntry(folder.folderNode.children[i]);
		}

		// Adds the + button to the dom only if enabled
		if (localStorage.getItem("show_new_entry") === "true") {
			addNewEntryButton();
		}

		// Show the options gear icon only if enabled and doesn't already exist
		if (localStorage.getItem("show_options_gear") === "true" && $("#options").length === 0) {
			$("#content").append('<div id="options"><a class="foundicon-settings" href="options.html" title="Options"></a></div>');
		}

		if (localStorage.getItem("drag_and_drop") === "true") {
			$("#dial").sortable({
				distance: 20,
				forcePlaceholderSize: true,
				cursor: "move",
				containment: "document",
				tolerance: "pointer",
				items: "> div:not(#new_entry)",
				stop: function() {
					updateBookmarksOrder()
				}
			});
		}
		alignVertical();
	});
}

function getThumbnailUrl(bookmark) {
	if (JSON.parse(localStorage.getItem("custom_icon_data"))[bookmark.url]) {
		return JSON.parse(localStorage.getItem("custom_icon_data"))[bookmark.url];
	} else {
		if (localStorage.getItem("force_http") === "true") {
			bookmark.url = bookmark.url.replace("https", "http");
		}
		return localStorage.getItem("thumbnailing_service").replace("[URL]", bookmark.url);
	}
}

// Scales a single speed dial entry to the specified size
function scaleSpeedDialEntry(entry) {
	var entryWidth = $("#dial").attr("entry-width");
	var entryHeight = entryWidth*0.75|0;

	entry.css({"height": entryHeight +"px", "width": entryWidth +"px"});

	if (entry[0].id !== "new_entry") {
		var title = entry.find(".bookmark").attr("title");
		var titleLimit = entryWidth / 10;
		if (title.length > titleLimit) {
			title = title.substr(0, titleLimit - 3) + "...";
		}
		entry.find(".title").text(title);
		entry.find(".image").css("height", entryHeight - 20 +"px");
	}

	entry.find(".foundicon-folder").css({ "font-size": entryWidth*0.5|0 +"px", "top": entryWidth*0.05|0 +"px" });
	entry.find(".foundicon-plus").css({ "font-size": entryWidth*0.3|0 +"px", "top": entryWidth*0.18|0 +"px" });
}

function showBookmarkEntryForm(heading, title, url, target) {
	var form = $("#bookmark_form");

	form.find("h1").text(heading);
	form.find(".title").val(title);
	form.find(".url").val(url);
	form.find(".icon").val(JSON.parse(localStorage.getItem("custom_icon_data"))[url]);
	form.attr("target", target);

	// Selectors to hide URL & custom icon fields when editing a folder name
	if (!$("h1").text().indexOf("Edit Folder")){
		form.find("p").eq(1).hide();
		form.find("p").eq(2).hide();
	}
	// Selectors to hide the cusom icon field when adding a new entry
	if (!$("h1").text().indexOf("New")) {
		form.find("p").eq(2).hide()
	}

	form.reveal();
	form.find(".title").focus();
	form.on("reveal:close", function() {
		$("p").show();
	});
}

function updateCustomIcon(url, old_url) {
	var icon_object = JSON.parse(localStorage.getItem("custom_icon_data"));
	var custom_icon = $(".icon").val();

	//Creates a new key:value pair and merges it into JSON from localStorage
	var new_icon = {};
	new_icon[url] = custom_icon;
	var temp_object = $.extend(icon_object, new_icon);

	//Makes sure thumbnail URL changes along with the bookmark URL
	if (url !== old_url) {
		delete temp_object[old_url];
	}

	//Removes empty URL entries from localStorag
	if (custom_icon.trim().length === 0 || url.trim().length === 0) {
		delete temp_object[url];
		delete temp_object[old_url];
	}

	localStorage.setItem("custom_icon_data", JSON.stringify(temp_object));
	if (localStorage.getItem("enable_sync") === "true") {
		syncToStorage();
	}
	createSpeedDial(getStartingFolder());
}

function updateSpeedDialEntry(bookmark) {
	var entry = $("#" + bookmark.id);

	entry.find(".bookmark").attr("href", bookmark.url);
	entry.find(".bookmark").attr("title", bookmark.title);
	entry.find(".title").text(bookmark.title);
}

function alignVertical() {
	$("#dial").css("padding-top", "");
	if (localStorage.getItem("show_folder_list") === "true") {
		$("#dial").css("padding-top", ((window.innerHeight - $("#dial").height())/2)-50|0  + "px");
	} else {
		$("#dial").css("padding-top",  (window.innerHeight - $("#dial").height())/2|0 + "px");
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
		var target = $("#bookmark_form").attr("target");
		var title = $("#bookmark_form .title").val();
		var url = $("#bookmark_form .url").val();

		if (target.length > 0) {
			updateBookmark(target, title, url);
		} else {
			addBookmark(title, url);
		}
	});

	// Navigates to the entry corresponding to the single digit number between 1-9
	$(window).on("keypress", function(e) {
		// Prevents navigation while typing numbers in #bookmark_form input fields
		if (document.activeElement.type !== "text") {
			var key = String.fromCharCode(e.which);
			if (key >= 1 && key <= 9) {
				if ($('.bookmark').eq(key-1).size() !== 0) {
					window.location = $('.bookmark').eq(key-1).attr("href");
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
		$(".entry").each(function() {
			scaleSpeedDialEntry($(this));
		});
		alignVertical();
	});

	// Change the current dial if the page hash changes
	$(window).on("hashchange", function() {
		var newFolder = getStartingFolder();
		createSpeedDial(newFolder);
		$("#folder_list").val(newFolder);
	});

	// Load the .css that refrences the .woff font file asynchronously in an ajax request, halves render speed of dial
	$.ajax({ success: function() {
		$("head").append('<link type="text/css" rel="stylesheet" href="css/general_foundicons.css" />');
	}});
});
