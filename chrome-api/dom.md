chrome.dom 

bookmark_border
Use the chrome.dom API to access special DOM APIs for Extensions

Availability
Chrome 88+
Methods
openOrClosedShadowRoot()

chrome.dom.openOrClosedShadowRoot(
  element: HTMLElement,
)
Gets the open shadow root or the closed shadow root hosted by the specified element. If the element doesn't attach the shadow root, it will return null.

Parameters
element
HTMLElement

Returns
object