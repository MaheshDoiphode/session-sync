chrome.contentSettings 

bookmark_border
Use the chrome.contentSettings API to change settings that control whether websites can use features such as cookies, JavaScript, and plugins. More generally speaking, content settings allow you to customize Chrome's behavior on a per-site basis instead of globally.

Permissions
contentSettings
You must declare the "contentSettings" permission in your extension's manifest to use the API. For example:


{
  "name": "My extension",
  ...
  "permissions": [
    "contentSettings"
  ],
  ...
}
Concepts and usage
Content setting patterns
You can use patterns to specify the websites that each content setting affects. For example, https://*.youtube.com/* specifies youtube.com and all of its subdomains. The syntax for content setting patterns is the same as for match patterns, with a few differences:

For http, https, and ftp URLs, the path must be a wildcard (/*). For file URLs, the path must be completely specified and must not contain wildcards.
In contrast to match patterns, content setting patterns can specify a port number. If a port number is specified, the pattern only matches websites with that port. If no port number is specified, the pattern matches all ports.
Pattern precedence
When more than one content setting rule applies for a given site, the rule with the more specific pattern takes precedence.

For example, the following patterns are ordered by precedence:

https://www.example.com/*
https://*.example.com/* (matching example.com and all subdomains)
<all_urls> (matching every URL)
Three kinds of wildcards affect how specific a pattern is:

Wildcards in the port (for example https://www.example.com:*/*)
Wildcards in the scheme (for example *://www.example.com:123/*)
Wildcards in the hostname (for example https://*.example.com:123/*)
If a pattern is more specific than another pattern in one part but less specific in another part, the different parts are checked in the following order: hostname, scheme, port. For example, the following patterns are ordered by precedence:

https://www.example.com:*/* Specifies the hostname and scheme.
*:/www.example.com:123/* Not as high, because although it specifies the hostname, it doesn't specify the scheme.
https://*.example.com:123/* Lower because although it specifies the port and scheme, it has a wildcard in the hostname.
Primary and secondary patterns
The URL taken into account when deciding which content setting to apply depends on the content type. For example, for contentSettings.notifications settings are based on the URL shown in the omnibox. This URL is called the "primary" URL.

Some content types can take additional URLs into account. For example, whether a site is allowed to set a contentSettings.cookies is decided based on the URL of the HTTP request (which is the primary URL in this case) as well as the URL shown in the omnibox (which is called the "secondary" URL).

If multiple rules have primary and secondary patterns, the rule with the more specific primary pattern takes precedence. If there multiple rules have the same primary pattern, the rule with the more specific secondary pattern takes precedence. For example, the following list of primary/secondary pattern pairs is ordered by precedence:

Precedence	Primary pattern	Secondary pattern
1	https://www.moose.com/*,	https://www.wombat.com/*
2	https://www.moose.com/*,	<all_urls>
3	<all_urls>,	https://www.wombat.com/*
4	<all_urls>,	<all_urls>
Secondary patterns are not supported for the images content setting.

Resource identifiers
Resource identifiers allow you to specify content settings for specific subtypes of a content type. Currently, the only content type that supports resource identifiers is contentSettings.plugins, where a resource identifier identifies a specific plugin. When applying content settings, first the settings for the specific plugin are checked. If there are no settings found for the specific plugin, the general content settings for plugins are checked.

For example, if a content setting rule has the resource identifier adobe-flash-player and the pattern <all_urls>, it takes precedence over a rule without a resource identifier and the pattern https://www.example.com/*, even if that pattern is more specific.

You can get a list of resource identifiers for a content type by calling the contentSettings.ContentSetting.getResourceIdentifiers() method. The returned list can change with the set of installed plugins on the user's machine, but Chrome tries to keep the identifiers stable across plugin updates.

Examples
To try this API, install the contentSettings API example from the chrome-extension-samples repository.

Types
AutoVerifyContentSetting
Chrome 113+
Enum

"allow"

"block"

CameraContentSetting
Chrome 46+
Enum

"allow"

"block"

"ask"

ClipboardContentSetting
Chrome 121+
Enum

"allow"

"block"

"ask"

ContentSetting
Properties
clear
void

Promise
Clear all content setting rules set by this extension.

The clear function looks like:

(details: object, callback?: function) => {...}
details
object

scope
Scope optional

Where to clear the setting (default: regular).

callback
function optional

The callback parameter looks like:

() => void
returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

get
void

Promise
Gets the current content setting for a given pair of URLs.

The get function looks like:

(details: object, callback?: function) => {...}
details
object

incognito
boolean optional

Whether to check the content settings for an incognito session. (default false)

primaryUrl
string

The primary URL for which the content setting should be retrieved. Note that the meaning of a primary URL depends on the content type.

resourceIdentifier
ResourceIdentifier optional

A more specific identifier of the type of content for which the settings should be retrieved.

secondaryUrl
string optional

The secondary URL for which the content setting should be retrieved. Defaults to the primary URL. Note that the meaning of a secondary URL depends on the content type, and not all content types use secondary URLs.

callback
function optional

The callback parameter looks like:

(details: object) => void
details
object

setting
T

The content setting. See the description of the individual ContentSetting objects for the possible values.

returns
Promise<object>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getResourceIdentifiers
void

Promise
The getResourceIdentifiers function looks like:

(callback?: function) => {...}
callback
function optional

The callback parameter looks like:

(resourceIdentifiers?: ResourceIdentifier[]) => void
resourceIdentifiers
ResourceIdentifier[] optional

A list of resource identifiers for this content type, or undefined if this content type does not use resource identifiers.

returns
Promise<ResourceIdentifier[]>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

set
void

Promise
Applies a new content setting rule.

The set function looks like:

(details: object, callback?: function) => {...}
details
object

primaryPattern
string

The pattern for the primary URL. For details on the format of a pattern, see Content Setting Patterns.

resourceIdentifier
ResourceIdentifier optional

The resource identifier for the content type.

scope
Scope optional

Where to set the setting (default: regular).

secondaryPattern
string optional

The pattern for the secondary URL. Defaults to matching all URLs. For details on the format of a pattern, see Content Setting Patterns.

setting
any

The setting applied by this rule. See the description of the individual ContentSetting objects for the possible values.

callback
function optional

The callback parameter looks like:

() => void
returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

CookiesContentSetting
Chrome 44+
Enum

"allow"

"block"

"session_only"

FullscreenContentSetting
Chrome 44+
Value
"allow"

ImagesContentSetting
Chrome 44+
Enum

"allow"

"block"

JavascriptContentSetting
Chrome 44+
Enum

"allow"

"block"

LocationContentSetting
Chrome 44+
Enum

"allow"

"block"

"ask"

MicrophoneContentSetting
Chrome 46+
Enum

"allow"

"block"

"ask"

MouselockContentSetting
Chrome 44+
Value
"allow"

MultipleAutomaticDownloadsContentSetting
Chrome 44+
Enum

"allow"

"block"

"ask"

NotificationsContentSetting
Chrome 44+
Enum

"allow"

"block"

"ask"

PluginsContentSetting
Chrome 44+
Value
"block"

PopupsContentSetting
Chrome 44+
Enum

"allow"

"block"

PpapiBrokerContentSetting
Chrome 44+
Value
"block"

ResourceIdentifier
The only content type using resource identifiers is contentSettings.plugins. For more information, see Resource Identifiers.

Properties
description
string optional

A human readable description of the resource.

id
string

The resource identifier for the given content type.

Scope
Chrome 44+
The scope of the ContentSetting. One of regular: setting for regular profile (which is inherited by the incognito profile if not overridden elsewhere), incognito\_session\_only: setting for incognito profile that can only be set during an incognito session and is deleted when the incognito session ends (overrides regular settings).

Enum

"regular"

"incognito_session_only"

Properties
automaticDownloads
Whether to allow sites to download multiple files automatically. One of allow: Allow sites to download multiple files automatically, block: Don't allow sites to download multiple files automatically, ask: Ask when a site wants to download files automatically after the first file. Default is ask. The primary URL is the URL of the top-level frame. The secondary URL is not used.

Type
ContentSetting<MultipleAutomaticDownloadsContentSetting>

autoVerify
Chrome 113+
Whether to allow sites to use the Private State Tokens API. One of allow: Allow sites to use the Private State Tokens API, block: Block sites from using the Private State Tokens API. Default is allow. The primary URL is the URL of the top-level frame. The secondary URL is not used. NOTE: When calling set(), the primary pattern must be .

Type
ContentSetting<AutoVerifyContentSetting>

camera
Chrome 46+
Whether to allow sites to access the camera. One of allow: Allow sites to access the camera, block: Don't allow sites to access the camera, ask: Ask when a site wants to access the camera. Default is ask. The primary URL is the URL of the document which requested camera access. The secondary URL is not used. NOTE: The 'allow' setting is not valid if both patterns are ''.

Type
ContentSetting<CameraContentSetting>

clipboard
Chrome 121+
Whether to allow sites to access the clipboard via advanced capabilities of the Async Clipboard API. "Advanced" capabilities include anything besides writing built-in formats after a user gesture, i.e. the ability to read, the ability to write custom formats, and the ability to write without a user gesture. One of allow: Allow sites to use advanced clipboard capabilities, block: Don't allow sites to use advanced clipboard capabilties, ask: Ask when a site wants to use advanced clipboard capabilities. Default is ask. The primary URL is the URL of the document which requested clipboard access. The secondary URL is not used.

Type
ContentSetting<ClipboardContentSetting>

cookies
Whether to allow cookies and other local data to be set by websites. One of allow: Accept cookies, block: Block cookies, session\_only: Accept cookies only for the current session. Default is allow. The primary URL is the URL representing the cookie origin. The secondary URL is the URL of the top-level frame.

Type
ContentSetting<CookiesContentSetting>

fullscreen
Deprecated. No longer has any effect. Fullscreen permission is now automatically granted for all sites. Value is always allow.

Type
ContentSetting<FullscreenContentSetting>

images
Whether to show images. One of allow: Show images, block: Don't show images. Default is allow. The primary URL is the URL of the top-level frame. The secondary URL is the URL of the image.

Type
ContentSetting<ImagesContentSetting>

javascript
Whether to run JavaScript. One of allow: Run JavaScript, block: Don't run JavaScript. Default is allow. The primary URL is the URL of the top-level frame. The secondary URL is not used.

Type
ContentSetting<JavascriptContentSetting>

location
Whether to allow Geolocation. One of allow: Allow sites to track your physical location, block: Don't allow sites to track your physical location, ask: Ask before allowing sites to track your physical location. Default is ask. The primary URL is the URL of the document which requested location data. The secondary URL is the URL of the top-level frame (which may or may not differ from the requesting URL).

Type
ContentSetting<LocationContentSetting>

microphone
Chrome 46+
Whether to allow sites to access the microphone. One of allow: Allow sites to access the microphone, block: Don't allow sites to access the microphone, ask: Ask when a site wants to access the microphone. Default is ask. The primary URL is the URL of the document which requested microphone access. The secondary URL is not used. NOTE: The 'allow' setting is not valid if both patterns are ''.

Type
ContentSetting<MicrophoneContentSetting>

mouselock
Deprecated. No longer has any effect. Mouse lock permission is now automatically granted for all sites. Value is always allow.

Type
ContentSetting<MouselockContentSetting>

notifications
Whether to allow sites to show desktop notifications. One of allow: Allow sites to show desktop notifications, block: Don't allow sites to show desktop notifications, ask: Ask when a site wants to show desktop notifications. Default is ask. The primary URL is the URL of the document which wants to show the notification. The secondary URL is not used.

Type
ContentSetting<NotificationsContentSetting>

plugins
Deprecated. With Flash support removed in Chrome 88, this permission no longer has any effect. Value is always block. Calls to set() and clear() will be ignored.

Type
ContentSetting<PluginsContentSetting>

popups
Whether to allow sites to show pop-ups. One of allow: Allow sites to show pop-ups, block: Don't allow sites to show pop-ups. Default is block. The primary URL is the URL of the top-level frame. The secondary URL is not used.

Type
ContentSetting<PopupsContentSetting>

unsandboxedPlugins
Deprecated. Previously, controlled whether to allow sites to run plugins unsandboxed, however, with the Flash broker process removed in Chrome 88, this permission no longer has any effect. Value is always block. Calls to set() and clear() will be ignored.

Type
ContentSetting<PpapiBrokerContentSetting>