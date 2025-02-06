chrome.alarms 

bookmark_border
Chrome 120: Starting in Chrome 120, the minimum alarm interval has been reduced from 1 minute to 30 seconds. For an alarm to trigger in 30 seconds, set periodInMinutes: 0.5.
Chrome 117: Starting in Chrome 117, the number of active alarms is limited to 500. Once this limit is reached, chrome.alarms.create() will fail. When using a callback, chrome.runtime.lastError will be set. When using promises, the promise will be rejected.
Use the chrome.alarms API to schedule code to run periodically or at a specified time in the future.

Permissions
alarms
To use the chrome.alarms API, declare the "alarms" permission in the manifest:


{
  "name": "My extension",
  ...
  "permissions": [
    "alarms"
  ],
  ...
}
Concepts and usage
To ensure reliable behavior, it is helpful to understand how the API behaves.

Device sleep
Alarms continue to run while a device is sleeping. However, an alarm will not wake up a device. When the device wakes up, any missed alarms will fire. Repeating alarms will fire at most once and then be rescheduled using the specified period starting from when the device wakes, not taking into account any time that has already elapsed since the alarm was originally set to run.

Persistence
Alarms generally persist until an extension is updated. However, this is not guaranteed, and alarms may be cleared when the browser is restarted. Consequently, consider setting a value in storage when an alarm is created, and then ensure it exists each time your service worker starts up. For example:


const STORAGE_KEY = "user-preference-alarm-enabled";

async function checkAlarmState() {
  const { alarmEnabled } = await chrome.storage.get(STORAGE_KEY);

  if (alarmEnabled) {
    const alarm = await chrome.alarms.get("my-alarm");

    if (!alarm) {
      await chrome.alarms.create({ periodInMinutes: 1 });
    }
  }
}

checkAlarmState();
Examples
The following examples show how to use and respond to an alarm. To try this API, install the Alarm API example from the chrome-extension-samples repository.

Set an alarm
The following example sets an alarm in the service worker when the extension is installed:

service-worker.js:


chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install') {
    return;
  }

  // Create an alarm so we have something to look at in the demo
  await chrome.alarms.create('demo-default-alarm', {
    delayInMinutes: 1,
    periodInMinutes: 1
  });
});
Respond to an alarm
The following example sets the action toolbar icon based on the name of the alarm that went off.

service-worker.js:

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.action.setIcon({
    path: getIconPath(alarm.name),
  });
});
Types
Alarm
Properties
name
string

Name of this alarm.

periodInMinutes
number optional

If not null, the alarm is a repeating alarm and will fire again in periodInMinutes minutes.

scheduledTime
number

Time at which this alarm was scheduled to fire, in milliseconds past the epoch (e.g. Date.now() + n). For performance reasons, the alarm may have been delayed an arbitrary amount beyond this.

AlarmCreateInfo
Properties
delayInMinutes
number optional

Length of time in minutes after which the onAlarm event should fire.

periodInMinutes
number optional

If set, the onAlarm event should fire every periodInMinutes minutes after the initial event specified by when or delayInMinutes. If not set, the alarm will only fire once.

when
number optional

Time at which the alarm should fire, in milliseconds past the epoch (e.g. Date.now() + n).

Methods
clear()
Promise
chrome.alarms.clear(
  name?: string,
  callback?: function,
)
Clears the alarm with the given name.

Parameters
name
string optional

The name of the alarm to clear. Defaults to the empty string.

callback
function optional

The callback parameter looks like:

(wasCleared: boolean) => void
wasCleared
boolean

Returns
Promise<boolean>

Chrome 91+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

clearAll()
Promise
chrome.alarms.clearAll(
  callback?: function,
)
Clears all alarms.

Parameters
callback
function optional

The callback parameter looks like:

(wasCleared: boolean) => void
wasCleared
boolean

Returns
Promise<boolean>

Chrome 91+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

create()
Promise
chrome.alarms.create(
  name?: string,
  alarmInfo: AlarmCreateInfo,
  callback?: function,
)
Creates an alarm. Near the time(s) specified by alarmInfo, the onAlarm event is fired. If there is another alarm with the same name (or no name if none is specified), it will be cancelled and replaced by this alarm.

In order to reduce the load on the user's machine, Chrome limits alarms to at most once every 30 seconds but may delay them an arbitrary amount more. That is, setting delayInMinutes or periodInMinutes to less than 0.5 will not be honored and will cause a warning. when can be set to less than 30 seconds after "now" without warning but won't actually cause the alarm to fire for at least 30 seconds.

To help you debug your app or extension, when you've loaded it unpacked, there's no limit to how often the alarm can fire.

Parameters
name
string optional

Optional name to identify this alarm. Defaults to the empty string.

alarmInfo
AlarmCreateInfo

Describes when the alarm should fire. The initial time must be specified by either when or delayInMinutes (but not both). If periodInMinutes is set, the alarm will repeat every periodInMinutes minutes after the initial event. If neither when or delayInMinutes is set for a repeating alarm, periodInMinutes is used as the default for delayInMinutes.

callback
function optional

Chrome 111+
The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 111+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

get()
Promise
chrome.alarms.get(
  name?: string,
  callback?: function,
)
Retrieves details about the specified alarm.

Parameters
name
string optional

The name of the alarm to get. Defaults to the empty string.

callback
function optional

The callback parameter looks like:

(alarm?: Alarm) => void
alarm
Alarm optional

Returns
Promise<Alarm | undefined>

Chrome 91+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getAll()
Promise
chrome.alarms.getAll(
  callback?: function,
)
Gets an array of all the alarms.

Parameters
callback
function optional

The callback parameter looks like:

(alarms: Alarm[]) => void
alarms
Alarm[]

Returns
Promise<Alarm[]>

Chrome 91+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onAlarm
chrome.alarms.onAlarm.addListener(
  callback: function,
)
Fired when an alarm has elapsed. Useful for event pages.

Parameters
callback
function

The callback parameter looks like:


(alarm: Alarm) => void
alarm
Alarm