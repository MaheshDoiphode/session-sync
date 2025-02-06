chrome.sessions 

bookmark_border
Use the chrome.sessions API to query and restore tabs and windows from a browsing session.

Permissions
sessions
Types
Device
Properties
deviceName
string

The name of the foreign device.

sessions
Session[]

A list of open window sessions for the foreign device, sorted from most recently to least recently modified session.

Filter
Properties
maxResults
number optional

The maximum number of entries to be fetched in the requested list. Omit this parameter to fetch the maximum number of entries (sessions.MAX_SESSION_RESULTS).

Session
Properties
lastModified
number

The time when the window or tab was closed or modified, represented in milliseconds since the epoch.

tab
Tab optional

The tabs.Tab, if this entry describes a tab. Either this or sessions.Session.window will be set.

window
Window optional

The windows.Window, if this entry describes a window. Either this or sessions.Session.tab will be set.

Properties
MAX_SESSION_RESULTS
The maximum number of sessions.Session that will be included in a requested list.

Value
25

Methods
getDevices()
Promise
chrome.sessions.getDevices(
  filter?: Filter,
  callback?: function,
)
Retrieves all devices with synced sessions.

Parameters
filter
Filter optional

callback
function optional

The callback parameter looks like:

(devices: Device[]) => void
devices
Device[]

The list of sessions.Device objects for each synced session, sorted in order from device with most recently modified session to device with least recently modified session. tabs.Tab objects are sorted by recency in the windows.Window of the sessions.Session objects.

Returns
Promise<Device[]>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getRecentlyClosed()
Promise

chrome.sessions.getRecentlyClosed(
  filter?: Filter,
  callback?: function,
)
Gets the list of recently closed tabs and/or windows.

Parameters
filter
Filter optional

callback
function optional

The callback parameter looks like:


(sessions: Session[]) => void
sessions
Session[]

The list of closed entries in reverse order that they were closed (the most recently closed tab or window will be at index 0). The entries may contain either tabs or windows.

Returns
Promise<Session[]>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

restore()
Promise
chrome.sessions.restore(
  sessionId?: string,
  callback?: function,
)
Reopens a windows.Window or tabs.Tab, with an optional callback to run when the entry has been restored.

Parameters
sessionId
string optional

The windows.Window.sessionId, or tabs.Tab.sessionId to restore. If this parameter is not specified, the most recently closed session is restored.

callback
function optional

The callback parameter looks like:


(restoredSession: Session) => void
restoredSession
Session

A sessions.Session containing the restored windows.Window or tabs.Tab object.

Returns
Promise<Session>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onChanged

chrome.sessions.onChanged.addListener(
  callback: function,
)
Fired when recently closed tabs and/or windows are changed. This event does not monitor synced sessions changes.

Parameters
callback
function

The callback parameter looks like:

() => void