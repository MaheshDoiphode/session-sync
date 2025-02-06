chrome.bookmarks 

bookmark_border
Use the chrome.bookmarks API to create, organize, and otherwise manipulate bookmarks. Also see Override Pages, which you can use to create a custom Bookmark Manager page.

Clicking the star adds a bookmark
Clicking the star adds a bookmark.
Permissions
bookmarks
You must declare the "bookmarks" permission in the extension manifest to use the bookmarks API. For example:


{
  "name": "My extension",
  ...
  "permissions": [
    "bookmarks"
  ],
  ...
}
Concepts and usage
Objects and properties
Bookmarks are organized in a tree, where each node in the tree is either a bookmark or a folder (sometimes called a group). Each node in the tree is represented by a bookmarks.BookmarkTreeNode object.

BookmarkTreeNode properties are used throughout the chrome.bookmarks API. For example, when you call bookmarks.create, you pass in the new node's parent (parentId), and, optionally, the node's index, title, and url properties. See bookmarks.BookmarkTreeNode for information about the properties a node can have.

Note: You cannot use this API to add or remove entries in the root folder. You also cannot rename, move, or remove the special "Bookmarks Bar" and "Other Bookmarks" folders.
Examples
The following code creates a folder with the title "Extension bookmarks". The first argument to create() specifies properties for the new folder. The second argument defines a function to be executed after the folder is created.

chrome.bookmarks.create(
  {'parentId': bookmarkBar.id, 'title': 'Extension bookmarks'},
  function(newFolder) {
    console.log("added folder: " + newFolder.title);
  },
);
The next snippet creates a bookmark pointing to the developer documentation for extensions. Since nothing bad will happen if creating the bookmark fails, this code doesn't bother to define a callback function.

chrome.bookmarks.create({
  'parentId': extensionsFolderId,
  'title': 'Extensions doc',
  'url': 'https://developer.chrome.com/docs/extensions',
});
To try this API, install the Bookmarks API example from the chrome-extension-samples repository.

Types
BookmarkTreeNode
A node (either a bookmark or a folder) in the bookmark tree. Child nodes are ordered within their parent folder.

Properties
children
BookmarkTreeNode[] optional

An ordered list of children of this node.

dateAdded
number optional

When this node was created, in milliseconds since the epoch (new Date(dateAdded)).

dateGroupModified
number optional

When the contents of this folder last changed, in milliseconds since the epoch.

dateLastUsed
number optional

Chrome 114+
When this node was last opened, in milliseconds since the epoch. Not set for folders.

folderType
FolderType optional

Pending
If present, this is a folder that is added by the browser and that cannot be modified by the user or the extension. Child nodes may be modified, if this node does not have the unmodifiable property set. Omitted if the node can be modified by the user and the extension (default).

There may be zero, one or multiple nodes of each folder type. A folder may be added or removed by the browser, but not via the extensions API.

id
string

The unique identifier for the node. IDs are unique within the current profile, and they remain valid even after the browser is restarted.

index
number optional

The 0-based position of this node within its parent folder.

parentId
string optional

The id of the parent folder. Omitted for the root node.

syncing
boolean

Pending
Whether this node is synced with the user's remote account storage by the browser. This can be used to distinguish between account and local-only versions of the same FolderType. The value of this property may change for an existing node, for example as a result of user action.

Note: this reflects whether the node is saved to the browser's built-in account provider. It is possible that a node could be synced via a third-party, even if this value is false.

For managed nodes (nodes where unmodifiable is set to true), this property will always be false.

title
string

The text displayed for the node.

unmodifiable
"managed"
 optional

Indicates the reason why this node is unmodifiable. The managed value indicates that this node was configured by the system administrator or by the custodian of a supervised user. Omitted if the node can be modified by the user and the extension (default).

url
string optional

The URL navigated to when a user clicks the bookmark. Omitted for folders.

