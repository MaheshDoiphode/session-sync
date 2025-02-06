chrome.devtools.performance 

bookmark_border
Use the chrome.devtools.performance API to listen to recording status updates in the Performance panel in DevTools.

See DevTools APIs summary for general introduction to using Developer Tools APIs.

Availability
Chrome 129+
Starting from Chrome 128, you can listen to notifications of the recording status of the Performance panel.
Concepts and usage
The chrome.devtools.performance API allows developers to interact with the recording features of the Performance panel panel in Chrome DevTools. You can use this API to get notifications when recording starts or stops.

Two events are available:

onProfilingStarted: This event is fired when the Performance panel begins recording performance data.
onProfilingStopped: This event is fired when the Performance panel stops recording performance data. stance that associates the current stack trace with the cre Both events don't have any associated parameters.
By listening to these events, developers can create extensions that react to the recording status in the Performance panel, providing additional automation during performance profiling.

Examples
This is how you can use the API to listen to recording status updates



chrome.devtools.performance.onProfilingStarted.addListener(() => {
  // Profiling started listener implementation
});

chrome.devtools.performance.onProfilingStopped.addListener(() => {
  // Profiling stopped listener implementation
})
Events
onProfilingStarted

chrome.devtools.performance.onProfilingStarted.addListener(
  callback: function,
)
Fired when the Performance panel starts recording.

Parameters
callback
function

The callback parameter looks like:


() => void
onProfilingStopped

chrome.devtools.performance.onProfilingStopped.addListener(
  callback: function,
)
Fired when the Performance panel stops recording.

Parameters
callback
function

The callback parameter looks like:


() => void