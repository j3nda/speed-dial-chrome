// Restore settings from chrome.storage.sync API
function restoreFromSync() {
	chrome.storage.sync.get(null, function (sync_object) {
		Object.keys(sync_object).forEach(function(key) {
			localStorage.setItem(key, sync_object[key]);
		});
		window.location.reload();
	});
}

// Sync settings to chrome.storage.sync API
function syncToStorage() {
	var settings_object = {};
	Object.keys(localStorage).forEach(function(key) {
		settings_object[key] = localStorage[key];
	});
	chrome.storage.sync.set(settings_object);
}

// Listen for sync events and update from synchronized data
if (localStorage.getItem("enable_sync") === "true") {
	chrome.storage.onChanged.addListener(function() {
		restoreFromSync();
	});
}