BookmarkTreeNodeUnmodifiable
Chrome 44+
Indicates the reason why this node is unmodifiable. The managed value indicates that this node was configured by the system administrator. Omitted if the node can be modified by the user and the extension (default).

Value
"managed"

CreateDetails
Object passed to the create() function.

Properties
index
number optional

parentId
string optional

Defaults to the Other Bookmarks folder.

title
string optional

url
string optional

FolderType
Pending
Indicates the type of folder.

Enum

"bookmarks-bar"
The folder whose contents is displayed at the top of the browser window.

"other"
Bookmarks which are displayed in the full list of bookmarks on all platforms.

"mobile"
Bookmarks generally available on the user's mobile devices, but modifiable by extension or in the bookmarks manager.

"managed"
A top-level folder that may be present if the system administrator or the custodian of a supervised user has configured bookmarks.

Properties
MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE
Deprecated
Bookmark write operations are no longer limited by Chrome.

Value
1000000

MAX_WRITE_OPERATIONS_PER_HOUR
Deprecated
Bookmark write operations are no longer limited by Chrome.

Value
1000000

Methods
create()
Promise
chrome.bookmarks.create(
  bookmark: CreateDetails,
  callback?: function,
)
Creates a bookmark or folder under the specified parentId. If url is NULL or missing, it will be a folder.

Parameters
bookmark
CreateDetails

callback
function optional

The callback parameter looks like:

(result: BookmarkTreeNode) => void
result
BookmarkTreeNode

Returns
Promise<BookmarkTreeNode>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

get()
Promise
chrome.bookmarks.get(
  idOrIdList: string | [string, ...string[]],
  callback?: function,
)
Retrieves the specified BookmarkTreeNode(s).

Parameters
idOrIdList
string | [string, ...string[]]

A single string-valued id, or an array of string-valued ids

callback
function optional

The callback parameter looks like:

(results: BookmarkTreeNode[]) => void
results
BookmarkTreeNode[]

Returns
Promise<BookmarkTreeNode[]>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getChildren()
Promise
chrome.bookmarks.getChildren(
  id: string,
  callback?: function,
)
Retrieves the children of the specified BookmarkTreeNode id.

Parameters
id
string

callback
function optional

The callback parameter looks like:

(results: BookmarkTreeNode[]) => void
results
BookmarkTreeNode[]

Returns
Promise<BookmarkTreeNode[]>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getRecent()
Promise
chrome.bookmarks.getRecent(
  numberOfItems: number,
  callback?: function,
)
Retrieves the recently added bookmarks.

Parameters
numberOfItems
number

The maximum number of items to return.

callback
function optional

The callback parameter looks like:

(results: BookmarkTreeNode[]) => void
results
BookmarkTreeNode[]

Returns
Promise<BookmarkTreeNode[]>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getSubTree()
Promise
chrome.bookmarks.getSubTree(
  id: string,
  callback?: function,
)
Retrieves part of the Bookmarks hierarchy, starting at the specified node.

Parameters
id
string

The ID of the root of the subtree to retrieve.

callback
function optional

The callback parameter looks like:

(results: BookmarkTreeNode[]) => void
results
BookmarkTreeNode[]

Returns
Promise<BookmarkTreeNode[]>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getTree()
Promise
chrome.bookmarks.getTree(
  callback?: function,
)
Retrieves the entire Bookmarks hierarchy.

Parameters
callback
function optional

The callback parameter looks like:

(results: BookmarkTreeNode[]) => void
results
BookmarkTreeNode[]

Returns
Promise<BookmarkTreeNode[]>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

move()
Promise
chrome.bookmarks.move(
  id: string,
  destination: object,
  callback?: function,
)
Moves the specified BookmarkTreeNode to the provided location.

Parameters
id
string

destination
object

index
number optional

parentId
string optional

callback
function optional

The callback parameter looks like:

(result: BookmarkTreeNode) => void
result
BookmarkTreeNode

Returns
Promise<BookmarkTreeNode>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

