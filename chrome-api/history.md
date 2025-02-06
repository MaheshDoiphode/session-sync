chrome.history 

bookmark_border
Use the chrome.history API to interact with the browser's record of visited pages. You can add, remove, and query for URLs in the browser's history. To override the history page with your own version, see Override Pages.

Permissions
history
To interact with the user's browser history, use the history API.

To use the history API, declare the "history" permission in the extension manifest. For example:


{
  "name": "My extension",
  ...
  "permissions": [
    "history"
  ],
  ...
}
Concepts and usage
Transition types
The history API uses transition types to describe how the browser navigated to a particular URL on a particular visit. For example, if a user visits a page by clicking a link on another page, the transition type is "link". See the reference content for a list of transition types.

Examples
To try this API, install the history API example from the chrome-extension-samples repository.

Types
HistoryItem
An object encapsulating one result of a history query.

Properties
id
string

The unique identifier for the item.

lastVisitTime
number optional

When this page was last loaded, represented in milliseconds since the epoch.

title
string optional

The title of the page when it was last loaded.

typedCount
number optional

The number of times the user has navigated to this page by typing in the address.

url
string optional

The URL navigated to by a user.

visitCount
number optional

The number of times the user has navigated to this page.

TransitionType
Chrome 44+
The transition type for this visit from its referrer.

Enum

"link"
The user arrived at this page by clicking a link on another page.

"typed"
The user arrived at this page by typing the URL in the address bar. This is also used for other explicit navigation actions.

"auto_bookmark"
The user arrived at this page through a suggestion in the UI, for example, through a menu item.

"auto_subframe"
The user arrived at this page through subframe navigation that they didn't request, such as through an ad loading in a frame on the previous page. These don't always generate new navigation entries in the back and forward menus.

"manual_subframe"
The user arrived at this page by selecting something in a subframe.

"generated"
The user arrived at this page by typing in the address bar and selecting an entry that didn't look like a URL, such as a Google Search suggestion. For example, a match might have the URL of a Google Search result page, but it might appear to the user as "Search Google for ...". These are different from typed navigations because the user didn't type or see the destination URL. They're also related to keyword navigations.

"auto_toplevel"
The page was specified in the command line or is the start page.

"form_submit"
The user arrived at this page by filling out values in a form and submitting the form. Not all form submissions use this transition type.

"reload"
The user reloaded the page, either by clicking the reload button or by pressing Enter in the address bar. Session restore and Reopen closed tab also use this transition type.

"keyword"
The URL for this page was generated from a replaceable keyword other than the default search provider.

"keyword_generated"
Corresponds to a visit generated for a keyword.

UrlDetails
Chrome 88+
Properties
url
string

The URL for the operation. It must be in the format as returned from a call to history.search().

VisitItem
An object encapsulating one visit to a URL.

Properties
id
string

The unique identifier for the corresponding history.HistoryItem.

isLocal
boolean

Chrome 115+
True if the visit originated on this device. False if it was synced from a different device.

referringVisitId
string

The visit ID of the referrer.

transition
TransitionType

The transition type for this visit from its referrer.

visitId
string

The unique identifier for this visit.

visitTime
number optional

When this visit occurred, represented in milliseconds since the epoch.

Methods
addUrl()
Promise
chrome.history.addUrl(
  details: UrlDetails,
  callback?: function,
)
Adds a URL to the history at the current time with a transition type of "link".

Parameters
details
UrlDetails

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

deleteAll()
Promise
chrome.history.deleteAll(
  callback?: function,
)
Deletes all items from the history.

Parameters
callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

deleteRange()
Promise
chrome.history.deleteRange(
  range: object,
  callback?: function,
)
Removes all items within the specified date range from the history. Pages will not be removed from the history unless all visits fall within the range.

Parameters
range
object

endTime
number

Items added to history before this date, represented in milliseconds since the epoch.

startTime
number

Items added to history after this date, represented in milliseconds since the epoch.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

deleteUrl()
Promise
chrome.history.deleteUrl(
  details: UrlDetails,
  callback?: function,
)
Removes all occurrences of the given URL from the history.

Parameters
details
UrlDetails

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getVisits()
Promise
chrome.history.getVisits(
  details: UrlDetails,
  callback?: function,
)
Retrieves information about visits to a URL.

Parameters
details
UrlDetails

callback
function optional

The callback parameter looks like:

(results: VisitItem[]) => void
results
VisitItem[]

Returns
Promise<VisitItem[]>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

search()
Promise

chrome.history.search(
  query: object,
  callback?: function,
)
Searches the history for the last visit time of each page matching the query.

Parameters
query
object

endTime
number optional

Limit results to those visited before this date, represented in milliseconds since the epoch.

maxResults
number optional

The maximum number of results to retrieve. Defaults to 100.

startTime
number optional

Limit results to those visited after this date, represented in milliseconds since the epoch. If property is not specified, it will default to 24 hours.

text
string

A free-text query to the history service. Leave this empty to retrieve all pages.

callback
function optional

The callback parameter looks like:

(results: HistoryItem[]) => void
results
HistoryItem[]

Returns
Promise<HistoryItem[]>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onVisited
chrome.history.onVisited.addListener(
  callback: function,
)
Fired when a URL is visited, providing the HistoryItem data for that URL. This event fires before the page has loaded.

Parameters
callback
function

The callback parameter looks like:

(result: HistoryItem) => void
result
HistoryItem

onVisitRemoved
chrome.history.onVisitRemoved.addListener(
  callback: function,
)
Fired when one or more URLs are removed from history. When all visits have been removed the URL is purged from history.

Parameters
callback
function

The callback parameter looks like:


(removed: object) => void
removed
object

allHistory
boolean

True if all history was removed. If true, then urls will be empty.

urls
string[] optional