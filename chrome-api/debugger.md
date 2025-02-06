chrome.debugger 

bookmark_border
The chrome.debugger API serves as an alternate transport for Chrome's remote debugging protocol. Use chrome.debugger to attach to one or more tabs to instrument network interaction, debug JavaScript, mutate the DOM and CSS, and more. Use the Debuggee property tabId to target tabs with sendCommand and route events by tabId from onEvent callbacks.

Permissions
debugger
You must declare the "debugger" permission in your extension's manifest to use this API.


{
  "name": "My extension",
  ...
  "permissions": [
    "debugger",
  ],
  ...
}
Concepts and usage
Once attached, the chrome.debugger API lets you send Chrome DevTools Protocol (CDP) commands to a given target. Explaining the CDP in depth is out of scope for this documentation—to learn more about CDP check out the official CDP documentation.

Targets
Targets represent something which is being debugged—this could include a tab, an iframe or a worker. Each target is identified by a UUID and has an associated type (such as iframe, shared_worker, and more).

Within a target, there may be multiple execution contexts—for example same process iframes don't get a unique target but are instead represented as different contexts that can be accessed from a single target.

Restricted domains
For security reasons, the chrome.debugger API does not provide access to all Chrome DevTools Protocol Domains. The available domains are: Accessibility, Audits, CacheStorage, Console, CSS, Database, Debugger, DOM, DOMDebugger, DOMSnapshot, Emulation, Fetch, IO, Input, Inspector, Log, Network, Overlay, Page, Performance, Profiler, Runtime, Storage, Target, Tracing, WebAudio, and WebAuthn.

Work with frames
There is not a one to one mapping of frames to targets. Within a single tab, multiple same process frames may share the same target but use a different execution context. On the other hand, a new target may be created for an out-of-process iframe.

To attach to all frames, you need to handle each type of frame separately:

Listen for the Runtime.executionContextCreated event to identify new execution contexts associated with same process frames.

Follow the steps to attach to related targets to identify out-of-process frames.

Attach to related targets
After connecting to a target, you may want to connect to further related targets including out-of-process child frames or associated workers.

Starting in Chrome 125, the chrome.debugger API supports flat sessions. This lets you add additional targets as children to your main debugger session and message them without needing another call to chrome.debugger.attach. Instead, you can add a sessionId property when calling chrome.debugger.sendCommand to identify the child target you would like to send a command to.

To automatically attach to out of process child frames, first add a listener for the Target.attachedToTarget event:


chrome.debugger.onEvent.addListener((source, method, params) => {
  if (method === "Target.attachedToTarget") {
    // `source` identifies the parent session, but we need to construct a new
    // identifier for the child session
    const session = { ...source, sessionId: params.sessionId };

    // Call any needed CDP commands for the child session
    await chrome.debugger.sendCommand(session, "Runtime.enable");
  }
});
Then, enable auto attach by sending the Target.setAutoAttach command with the flatten option set to true:

await chrome.debugger.sendCommand({ tabId }, "Target.setAutoAttach", {
  autoAttach: true,
  waitForDebuggerOnStart: false,
  flatten: true,
  filter: [{ type: "iframe", exclude: false }]
});
Examples
To try this API, install the debugger API example from the chrome-extension-samples repository.

Types
Debuggee
Debuggee identifier. Either tabId, extensionId or targetId must be specified

Properties
extensionId
string optional

The id of the extension which you intend to debug. Attaching to an extension background page is only possible when the --silent-debugger-extension-api command-line switch is used.

tabId
number optional

The id of the tab which you intend to debug.

targetId
string optional

The opaque id of the debug target.

DebuggerSession
Chrome 125+
Debugger session identifier. One of tabId, extensionId or targetId must be specified. Additionally, an optional sessionId can be provided. If sessionId is specified for arguments sent from onEvent, it means the event is coming from a child protocol session within the root debuggee session. If sessionId is specified when passed to sendCommand, it targets a child protocol session within the root debuggee session.

Properties
extensionId
string optional

The id of the extension which you intend to debug. Attaching to an extension background page is only possible when the --silent-debugger-extension-api command-line switch is used.

sessionId
string optional

The opaque id of the Chrome DevTools Protocol session. Identifies a child session within the root session identified by tabId, extensionId or targetId.

tabId
number optional

The id of the tab which you intend to debug.

targetId
string optional

The opaque id of the debug target.

DetachReason
Chrome 44+
Connection termination reason.

Enum

"target_closed"

"canceled_by_user"

TargetInfo
Debug target information

Properties
attached
boolean

True if debugger is already attached.

extensionId
string optional

The extension id, defined if type = 'background_page'.

faviconUrl
string optional

Target favicon URL.

id
string

Target id.

tabId
number optional

The tab id, defined if type == 'page'.

title
string

Target page title.

type
TargetInfoType

Target type.

url
string

Target URL.

TargetInfoType
Chrome 44+
Target type.

Enum

"page"

"background_page"

"worker"

"other"

Methods
attach()
Promise
chrome.debugger.attach(
  target: Debuggee,
  requiredVersion: string,
  callback?: function,
)
Attaches debugger to the given target.

Parameters
target
Debuggee

Debugging target to which you want to attach.

requiredVersion
string

Required debugging protocol version ("0.1"). One can only attach to the debuggee with matching major version and greater or equal minor version. List of the protocol versions can be obtained here.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

detach()
Promise
chrome.debugger.detach(
  target: Debuggee,
  callback?: function,
)
Detaches debugger from the given target.

Parameters
target
Debuggee

Debugging target from which you want to detach.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getTargets()
Promise
chrome.debugger.getTargets(
  callback?: function,
)
Returns the list of available debug targets.

Parameters
callback
function optional

The callback parameter looks like:

(result: TargetInfo[]) => void
result
TargetInfo[]

Array of TargetInfo objects corresponding to the available debug targets.

Returns
Promise<TargetInfo[]>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

sendCommand()
Promise
chrome.debugger.sendCommand(
  target: DebuggerSession,
  method: string,
  commandParams?: object,
  callback?: function,
)
Sends given command to the debugging target.

Parameters
target
DebuggerSession

Debugging target to which you want to send the command.

method
string

Method name. Should be one of the methods defined by the remote debugging protocol.

commandParams
object optional

JSON object with request parameters. This object must conform to the remote debugging params scheme for given method.

callback
function optional

The callback parameter looks like:

(result?: object) => void
result
object optional

JSON object with the response. Structure of the response varies depending on the method name and is defined by the 'returns' attribute of the command description in the remote debugging protocol.

Returns
Promise<object | undefined>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onDetach
chrome.debugger.onDetach.addListener(
  callback: function,
)
Fired when browser terminates debugging session for the tab. This happens when either the tab is being closed or Chrome DevTools is being invoked for the attached tab.

Parameters
callback
function

The callback parameter looks like:

(source: Debuggee, reason: DetachReason) => void
source
Debuggee

reason
DetachReason

onEvent
chrome.debugger.onEvent.addListener(
  callback: function,
)
Fired whenever debugging target issues instrumentation event.

Parameters
callback
function

The callback parameter looks like:


(source: DebuggerSession, method: string, params?: object) => void
source
DebuggerSession

method
string

params
object optional