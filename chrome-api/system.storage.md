chrome.system.storage 

bookmark_border
Use the chrome.system.storage API to query storage device information and be notified when a removable storage device is attached and detached.

Permissions
system.storage
Types
EjectDeviceResultCode
Enum

"success"
The ejection command is successful -- the application can prompt the user to remove the device.

"in_use"
The device is in use by another application. The ejection did not succeed; the user should not remove the device until the other application is done with the device.

"no_such_device"
There is no such device known.

"failure"
The ejection command failed.

StorageAvailableCapacityInfo
Properties
availableCapacity
number

The available capacity of the storage device, in bytes.

id
string

A copied id of getAvailableCapacity function parameter id.

StorageUnitInfo
Properties
capacity
number

The total amount of the storage space, in bytes.

id
string

The transient ID that uniquely identifies the storage device. This ID will be persistent within the same run of a single application. It will not be a persistent identifier between different runs of an application, or between different applications.

name
string

The name of the storage unit.

type
StorageUnitType

The media type of the storage unit.

StorageUnitType
Enum

"fixed"
The storage has fixed media, e.g. hard disk or SSD.

"removable"
The storage is removable, e.g. USB flash drive.

"unknown"
The storage type is unknown.

Methods
ejectDevice()
Promise
chrome.system.storage.ejectDevice(
  id: string,
  callback?: function,
)
Ejects a removable storage device.

Parameters
id
string

callback
function optional

The callback parameter looks like:

(result: EjectDeviceResultCode) => void
result
EjectDeviceResultCode

Returns
Promise<EjectDeviceResultCode>

Chrome 91+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getAvailableCapacity()
Promise Dev channel
chrome.system.storage.getAvailableCapacity(
  id: string,
  callback?: function,
)
Get the available capacity of a specified id storage device. The id is the transient device ID from StorageUnitInfo.

Parameters
id
string

callback
function optional

The callback parameter looks like:


(info: StorageAvailableCapacityInfo) => void
info
StorageAvailableCapacityInfo

Returns
Promise<StorageAvailableCapacityInfo>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getInfo()
Promise

chrome.system.storage.getInfo(
  callback?: function,
)
Get the storage information from the system. The argument passed to the callback is an array of StorageUnitInfo objects.

Parameters
callback
function optional

The callback parameter looks like:


(info: StorageUnitInfo[]) => void
info
StorageUnitInfo[]

Returns
Promise<StorageUnitInfo[]>

Chrome 91+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onAttached

chrome.system.storage.onAttached.addListener(
  callback: function,
)
Fired when a new removable storage is attached to the system.

Parameters
callback
function

The callback parameter looks like:


(info: StorageUnitInfo) => void
info
StorageUnitInfo

onDetached

chrome.system.storage.onDetached.addListener(
  callback: function,
)
Fired when a removable storage is detached from the system.

Parameters
callback
function

The callback parameter looks like:


(id: string) => void
id
string