remove()
Promise
chrome.bookmarks.remove(
  id: string,
  callback?: function,
)
Removes a bookmark or an empty bookmark folder.

Parameters
id
string

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

removeTree()
Promise
chrome.bookmarks.removeTree(
  id: string,
  callback?: function,
)
Recursively removes a bookmark folder.

Parameters
id
string

callback
function optional

The callback parameter looks like:

() => void
Returns
Promise<void>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

search()
Promise
chrome.bookmarks.search(
  query: string | object,
  callback?: function,
)
Searches for BookmarkTreeNodes matching the given query. Queries specified with an object produce BookmarkTreeNodes matching all specified properties.

Parameters
query
string | object

Either a string of words and quoted phrases that are matched against bookmark URLs and titles, or an object. If an object, the properties query, url, and title may be specified and bookmarks matching all specified properties will be produced.

query
string optional

A string of words and quoted phrases that are matched against bookmark URLs and titles.

title
string optional

The title of the bookmark; matches verbatim.

url
string optional

The URL of the bookmark; matches verbatim. Note that folders have no URL.

callback
function optional

The callback parameter looks like:

(results: BookmarkTreeNode[]) => void
results
BookmarkTreeNode[]

Returns
Promise<BookmarkTreeNode[]>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

update()
Promise
chrome.bookmarks.update(
  id: string,
  changes: object,
  callback?: function,
)
Updates the properties of a bookmark or folder. Specify only the properties that you want to change; unspecified properties will be left unchanged. Note: Currently, only 'title' and 'url' are supported.

Parameters
id
string

changes
object

title
string optional

url
string optional

callback
function optional

The callback parameter looks like:

(result: BookmarkTreeNode) => void
result
BookmarkTreeNode

Returns
Promise<BookmarkTreeNode>

Chrome 90+
Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

Events
onChanged
chrome.bookmarks.onChanged.addListener(
  callback: function,
)
Fired when a bookmark or folder changes. Note: Currently, only title and url changes trigger this.

Parameters
callback
function

The callback parameter looks like:

(id: string, changeInfo: object) => void
id
string

changeInfo
object

title
string

url
string optional

onChildrenReordered
chrome.bookmarks.onChildrenReordered.addListener(
  callback: function,
)
Fired when the children of a folder have changed their order due to the order being sorted in the UI. This is not called as a result of a move().

Parameters
callback
function

The callback parameter looks like:

(id: string, reorderInfo: object) => void
id
string

reorderInfo
object

childIds
string[]

onCreated
chrome.bookmarks.onCreated.addListener(
  callback: function,
)
Fired when a bookmark or folder is created.

Parameters
callback
function

The callback parameter looks like:

(id: string, bookmark: BookmarkTreeNode) => void
id
string

bookmark
BookmarkTreeNode

onImportBegan
chrome.bookmarks.onImportBegan.addListener(
  callback: function,
)
Fired when a bookmark import session is begun. Expensive observers should ignore onCreated updates until onImportEnded is fired. Observers should still handle other notifications immediately.

Parameters
callback
function

The callback parameter looks like:

() => void
onImportEnded
chrome.bookmarks.onImportEnded.addListener(
  callback: function,
)
Fired when a bookmark import session is ended.

Parameters
callback
function

The callback parameter looks like:

() => void
onMoved
chrome.bookmarks.onMoved.addListener(
  callback: function,
)
Fired when a bookmark or folder is moved to a different parent folder.

Parameters
callback
function

The callback parameter looks like:

(id: string, moveInfo: object) => void
id
string

moveInfo
object

index
number

oldIndex
number

oldParentId
string

parentId
string

onRemoved
chrome.bookmarks.onRemoved.addListener(
  callback: function,
)
Fired when a bookmark or folder is removed. When a folder is removed recursively, a single notification is fired for the folder, and none for its contents.

Parameters
callback
function

The callback parameter looks like:

(id: string, removeInfo: object) => void
id
string

removeInfo
object

index
number

node
BookmarkTreeNode

Chrome 48+
parentId
string