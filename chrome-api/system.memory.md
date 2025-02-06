chrome.system.memory 

bookmark_border
The chrome.system.memory API.

Permissions
system.memory
Types
MemoryInfo
Properties
availableCapacity
number

The amount of available capacity, in bytes.

capacity
number

The total amount of physical memory capacity, in bytes.

Methods
getInfo()
Promise

chrome.system.memory.getInfo(
  callback?: function,
)
Get physical memory information.

Parameters
callback
function optional

The callback parameter looks like:


(info: MemoryInfo) => void
info
MemoryInfo

Returns
Promise<MemoryInfo>

Chrome 91+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.