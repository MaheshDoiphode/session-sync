chrome.fontSettings 

bookmark_border
Use the chrome.fontSettings API to manage Chrome's font settings.

Permissions
fontSettings
To use the Font Settings API, you must declare the "fontSettings" permission in the extension manifest. For example:


{
  "name": "My Font Settings Extension",
  "description": "Customize your fonts",
  "version": "0.2",
  "permissions": [
    "fontSettings"
  ],
  ...
}
Concepts and usage
Chrome allows for some font settings to depend on certain generic font families and language scripts. For example, the font used for sans-serif Simplified Chinese may be different than the font used for serif Japanese.

The generic font families supported by Chrome are based on CSS generic font families and are listed under GenericReference. When a web page specifies a generic font family, Chrome selects the font based on the corresponding setting. If no generic font family is specified, Chrome uses the setting for the "standard" generic font family.

When a web page specifies a language, Chrome selects the font based on the setting for the corresponding language script. If no language is specified, Chrome uses the setting for the default, or global, script.

The supported language scripts are specified by ISO 15924 script code and listed under ScriptCode. Technically, Chrome settings are not strictly per-script but also depend on language. For example, Chrome chooses the font for Cyrillic (ISO 15924 script code "Cyrl") when a web page specifies the Russian language, and uses this font not just for Cyrillic script but for everything the font covers, such as Latin.

Examples
The following code gets the standard font for Arabic.

chrome.fontSettings.getFont(
  { genericFamily: 'standard', script: 'Arab' },
  function(details) { console.log(details.fontId); }
);
The next snippet sets the sans-serif font for Japanese.

chrome.fontSettings.setFont(
  { genericFamily: 'sansserif', script: 'Jpan', fontId: 'MS PGothic' }
);
To try this API, install the fontSettings API example from the chrome-extension-samples repository.

Types
FontName
Represents a font name.

Properties
displayName
string

The display name of the font.

fontId
string

The font ID.

GenericFamily
A CSS generic font family.

Enum

"standard"

"sansserif"

"serif"

"fixed"

"cursive"

"fantasy"

"math"

LevelOfControl
One of not\_controllable: cannot be controlled by any extension controlled\_by\_other\_extensions: controlled by extensions with higher precedence controllable\_by\_this\_extension: can be controlled by this extension controlled\_by\_this\_extension: controlled by this extension

Enum

"not_controllable"

"controlled_by_other_extensions"

"controllable_by_this_extension"

"controlled_by_this_extension"

ScriptCode
An ISO 15924 script code. The default, or global, script is represented by script code "Zyyy".

Enum

"Afak"

"Arab"

"Armi"

"Armn"

"Avst"

"Bali"

"Bamu"

"Bass"

"Batk"

"Beng"

"Blis"

"Bopo"

"Brah"

"Brai"

"Bugi"

"Buhd"

"Cakm"

"Cans"

"Cari"

"Cham"

"Cher"

"Cirt"

"Copt"

"Cprt"

"Cyrl"

"Cyrs"

"Deva"

"Dsrt"

"Dupl"

"Egyd"

"Egyh"

"Egyp"

"Elba"

"Ethi"

"Geor"

"Geok"

"Glag"

"Goth"

"Gran"

"Grek"

"Gujr"

"Guru"

"Hang"

"Hani"

"Hano"

"Hans"

"Hant"

"Hebr"

"Hluw"

"Hmng"

"Hung"

"Inds"

"Ital"

"Java"

"Jpan"

"Jurc"

"Kali"

"Khar"

"Khmr"

"Khoj"

"Knda"

"Kpel"

"Kthi"

"Lana"

"Laoo"

"Latf"

"Latg"

"Latn"

"Lepc"

"Limb"

"Lina"

"Linb"

"Lisu"

"Loma"

"Lyci"

"Lydi"

"Mand"

"Mani"

"Maya"

"Mend"

"Merc"

"Mero"

"Mlym"

"Moon"

"Mong"

"Mroo"

"Mtei"

"Mymr"

"Narb"

"Nbat"

"Nkgb"

"Nkoo"

"Nshu"

"Ogam"

"Olck"

"Orkh"

"Orya"

"Osma"

"Palm"

"Perm"

"Phag"

"Phli"

"Phlp"

"Phlv"

"Phnx"

"Plrd"

"Prti"

"Rjng"

"Roro"

"Runr"

"Samr"

"Sara"

"Sarb"

"Saur"

"Sgnw"

"Shaw"

"Shrd"

"Sind"

"Sinh"

"Sora"

"Sund"

"Sylo"

"Syrc"

"Syre"

"Syrj"

"Syrn"

"Tagb"

"Takr"

"Tale"

"Talu"

"Taml"

"Tang"

"Tavt"

"Telu"

"Teng"

"Tfng"

"Tglg"

"Thaa"

"Thai"

"Tibt"

"Tirh"

"Ugar"

"Vaii"

"Visp"

"Wara"

"Wole"

"Xpeo"

"Xsux"

"Yiii"

"Zmth"

"Zsym"

"Zyyy"

Methods
clearDefaultFixedFontSize()
Promise
chrome.fontSettings.clearDefaultFixedFontSize(
  details?: object,
  callback?: function,
)
Clears the default fixed font size set by this extension, if any.

Parameters
details
object optional

This parameter is currently unused.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

clearDefaultFontSize()
Promise
chrome.fontSettings.clearDefaultFontSize(
  details?: object,
  callback?: function,
)
Clears the default font size set by this extension, if any.

Parameters
details
object optional

This parameter is currently unused.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

