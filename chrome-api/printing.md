chrome.printing 

bookmark_border
Important: This API works only on ChromeOS.
Use the chrome.printing API to send print jobs to printers installed on Chromebook.

Permissions
printing
Availability
Chrome 81+ ChromeOS only
All chrome.printing methods and events require you to declare the "printing" permission in the extension manifest. For example:


{
  "name": "My extension",
  ...
  "permissions": [
    "printing"
  ],
  ...
}
Examples
The examples below demonstrate using each of the methods in the printing namespace. This code is copied from or based on the api-samples/printing in the extensions-samples Github repo.

cancelJob()
This example uses the onJobStatusChanged handler to hide a 'cancel' button when the jobStatus is neither PENDING or IN_PROGRESS. Note that on some networks or when a Chromebook is connected directly to the printer, these states may pass too quickly for the cancel button to be visible long enough to be called. This is greatly simplified printing example.


chrome.printing.onJobStatusChanged.addListener((jobId, status) => {
  const cancelButton = document.getElementById("cancelButton");
  cancelButton.addEventListener('click', () => {
    chrome.printing.cancelJob(jobId).then((response) => {
      if (response !== undefined) {
        console.log(response.status);
      }
      if (chrome.runtime.lastError !== undefined) {
        console.log(chrome.runtime.lastError.message);
      }
    });
  });
  if (status !== "PENDING" && status !== "IN_PROGRESS") {
    cancelButton.style.visibility = 'hidden';
  } else {
    cancelButton.style.visibility = 'visible';
  }
}
getPrinters() and getPrinterInfo()
A single example is used for these functions because getting printer information requires a printer ID, which is retrieved by calling getPrinters(). This example logs the name and description of the default printer to the console. This is a simplified version of the printing example.

​​const printers = await chrome.printing.getPrinters();
const defaultPrinter = printers.find((printer) => {
  const printerInfo = await chrome.printing.getPrinterInfo(printer.id);
  return printerInfo.isDefault;
}
console.log(`Default printer: ${defaultPrinter.name}.\n\t${defaultPrinter.description}`);
submitJob()
The submitJob() method requires three things.

A ticket structure specifying which capabilities of the printer are to be used. If the user needs to select from available capabilities, you can retrieve them for a specific printer using getPrinterInfo().
A SubmitJobRequest structure, which specifies the printer to use, and the file or date to print. This structure contains a reference to the ticket structure.
A blob of the file or data to print.
Calling submitJob() triggers a dialog box asking the user to confirm printing. Use the PrintingAPIExtensionsAllowlist to bypass confirmation.

This is a simplified version of the printing example. Notice that the ticket is attached to the SubmitJobRequest structure (line 8) and that the data to print is converted to a blob (line 10). Getting the ID of the printer (line 1) is more complicated in the sample than is shown here.


const defaultPrinter = getDefaultPrinter();
const ticket = getPrinterTicket(defaultPrinter);
const arrayBuffer = getPrintData();
const submitJobRequest = {
  job: {
    printerId: defaultPrinter,
    title: 'test job',
    ticket: ticket,
    contentType: 'application/pdf',
    document: new Blob([new Uint8Array(arrayBuffer)], {
      type: 'application/pdf'
    });
  }
};

chrome.printing.submitJob(submitJobRequest, (response) => {
  if (response !== undefined) {
    console.log(response.status);
  }
  if (chrome.runtime.lastError !== undefined) {
    console.log(chrome.runtime.lastError.message);
  }
});
Roll printing
This example shows how to build a printer ticket for continuous (or roll) printing, which is often used with receipt printing. The submitJobRequest object for roll printing is the same as that shown for the submitJob() example.

If you need to change the default value for paper cutting, use the vendor_ticket_item key. (The default varies from printer to printer.) To change the value, provide an array with one member: an object whose id is 'finishings'. The value can either be 'trim' for printers that cut the roll at the end of printing or 'none' for printers that require the print job to be torn off.

const ticket = {
  version: '1.0',
  print: {
    vendor_ticket_item: [{id: 'finishings', value: 'trim'}],
    color: {type: 'STANDARD_MONOCHROME'},
    duplex: {type: 'NO_DUPLEX'},
    page_orientation: {type: 'PORTRAIT'},
    copies: {copies: 1},
    dpi: {horizontal_dpi: 300, vertical_dpi: 300},
    media_size: {
      width_microns: 72320,
      height_microns: 100000
    },
    collate: {collate: false}
  }
};
Some printers do not support the "finishings" option. To determine if your printer does, call getPrinterInfo() and look for a "display_name" of "finishings/11".

"vendor_capability": [
  {
    "display_name": "finishings/11",
    "id": "finishings/11",
    "type": "TYPED_VALUE",
    "typed_value_cap": {
      "value_type": "BOOLEAN"
    }
  },
  ...
]
Note: starting with Chrome 124, the vendor_ticket_item allows all items from the printer's vendor_capabilities. For example, any value return by getPrinterInfo() is valid. Before, only the finishings key was supported.
The values in a ticket's media_size key are specific to each printer. To select an appropriate size call getPrinterInfo(). The returned GetPrinterResponse contains an array of supported media sizes at "media_size"."option". Choose an option whose "is_continuous_feed" value is true. Use its height and width values for the ticket.

"media_size": {
  "option": [
  {
    "custom_display_name": "",
    "is_continuous_feed": true,
    "max_height_microns": 2000000,
    "min_height_microns": 25400,
    "width_microns": 50800
  },
  ...
  ]
}
Types
GetPrinterInfoResponse
Properties
capabilities
object optional

Printer capabilities in CDD format. The property may be missing.

status
PrinterStatus

The status of the printer.

JobStatus
Status of the print job.

Enum

"PENDING"
Print job is received on Chrome side but was not processed yet.

"IN_PROGRESS"
Print job is sent for printing.

"FAILED"
Print job was interrupted due to some error.

"CANCELED"
Print job was canceled by the user or via API.

"PRINTED"
Print job was printed without any errors.

Printer
Properties
description
string

The human-readable description of the printer.

id
string

The printer's identifier; guaranteed to be unique among printers on the device.

isDefault
boolean

The flag which shows whether the printer fits DefaultPrinterSelection rules. Note that several printers could be flagged.

name
string

The name of the printer.

recentlyUsedRank
number optional

The value showing how recent the printer was used for printing from Chrome. The lower the value is the more recent the printer was used. The minimum value is 0. Missing value indicates that the printer wasn't used recently. This value is guaranteed to be unique amongst printers.

source
PrinterSource

The source of the printer (user or policy configured).

uri
string

The printer URI. This can be used by extensions to choose the printer for the user.

PrinterSource
The source of the printer.

Enum

"USER"
Printer was added by user.

"POLICY"
Printer was added via policy.

PrinterStatus
The status of the printer.

Enum

"DOOR_OPEN"
The door of the printer is open. Printer still accepts print jobs.

"TRAY_MISSING"
The tray of the printer is missing. Printer still accepts print jobs.

"OUT_OF_INK"
The printer is out of ink. Printer still accepts print jobs.

"OUT_OF_PAPER"
The printer is out of paper. Printer still accepts print jobs.

"OUTPUT_FULL"
The output area of the printer (e.g. tray) is full. Printer still accepts print jobs.

"PAPER_JAM"
The printer has a paper jam. Printer still accepts print jobs.

"GENERIC_ISSUE"
Some generic issue. Printer still accepts print jobs.

"STOPPED"
The printer is stopped and doesn't print but still accepts print jobs.

"UNREACHABLE"
The printer is unreachable and doesn't accept print jobs.

"EXPIRED_CERTIFICATE"
The SSL certificate is expired. Printer accepts jobs but they fail.

"AVAILABLE"
The printer is available.

SubmitJobRequest
Properties
job
PrintJob

The print job to be submitted. The only supported content type is "application/pdf", and the Cloud Job Ticket shouldn't include FitToPageTicketItem, PageRangeTicketItem, ReverseOrderTicketItem and VendorTicketItem fields since they are irrelevant for native printing. All other fields must be present.

SubmitJobResponse
Properties
jobId
string optional

The id of created print job. This is a unique identifier among all print jobs on the device. If status is not OK, jobId will be null.

status
SubmitJobStatus

The status of the request.

SubmitJobStatus
The status of submitJob request.

Enum

"OK"
Sent print job request is accepted.

"USER_REJECTED"
Sent print job request is rejected by the user.

Properties
MAX_GET_PRINTER_INFO_CALLS_PER_MINUTE
The maximum number of times that getPrinterInfo can be called per minute.

Value
20

MAX_SUBMIT_JOB_CALLS_PER_MINUTE
The maximum number of times that submitJob can be called per minute.

Value
40

Methods
cancelJob()
Promise
chrome.printing.cancelJob(
  jobId: string,
  callback?: function,
)
Cancels previously submitted job.

Parameters
jobId
string

The id of the print job to cancel. This should be the same id received in a SubmitJobResponse.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 100+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getPrinterInfo()
Promise
chrome.printing.getPrinterInfo(
  printerId: string,
  callback?: function,
)
Returns the status and capabilities of the printer in CDD format. This call will fail with a runtime error if no printers with given id are installed.

Parameters
printerId
string

callback
function optional

The callback parameter looks like:

(response: GetPrinterInfoResponse) => void
response
GetPrinterInfoResponse

Returns
Promise<GetPrinterInfoResponse>

Chrome 100+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getPrinters()
Promise
chrome.printing.getPrinters(
  callback?: function,
)
Returns the list of available printers on the device. This includes manually added, enterprise and discovered printers.

Parameters
callback
function optional

The callback parameter looks like:

(printers: Printer[]) => void
printers
Printer[]

Returns
Promise<Printer[]>

Chrome 100+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

submitJob()
Promise
chrome.printing.submitJob(
  request: SubmitJobRequest,
  callback?: function,
)
Submits the job for printing. If the extension is not listed in the PrintingAPIExtensionsAllowlist policy, the user is prompted to accept the print job. Before Chrome 120, this function did not return a promise.

Parameters
request
SubmitJobRequest

callback
function optional

The callback parameter looks like:

(response: SubmitJobResponse) => void
response
SubmitJobResponse

Returns
Promise<SubmitJobResponse>

Chrome 100+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onJobStatusChanged
chrome.printing.onJobStatusChanged.addListener(
  callback: function,
)
Event fired when the status of the job is changed. This is only fired for the jobs created by this extension.

Parameters
callback
function

The callback parameter looks like:

(jobId: string, status: JobStatus) => void
jobId
string

status
JobStatus