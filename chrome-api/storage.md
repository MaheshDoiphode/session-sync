chrome.storage 

bookmark_border
Use the chrome.storage API to store, retrieve, and track changes to user data.

Permissions
storage
To use the storage API, declare the "storage" permission in the extension manifest. For example:


{
  "name": "My extension",
  ...
  "permissions": [
    "storage"
  ],
  ...
}
Concepts and usage
The Storage API provides an extension-specific way to persist user data and state. It's similar to the web platform's storage APIs (IndexedDB, and Storage), but was designed to meet the storage needs of extensions. The following are a few key features:

All extension contexts, including the extension service worker and content scripts have access to the Storage API.
The JSON serializable values are stored as object properties.
The Storage API is asynchronous with bulk read and write operations.
Even if the user clears the cache and browsing history, the data persists.
Stored settings persist even when using split incognito.
Includes an exclusive read-only managed storage area for enterprise policies.
Can extensions use web storage APIs?
While extensions can use the Storage interface (accessible from window.localStorage) in some contexts (popup and other HTML pages), we don't recommend it for the following reasons:

Extension service workers can't use the Web Storage API.
Content scripts share storage with the host page.
Data saved using the Web Storage API is lost when the user clears their browsing history.
To move data from web storage APIs to extension storage APIs from a service worker:

Prepare an offscreen document html page and script file. The script file should contain a conversion routine and an onMessage handler.
In the extension service worker, check chrome.storage for your data.
If your data isn't found, call createDocument().
After the returned Promise resolves, call sendMessage() to start the conversion routine.
Inside the offscreen document's onMessage handler, call the conversion routine.
There are also some nuances to how web storage APIs work in extensions. Learn more in the Storage and Cookies article.

Storage areas
The Storage API is divided into the following storage areas:

storage.local
Data is stored locally and cleared when the extension is removed. The storage limit is 10 MB (5 MB in Chrome 113 and earlier), but can be increased by requesting the "unlimitedStorage" permission. We recommend using storage.local to store larger amounts of data.
storage.managed
Managed storage is read-only storage for policy installed extensions and managed by system administrators using a developer-defined schema and enterprise policies. Policies are analogous to options but are configured by a system administrator instead of the user, allowing the extension to be preconfigured for all users of an organization. For information on policies, see Documentation for Administrators. To learn more about the managed storage area, see Manifest for storage areas.
storage.session
Holds data in memory while an extension is loaded. The storage is cleared if the extension is disabled, reloaded or updated and when the browser restarts. By default, it's not exposed to content scripts, but this behavior can be changed by setting chrome.storage.session.setAccessLevel(). The storage limit is 10 MB (1 MB in Chrome 111 and earlier). Thestorage.session interface is one of several we recommend for service workers.
storage.sync
If syncing is enabled, the data is synced to any Chrome browser that the user is logged into. If disabled, it behaves like storage.local. Chrome stores the data locally when the browser is offline and resumes syncing when it's back online. The quota limitation is approximately 100 KB, 8 KB per item. We recommend using storage.sync to preserve user settings across synced browsers. If you're working with sensitive user data, instead use storage.session.
Storage and throttling limits
The Storage API has the following usage limitations:

Storing data often comes with performance costs, and the API includes storage quotas. We recommend being careful about what data you store so that you don't lose the ability to store data.
Storage can take time to complete. Make sure to structure your code to account for that time.
For details on storage area limitations and what happens when they're exceeded, see the quota information for sync, local, and session.

Use cases
The following sections demonstrate common use cases for the Storage API.

Synchronous response to storage updates
To track changes made to storage, add a listener to its onChanged event. When anything changes in storage, that event fires. The sample code listens for these changes:

background.js:


chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});
We can take this idea even further. In this example, we have an options page that allows the user to toggle a "debug mode" (implementation not shown here). The options page immediately saves the new settings to storage.sync, and the service worker uses storage.onChanged to apply the setting as soon as possible.

options.html:

