/* eslint-disable lines-around-comment */
/* eslint-disable max-len */

/**
 * Contracts for future states. Initial states contain empty values.
 * Do not to let states bloat for no reason (as it could with large .innerHTML or .textContent).
 * Be sure to update docs/state-object-defaults.md when updating any of these defaults.
 *
 * @param {string} orgSelector - The organism's selector.
 * @returns {object} Default state.
 */
function getStateDefault(orgSelector) {
  let stateDefault = {};

  if (orgSelector === 'document') {
    stateDefault = {
      activeOrganism: null,
      data: null
    };
  }
  else if (orgSelector === 'window') {
    stateDefault = {
      data: null,
      scrollTop: null,
      width: null,
      height: null
    };
  }
  else {
    stateDefault = {
      attribs: {},
      boundingClientRect: {
        width: null,
        height: null,
        top: null,
        right: null,
        bottom: null,
        left: null
      },
      classArray: [],
      classList: [],
      data: null,
      innerHTML: null,
      innerWidth: null,
      innerHeight: null,
      props: {},
      scrollTop: null,
      style: {},
      textContent: null,
      width: null,
      height: null,
      $members: []
    };
  }

  return stateDefault;
}

/**
 * This builds state objects for organisms and their members.
 *
 * @param {object} $org - Organism.
 * @param {object} state - Preinitialized state.
 * @param {object} action - Object defining how we'll act.
 * @returns {undefined} This function mutates the state param.
 */
