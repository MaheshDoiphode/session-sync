chrome.browsingData 

bookmark_border
Use the chrome.browsingData API to remove browsing data from a user's local profile.

Permissions
browsingData
You must declare the "browsingData" permission in the extension manifest to use this API.


{
  "name": "My extension",
  ...
  "permissions": [
    "browsingData",
  ],
  ...
}
Concepts and usage
The simplest use-case for this API is a a time-based mechanism for clearing a user's browsing data. Your code should provide a timestamp which indicates the historical date after which the user's browsing data should be removed. This timestamp is formatted as the number of milliseconds since the Unix epoch (which can be retrieved from a JavaScript Date object using the getTime() method).

For example, to clear all of a user's browsing data from the last week, you might write code as follows:


var callback = function () {
  // Do something clever here once data has been removed.
};

var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
var oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek;
chrome.browsingData.remove({
  "since": oneWeekAgo
}, {
  "appcache": true,
  "cache": true,
  "cacheStorage": true,
  "cookies": true,
  "downloads": true,
  "fileSystems": true,
  "formData": true,
  "history": true,
  "indexedDB": true,
  "localStorage": true,
  "passwords": true,
  "serviceWorkers": true,
  "webSQL": true
}, callback);
The chrome.browsingData.remove() method lets you remove various types of browsing data with a single call, and will be much faster than calling multiple more specific methods. If, however, you only want to clear one specific type of browsing data (cookies, for example), the more granular methods offer a readable alternative to a call filled with JSON.


var callback = function () {
  // Do something clever here once data has been removed.
};

var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
var oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek;
chrome.browsingData.removeCookies({
  "since": oneWeekAgo
}, callback);
If the user is syncing their data, chrome.browsingData.remove() may automatically rebuild the cookie for the Sync account after clearing it. This is to ensure that Sync can continue working, so that the data can be eventually deleted on the server. However the more specific chrome.browsingData.removeCookies() can be used to clear the cookie for the Sync account, and Sync will be paused in this case.

Important: Removing browsing data involves a good deal of heavy lifting in the background, and can take tens of seconds to complete, depending on a user's profile. You should use either the returned promise or the callback to keep your users up to date on the removal's status.
Specific origins
To remove data for a specific origin or to exclude a set of origins from deletion, you can use the RemovalOptions.origins and RemovalOptions.excludeOrigins parameters. They can only be applied to cookies, cache, and storage (CacheStorage, FileSystems, IndexedDB, LocalStorage, ServiceWorkers, and WebSQL).


chrome.browsingData.remove({
  "origins": ["https://www.example.com"]
}, {
  "cacheStorage": true,
  "cookies": true,
  "fileSystems": true,
  "indexedDB": true,
  "localStorage": true,
  "serviceWorkers": true,
  "webSQL": true
}, callback);
Important: As cookies are scoped more broadly than other types of storage, deleting cookies for an origin will delete all cookies of the registrable domain. For example, deleting data for https://www.example.com will delete cookies with a domain of .example.com as well.
Origin types
Adding an originTypes property to the APIs options object lets you specify which types of origins ought to be effected. Origins are divided into three categories:

unprotectedWeb covers the general case of websites that users visit without taking any special action. If you don't specify an originTypes, the API defaults to removing data from unprotected web origins.
protectedWeb covers those web origins that have been installed as hosted applications. Installing Angry Birds, for example, protects the origin https://chrome.angrybirds.com, and removes it from the unprotectedWeb category. Be careful when triggering deletion of data for these origins: make sure your users know what they're getting, as this will irrevocably remove their game data. No one wants to knock tiny pig houses over more often than necessary.
extension covers origins under the chrome-extensions: scheme. Removing extension data is, again, something you should be very careful about.
We could adjust the previous example to remove only data from protected websites as follows:


var callback = function () {
  // Do something clever here once data has been removed.
};

var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
var oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek;
chrome.browsingData.remove({
  "since": oneWeekAgo,
  "originTypes": {
    "protectedWeb": true
  }
}, {
  "appcache": true,
  "cache": true,
  "cacheStorage": true,
  "cookies": true,
  "downloads": true,
  "fileSystems": true,
  "formData": true,
  "history": true,
  "indexedDB": true,
  "localStorage": true,
  "passwords": true,
  "serviceWorkers": true,
  "webSQL": true
}, callback);
Warning: Be careful with the protectedWeb and extension origin types. These are destructive operations that may surprise your users if they're not well-informed about what to expect when your extension removes data on their behalf.
Examples
To try this API, install the browsingData API example from the chrome-extension-samples repository.

Types
DataTypeSet
A set of data types. Missing data types are interpreted as false.

Properties
appcache
boolean optional

Websites' appcaches.

cache
boolean optional

The browser's cache.

cacheStorage
boolean optional

Chrome 72+
Cache storage

cookies
boolean optional

The browser's cookies.

downloads
boolean optional

The browser's download list.

fileSystems
boolean optional

Websites' file systems.

formData
boolean optional

The browser's stored form data.

history
boolean optional

The browser's history.

indexedDB
boolean optional

Websites' IndexedDB data.

