chrome.loginState 

bookmark_border
Important: This API works only on ChromeOS.
Use the chrome.loginState API to read and monitor the login state.

Permissions
loginState
Availability
Chrome 78+ ChromeOS only
Types
ProfileType
Enum

"SIGNIN_PROFILE"
Specifies that the extension is in the signin profile.

"USER_PROFILE"
Specifies that the extension is in the user profile.

SessionState
Enum

"UNKNOWN"
Specifies that the session state is unknown.

"IN_OOBE_SCREEN"
Specifies that the user is in the out-of-box-experience screen.

"IN_LOGIN_SCREEN"
Specifies that the user is in the login screen.

"IN_SESSION"
Specifies that the user is in the session.

"IN_LOCK_SCREEN"
Specifies that the user is in the lock screen.

"IN_RMA_SCREEN"
Specifies that the device is in RMA mode, finalizing repairs.

Methods
getProfileType()
Promise
chrome.loginState.getProfileType(
  callback?: function,
)
Gets the type of the profile the extension is in.

Parameters
callback
function optional

The callback parameter looks like:

(result: ProfileType) => void
result
ProfileType

Returns
Promise<ProfileType>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getSessionState()
Promise

chrome.loginState.getSessionState(
  callback?: function,
)
Gets the current session state.

Parameters
callback
function optional

The callback parameter looks like:


(result: SessionState) => void
result
SessionState

Returns
Promise<SessionState>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onSessionStateChanged

chrome.loginState.onSessionStateChanged.addListener(
  callback: function,
)
Dispatched when the session state changes. sessionState is the new session state.

Parameters
callback
function

The callback parameter looks like:


(sessionState: SessionState) => void
sessionState
SessionState