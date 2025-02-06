chrome.management 

bookmark_border
The chrome.management API provides ways to manage installed apps and extensions.

Permissions
management
You must declare the "management" permission in the extension manifest to use the management API. For example:


{
  "name": "My extension",
  ...
  "permissions": [
    "management"
  ],
  ...
}
management.getPermissionWarningsByManifest(), management.uninstallSelf(), and management.getSelf() do not require the management permission.

Types
ExtensionDisabledReason
Chrome 44+
A reason the item is disabled.

Enum

"unknown"

"permissions_increase"

ExtensionInfo
Information about an installed extension, app, or theme.

Properties
appLaunchUrl
string optional

The launch url (only present for apps).

availableLaunchTypes
LaunchType[] optional

The currently available launch types (only present for apps).

description
string

The description of this extension, app, or theme.

disabledReason
ExtensionDisabledReason optional

A reason the item is disabled.

enabled
boolean

Whether it is currently enabled or disabled.

homepageUrl
string optional

The URL of the homepage of this extension, app, or theme.

hostPermissions
string[]

Returns a list of host based permissions.

icons
IconInfo[] optional

A list of icon information. Note that this just reflects what was declared in the manifest, and the actual image at that url may be larger or smaller than what was declared, so you might consider using explicit width and height attributes on img tags referencing these images. See the manifest documentation on icons for more details.

id
string

The extension's unique identifier.

installType
ExtensionInstallType

How the extension was installed.

isApp
boolean

Deprecated
Please use management.ExtensionInfo.type.

True if this is an app.

launchType
LaunchType optional

The app launch type (only present for apps).

mayDisable
boolean

Whether this extension can be disabled or uninstalled by the user.

mayEnable
boolean optional

Chrome 62+
Whether this extension can be enabled by the user. This is only returned for extensions which are not enabled.

name
string

The name of this extension, app, or theme.

offlineEnabled
boolean

Whether the extension, app, or theme declares that it supports offline.

optionsUrl
string

The url for the item's options page, if it has one.

permissions
string[]

Returns a list of API based permissions.

shortName
string

A short version of the name of this extension, app, or theme.

type
ExtensionType

The type of this extension, app, or theme.

updateUrl
string optional

The update URL of this extension, app, or theme.

version
string

The version of this extension, app, or theme.

versionName
string optional

Chrome 50+
The version name of this extension, app, or theme if the manifest specified one.

ExtensionInstallType
Chrome 44+
How the extension was installed. One of admin: The extension was installed because of an administrative policy, development: The extension was loaded unpacked in developer mode, normal: The extension was installed normally via a .crx file, sideload: The extension was installed by other software on the machine, other: The extension was installed by other means.

Enum

"admin"

"development"

"normal"

"sideload"

"other"

ExtensionType
Chrome 44+
The type of this extension, app, or theme.

Enum

"extension"

"hosted_app"

"packaged_app"

"legacy_packaged_app"

"theme"

"login_screen_extension"

IconInfo
Information about an icon belonging to an extension, app, or theme.

Properties
size
number

A number representing the width and height of the icon. Likely values include (but are not limited to) 128, 48, 24, and 16.

url
string

The URL for this icon image. To display a grayscale version of the icon (to indicate that an extension is disabled, for example), append ?grayscale=true to the URL.

LaunchType
These are all possible app launch types.

Enum

"OPEN_AS_REGULAR_TAB"

"OPEN_AS_PINNED_TAB"

"OPEN_AS_WINDOW"

"OPEN_FULL_SCREEN"

UninstallOptions
Chrome 88+
Options for how to handle the extension's uninstallation.

Properties
showConfirmDialog
boolean optional

Whether or not a confirm-uninstall dialog should prompt the user. Defaults to false for self uninstalls. If an extension uninstalls another extension, this parameter is ignored and the dialog is always shown.

Methods
createAppShortcut()
Promise
chrome.management.createAppShortcut(
  id: string,
  callback?: function,
)
Display options to create shortcuts for an app. On Mac, only packaged app shortcuts can be created.

Parameters
id
string

This should be the id from an app item of management.ExtensionInfo.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

generateAppForLink()
Promise
chrome.management.generateAppForLink(
  url: string,
  title: string,
  callback?: function,
)
Generate an app for a URL. Returns the generated bookmark app.

Parameters
url
string

The URL of a web page. The scheme of the URL can only be "http" or "https".

title
string

The title of the generated app.

callback
function optional

The callback parameter looks like:

(result: ExtensionInfo) => void
result
ExtensionInfo

Returns
Promise<ExtensionInfo>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

get()
Promise
chrome.management.get(
  id: string,
  callback?: function,
)
Returns information about the installed extension, app, or theme that has the given ID.

Parameters
id
string

