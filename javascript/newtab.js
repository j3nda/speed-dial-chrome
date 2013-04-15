// Adds a new bookmark to chrome, and displays it on the speed dial
function addBookmark(title, url) {
    if (title.length == 0 || url.length == 0)
        return

    // Chrome won't create bookmarks without HTTP
    if (url.indexOf("http") != 0)
        url = 'http://' + url;

//    chrome.bookmarks.create({'parentId': $("#dial").attr('name').toString(), 'title': title, 'url': url}, function() {});

    var folder_id  = localStorage['folder'];
    var dfolder_id = localStorage['default_folder_id'];
        if (dfolder_id != undefined || dfolder_id > 1) {
            folder_id = dfolder_id;
        }
    chrome.bookmarks.create({'parentId': folder_id, 'title': title, 'url': url}, function() {});
}

// Adds a bookmark onto the speed dial. Takes a chrome bookmark node object.
function addSpeedDialEntry(bookmark) {
    if (bookmark.hasOwnProperty('url')) {
        var title = bookmark.title;
        var url = bookmark.url;

        // Format the URL as needed
        if (localStorage['force_http'] == 'true') {
            url = url.replace('https', 'http');
        }

        $("#dial").append(
            '<li>' +
                '<div id="' + bookmark.id + '" class="entry" name="' + title +'" index="' + bookmark.index + '">' +
                    '<a href="' + url + '" class="bookmark">' +
                        '<img id="' + bookmark.id + '_thumb" src="' + localStorage['thumbnail_url'].replace('[URL]', url) + '" />' +
                        '<p id="' + bookmark.id + '_edit" class="edit">&nbsp;</p>' +
                        '<p id="' + bookmark.id + '_title" class="title">' + title + '</p>' +
                        '<p id="' + bookmark.id + '_remove" class="remove">&nbsp;</p>' +
                    '</a>' +
                '</div>' +
            '</li>'
        );
    }

    $('#' + bookmark.id + '_edit').bind('click', function() {
        editBookmark(bookmark.id);
        return false;
    });

    $('#' + bookmark.id + '_remove').bind('click', function() {
        removeBookmark(bookmark.id);
        return false;
    });

    scaleEntry(bookmark.id, $('#entry_height').val(), $('#entry_width').val());

    $("#new_entry").appendTo($('#dial'));
    $('.popbox').popbox();
}

// Creates all global event handles users by the speed dial
function createEventHandlers() {
    $('#new_entry').bind('click', function() {
        if (!$('#new_entry_title').is(":focus") && !$('#new_entry_url').is(":focus")) {
            $('#new_entry_title').val("");
            $('#new_entry_url').val("");
            $('#new_entry_title').focus();
        }
    });

    $('#new_entry_title,#new_entry_url').bind('keypress', function(event) {
        if (event.keyCode == 13) {
            var title = $('#new_entry_title').val();
            var url = $('#new_entry_url').val();
            addBookmark(title, url);
            $('.box').fadeOut("fast"); // Close the popup window
        }
    });

    chrome.bookmarks.onRemoved.addListener(function(id, info) {
        removeSpeedDialEntry(id);
    });

    chrome.bookmarks.onCreated.addListener(function(id, bookmark) {
        if (bookmark.parentId == $('#dial').attr('name')) {
            addSpeedDialEntry(bookmark);
            scaleSpeedDial();
        }
    });

    /*chrome.bookmarks.onMoved.addListener(function(id, moveInfo) {
        var folderId = $('#dial').attr('name');

        if (moveInfo.parentId != moveInfo.oldParentId) {
            if (moveInfo.parentId == folderId) {
                chrome.bookmarks.get(id, function(bookmark) {
                    addSpeedDialEntry(bookmark[0]);
                    scaleSpeedDial();
                });
            } else if (moveInfo.parentId != folderId) {
                removeSpeedDialEntry(id);
            }
        }
    });*/
}

/* Retrieve the bookmarks bar node and use it to generate speed dials */
function createSpeedDial(folderId) {
    $(".entry").each(function() {
        if ($(this).attr('id') != 'new_entry')
            $(this).remove();
    });

    chrome.bookmarks.getSubTree(folderId, function(node) {
        var folder = {'folderId': folderId, 'folderName': node[0].title, 'folderNode': node[0]}
        parseBookmarksFolder(folder);
    });
}

// Ensure all localStorage parameters are defined
function defaultStorage(name, value) {
    if (localStorage[name] == null || localStorage[name] == undefined)
        localStorage[name] = value;
}