<!-- type="module" allows you to use top level await -->
<script defer src="options.js" type="module"></script>
<form id="optionsForm">
  <label for="debug">
    <input type="checkbox" name="debug" id="debug">
    Enable debug mode
  </label>
</form>
options.js:

// In-page cache of the user's options
const options = {};
const optionsForm = document.getElementById("optionsForm");

// Immediately persist options changes
optionsForm.debug.addEventListener("change", (event) => {
  options.debug = event.target.checked;
  chrome.storage.sync.set({ options });
});

// Initialize the form with the user's option settings
const data = await chrome.storage.sync.get("options");
Object.assign(options, data.options);
optionsForm.debug.checked = Boolean(options.debug);
background.js:

function setDebugMode() { /* ... */ }

// Watch for changes to the user's options & apply them
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.options?.newValue) {
    const debugMode = Boolean(changes.options.newValue.debug);
    console.log('enable debug mode?', debugMode);
    setDebugMode(debugMode);
  }
});
Asynchronous preload from storage
Because service workers don't run all the time, Manifest V3 extensions sometimes need to asynchronously load data from storage before they execute their event handlers. To do this, the following snippet uses an async action.onClicked event handler that waits for the storageCache global to be populated before executing its logic.

background.js:

// Where we will expose all the data we retrieve from storage.sync.
const storageCache = { count: 0 };
// Asynchronously retrieve data from storage.sync, then cache it.
const initStorageCache = chrome.storage.sync.get().then((items) => {
  // Copy the data retrieved from storage into storageCache.
  Object.assign(storageCache, items);
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await initStorageCache;
  } catch (e) {
    // Handle error that occurred during storage initialization.
  }

  // Normal action handler logic.
  storageCache.count++;
  storageCache.lastTabId = tab.id;
  chrome.storage.sync.set(storageCache);
});
DevTools
You can view and edit data stored using the API in DevTools. To learn more, see the View and edit extension storage page in the DevTools documentation.

Examples
The following samples demonstrate the local, sync, and session storage areas:

Local
Sync
Session
chrome.storage.local.set({ key: value }).then(() => {
  console.log("Value is set");
});

chrome.storage.local.get(["key"]).then((result) => {
  console.log("Value is " + result.key);
});
To see other demos of the Storage API, explore any of the following samples:

Global search extension.
Water alarm extension.
Types
AccessLevel
Chrome 102+
The storage area's access level.

Enum

"TRUSTED_CONTEXTS"
Specifies contexts originating from the extension itself.

"TRUSTED_AND_UNTRUSTED_CONTEXTS"
Specifies contexts originating from outside the extension.

StorageArea
Properties
onChanged
Event<functionvoidvoid>

Chrome 73+
Fired when one or more items change.

The onChanged.addListener function looks like:

(callback: function) => {...}
callback
function

The callback parameter looks like:

(changes: object) => void
changes
object

clear
void

Promise
Removes all items from storage.

The clear function looks like:

(callback?: function) => {...}
callback
function optional

The callback parameter looks like:

() => void
returns
Promise<void>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

get
void

Promise
Gets one or more items from storage.

The get function looks like:

(keys?: string | string[] | object, callback?: function) => {...}
keys
string | string[] | object optional

A single key to get, list of keys to get, or a dictionary specifying default values (see description of the object). An empty list or object will return an empty result object. Pass in null to get the entire contents of storage.

callback
function optional

The callback parameter looks like:

(items: object) => void
items
object

Object with items in their key-value mappings.

returns
Promise<object>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getBytesInUse
void

Promise
Gets the amount of space (in bytes) being used by one or more items.

The getBytesInUse function looks like:

(keys?: string | string[], callback?: function) => {...}
keys
string | string[] optional

A single key or list of keys to get the total usage for. An empty list will return 0. Pass in null to get the total usage of all of storage.

callback
function optional

The callback parameter looks like:

(bytesInUse: number) => void
bytesInUse
number

Amount of space being used in storage, in bytes.

returns
Promise<number>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getKeys
void

Promise Chrome 130+
Gets all keys from storage.

