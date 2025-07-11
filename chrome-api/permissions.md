chrome.permissions 

bookmark_border
Use the chrome.permissions API to request declared optional permissions at run time rather than install time, so users understand why the permissions are needed and grant only those that are necessary.

Concepts and usage
Permission warnings exist to describe the capabilities granted by an API, but some of these warnings may not be obvious. The Permissions API allows developers to explain permission warnings and introduce new features gradually which gives users a risk-free introduction to the extension. This way, users can specify how much access they are willing to grant and which features they want to enable.

For example, the optional permissions extension's core functionality is overriding the new tab page. One feature is displaying the user's goal of the day. This feature only requires the storage permission, which does not include a warning. The extension has an additional feature, that users can enable by clicking the following button:

An extension button that enables additional features.
An extension button that enables additional features.
Displaying the user's top sites requires the topSites permission, which has the following warning.

Axtension warning for topSites API.
An extension warning for topSites API
Implement optional permissions
Step 1: Decide which permissions are required and which are optional
An extension can declare both required and optional permissions. In general, you should:

Use required permissions when they are needed for your extension's basic functionality.
Use optional permissions when they are needed for optional features in your extension.
Advantages of required permissions:

Fewer prompts: An extension can prompt the user once to accept all permissions.
Simpler development: Required permissions are guaranteed to be present.
Advantages of optional permissions:

Better security: Extensions run with fewer permissions since users only enable permissions that are needed.
Better information for users: An extension can explain why it needs a particular permission when the user enables the relevant feature.
Easier upgrades: When you upgrade your extension, Chrome won't disable it for your users if the upgrade adds optional rather than required permissions.
Step 2: Declare optional permissions in the manifest
Declare optional permissions in your extension manifest with the optional_permissions key, using the same format as the permissions field:


{
  "name": "My extension",
  ...
  "optional_permissions": ["tabs"],
  "optional_host_permissions": ["https://www.google.com/"],
  ...
}
If you want to request hosts that you only discover at runtime, include "https://*/*" in your extension's optional_host_permissions field. This lets you specify any origin in "Permissions.origins" as long as it has a matching scheme.

Permissions that can not be specified as optional

Most Chrome extension permissions can be specified as optional, with the following exceptions.

Permission	Description
"debugger"	The chrome.debugger API serves as an alternate transport for Chrome's remote debugging protocol.
"declarativeNetRequest"	Grants the extension access to the chrome.declarativeNetRequest API.
"devtools"	Allows extension to expand Chrome DevTools functionality.
"geolocation"	Allows the extension to use the HTML5 geolocation API.
"mdns"	Grants the extension access to the chrome.mdns API.
"proxy"	Grants the extension access to the chrome.proxy API to manage Chrome's proxy settings.
"tts"	The chrome.tts API plays synthesized text-to-speech (TTS).
"ttsEngine"	The chrome.ttsEngine API implements a text-to-speech (TTS) engine using an extension.
"wallpaper"	ChromeOS only. Use the chrome.wallpaper API change the ChromeOS wallpaper.
View Declare Permissions for further information on available permissions and their warnings.

Step 3: Request optional permissions
Request the permissions from within a user gesture using permissions.request():


document.querySelector('#my-button').addEventListener('click', (event) => {
  // Permissions must be requested from inside a user gesture, like a button's
  // click handler.
  chrome.permissions.request({
    permissions: ['tabs'],
    origins: ['https://www.google.com/']
  }, (granted) => {
    // The callback argument will be true if the user granted the permissions.
    if (granted) {
      doSomething();
    } else {
      doSomethingElse();
    }
  });
});
Chrome prompts the user if adding the permissions results in different warning messages than the user has already seen and accepted. For example, the previous code might result in a prompt like this:

An example permission confirmation prompt.
An example permission confirmation prompt.
Step 4: Check the extension's current permissions
To check whether your extension has a specific permission or set of permissions, use permission.contains():

chrome.permissions.contains({
  permissions: ['tabs'],
  origins: ['https://www.google.com/']
}, (result) => {
  if (result) {
    // The extension has the permissions.
  } else {
    // The extension doesn't have the permissions.
  }
});
Step 5: Remove the permissions
You should remove permissions when you no longer need them. After a permission has been removed, calling permissions.request() usually adds the permission back without prompting the user.