function stateBuild($org, state, action) {
  try {
    const memberIdx = action.memberIdx;

    // attribs

    if ($org[0] && $org[0].attribs) { // Cheerio
      state.attribs = JSON.parse(JSON.stringify($org[0].attribs));
    }

    else if ($org[0] && $org[0].attributes && $org[0].attributes.length) { // jQuery
      for (let i = 0; i < $org[0].attributes.length; i++) {
        const attr = $org[0].attributes[i];

        state.attribs[attr.name] = attr.value;
      }
    }

    // classArray and classList

    let classesForReduction = [];

    if (state.attribs && typeof state.attribs.class === 'string') {
      classesForReduction = state.attribs.class.trim() ? state.attribs.class.split(/\s+/) : [];
      state.classArray = classesForReduction;
      state.classList = state.classArray;
    }

    // props

    if (state.props instanceof Object) {
      for (let i of Object.keys(state.props)) {
        state.props[i] = $org[0][i];
      }
    }

    switch (action.method) {

      /**
### addClass(classes)
For each submitted class, add that class to all matches which do not have that
class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string`\|`function` | A space-separated string, or a function that returns a space-separated string. |
*/
      case 'addClass': {
        // Handled by running the method as a side-effect and splitting the class attribute into an array and copying
        // that to .classArray and .classList
        break;
      }

      /**
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
*/
      case 'after': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected organisms.
        // Will not automatically update any state's .innerHTML.
        break;
      }

      /**
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
*/
      case 'append': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected organisms.
        break;
      }

      /**
### attr(attributes)
Set one or more attributes for all matches.

| Param | Type | Description |
| --- | --- | --- |
| attributes | `object` | An object of attribute:value pairs. A string value will add or update the corresponding attribute. A null value will remove the corresponding attribute. |
*/
      case 'attr': {
        if (action.args[0] instanceof Object && action.args[0].constructor === Object) {
          Object.assign(state.attribs, action.args[0]);
        }

        break;
      }

      /**
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
*/
      case 'before': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected organisms.
        // Will not automatically update any state's .innerHTML.
        break;
      }

      /**
### css(properties)
Set one or more CSS properties for all matches.

| Param | Type | Description |
| --- | --- | --- |
| properties | `object` | An object of property:value pairs to set. |

### css(properties)
Update `state.style` with the computed style of the actual element. Requerio
does not preemptively set all styles on the state, given how wasteful that would
be across all styles across all organisms.

| Param | Type | Description |
| --- | --- | --- |
| properties | `string`\|`string[]` | The name or names of properties to get from the element, and set on the state. |
*/
      case 'css': {
        Object.assign(state.style, action.args[0]);

        break;
      }

      /**
### data(keyValues)
Set one or more key:value pairs of data. Does not affect HTML attributes in the
DOM.

| Param | Type | Description |
| --- | --- | --- |
| keyValues | `object` | An object of key:value pairs. |
*/
      case 'data': {
        if (action.args[0] instanceof Object && action.args[0].constructor === Object) {
          if (!state.data) {
            state.data = {};
          }

          Object.assign(state.data, action.args[0]);
        }

        break;
      }

      /**
### detach()
Remove all matches from the DOM, but keep in memory in case they need to be reattached.
*/
      case 'detach': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected parents.
        // Will not automatically update any state's .innerHTML.
        break;
      }

      /**
### empty()
Empty innerHTML of all matches.
*/
      case 'empty': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected organisms.
        // Will not automatically update any state's .innerHTML.
        break;
      }

      // Internal. Do not document.
      case 'getBoundingClientRect': {
        if (action.args.length === 1) {
          if (
            typeof action.args[0] === 'object' && // Exclude functions. Don't assume what its constructor is.
            action.args[0] instanceof Object
          ) {

            // Must copy, not reference, but can't use JSON.parse(JSON.stringify()) in FF and Edge because in those
            // browsers, DOMRect properties are inherited, not "own" properties (as in hasOwnProperty).
            const rectObj = action.args[0];

            for (let i in rectObj) {
              if (typeof rectObj[i] === 'number') {
                state.boundingClientRect[i] = rectObj[i];
              }
            }
          }
        }

        break;
      }

      /**
### height(value)
Set the height (not including padding, border, or margin) of all matches.

| Param | Type | Description |
| --- | --- | --- |
| value | `number`\|`string`\|`function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
*/
      case 'height': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.height = action.args[0];

            // If using Cheerio.
            if (typeof global === 'object' && global.$._root && global.$._root.attribs) {
              state.boundingClientRect.height = action.args[0];
            }
          }
        }

        break;
      }

      /**
### html(htmlString)
Set the innerHTML of all matches.

| Param | Type | Description |
| --- | --- | --- |
| htmlString | `string` | A string of HTML. Functions are not supported. |

### html()
Dispatching an 'html' action without an htmlString parameter will set
`state.innerHTML` to the string value of the innerHTML of the actual element.
Prior to that, `state.innerHTML` will be null. Simply invoking `.getState()`
where `state.innerHTML` is null will not update `state.innerHTML`. However,
once `state.innerHTML` has been set to a string, subsequent invocations of
`.getState()` will update `state.innerHTML`. Set `state.innerHTML` only when
necessary, since very large innerHTML strings across many organisms with many
members can add up to a large amount of data.
*/
      case 'html': {
        // Only perform this update IF
        // there is an argument AND
        // this action is untargeted OR is targeted and is the member action (not the organism action).
        if (action.args.length === 1 && (typeof memberIdx === 'undefined' || !state.$members.length)) {
          state.innerHTML = action.args[0];
        }

        break;
      }

      /**
### innerHeight(value)
Set the innerHeight (including padding, but not border or margin) of all
matches.

| Param | Type | Description |
| --- | --- | --- |
| value | `number`\|`string`\|`function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
*/
      case 'innerHeight': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.innerHeight = action.args[0];
          }
        }

        break;
      }

      /**
### innerWidth(value)
Set the innerWidth (including padding, but not border or margin) of all
matches.

| Param | Type | Description |
| --- | --- | --- |
| value | `number`\|`string`\|`function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
*/
      case 'innerWidth': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.innerWidth = action.args[0];
          }
        }

        break;
      }

      /**
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
*/
      case 'prepend': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected organisms.
        break;
      }

      /**
### prop(properties)
Set one or more properties for all matches. See https://api.jquery.com/prop/
for important distinctions between attributes and properties.

| Param | Type | Description |
| --- | --- | --- |
| properties | `object` | An object of property:value pairs. |
*/
      case 'prop': {
        if (action.args[0] instanceof Object && action.args[0].constructor === Object) {
          Object.assign(state.props, action.args[0]);
        }

        break;
      }

      /**
### remove()
Remove all matches from the DOM, and from memory.
*/
      case 'remove': {
        // Handled by running the method as a side-effect. Will reset elements and members of affected parents.
        // Will not automatically update any state's .innerHTML.
        break;
      }

      /**
### removeClass(classes)
For each submitted class, remove that class from all matches which have that
class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string`\|`function` | A space-separated string, or a function that returns a space-separated string. |
*/
      case 'removeClass': {
        // Handled by running the method as a side-effect and splitting the class attribute into an array and copying
        // that to .classArray and .classList
        break;
      }

      /**
### removeData(name)
Remove a previously-stored piece of data. Does not affect HTML attributes in the
DOM.

| Param | Type | Description |
| --- | --- | --- |
| name | `string` | A string naming the piece of data to delete. |

### removeData(list)
Remove previously-stored pieces of data. Does not affect HTML attributes in the
DOM.

| Param | Type | Description |
| --- | --- | --- |
| list | `string`\|`array` | A space-separated string or an array naming the pieces of data to delete. |
*/
      case 'removeData': {
        if (typeof action.args[0] === 'string') {
          if (action.args[0].includes(' ')) {
            action.args[0].split(' ').forEach((key) => {
              delete state.data[key];
            });
          }
          else {
            delete state.data[action.args[0]];
          }
        }
        else if (Array.isArray(action.args[0])) {
          action.args[0].forEach((key) => {
            delete state.data[key];
          });
        }

        break;
      }

      /**
### scrollTop(value)
Set the vertical scroll position (the number of CSS pixels that are hidden from
view above the scrollable area) of the match.

| Param | Type | Description |
| --- | --- | --- |
| value | `number` | The number to set the scroll position to. |
*/
      case 'scrollTop': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.scrollTop = action.args[0];
          }
        }

        break;
      }

      /**
### setActiveOrganism(selector)
Only applicable if 'document' is an incepted organism. When a 'focus' action is
dispatched by an organism, this sets the 'document' organism's
`state.activeOrganism` to the selector of the focused organism. The
'setActiveOrganism' action can only be dispatched by the 'document' organism.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string` | The identifying selector of the focused organism. |
*/
      case 'setActiveOrganism': {
        if ($org.selector === 'document') {
          state.activeOrganism = action.args[0] || null;
        }

        break;
      }

      /**
### setBoundingClientRect(boundingClientRect)
Copy properties of the boundingClientRect parameter over the corresponding
properties on `state.boundingClientRect`.

| Param | Type | Description |
| --- | --- | --- |
| boundingClientRect | `object` | An object of key:values. The object may contain one or more properties, but they must correspond to properties defined by the [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect) class, with the exception of `.x` and `.y` (as per compatibility with Microsoft browsers). |
*/
      case 'setBoundingClientRect': {
        if (
          typeof action.args[0] === 'object' && // Exclude functions. Don't assume what its constructor is.
          action.args[0] instanceof Object
        ) {
          const rectObj = action.args[0];

          // Must iterate through "own" properties and copy from rectObj. Shortcuts like Object.assign won't work
          // because rectObj is not a plain object in browsers.
          for (let measurement of Object.keys(state.boundingClientRect)) {
            if (
              state.boundingClientRect[measurement] !== action.args[0][measurement] &&
              action.args[0][measurement] != null // eslint-disable-line eqeqeq
            ) {
              state.boundingClientRect[measurement] = action.args[0][measurement];
            }
          }

          // If this is dispatched on the server, we need to copy the rectObj to the state $members.
          if (typeof global === 'object' && global.$._root && global.$._root.attribs) {
            if (
              typeof memberIdx === 'number' &&
              state.$members[memberIdx]
            ) {
              Object.assign(state.$members[memberIdx].boundingClientRect, rectObj);
            }
            else {
              for (let $member of state.$members) {
                Object.assign($member.boundingClientRect, rectObj);
              }
            }
          }
        }

        break;
      }

      /**
### text(text)
Set the textContent of all matches. This is a safer way to change text on the DOM than dispatching an 'html' action.

| Param | Type | Description |
| --- | --- | --- |
| text | `string` | A string of text. Functions are not supported. |

### text()
Dispatching a 'text' action without a parameter will set `state.textContent` to
the string value of the textContent of the actual element. Prior to that,
`state.textContent` will be null. Simply invoking `.getState()` where
`state.textContent` is null will not update `state.textContent`. However, once
`state.textContent` has been set to a string, subsequent invocations of
`.getState()` will update `state.textContent`. Set `state.textContent` only when
necessary, since very large text strings across many organisms with many members
can add up to a large amount of data.
*/
      case 'text': {
        // Only perform this update IF
        // there is an argument AND
        // this action is untargeted OR is targeted and is the member action (not the organism action).
        if (action.args.length === 1 && (typeof memberIdx === 'undefined' || !state.$members.length)) {
          state.textContent = action.args[0];
        }

        break;
      }

      /**
### toggleClass(classes)
For each submitted class, add or remove that class from all matches, depending
on whether or not the member has that class.

| Param | Type | Description |
| --- | --- | --- |
| classes | `string`\|`function` | A space-separated string, or a function that returns a space-separated string. |

### toggleClass(paramsArray)
For each submitted class, add or remove that class from all matches, depending
on a true/false switch.

| Param | Type | Description |
| --- | --- | --- |
| paramsArray | `array` | An array: where element 0 is a space-separated string, or a function that returns a space-separated string; and element 1 is a boolean switch, where true means add, false means remove. |
*/
      case 'toggleClass': {
        // Handled by running the method as a side-effect and splitting the class attribute into an array and copying
        // that to .classArray and .classList
        break;
      }

      /**
### val(value)
Set the value of all matches, typically form fields. This will set `state.value`.

| Param | Type | Description |
| --- | --- | --- |
| value | `string`\|`number` | The value to which to set the form field's value. Functions are not supported. |
*/
      case 'val': {
        state.value = action.args[0] || null;

        break;
      }

      /**
### width(value)
Set the width (not including padding, border, or margin) of all matches.

| Param | Type | Description |
| --- | --- | --- |
| value | `number`\|`string`\|`function` | The number of CSS pixels, a string representing the measurement, or a function returning the measurement. |
*/
      case 'width': {
        if (action.args.length === 1) {
          if (typeof action.args[0] === 'number') {
            state.width = action.args[0];

            // If using Cheerio.
            if (typeof global === 'object' && global.$._root && global.$._root.attribs) {
              state.boundingClientRect.width = action.args[0];
            }
          }
        }

        break;
      }
    // DO NOT REMOVE FOLLOWING COMMENT.
    } // end switch (action.method)
  }
  catch (err) {
    /* istanbul ignore next */
    console.error(err); // eslint-disable-line no-console
    /* istanbul ignore next */
    throw err;
  }
}

