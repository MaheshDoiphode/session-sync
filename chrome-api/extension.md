chrome.extension 

bookmark_border
The chrome.extension API has utilities that can be used by any extension page. It includes support for exchanging messages between an extension and its content scripts or between extensions, as described in detail in Message Passing.

Types
ViewType
Chrome 44+
The type of extension view.

Enum

"tab"

"popup"

Properties
inIncognitoContext
True for content scripts running inside incognito tabs, and for extension pages running inside an incognito process. The latter only applies to extensions with 'split' incognito_behavior.

Type
boolean

Methods
getBackgroundPage()
Foreground only

chrome.extension.getBackgroundPage()
Returns the JavaScript 'window' object for the background page running inside the current extension. Returns null if the extension has no background page.

Returns
Window | undefined

getViews()
Foreground only
chrome.extension.getViews(
  fetchProperties?: object,
)
Returns an array of the JavaScript 'window' objects for each of the pages running inside the current extension.

Parameters
fetchProperties
object optional

tabId
number optional

Chrome 54+
Find a view according to a tab id. If this field is omitted, returns all views.

type
ViewType optional

The type of view to get. If omitted, returns all views (including background pages and tabs).

windowId
number optional

The window to restrict the search to. If omitted, returns all views.

Returns
Window[]

Array of global objects

isAllowedFileSchemeAccess()
Promise

chrome.extension.isAllowedFileSchemeAccess(
  callback?: function,
)
Retrieves the state of the extension's access to the 'file://' scheme. This corresponds to the user-controlled per-extension 'Allow access to File URLs' setting accessible via the chrome://extensions page.

Parameters
callback
function optional

The callback parameter looks like:

(isAllowedAccess: boolean) => void
isAllowedAccess
boolean

True if the extension can access the 'file://' scheme, false otherwise.

Returns
Promise<boolean>

Chrome 99+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

isAllowedIncognitoAccess()
Promise
chrome.extension.isAllowedIncognitoAccess(
  callback?: function,
)
Retrieves the state of the extension's access to Incognito-mode. This corresponds to the user-controlled per-extension 'Allowed in Incognito' setting accessible via the chrome://extensions page.

Parameters
callback
function optional

The callback parameter looks like:

(isAllowedAccess: boolean) => void
isAllowedAccess
boolean

True if the extension has access to Incognito mode, false otherwise.

Returns
Promise<boolean>

Chrome 99+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

setUpdateUrlData()

chrome.extension.setUpdateUrlData(
  data: string,
)
Sets the value of the ap CGI parameter used in the extension's update URL. This value is ignored for extensions that are hosted in the Chrome Extension Gallery.

Parameters
data
string

Events