chrome.permissions.remove({
  permissions: ['tabs'],
  origins: ['https://www.google.com/']
}, (removed) => {
  if (removed) {
    // The permissions have been removed.
  } else {
    // The permissions have not been removed (e.g., you tried to remove
    // required permissions).
  }
});
Types
Permissions
Properties
origins
string[] optional

The list of host permissions, including those specified in the optional_permissions or permissions keys in the manifest, and those associated with Content Scripts.

permissions
string[] optional

List of named permissions (does not include hosts or origins).

Methods
addHostAccessRequest()
Promise Chrome 133+ MV3+
chrome.permissions.addHostAccessRequest(
  request: object,
  callback?: function,
)
Adds a host access request. Request will only be signaled to the user if extension can be granted access to the host in the request. Request will be reset on cross-origin navigation. When accepted, grants persistent access to the site’s top origin

Parameters
request
object

documentId
string optional

The id of a document where host access requests can be shown. Must be the top-level document within a tab. If provided, the request is shown on the tab of the specified document and is removed when the document navigates to a new origin. Adding a new request will override any existent request for tabId. This or tabId must be specified.

pattern
string optional

The URL pattern where host access requests can be shown. If provided, host access requests will only be shown on URLs that match this pattern.

tabId
number optional

The id of the tab where host access requests can be shown. If provided, the request is shown on the specified tab and is removed when the tab navigates to a new origin. Adding a new request will override an existent request for documentId. This or documentId must be specified.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

contains()
Promise
chrome.permissions.contains(
  permissions: Permissions,
  callback?: function,
)
Checks if the extension has the specified permissions.

Parameters
permissions
Permissions

callback
function optional

The callback parameter looks like:

(result: boolean) => void
result
boolean

True if the extension has the specified permissions. If an origin is specified as both an optional permission and a content script match pattern, this will return false unless both permissions are granted.

Returns
Promise<boolean>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getAll()
Promise
chrome.permissions.getAll(
  callback?: function,
)
Gets the extension's current set of permissions.

Parameters
callback
function optional

The callback parameter looks like:

(permissions: Permissions) => void
permissions
Permissions

The extension's active permissions. Note that the origins property will contain granted origins from those specified in the permissions and optional_permissions keys in the manifest and those associated with Content Scripts.

Returns
Promise<Permissions>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

remove()
Promise
chrome.permissions.remove(
  permissions: Permissions,
  callback?: function,
)
Removes access to the specified permissions. If there are any problems removing the permissions, runtime.lastError will be set.

Parameters
permissions
Permissions

callback
function optional

The callback parameter looks like:

(removed: boolean) => void
removed
boolean

True if the permissions were removed.

Returns
Promise<boolean>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeHostAccessRequest()
Promise Chrome 133+ MV3+
chrome.permissions.removeHostAccessRequest(
  request: object,
  callback?: function,
)
Removes a host access request, if existent.

Parameters
request
object

documentId
string optional

The id of a document where host access request will be removed. Must be the top-level document within a tab. This or tabId must be specified.

pattern
string optional

The URL pattern where host access request will be removed. If provided, this must exactly match the pattern of an existing host access request.

tabId
number optional

The id of the tab where host access request will be removed. This or documentId must be specified.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

request()
Promise
chrome.permissions.request(
  permissions: Permissions,
  callback?: function,
)
Requests access to the specified permissions, displaying a prompt to the user if necessary. These permissions must either be defined in the optional_permissions field of the manifest or be required permissions that were withheld by the user. Paths on origin patterns will be ignored. You can request subsets of optional origin permissions; for example, if you specify *://*\/* in the optional_permissions section of the manifest, you can request http://example.com/. If there are any problems requesting the permissions, runtime.lastError will be set.

Parameters
permissions
Permissions

callback
function optional

The callback parameter looks like:

(granted: boolean) => void
granted
boolean

True if the user granted the specified permissions.

Returns
Promise<boolean>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onAdded
chrome.permissions.onAdded.addListener(
  callback: function,
)
Fired when the extension acquires new permissions.

Parameters
callback
function

The callback parameter looks like:

(permissions: Permissions) => void
permissions
Permissions

onRemoved
chrome.permissions.onRemoved.addListener(
  callback: function,
)
Fired when access to permissions has been removed from the extension.

Parameters
callback
function

The callback parameter looks like:

(permissions: Permissions) => void
permissions
Permissions