function generateFolderList() {
    var folderList = new Array();
    var openList = new Array();

    chrome.bookmarks.getTree(function(rootNode) {
        for (index in rootNode[0].children) {
            openList.push(rootNode[0].children[index]);
        }

        var node = openList.pop();

        while (node != null) {
            if (!node.hasOwnProperty('url')) {
                var hasBookmarks = false;

                if (node.path == undefined || node.parentId == "0")
                    node.path = "";

                node.path += node.title

                for (child in node.children) {
                    if (node.children[child].hasOwnProperty('url'))
                        hasBookmarks = true;

                    node.children[child].path = node.path + '/';
                    openList.push(node.children[child]);
                }

                if (hasBookmarks) {
                    folderList.push(node);
                }
            }

            node = openList.pop();
        }

        folderList.sort(function (a, b) {
            var aName = a.path.toLowerCase();
            var bName = b.path.toLowerCase();
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        });


        var folder_id  = localStorage['folder'];
        var dfolder_id = localStorage['default_folder_id'];
            if (dfolder_id != undefined || dfolder_id > 1) {
                folder_id = dfolder_id;
            }

        for (index in folderList) {
            if (folderList[index].id == folder_id) { //folderList[index].path.toLowerCase() == 'bookmarks bar') {
                selected = ' selected="selected"';

            } else {
                selected = '';
            }

            $("#folder_list").append('<option' + selected + ' value="' + folderList[index].id + '">' + folderList[index].path + '</option>');
        }
    });
}

function editBookmark(id) {

}

// Defaults the local storage options
function initialise() {
    defaultStorage('columns', 6);
    defaultStorage('folder', "1");
    defaultStorage('force_http', 'true');
    defaultStorage('new_entry', 'block');
    defaultStorage('show_advanced', 'true');
    defaultStorage('show_folder_list', 'auto');
    defaultStorage('default_folder_index', 0);
    defaultStorage('thumbnail_url', 'http://immediatenet.com/t/l?Size=1024x768&URL=[URL]');
    defaultStorage('width', 70);
}

/* Creates actual HTML elements from passed folders */
function parseBookmarksFolder(folder) {
    $("#dial").attr('name', folder.folderId);
    $('#new_entry').css('display', localStorage["new_entry"]);
    $('#folder_list').css('display', localStorage['show_folder_list']);

    for (index in folder.folderNode.children) {
        addSpeedDialEntry(folder.folderNode.children[index])
    }

    createEventHandlers();
    scaleSpeedDial();
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
function scaleEntry(id, entryHeight, entryWidth) {
    var entry = $('#' + id);
    var title = entry.attr('name');
    var titleLimit = parseInt(entryWidth / 9);  // The 9 is entirely arbitrary, found through trial and error

    if (title != null && title != undefined && title.length > titleLimit)
        title = title.substring(0, titleLimit - 3) + '...';

    entry.css('height', entryHeight);
    entry.css('min-width', entryWidth);
    entry.css('width', entryWidth);

    $('#' + id + "_thumb").css('height', entryHeight - 25);
    $('#' + id + "_title").text(title);
}

// Scales the entire speed dial to match settings
function scaleSpeedDial() {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    var columns = parseInt(localStorage["columns"]);
    var width = parseInt(localStorage['width']);

    var pageWidth = parseInt((windowWidth / 100) * width);
    var entryWidth = parseInt((pageWidth / columns) - 26); // 26 = margin + borders
    var entryHeight = parseInt(entryWidth * 0.75);

    $('#dial').css('width', pageWidth + "px");
    $("#entry_height").val(entryHeight);
    $("#entry_width").val(entryWidth);

    // Scale the entries
    $('.entry').each(function(index) {
        scaleEntry($(this).attr('id'), entryHeight, entryWidth);
    });
}

// Writes the positions of all bookmarks back to
function updateBookmarkPositions() {
    var parentId = $("#dial").attr('name');

    $(".entry").not("#new_entry").each(function(index) {
        if (parseInt($(this).attr('index')) != index) {
            chrome.bookmarks.move($(this).attr('id'), {'parentId': parentId, 'index': index});
            $(this).attr('index', index);
        }
    });
}

/* Load settings and pass on parameters for creating entries */
$(document).ready(function() {
    initialise();
    generateFolderList();
//    createSpeedDial(localStorage['folder']);

    var folder_id  = localStorage['folder'];
    var dfolder_id = localStorage['default_folder_id'];
        if (dfolder_id != undefined || dfolder_id > 1) {
            folder_id = dfolder_id;
            // TODO: if dfolder_id isn't in folder_list then put back to '1' (~folder_list)
        }
    createSpeedDial(folder_id);


    $(window).resize(function(){
        scaleSpeedDial();
    });

    $("#folder_list").bind('change', function() {
        createSpeedDial($("#folder_list option:selected").val());
    });

    $("#dial").dragsort({
        dragEnd: updateBookmarkPositions,
        placeHolderTemplate: '<li><div class="entry"></div></li>',
        dragSelectorExclude: '#new_entry'
    });
});
