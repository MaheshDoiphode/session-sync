chrome.system.cpu 

bookmark_border
Use the system.cpu API to query CPU metadata.

Permissions
system.cpu
Types
CpuInfo
Properties
archName
string

The architecture name of the processors.

features
string[]

A set of feature codes indicating some of the processor's capabilities. The currently supported codes are "mmx", "sse", "sse2", "sse3", "ssse3", "sse4_1", "sse4_2", and "avx".

modelName
string

The model name of the processors.

numOfProcessors
number

The number of logical processors.

processors
ProcessorInfo[]

Information about each logical processor.

temperatures
number[]

Chrome 60+
List of CPU temperature readings from each thermal zone of the CPU. Temperatures are in degrees Celsius.

Currently supported on Chrome OS only.

CpuTime
Properties
idle
number

The cumulative time spent idle by this processor.

kernel
number

The cumulative time used by kernel programs on this processor.

total
number

The total cumulative time for this processor. This value is equal to user + kernel + idle.

user
number

The cumulative time used by userspace programs on this processor.

ProcessorInfo
Properties
usage
CpuTime

Cumulative usage info for this logical processor.

Methods
getInfo()
Promise

chrome.system.cpu.getInfo(
  callback?: function,
)
Queries basic CPU information of the system.

Parameters
callback
function optional

The callback parameter looks like:


(info: CpuInfo) => void
info
CpuInfo

Returns
Promise<CpuInfo>

Chrome 91+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.