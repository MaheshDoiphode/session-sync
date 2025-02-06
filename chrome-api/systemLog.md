chrome.systemLog 

bookmark_border
Important: This API works only on ChromeOS.
Use the chrome.systemLog API to record Chrome system logs from extensions.

Permissions
systemLog
Availability
Chrome 125+ ChromeOS only Requires policy
Types
MessageOptions
Properties
message
string

Methods
add()
Promise

chrome.systemLog.add(
  options: MessageOptions,
  callback?: function,
)
Adds a new log record.

Parameters
options
MessageOptions

The logging options.

callback
function optional

The callback parameter looks like:


() => void
Returns
Promise<void>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.