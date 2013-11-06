// Restore settings from chrome.storage.sync API
function restoreFromSync() {
	chrome.storage.sync.get(null, function (all) {
		JSON.parse(JSON.stringify(all),function(key,value){
			if (key) {
				localStorage.setItem(key,value);
			}
		});
	});
}

// Sync settings to chrome.storage.sync API
function syncToStorage() {
	var settings_object = {};
	JSON.parse(JSON.stringify(localStorage),function(key,value){
		if (key) {
			settings_object[key] = value;
		}
	});
	chrome.storage.sync.set(settings_object);
}

// Listen for sync events and update from synced data
if (localStorage.getItem("enable_sync") === "true") {
	chrome.storage.onChanged.addListener(function(changes, sync) {
		restoreFromSync();
		setTimeout(function() { location.reload(); }, 100);
	});
}
