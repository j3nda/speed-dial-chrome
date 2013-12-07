function addNewEntryButton() {
	$("#dial").append('<div class="entry" id="new_entry" title="Add New"><div><i class="foundicon-plus"></i></div></div>');
	$("#new_entry").click(function() {
		showBookmarkEntryForm("New Bookmark or Folder", "", "", "");
	});
	scaleSpeedDialEntry($("#new_entry"));
}

function addSpeedDialEntry(bookmark, index) {
	if (bookmark.hasOwnProperty("title") && bookmark.hasOwnProperty("url")) {
		$("#dial").append('<div class="entry" id="' + bookmark.id + '">' +
							'<a class="bookmark" id="index_' + index + '" href="' + bookmark.url + '" title="' + bookmark.title + '">' +
								'<div class="imgwrapper"><div class="image" style="background-image:url(' + getThumbnailUrl(bookmark.url) + ')"></div></div>' +
								'<table class="details"><tbody><tr>' +
								'<td class="edit" title="Edit"><span class="foundicon-edit"></span></td>' +
								'<td class="title">' + bookmark.title + '</td>' +
								'<td class="remove" title="Remove"><div class="foundicon-remove"></div></td>' +
								'</tr></tbody></table>' +
							'</a>' +
						'</div>');

		var entry = $("#" + bookmark.id);
		entry.find(".edit").click(function(event) {
			event.preventDefault();
			showBookmarkEntryForm("Edit Bookmark: " + bookmark.title, bookmark.title, bookmark.url, bookmark.id);
		});
		entry.find(".remove").click(function(event) {
			event.preventDefault();
			if (confirm("Are you sure you want to remove this bookmark?")) {
				removeBookmark(bookmark.id);
				var old_url = entry.find(".bookmark").attr("href");
				updateCustomIcon("", old_url);
			}
		});

		//If custom icon for the URL exists, evaluates to true & centers it on the dial
		if (JSON.parse(localStorage.getItem("icon_urls"))[bookmark.url]) {
			entry.find(".image").css({
				"background-size": "contain",
				"background-position": "center"
			});
		}

		scaleSpeedDialEntry(entry);

		} else if (bookmark.hasOwnProperty("children") && localStorage.getItem("show_subfolder_icons") === "true") {
			$("#dial").append('<div class="entry" id="' + bookmark.id + '">' +
								'<a class="bookmark" id="index_' + index + '" href="newtab.html#' + bookmark.id + '" title="' + bookmark.title + '" >' +
									'<div class="imgwrapper"><span class="foldericon foundicon-folder"></span></div>' +
									'<table class="details"><tbody><tr>' +
										'<td class="edit" title="Edit"><span class="foundicon-edit"></span></td>' +
										'<td class="title"><div>' + bookmark.title + '</div></td>' +
										'<td class="remove" title="Remove"><div class="foundicon-remove"></div></td></tr></tbody>' +
									'</table>' +
								'</a>' +
							'</div>');

			entry = $("#" + bookmark.id);
			entry.find(".edit").click(function(event) {
				event.preventDefault();
				showBookmarkEntryForm("Edit Folder: " + bookmark.title, bookmark.title, bookmark.url, bookmark.id);
			});
			entry.find(".remove").click(function(event) {
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
	var adjustedDialWidth = window.innerWidth * 0.01 * dialWidth;

	var entryWidth = adjustedDialWidth / dialColumns - borderWidth;
	if (entryWidth < minEntryWidth) {
		entryWidth = minEntryWidth;
		adjustedDialWidth = (adjustedDialWidth / (minEntryWidth + borderWidth)) * (minEntryWidth + borderWidth);
	}
	var entryHeight = Math.floor(entryWidth*0.75); // height = 3/4 width
	$("#dial").css("width", adjustedDialWidth +"px");
	$("#entry_height").val(entryHeight);
	$("#entry_width").val(entryWidth);
}

/* Retrieve the bookmarks bar node and use it to generate speed dials */
function createSpeedDial(folderId) {
	// Removes all entries under the current view before displaying new folderId
	$("#dial").empty();

	chrome.bookmarks.getSubTree(folderId, function(node) {
		var folder = {
			"folderId": folderId,
			"folderName": node[0].title,
			"folderNode": node[0]
		};

		$("#dial").attr("folder", folderId);
		generateFolderList();
		calculateSpeedDialSize();

		// Loop over bookmarks in folder and add to the dial
		for (var i = 0; i < folder.folderNode.children.length; i++) {
			addSpeedDialEntry(folder.folderNode.children[i], i+1);
		}

		// Only adds the + button to the dom if enabled
		if (localStorage.getItem("show_new_entry") === "true") {
			addNewEntryButton();
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

function getThumbnailUrl(url) {
	if (JSON.parse(localStorage.getItem("icon_urls"))[url]) {
		return JSON.parse(localStorage.getItem("icon_urls"))[url];
	} else {
		if (localStorage.getItem("force_http") === "true") {
			url = url.replace("https", "http");
		}
		return localStorage.getItem("thumbnailing_service").replace("[URL]", url);
	}
}

// Scales a single speed dial entry to the specified size
function scaleSpeedDialEntry(entry) {
	var entryHeight = document.getElementById("entry_height").value;
	var entryWidth = document.getElementById("entry_width").value;

	entry.css({"height": entryHeight +"px", "width": entryWidth +"px"});

	if (entry.attr("id") !== "new_entry") {
		var title = entry.find(".bookmark").attr("title");
		var titleLimit = entryWidth / 10;
		if (title.length > titleLimit) {
			title = title.substr(0, titleLimit - 3) + "...";
		}
		entry.find(".imgwrapper").css("height", entryHeight - 20 +"px");
		entry.find(".title").text(title);
	}

	entry.find(".foundicon-folder").css({ "font-size": entryWidth*0.5 +"px", "top": entryWidth*0.05 +"px" });
	entry.find(".foundicon-plus").css({ "font-size": entryWidth*0.3 +"px", "top": entryWidth*0.18 +"px" });
}

function showBookmarkEntryForm(heading, title, url, target) {
	var form = $("#bookmark_form");

	form.find("h1").text(heading);
	form.find(".title").val(title);
	form.find(".url").val(url);
	form.find(".icon").val(JSON.parse(localStorage.getItem("icon_urls"))[url]);
	form.find(".target").val(target);

	//Selector to hide URL & custom icon fields when editing a folder name
	if (!$("h1").text().indexOf("Edit Folder")){
		$("h1").parent().find("p").eq(1).hide();
		$("h1").parent().find("p").eq(2).hide();
	}
	//Selector to hide the cusom icon field adding new entries
	if (!$("h1").text().indexOf("New")) { $("h1").parent().find("p").eq(2).hide() }

	form.reveal({ animation: "none" });

	form.find(".title").focus();
	$(".close-reveal-modal").click(function() {
		$("p").show();
	});
}

function updateCustomIcon(url, old_url) {
	var icon_object = JSON.parse(localStorage.getItem("icon_urls"));
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

	localStorage.setItem("icon_urls", JSON.stringify(temp_object));
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
	if (localStorage.getItem("show_folder_list") === "true") {
		$("#dial").css("padding", (Math.floor(($(window).height() - $("#dial").height())/2)-60) + "px 0px 0px");
	} else {
		$("#dial").css("padding", (Math.floor($(window).height() - $("#dial").height() - 20)/2) + "px 0px 0px");
	}
}

document.addEventListener("DOMContentLoaded", function() {
	initialize();
	createSpeedDial(getStartingFolder());

	$("#bookmark_form .title, #bookmark_form .url, #bookmark_form .icon").keyup(function(e) {
		if (e.which === 13) {
			$("#bookmark_form button").trigger("click");
		}
	});

	$("#bookmark_form button").click(function() {
		var target = $("#bookmark_form .target").val();
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
		var key = String.fromCharCode(e.which);
		if (key >= 1 && key <= 9) {
			if ($("#index_" + key).length !== 0) {
				window.location = $("#index_" + key).attr("href");
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
	$(window).on("hashchange", function(folderId) {
		setCurrentFolder(getStartingFolder());
	});
});