The ID from an item of management.ExtensionInfo.

callback
function optional

The callback parameter looks like:

(result: ExtensionInfo) => void
result
ExtensionInfo

Returns
Promise<ExtensionInfo>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getAll()
Promise
chrome.management.getAll(
  callback?: function,
)
Returns a list of information about installed extensions and apps.

Parameters
callback
function optional

The callback parameter looks like:

(result: ExtensionInfo[]) => void
result
ExtensionInfo[]

Returns
Promise<ExtensionInfo[]>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getPermissionWarningsById()
Promise
chrome.management.getPermissionWarningsById(
  id: string,
  callback?: function,
)
Returns a list of permission warnings for the given extension id.

Parameters
id
string

The ID of an already installed extension.

callback
function optional

The callback parameter looks like:

(permissionWarnings: string[]) => void
permissionWarnings
string[]

Returns
Promise<string[]>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getPermissionWarningsByManifest()
Promise
chrome.management.getPermissionWarningsByManifest(
  manifestStr: string,
  callback?: function,
)
Returns a list of permission warnings for the given extension manifest string. Note: This function can be used without requesting the 'management' permission in the manifest.

Parameters
manifestStr
string

Extension manifest JSON string.

callback
function optional

The callback parameter looks like:

(permissionWarnings: string[]) => void
permissionWarnings
string[]

Returns
Promise<string[]>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getSelf()
Promise
chrome.management.getSelf(
  callback?: function,
)
Returns information about the calling extension, app, or theme. Note: This function can be used without requesting the 'management' permission in the manifest.

Parameters
callback
function optional

The callback parameter looks like:

(result: ExtensionInfo) => void
result
ExtensionInfo

Returns
Promise<ExtensionInfo>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

installReplacementWebApp()
Promise Chrome 77+
chrome.management.installReplacementWebApp(
  callback?: function,
)
Launches the replacement_web_app specified in the manifest. Prompts the user to install if not already installed.

Parameters
callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

launchApp()
Promise
chrome.management.launchApp(
  id: string,
  callback?: function,
)
Launches an application.

Parameters
id
string

The extension id of the application.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

setEnabled()
Promise
chrome.management.setEnabled(
  id: string,
  enabled: boolean,
  callback?: function,
)
Enables or disables an app or extension. In most cases this function must be called in the context of a user gesture (e.g. an onclick handler for a button), and may present the user with a native confirmation UI as a way of preventing abuse.

Parameters
id
string

This should be the id from an item of management.ExtensionInfo.

enabled
boolean

Whether this item should be enabled or disabled.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

setLaunchType()
Promise
chrome.management.setLaunchType(
  id: string,
  launchType: LaunchType,
  callback?: function,
)
Set the launch type of an app.

Parameters
id
string

This should be the id from an app item of management.ExtensionInfo.

launchType
LaunchType

The target launch type. Always check and make sure this launch type is in ExtensionInfo.availableLaunchTypes, because the available launch types vary on different platforms and configurations.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

uninstall()
Promise
chrome.management.uninstall(
  id: string,
  options?: UninstallOptions,
  callback?: function,
)
Uninstalls a currently installed app or extension. Note: This function does not work in managed environments when the user is not allowed to uninstall the specified extension/app. If the uninstall fails (e.g. the user cancels the dialog) the promise will be rejected or the callback will be called with runtime.lastError set.

Parameters
id
string

This should be the id from an item of management.ExtensionInfo.

options
UninstallOptions optional

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

uninstallSelf()
Promise
chrome.management.uninstallSelf(
  options?: UninstallOptions,
  callback?: function,
)
Uninstalls the calling extension. Note: This function can be used without requesting the 'management' permission in the manifest. This function does not work in managed environments when the user is not allowed to uninstall the specified extension/app.

Parameters
options
UninstallOptions optional

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 88+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onDisabled
chrome.management.onDisabled.addListener(
  callback: function,
)
Fired when an app or extension has been disabled.

Parameters
callback
function

The callback parameter looks like:

(info: ExtensionInfo) => void
info
ExtensionInfo

onEnabled
chrome.management.onEnabled.addListener(
  callback: function,
)
Fired when an app or extension has been enabled.

Parameters
callback
function

The callback parameter looks like:

(info: ExtensionInfo) => void
info
ExtensionInfo

onInstalled
chrome.management.onInstalled.addListener(
  callback: function,
)
Fired when an app or extension has been installed.

Parameters
callback
function

The callback parameter looks like:

(info: ExtensionInfo) => void
info
ExtensionInfo

onUninstalled
chrome.management.onUninstalled.addListener(
  callback: function,
)
Fired when an app or extension has been uninstalled.

Parameters
callback
function

The callback parameter looks like:


(id: string) => void
id
string