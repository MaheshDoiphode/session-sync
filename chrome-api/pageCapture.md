chrome.pageCapture 

bookmark_border
Use the chrome.pageCapture API to save a tab as MHTML.

MHTML is a standard format supported by most browsers. It encapsulates in a single file a page and all its resources (CSS files, images..).

Note that for security reasons a MHTML file can only be loaded from the file system and that it can only be loaded in the main frame.

Permissions
pageCapture
You must declare the "pageCapture" permission in the extension manifest to use the pageCapture API. For example:


{
  "name": "My extension",
  ...
  "permissions": [
    "pageCapture"
  ],
  ...
}
Methods
saveAsMHTML()
Promise

chrome.pageCapture.saveAsMHTML(
  details: object,
  callback?: function,
)
Saves the content of the tab with given id as MHTML.

Parameters
details
object

tabId
number

The id of the tab to save as MHTML.

callback
function optional

The callback parameter looks like:

(mhtmlData?: Blob) => void
mhtmlData
Blob optional

The MHTML data as a Blob.

Returns
Promise<Blob | undefined>

Chrome 116+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.