/**
 * Closure to generate reducers specific to organisms.
 *
 * @param {string} orgSelector - The organism's selector.
 * @param {function} [customReducer] - A custom reducer most likely purposed for custom methods.
 * @returns {function} A function configured to work on the orgSelector.
 */
function reducerClosure(orgSelector, customReducer) {

  /**
   * Clone an old state, update the clone based on an action, and return the clone.
   *
   * @param {object} prevState - Old state.
   * @param {object} action - An object with properties defining an action.
   * @returns {object} New state.
   */
  return function (prevState, action) {
    // If this is the reducer for the selected organism, reduce and return a new state.
    if (action.selector === orgSelector) {
      const $org = action.$org;
      const stateDefault = getStateDefault(orgSelector);
      let state;

      try {
        // Clone old state into new state.
        state = JSON.parse(JSON.stringify(prevState));
      }
      catch (err) {
        // Clone default state into new state if prevState param is undefined.
        /* istanbul ignore next */
        state = JSON.parse(JSON.stringify(stateDefault));
      }

      // Update length of state.$members array to match length of $org.$members.
      if (Array.isArray($org.$members) && Array.isArray(state.$members)) {
        if ($org.$members.length < state.$members.length) {
          try {
            // Update $members array with clones of stateDefault.
            state.$members = [];

            for (let i = 0; i < $org.$members.length; i++) {
              state.$members[i] = JSON.parse(JSON.stringify(stateDefault));
            }
          }
          catch (err) {
            /* istanbul ignore next */
            console.error(err); // eslint-disable-line no-console
          }
        }

        else if ($org.$members.length > state.$members.length) {
          try {
            // Populate $members array with clones of stateDefault if necessary.
            for (let i = 0; i < $org.$members.length; i++) {
              if (!state.$members[i]) {
                state.$members[i] = JSON.parse(JSON.stringify(stateDefault));
              }
            }
          }
          catch (err) {
            /* istanbul ignore next */
            console.error(err); // eslint-disable-line no-console
          }
        }
      }

      // Build new state for organism.
      stateBuild($org, state, action);

      const memberIdx = action.memberIdx;

      // Build new state for selection in $members array.
      if (
        typeof memberIdx === 'number' &&
        $org.$members[memberIdx] &&
        state.$members[memberIdx]
      ) {
        stateBuild($org.$members[memberIdx], state.$members[memberIdx], action);
      }
      else if (Array.isArray(memberIdx)) {
        for (let idx of memberIdx) {
          stateBuild($org.$members[idx], state.$members[idx], action);
        }
      }

      if (typeof customReducer === 'function') {
        const customState = customReducer(state, action, $org, prevState);

        // We need to validate customState because older versions of Requerio had the 4th constructor argument return an
        // object of action functions. We now want the 4th argument to be an optional custom reducer.
        if (
          typeof customState === 'object' && // Don't want to check constructor because this is user submitted.
          customState instanceof Object
        ) {
          for (let i of Object.keys(customState)) {
            if (typeof customState[i] === 'function') {
              // The older Requerio versions would have functions as properties of this object.
              // If this is the case, ignore the output of customReducer and return the state as built earlier.
              return state;
            }
          }

          return customState;
        }
      }

      return state;
    }

    // If this is not the reducer for the selected organism, return the unmutated state if submitted as a defined param.
    // Else return the default state.
    else {
      if (prevState) {
        return prevState;
      }
      else {
        return getStateDefault(orgSelector);
      }
    }
  };
}

/**
 * Combine organism-specific reducers for consumption by whole app.
 *
 * @param {object} $orgs - Organisms keyed by selector.
 * @param {object} Redux - Redux object.
 * @param {function} [customReducer] - A custom reducer most likely purposed for custom methods.
 * @returns {object} Combined reducers
 */
export default ($orgs, Redux, customReducer) => {
  const reducers = {};

  for (let i of Object.keys($orgs)) {
    reducers[i] = reducerClosure(i, customReducer);
  }

  return Redux.combineReducers(reducers);
};