clearFont()
Promise
chrome.fontSettings.clearFont(
  details: object,
  callback?: function,
)
Clears the font set by this extension, if any.

Parameters
details
object

genericFamily
GenericFamily

The generic font family for which the font should be cleared.

script
ScriptCode optional

The script for which the font should be cleared. If omitted, the global script font setting is cleared.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

clearMinimumFontSize()
Promise
chrome.fontSettings.clearMinimumFontSize(
  details?: object,
  callback?: function,
)
Clears the minimum font size set by this extension, if any.

Parameters
details
object optional

This parameter is currently unused.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getDefaultFixedFontSize()
Promise
chrome.fontSettings.getDefaultFixedFontSize(
  details?: object,
  callback?: function,
)
Gets the default size for fixed width fonts.

Parameters
details
object optional

This parameter is currently unused.

callback
function optional

The callback parameter looks like:

(details: object) => void
details
object

levelOfControl
LevelOfControl

The level of control this extension has over the setting.

pixelSize
number

The font size in pixels.

Returns
Promise<object>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getDefaultFontSize()
Promise
chrome.fontSettings.getDefaultFontSize(
  details?: object,
  callback?: function,
)
Gets the default font size.

Parameters
details
object optional

This parameter is currently unused.

callback
function optional

The callback parameter looks like:

(details: object) => void
details
object

levelOfControl
LevelOfControl

The level of control this extension has over the setting.

pixelSize
number

The font size in pixels.

Returns
Promise<object>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getFont()
Promise
chrome.fontSettings.getFont(
  details: object,
  callback?: function,
)
Gets the font for a given script and generic font family.

Parameters
details
object

genericFamily
GenericFamily

The generic font family for which the font should be retrieved.

script
ScriptCode optional

The script for which the font should be retrieved. If omitted, the font setting for the global script (script code "Zyyy") is retrieved.

callback
function optional

The callback parameter looks like:

(details: object) => void
details
object

fontId
string

The font ID. Rather than the literal font ID preference value, this may be the ID of the font that the system resolves the preference value to. So, fontId can differ from the font passed to setFont, if, for example, the font is not available on the system. The empty string signifies fallback to the global script font setting.

levelOfControl
LevelOfControl

The level of control this extension has over the setting.

Returns
Promise<object>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getFontList()
Promise
chrome.fontSettings.getFontList(
  callback?: function,
)
Gets a list of fonts on the system.

Parameters
callback
function optional

The callback parameter looks like:

(results: FontName[]) => void
results
FontName[]

Returns
Promise<FontName[]>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getMinimumFontSize()
Promise
chrome.fontSettings.getMinimumFontSize(
  details?: object,
  callback?: function,
)
Gets the minimum font size.

Parameters
details
object optional

This parameter is currently unused.

callback
function optional

The callback parameter looks like:

(details: object) => void
details
object

levelOfControl
LevelOfControl

The level of control this extension has over the setting.

pixelSize
number

The font size in pixels.

Returns
Promise<object>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

setDefaultFixedFontSize()
Promise
chrome.fontSettings.setDefaultFixedFontSize(
  details: object,
  callback?: function,
)
Sets the default size for fixed width fonts.

Parameters
details
object

pixelSize
number

The font size in pixels.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

setDefaultFontSize()
Promise
chrome.fontSettings.setDefaultFontSize(
  details: object,
  callback?: function,
)
Sets the default font size.

Parameters
details
object

pixelSize
number

The font size in pixels.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

setFont()
Promise
chrome.fontSettings.setFont(
  details: object,
  callback?: function,
)
Sets the font for a given script and generic font family.

Parameters
details
object

fontId
string

The font ID. The empty string means to fallback to the global script font setting.

genericFamily
GenericFamily

The generic font family for which the font should be set.

script
ScriptCode optional

The script code which the font should be set. If omitted, the font setting for the global script (script code "Zyyy") is set.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

setMinimumFontSize()
Promise
chrome.fontSettings.setMinimumFontSize(
  details: object,
  callback?: function,
)
Sets the minimum font size.

Parameters
details
object

pixelSize
number

The font size in pixels.

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 96+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onDefaultFixedFontSizeChanged
chrome.fontSettings.onDefaultFixedFontSizeChanged.addListener(
  callback: function,
)
Fired when the default fixed font size setting changes.

Parameters
callback
function

The callback parameter looks like:

(details: object) => void
details
object

levelOfControl
LevelOfControl

The level of control this extension has over the setting.

pixelSize
number

The font size in pixels.

onDefaultFontSizeChanged
chrome.fontSettings.onDefaultFontSizeChanged.addListener(
  callback: function,
)
Fired when the default font size setting changes.

Parameters
callback
function

The callback parameter looks like:

(details: object) => void
details
object

levelOfControl
LevelOfControl

The level of control this extension has over the setting.

pixelSize
number

The font size in pixels.

onFontChanged
chrome.fontSettings.onFontChanged.addListener(
  callback: function,
)
Fired when a font setting changes.

Parameters
callback
function

The callback parameter looks like:

(details: object) => void
details
object

fontId
string

The font ID. See the description in getFont.

genericFamily
GenericFamily

The generic font family for which the font setting has changed.

levelOfControl
LevelOfControl

The level of control this extension has over the setting.

script
ScriptCode optional

The script code for which the font setting has changed.

onMinimumFontSizeChanged
chrome.fontSettings.onMinimumFontSizeChanged.addListener(
  callback: function,
)
Fired when the minimum font size setting changes.

Parameters
callback
function

The callback parameter looks like:

(details: object) => void
details
object

levelOfControl
LevelOfControl

The level of control this extension has over the setting.

pixelSize
number

The font size in pixels.