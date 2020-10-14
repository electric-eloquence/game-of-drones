# Action Methods

### addClass(classes)
For each submitted class, add that class to all matches which do not have that
class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string`\|`function` | A space-separated string, or a function that returns a space-separated string. |

### after(...content)
Add HTML content immediately after all matches.

| Param | Type | Description |
| --- | --- | --- |
| ...content | `string`\|`object`\|`array` | A string, a DOM (or DOM-like) element, a jQuery/Cheerio component, an array thereof, or a comma-separated combination thereof. |

### after(content)
Add HTML content immediately after all matches.

| Param | Type | Description |
| --- | --- | --- |
| content | `function` | A function that returns an HTML string. |

### append(...content)
Append HTML content to the innerHTML of all matches.

| Param | Type | Description |
| --- | --- | --- |
| ...content | `string`\|`object`\|`array` | A string, a DOM (or DOM-like) element, a jQuery/Cheerio component, an array thereof, or a comma-separated combination thereof. |

### append(content)
Append HTML content to the innerHTML of all matches.

| Param | Type | Description |
| --- | --- | --- |
| content | `function` | A function that returns an HTML string. |

### attr(attributes)
Set one or more attributes for all matches.

| Param | Type | Description |
| --- | --- | --- |
| attributes | `object` | An object of attribute:value pairs. A string value will add or update the corresponding attribute. A null value will remove the corresponding attribute. |

### before(...content)
Add HTML content immediately before all matches.

| Param | Type | Description |
| --- | --- | --- |
| ...content | `string`\|`object`\|`array` | A string, a DOM (or DOM-like) element, a jQuery/Cheerio component, an array thereof, or a comma-separated combination thereof. |

### before(content)
Add HTML content immediately before all matches.

| Param | Type | Description |
| --- | --- | --- |
| content | `function` | A function that returns an HTML string. |

### css(properties)
Set one or more CSS properties for all matches.

| Param | Type | Description |
| --- | --- | --- |
| properties | `object` | An object of property:value pairs to set. |

### data(keyValues)
Set one or more key:value pairs of data. Does not affect HTML data attributes.

| Param | Type | Description |
| --- | --- | --- |
| keyValues | `object` | An object of key:value pairs. |

### detach()
Remove all matches from the DOM, but keep in memory in case they need to be reattached.

### empty()
Empty innerHTML of all matches.

### height(value)
Set the height (not including padding, border, or margin) of all matches.

| Param | Type | Description |
| --- | --- | --- |
| value | `number`\|`string`\|`function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |

### html(htmlString)
Set the innerHTML of all matches. Will set `state.html` as per the getter below.

| Param | Type | Description |
| --- | --- | --- |
| htmlString | `string` | A string of HTML. |

### html()
Dispatching an 'html' action without an htmlString parameter will set
`state.html` to the string value of the innerHTML of the actual element. Prior
to that, `state.html` will be null. Simply invoking `.getState()` where
`state.html` is null will not update `state.html`. However, once `state.html`
has been set to a string, subsequent invocations of `.getState()` will update
`state.html`. Set `state.html` only when necessary, since very large innerHTML
strings across many organisms with many members can add up to a large amount of
data.

### prepend(...content)
Prepend HTML content to the innerHTML of all matches.

| Param | Type | Description |
| --- | --- | --- |
| ...content | `string`\|`object`\|`array` | A string, a DOM (or DOM-like) element, a jQuery/Cheerio component, an array thereof, or a comma-separated combination thereof. |

### prepend(content)
Prepend HTML content to the innerHTML of all matches.

| Param | Type | Description |
| --- | --- | --- |
| content | `function` | A function that returns an HTML string. |

### prop(properties)
Set one or more properties for all matches. See https://api.jquery.com/prop/
for important distinctions between attributes and properties.

| Param | Type | Description |
| --- | --- | --- |
| properties | `object` | An object of property:value pairs. |

### remove()
Remove all matches from the DOM, and from memory.

### removeClass(classes)
For each submitted class, remove that class from all matches which have that
class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string`\|`function` | A space-separated string, or a function that returns a space-separated string. |

### removeData(name)
Remove a previously-stored piece of data. Does not affect HTML data attributes.

| Param | Type | Description |
| --- | --- | --- |
| name | `string` | A string naming the piece of data to delete. |

### removeData(list)
Remove previously-stored pieces of data. Does not affect HTML attributes in the
DOM.

| Param | Type | Description |
| --- | --- | --- |
| list | `string`\|`array` | A space-separated string or an array naming the pieces of data to delete. |

### scrollLeft(value)
Set the horizontal scroll position (the number of CSS pixels that are hidden
from view to the left of the scrollable area) of the match.

| Param | Type | Description |
| --- | --- | --- |
| value | `number` | The number to set the scroll position to. |

### scrollTop(value)
Set the vertical scroll position (the number of CSS pixels that are hidden from
view above the scrollable area) of the match.

| Param | Type | Description |
| --- | --- | --- |
| value | `number` | The number to set the scroll position to. |

### setActiveOrganism(selector)
Only applicable if 'document' is an incepted organism. When a 'focus' action is
dispatched by an organism, this sets the 'document' organism's
`state.activeOrganism` to the selector of the focused organism. The
'setActiveOrganism' action can only be dispatched by the 'document' organism.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string` | The identifying selector of the focused organism. |

### setBoundingClientRect(boundingClientRect)
Copy properties of the boundingClientRect parameter over the corresponding
properties on `state.boundingClientRect`.

| Param | Type | Description |
| --- | --- | --- |
| boundingClientRect | `object` | An object of key:values. The object may contain one or more properties, but they must correspond to properties defined by the [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect) class. |

### text(text)
Set the textContent of all matches. This is a safer way to change text on the
DOM than dispatching an 'html' action. Will set `state.textContent` as per the
getter below.

| Param | Type | Description |
| --- | --- | --- |
| text | `string` | A string of text. |

### text()
Dispatching a 'text' action without a parameter will set `state.textContent` to
the textContent of the targeted element, or if untargeted, the textContent of
the first element. This contrasts with the return value of jQuery/Cheerio
`.text()` which concatenates the textContent of all matching elements. Prior to
the first 'text' action, `state.textContent` will be null. Simply invoking
`.getState()` where `state.textContent` is null will not update
`state.textContent`. However, once `state.textContent` has been set to a string,
subsequent invocations of `.getState()` will update `state.textContent`. Set
`state.textContent` only when necessary, since very large text strings across
many organisms with many members can add up to a large amount of data.

### toggleClass(classes)
For each submitted class, add or remove that class from all matches, depending
on whether or not the member has that class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string`\|`function` | A space-separated string, or a function that returns a space-separated string. |

### val(value)
Set the value of all matches, typically form inputs. This will set `state.val`.

| Param | Type | Description |
| --- | --- | --- |
| value | `string`\|`number`\|`array`\|`function` | The value(s) to which to set the form input value(s). |

### width(value)
Set the width (not including padding, border, or margin) of all matches.

| Param | Type | Description |
| --- | --- | --- |
| value | `number`\|`string`\|`function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |

### blur()
Remove focus from the specified element, if that element has focus.
If there is a 'document' organism and it has `state.activeOrganism` set, unset that property.

### focus()
Set focus on the specified element, if that element can take focus. If it can take focus, and if there is a 'document'
organism, set the focused organism's selector as `state.activeOrganism`.