localStorage
boolean optional

Websites' local storage data.

passwords
boolean optional

Stored passwords.

pluginData
boolean optional

Deprecated since Chrome 88
Support for Flash has been removed. This data type will be ignored.

Plugins' data.

serverBoundCertificates
boolean optional

Deprecated since Chrome 76
Support for server-bound certificates has been removed. This data type will be ignored.

Server-bound certificates.

serviceWorkers
boolean optional

Service Workers.

webSQL
boolean optional

Websites' WebSQL data.

RemovalOptions
Options that determine exactly what data will be removed.

Properties
excludeOrigins
string[] optional

Chrome 74+
When present, data for origins in this list is excluded from deletion. Can't be used together with origins. Only supported for cookies, storage and cache. Cookies are excluded for the whole registrable domain.

originTypes
object optional

An object whose properties specify which origin types ought to be cleared. If this object isn't specified, it defaults to clearing only "unprotected" origins. Please ensure that you really want to remove application data before adding 'protectedWeb' or 'extensions'.

extension
boolean optional

Extensions and packaged applications a user has installed (be _really_ careful!).

protectedWeb
boolean optional

Websites that have been installed as hosted applications (be careful!).

unprotectedWeb
boolean optional

Normal websites.

origins
[string, ...string[]] optional

Chrome 74+
When present, only data for origins in this list is deleted. Only supported for cookies, storage and cache. Cookies are cleared for the whole registrable domain.

since
number optional

Remove data accumulated on or after this date, represented in milliseconds since the epoch (accessible via the getTime method of the JavaScript Date object). If absent, defaults to 0 (which would remove all browsing data).

Methods
remove()
Promise
chrome.browsingData.remove(
  options: RemovalOptions,
  dataToRemove: DataTypeSet,
  callback?: function,
)
Clears various types of browsing data stored in a user's profile.

Parameters
options
RemovalOptions

dataToRemove
DataTypeSet

The set of data types to remove.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeAppcache()
Promise
chrome.browsingData.removeAppcache(
  options: RemovalOptions,
  callback?: function,
)
Clears websites' appcache data.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeCache()
Promise
chrome.browsingData.removeCache(
  options: RemovalOptions,
  callback?: function,
)
Clears the browser's cache.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeCacheStorage()
Promise Chrome 72+
chrome.browsingData.removeCacheStorage(
  options: RemovalOptions,
  callback?: function,
)
Clears websites' cache storage data.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeCookies()
Promise
chrome.browsingData.removeCookies(
  options: RemovalOptions,
  callback?: function,
)
Clears the browser's cookies and server-bound certificates modified within a particular timeframe.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeDownloads()
Promise
chrome.browsingData.removeDownloads(
  options: RemovalOptions,
  callback?: function,
)
Clears the browser's list of downloaded files (not the downloaded files themselves).

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeFileSystems()
Promise
chrome.browsingData.removeFileSystems(
  options: RemovalOptions,
  callback?: function,
)
Clears websites' file system data.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeFormData()
Promise
chrome.browsingData.removeFormData(
  options: RemovalOptions,
  callback?: function,
)
Clears the browser's stored form data (autofill).

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeHistory()
Promise
chrome.browsingData.removeHistory(
  options: RemovalOptions,
  callback?: function,
)
Clears the browser's history.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeIndexedDB()
Promise
chrome.browsingData.removeIndexedDB(
  options: RemovalOptions,
  callback?: function,
)
Clears websites' IndexedDB data.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeLocalStorage()
Promise
chrome.browsingData.removeLocalStorage(
  options: RemovalOptions,
  callback?: function,
)
Clears websites' local storage data.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removePasswords()
Promise
chrome.browsingData.removePasswords(
  options: RemovalOptions,
  callback?: function,
)
Clears the browser's stored passwords.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removePluginData()
Promise Deprecated since Chrome 88
chrome.browsingData.removePluginData(
  options: RemovalOptions,
  callback?: function,
)
Support for Flash has been removed. This function has no effect.

Clears plugins' data.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeServiceWorkers()
Promise Chrome 72+
chrome.browsingData.removeServiceWorkers(
  options: RemovalOptions,
  callback?: function,
)
Clears websites' service workers.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeWebSQL()
Promise
chrome.browsingData.removeWebSQL(
  options: RemovalOptions,
  callback?: function,
)
Clears websites' WebSQL data.

Parameters
options
RemovalOptions

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

settings()
Promise
chrome.browsingData.settings(
  callback?: function,
)
Reports which types of data are currently selected in the 'Clear browsing data' settings UI. Note: some of the data types included in this API are not available in the settings UI, and some UI settings control more than one data type listed here.

Parameters
callback
function optional

The callback parameter looks like:

(result: object) => void
result
object

dataRemovalPermitted
DataTypeSet

All of the types will be present in the result, with values of true if they are permitted to be removed (e.g., by enterprise policy) and false if not.

dataToRemove
DataTypeSet

All of the types will be present in the result, with values of true if they are both selected to be removed and permitted to be removed, otherwise false.

options
RemovalOptions

Returns
Promise<object>

Chrome 96+