The getKeys function looks like:

(callback?: function) => {...}
callback
function optional

The callback parameter looks like:

(keys: string[]) => void
keys
string[]

Array with keys read from storage.

returns
Promise<string[]>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

remove
void

Promise
Removes one or more items from storage.

The remove function looks like:

(keys: string | string[], callback?: function) => {...}
keys
string | string[]

A single key or a list of keys for items to remove.

callback
function optional

The callback parameter looks like:

() => void
returns
Promise<void>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

set
void

Promise
Sets multiple items.

The set function looks like:

(items: object, callback?: function) => {...}
items
object

An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.

Primitive values such as numbers will serialize as expected. Values with a typeof "object" and "function" will typically serialize to {}, with the exception of Array (serializes as expected), Date, and Regex (serialize using their String representation).

callback
function optional

The callback parameter looks like:

() => void
returns
Promise<void>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

setAccessLevel
void

Promise Chrome 102+
Sets the desired access level for the storage area. The default will be only trusted contexts.

The setAccessLevel function looks like:

(accessOptions: object, callback?: function) => {...}
accessOptions
object

accessLevel
AccessLevel

The access level of the storage area.

callback
function optional

The callback parameter looks like:

() => void
returns
Promise<void>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

StorageChange
Properties
newValue
any optional

The new value of the item, if there is a new value.

oldValue
any optional

The old value of the item, if there was an old value.

Properties
local
Items in the local storage area are local to each machine.

Type
StorageArea & object

Properties
QUOTA_BYTES
10485760

The maximum amount (in bytes) of data that can be stored in local storage, as measured by the JSON stringification of every value plus every key's length. This value will be ignored if the extension has the unlimitedStorage permission. Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError when using a callback, or a rejected Promise if using async/await.

managed
Items in the managed storage area are set by an enterprise policy configured by the domain administrator, and are read-only for the extension; trying to modify this namespace results in an error. For information on configuring a policy, see Manifest for storage areas.

Type
StorageArea

session
Chrome 102+ MV3+
Items in the session storage area are stored in-memory and will not be persisted to disk.

Type
StorageArea & object

Properties
QUOTA_BYTES
10485760

The maximum amount (in bytes) of data that can be stored in memory, as measured by estimating the dynamically allocated memory usage of every value and key. Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError when using a callback, or when a Promise is rejected.

sync
Items in the sync storage area are synced using Chrome Sync.

Type
StorageArea & object

Properties
MAX_ITEMS
512

The maximum number of items that can be stored in sync storage. Updates that would cause this limit to be exceeded will fail immediately and set runtime.lastError when using a callback, or when a Promise is rejected.

MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE
1000000

Deprecated
The storage.sync API no longer has a sustained write operation quota.

MAX_WRITE_OPERATIONS_PER_HOUR
1800

The maximum number of set, remove, or clear operations that can be performed each hour. This is 1 every 2 seconds, a lower ceiling than the short term higher writes-per-minute limit.

Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError when using a callback, or when a Promise is rejected.

MAX_WRITE_OPERATIONS_PER_MINUTE
120

The maximum number of set, remove, or clear operations that can be performed each minute. This is 2 per second, providing higher throughput than writes-per-hour over a shorter period of time.

Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError when using a callback, or when a Promise is rejected.

QUOTA_BYTES
102400

The maximum total amount (in bytes) of data that can be stored in sync storage, as measured by the JSON stringification of every value plus every key's length. Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError when using a callback, or when a Promise is rejected.

QUOTA_BYTES_PER_ITEM
8192

The maximum size (in bytes) of each individual item in sync storage, as measured by the JSON stringification of its value plus its key length. Updates containing items larger than this limit will fail immediately and set runtime.lastError when using a callback, or when a Promise is rejected.

Events
onChanged

chrome.storage.onChanged.addListener(
  callback: function,
)
Fired when one or more items change.

Parameters
callback
function

The callback parameter looks like:


(changes: object, areaName: string) => void
changes
object

areaName
string