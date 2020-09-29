# Requerio API

## Additional Requerio Properties

### requerio.store
A reference to the Redux store for the Requerio instance.

### requerio.incept(selector, [selector, ...])
Incepts additional organisms after initialization. They will be added to the 
`requerio.$orgs` object.

__Returns__: `undefined`

| Param | Type | Description |
| --- | --- | --- |
| ...selector | `string` | A comma separated list of selectors to incept into organisms. |

## Organism Methods

These methods are made available on organisms after inception. The organisms are 
members of Requerio's `$orgs` property and are keyed by their selector. For 
example:

```javascript
requerio.$orgs['#yoda'].dispatchAction('css', {color: 'green'});
```

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN `npm run doc` TO UPDATE -->
<!-- START GENERATED API DOC -->


### .blur()
A server-side stand-in for client-side `.blur()`.

### .dispatchAction(method, [args], [memberIdx])
Dispatches actions for reduction. Side-effects occur here (not in the reducer).
1. Applies the jQuery or Cheerio method.
2. Applies any additional changes.
3. Calls the Redux `store.dispatch()` method.

__Returns__: `object` - The organism. Allows for action dispatches to be chained.

| Param | Type | Description |
| --- | --- | --- |
| method | `string` | The name of the method on the organism's prototype. |
| [args] | `*` | This param contains the values to be passed as arguments to the method. null or an empty array may be submitted if not passing arguments, but targeting a memberIdx. |
| [memberIdx] | `number`\|`number[]` | The index, or array of indices, of the organism member(s), if targeting one or more members. |

### .exclude(selector)
Exclude (temporarily) a selected member or members from an organism's `.$members`
array. A `.dispatchAction()` is meant to be ultimately chained to this method.
Invoking `.dispatchAction()` will restore all original `.$members`.

__Returns__: `object` - The organism with its `.$members` winnowed of selected exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object`\|`function` | A selector string, a DOM (or DOM-like) element, a jQuery/Cheerio component, or a function returning true or false. |

### .focus([options])
A server-side stand-in for client-side `.focus()`.

### .getState([memberIdx])
A reference to Redux `store.getState()`.

__Returns__: `object` - The organism's state.

| Param | Type | Description |
| --- | --- | --- |
| [memberIdx] | `number` | The index of the organism member (if targeting a member). |

### .getStore()
A reference to the Redux `store`. The same reference as `requerio.store`.

__Returns__: `object` - This app's state store.

### .hasChild(selector)
Filter (temporarily) an organism's `.$members` array to include only those with
a child matching the selector. A `.dispatchAction()` is meant to be ultimately
chained to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |

### .hasElement(element)
Filter (temporarily) an organism's `.$members` to include only that whose element
matches the param. A `.dispatchAction()` is meant to be ultimately chained to
this method. Invoking `.dispatchAction()` will restore all original `$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| element | `object` | A DOM (or DOM-like) element. |

### .hasNext(selector)
Filter (temporarily) an organism's `.$members` array to include only those whose
"next" sibling is matched by the selector. A `.dispatchAction()` is meant to be
ultimately chained to this method. Invoking `.dispatchAction()` will restore all
original `$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |

### .hasParent(selector)
Filter (temporarily) an organism's `.$members` to include only those with a
parent matching the selector. A `.dispatchAction()` is meant to be ultimately
chained to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |

### .hasPrev(selector)
Filter (temporarily) an organism's `.$members` to include only those whose "prev"
sibling is matched by the selector. A `.dispatchAction()` is meant to be
ultimately chained to this method. Invoking `.dispatchAction()` will restore all
original `$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |

### .hasSelector(selector)
Filter (temporarily) an organism's `.$members` to include only those that match
the selector criteria. A `.dispatchAction()` is meant to be ultimately chained
to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string` | A jQuery/Cheerio selector. |

### .hasSibling(selector)
Filter (temporarily) an organism's `.$members` to include only those with a
sibling matched by the selector. A `.dispatchAction()` is meant to be ultimately
chained to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string` | A selector string. |

### .populateMembers()
(Re)populate an organism's `.$members` array with its (recalculated) members.
`.$members` are jQuery/Cheerio components, not fully incepted organisms.

### .resetElementsAndMembers()
Reset the organism's elements and members as they are added or removed. This is
necessary because neither jQuery nor Cheerio dynamically updates the indexed
elements or length properties on a saved jQuery or Cheerio component.

### .setBoundingClientRect(rectObj, [memberIdx])
Give the ability to set `boundingClientRect` properties. Only for server-side
testing.

| Param | Type | Description |
| --- | --- | --- |
| rectObj | `object` | An object of `boundingClientRect` measurements. Does not need to include all of them. |
| [memberIdx] | `number`\|`number[]` | The index (or array of indices) of the organism member(s) if targeting one or more members. |

### .updateMeasurements()
Update measurements on the state object as per changes to attributes and styles.

__Returns__: `boolean` - Whether or not to update state based on a change in measurement.

| Param | Type | Description |
| --- | --- | --- |
| state | `object` | The most recent state. |
| [member] | `object`\|`object[]` | The object (or array or objects) representing the organism member(s) (if targeting one or more members). |
| [memberIdx] | `number`\|`number[]` | The index (or array of indices) of the organism member(s) (if targeting one or more members). |
<!-- STOP GENERATED API DOC -->

## Additional Documentation

* [Action Methods](methods.md)
* [State Object Defaults](state-object-defaults.md)
* [Extensibility](extensibility.md)
