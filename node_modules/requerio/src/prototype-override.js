/**
 * Apply the jQuery or Cheerio method on the organism.
 *
 * @param {object} $org - Organism object.
 * @param {string} method - Name of the method to be applied.
 * @param {array} args - Arguments array, (not array-like object).
 * @param {object|object[]} [$member] - Organism member, or array of members.
 */
function applyMethod($org, method, args, $member) {
  if (Array.isArray($member)) {
    // Apply on each iteration of $member array.
    for (let i = 0; i < $member.length; i++) {
      if (typeof $member[i][method] === 'function') {
        $member[i][method].apply($member[i], args);
      }
    }
  }
  else if ($member) {
    // Apply to $member.
    if (typeof $member[method] === 'function') {
      $member[method].apply($member, args);
    }
  }
  else {
    // Apply to $org.
    if (typeof $org[method] === 'function') {
      $org[method].apply($org, args);
    }
  }
}

/**
 * Apply the jQuery or Cheerio .`data()` method on the organism and  prep data for copying directly to state.
 *
 * @param {object} $org - Organism object.
 * @param {array} args - Arguments array, (not array-like object).
 * @param {object|object[]} [$member] - Organism member, or array of members.
 */
function applyData($org, args, $member) {
  if (args[0] instanceof Object && args[0].constructor === Object) {
    applyMethod($org, 'data', args, $member);
  }

  if (Array.isArray($member)) {
    // Get all data to submit for updating state. Only iterate once.
    for (let i = 0; i < $member.length; i++) {
      const data = $member[i].data.apply($member[i]);
      args[0] = data;

      break;
    }
  }
  else if ($member) {
    const data = $member.data.apply($member);
    args[0] = data;
  }
  else {
    const data = $org.data.apply($org);
    args[0] = data;
  }
}

/**
 * Apply a method for getting or setting a measurement.
 *
 * @param {object} $org - Organism object.
 * @param {string} method - Name of the method to be applied.
 * @param {array} args - Arguments array, (not array-like object).
 * @param {object|object[]} [$member] - Organism member, or array of members.
 * @param {number|number[]} [memberIdx] - The index of the member within $org.$members, or array of member indices.
 * @returns {number|string|undefined} The measurement if getting.
 */
function applyMeasurement($org, method, args, $member, memberIdx) {
  let retVal;

  if (Array.isArray($member) && Array.isArray(memberIdx)) {
    // Apply on each iteration of $member array.
    for (let i = 0; i < $member.length; i++) {
      if (typeof window === 'object') { // jQuery
        if (typeof $member[i][method] === 'function') {
          $member[i][method].apply($member[i], args);
        }
      }
      else { // Cheerio
        if (typeof $org[method] === 'function') {
          retVal = $org[method].call($org, args[0], memberIdx[i]);
        }
      }
    }
  }
  else if ($member && typeof memberIdx === 'number') {
    // Apply to $member.
    if (typeof window === 'object') { // jQuery
      if (typeof $member[method] === 'function') {
        $member[method].apply($member, args);
      }
    }
    else { // Cheerio
      if (typeof $org[method] === 'function') {
        retVal = $org[method].call($org, args[0], memberIdx);
      }
    }
  }
  else {
    // Apply to $org.
    if (typeof window === 'object') { // jQuery
      if (typeof $org[method] === 'function') {
        $org[method].apply($org, args);
      }
    }
    else { // Cheerio
      if (typeof $org[method] === 'function') {
        retVal = $org[method].call($org, args[0]);
      }
    }
  }

  return retVal;
}

/**
 * Convert camelCase "method" to CAPS_SNAKE_CASE "type".
 *
 * @param {string} method - The jQuery/Cheerio/Requerio "method" name.
 * @returns {string} The Redux action "type" per Redux casing convention.
 */
function convertMethodToType(method) {
  return method.replace(/([A-Z])/g, '_$1').toUpperCase();
}

/**
 * Convenience method for getting boundingClientRect whether on client or server.
 *
 * @param {object} $org - Organism object.
 * @param {array} args - Arguments array, (not array-like object). Must always be an empty array. Will write the
 *   measurement to its element 0.
 * @param {number|number[]} [memberIdx] - Organism member index, or array of member indices.
 * @returns {array} The `args` array.
 */
function getBoundingClientRect($org, args, memberIdx) {
  if (Array.isArray(memberIdx)) {
    for (let i = 0; i < memberIdx.length; i++) {
      const idx = memberIdx[i];

      // Apply on indexed element.
      /* istanbul ignore else */
      if (typeof $org.getBoundingClientRect === 'function') {
        args[0] = $org.getBoundingClientRect.call($org, idx);
      }
      else if (typeof window === 'object') {
        if ($org[idx] && typeof $org[idx].getBoundingClientRect === 'function') {
          args[0] = $org[idx].getBoundingClientRect.call($org[idx]);
        }
      }
    }
  }
  else if (typeof memberIdx === 'number') {
    // Apply on indexed element.
    /* istanbul ignore else */
    if (typeof $org.getBoundingClientRect === 'function') {
      args[0] = $org.getBoundingClientRect.call($org, memberIdx);
    }
    else if (typeof window === 'object') {
      if ($org[memberIdx] && typeof $org[memberIdx].getBoundingClientRect === 'function') {
        args[0] = $org[memberIdx].getBoundingClientRect.call($org[memberIdx]);
      }
    }
  }
  else {
    // If no memberIdx, apply on first item.
    /* istanbul ignore else */
    if (typeof $org.getBoundingClientRect === 'function') {
      args[0] = $org.getBoundingClientRect.call($org);
    }
    else if (typeof window === 'object') {
      if ($org[0] && typeof $org[0].getBoundingClientRect === 'function') {
        args[0] = $org[0].getBoundingClientRect.call($org[0]);
      }
    }
  }

  return args;
}

/**
 * Convenience method for getting measurements in a DOM environment.
 *
 * @param {object} $org - Organism object.
 * @param {string} method - Name of the method to be applied.
 *   measurement to its element 0.
 * @param {object} computedStyle - Only defined for jQuery. Per DOM `CSSStyleDeclaration` spec.
 * @param {object} elem - Per DOM `HTMLElement` spec.
 * @returns {array} The `args` array.
 */
function getMeasurementSwitch($org, method, computedStyle = {}, elem) {
  switch (method) {
    case 'innerWidth':
      if ($org.selector === 'window') {
        return elem.innerWidth;
      }
      else if ($org.selector === 'document') {
        return;
      }
      else {
        if (computedStyle.boxSizing === 'content-box') {
          return parseFloat(computedStyle.width) +
            (parseFloat(computedStyle.paddingLeft) || 0) +
            (parseFloat(computedStyle.paddingRight) || 0);
        }
        else {
          return parseFloat(computedStyle.width) -
            (parseFloat(computedStyle.borderLeftWidth) || 0) -
            (parseFloat(computedStyle.borderRightWidth) || 0);
        }
      }

    case 'innerHeight':
      if ($org.selector === 'window') {
        return elem.innerHeight;
      }
      else if ($org.selector === 'document') {
        return;
      }
      else {
        if (computedStyle.boxSizing === 'content-box') {
          return parseFloat(computedStyle.height) +
            (parseFloat(computedStyle.paddingTop) || 0) +
            (parseFloat(computedStyle.paddingBottom) || 0);
        }
        else {
          return parseFloat(computedStyle.height) -
            (parseFloat(computedStyle.borderTopWidth) || 0) -
            (parseFloat(computedStyle.borderBottomWidth) || 0);
        }
      }

    case 'outerWidth':
      if ($org.selector === 'window') {
        return elem.outerWidth;
      }
      else if ($org.selector === 'document') {
        return;
      }
      else {
        if (computedStyle.boxSizing === 'content-box') {
          return parseFloat(computedStyle.width) +
            (parseFloat(computedStyle.paddingLeft) || 0) +
            (parseFloat(computedStyle.paddingRight) || 0) +
            (parseFloat(computedStyle.borderLeftWidth) || 0) +
            (parseFloat(computedStyle.borderRightWidth) || 0) +
            (parseFloat(computedStyle.marginLeft) || 0) +
            (parseFloat(computedStyle.marginRight) || 0);
        }
        else {
          return parseFloat(computedStyle.width) +
            (parseFloat(computedStyle.marginLeft) || 0) +
            (parseFloat(computedStyle.marginRight) || 0);
        }
      }

    case 'outerHeight':
      if ($org.selector === 'window') {
        return elem.outerHeight;
      }
      else if ($org.selector === 'document') {
        return;
      }
      else {
        if (computedStyle.boxSizing === 'content-box') {
          return parseFloat(computedStyle.height) +
            (parseFloat(computedStyle.paddingTop) || 0) +
            (parseFloat(computedStyle.paddingBottom) || 0) +
            (parseFloat(computedStyle.borderTopWidth) || 0) +
            (parseFloat(computedStyle.borderBottomWidth) || 0) +
            (parseFloat(computedStyle.marginTop) || 0) +
            (parseFloat(computedStyle.marginBottom) || 0);
        }
        else {
          return parseFloat(computedStyle.height) +
            (parseFloat(computedStyle.marginTop) || 0) +
            (parseFloat(computedStyle.marginBottom) || 0);
        }
      }

    case 'scrollLeft':
      if ($org.selector === 'window') {
        return elem.pageXOffset;
      }
      else if ($org.selector === 'document') {
        return elem.documentElement.scrollLeft;
      }
      else {
        return elem.scrollLeft;
      }

    case 'scrollTop':
      if ($org.selector === 'window') {
        return elem.pageYOffset;
      }
      else if ($org.selector === 'document') {
        return elem.documentElement.scrollTop;
      }
      else {
        return elem.scrollTop;
      }

    case 'width':
      if ($org.selector === 'window') {
        return elem.innerWidth;
      }
      else if ($org.selector === 'document') {
        return Math.max(
          elem.body.scrollWidth,
          elem.documentElement.scrollWidth,
          elem.body.offsetWidth,
          elem.documentElement.offsetWidth,
          elem.documentElement.clientWidth
        );
      }
      else {
        if (computedStyle.boxSizing === 'content-box') {
          return parseFloat(computedStyle.width);
        }
        else {
          return parseFloat(computedStyle.width) -
            (parseFloat(computedStyle.paddingLeft) || 0) -
            (parseFloat(computedStyle.paddingRight) || 0) -
            (parseFloat(computedStyle.borderLeftWidth) || 0) -
            (parseFloat(computedStyle.borderRightWidth) || 0);
        }
      }

    case 'height':
      if ($org.selector === 'window') {
        return elem.innerHeight;
      }
      else if ($org.selector === 'document') {
        return Math.max(
          elem.body.scrollHeight,
          elem.documentElement.scrollHeight,
          elem.body.offsetHeight,
          elem.documentElement.offsetHeight,
          elem.documentElement.clientHeight
        );
      }
      else {
        if (computedStyle.boxSizing === 'content-box') {
          return parseFloat(computedStyle.height);
        }
        else {
          return parseFloat(computedStyle.height) -
            (parseFloat(computedStyle.paddingTop) || 0) -
            (parseFloat(computedStyle.paddingBottom) || 0) -
            (parseFloat(computedStyle.borderTopWidth) || 0) -
            (parseFloat(computedStyle.borderBottomWidth) || 0);
        }
      }
  }
}

/**
 * Get a measurement as efficiently as possible.
 *
 * @param {object} $org - Organism object.
 * @param {string} method - Name of the method to be applied.
 * @param {array} args - Arguments array, (not array-like object). Must always be an empty array. Will write the
 *   measurement to its element 0.
 * @param {object|undefined} computedStyle - Only defined for jQuery. Per DOM `CSSStyleDeclaration` spec.
 * @param {object|object[]} [$member] - Organism member, or array of members.
 * @param {number|number[]} [memberIdx] - The index of the member within $org.$members, or array of member indices.
 * @returns {array} The `args` array.
 */
function getMeasurement($org, method, args, computedStyle, $member, memberIdx) {
  if (Array.isArray($member)) {
    // Apply on first valid iteration of $member array.
    for (let i = 0; i < $member.length; i++) {
      if (typeof window === 'object') { // jQuery
        args[0] = getMeasurementSwitch($org, method, computedStyle, $member[i][0]);
      }
      else if (typeof $org[method] === 'function') { // Cheerio
        args[0] = applyMeasurement($org, method, [null], $member, memberIdx);
      }

      break;
    }
  }
  else if ($member) {
    // Apply to $member.
    /* istanbul ignore if */
    if (typeof window === 'object') { // jQuery
      args[0] = getMeasurementSwitch($org, method, computedStyle, $member[0]);
    }
    else if (typeof $org[method] === 'function') { // Cheerio
      args[0] = applyMeasurement($org, method, [null], $member, memberIdx);
    }
  }
  else {
    // Apply to $org.
    if (typeof window === 'object') { // jQuery
      if ($org.selector === 'window') {
        args[0] = getMeasurementSwitch($org, method, computedStyle, window);
      }
      else if ($org.selector === 'document') {
        args[0] = getMeasurementSwitch($org, method, computedStyle, document);
      }
      else {
        args[0] = getMeasurementSwitch($org, method, computedStyle, $org[0]);
      }
    }
    else if (typeof $org[method] === 'function') { // Cheerio
      args[0] = applyMeasurement($org, method, [null]);
    }
  }

  args[0] = isNaN(args[0]) ? void 0 : args[0];

  return args;
}

/**
 * Override $.prototype with custom methods for dealing with state.
 *
 * @param {object} requerio - Requerio instance.
 */
export default (requerio) => {
  /* eslint-disable max-len */
  /* eslint-disable valid-jsdoc */

  const {$, $orgs, store} = requerio;
  $.prototype.$members = [];

  /**
   * Must redefine .after() because we may need to reset the elements and members of sibling and descendent organisms.
   * Same params as jQuery/Cheerio .after().
   * Do not document.
   */
  const afterFnOrig = $.prototype.after;

  $.prototype.after = function () {
    const descendantsToReset = [];
    const $parent = this.parent();

    if (arguments.length) {
      for (const orgSelector1 of Object.keys($orgs)) {
        const $org1 = $orgs[orgSelector1];

        // Iterate through organisms and check if the parent of this organism (dispatching the 'after' action)
        // is an ancestor.
        // This is much more efficient than searching through branches of descendants.
        for (let i = 0; i < $parent.length; i++) {
          if ($org1.parents($parent[i]).length) {
            descendantsToReset.push($org1);

            break;
          }
        }
      }
    }

    const retVal = afterFnOrig.apply(this, arguments);

    if (arguments.length) {
      this.resetElementsAndMembers();

      descendantsToReset.forEach(descendantToReset => descendantToReset.resetElementsAndMembers());
    }

    return retVal;
  };

  /**
   * Must redefine .append() because we may need to reset the elements and members of descendent organisms.
   * Same params as jQuery/Cheerio .append().
   * Do not document.
   */
  const appendFnOrig = $.prototype.append;

  $.prototype.append = function () {
    const descendantsToReset = [];

    if (arguments.length) {
      for (const orgSelector1 of Object.keys($orgs)) {
        const $org1 = $orgs[orgSelector1];

        // Iterate through organisms and check if this organism (dispatching the 'append' action) is an ancestor.
        // This is much more efficient than searching through branches of descendants.
        for (let i = 0; i < this.length; i++) {
          if ($org1.parents(this[i]).length) {
            descendantsToReset.push($org1);

            break;
          }
        }
      }
    }

    const retVal = appendFnOrig.apply(this, arguments);

    if (arguments.length) {
      this.resetElementsAndMembers();

      descendantsToReset.forEach(descendantToReset => descendantToReset.resetElementsAndMembers());
    }

    return retVal;
  };

  /**
   * Must redefine .before() because we may need to reset the elements and members of sibling and descendent organisms
   * Same params as jQuery/Cheerio .before().
   * Do not document.
   */
  const beforeFnOrig = $.prototype.before;

  $.prototype.before = function () {
    const descendantsToReset = [];
    const $parent = this.parent();

    if (arguments.length) {
      for (const orgSelector1 of Object.keys($orgs)) {
        const $org1 = $orgs[orgSelector1];

        // Iterate through organisms and check if the parent of this organism (dispatching the 'before' action)
        // is an ancestor.
        // This is much more efficient than searching through branches of descendants.
        for (let i = 0; i < $parent.length; i++) {
          if ($org1.parents($parent[i]).length) {
            descendantsToReset.push($org1);

            break;
          }
        }
      }
    }

    const retVal = beforeFnOrig.apply(this, arguments);

    if (arguments.length) {
      this.resetElementsAndMembers();

      descendantsToReset.forEach(descendantToReset => descendantToReset.resetElementsAndMembers());
    }

    return retVal;
  };

  /**
### .blur()
A server-side stand-in for client-side `.blur()`.
*/
  if (!$.prototype.blur) {
    $.prototype.blur = function () {};
  }

  /**
   * Must redefine .detach() because we need to reset the elements and members of parent organisms.
   * Same params as jQuery .detach().
   * Do not document.
   */
  const detachFnOrig = $.prototype.detach;

  $.prototype.detach = function () {
    const parentsToReset = [];

    for (const orgSelector1 of Object.keys($orgs)) {
      for (let i = 0; i < this.$members.length; i++) {
        if (this.$members[i].parent(orgSelector1).length) {
          parentsToReset.push($orgs[orgSelector1]);

          break;
        }
      }
    }

    if (typeof detachFnOrig === 'function') {
      detachFnOrig.apply(this);
    }
    else {
      // We can just use .remove() in Cheerio since there are no additional data to retain.
      this.remove();
    }

    parentsToReset.forEach(parentToReset => parentToReset.resetElementsAndMembers());

    return this;
  };

  /**
### .dispatchAction(method, [args], [memberIdx])
Dispatches actions for reduction. Side-effects occur here (not in the reducer).
1. Applies the jQuery or Cheerio method.
2. Applies any additional changes.
3. Calls the Redux `store.dispatch()` method.

__Returns__: `object` - The organism. Allows for action dispatches to be chained.

| Param | Type | Description |
| --- | --- | --- |
| method | `string` | The name of the method on the organism's prototype. |
| [args] | `*` | This param contains the values to be passed as arguments to the method. `null` may be submitted if not passing arguments, but targeting a memberIdx. |
| [memberIdx] | `number`\|`number[]` | The index, or array of indices, of the organism member(s), if targeting one or more members. |
*/
  $.prototype.dispatchAction = function (method, args_, memberIdx_) {
    const type = convertMethodToType(method);

    let args = [];

    // eslint-disable-next-line eqeqeq
    if (args_ != null) {
      args = [args_];
    }

    let memberIdx = memberIdx_;
    let membersLength = 0;

    this.$members.forEach(() => membersLength++);

    if (membersLength < this.$members.length) {
      memberIdx = [];

      // forEach loop necessary to retain original idx in case items were deleted.
      this.$members.forEach(($member, idx) => memberIdx.push(idx));
    }

    // Submission of memberIdx indicates that the action is to be dispatched on the specific member of the CSS class.
    let $member;

    if (Array.isArray(memberIdx)) {
      $member = [];

      for (let i = 0; i < memberIdx.length; i++) {
        $member.push($(this[memberIdx[i]]));
      }
    }
    else if (typeof memberIdx === 'number') {
      // Exit if the memberIdx points to nothing.
      if (typeof this[memberIdx] === 'undefined') {
        return;
      }

      $member = $(this[memberIdx]);
    }

    // Side-effects must happen here. store.dispatch() depends on this.
    switch (method) {

      case 'attr': {
        applyMethod(this, method, args, $member);

        break;
      }

      case 'css': {
        applyMethod(this, method, args, $member);

        break;
      }

      case 'data': {
        applyData(this, args, $member); // Mutates args.

        break;
      }

      case 'empty': {
        if ($member) {
          applyMethod(this, method, args, $member);
        }
        else {
          applyMethod(this, method, args, this.$members);
        }

        break;
      }

      // getBoundingClientRect takes measurements and updates state. This never accepts an argument.
      // On the client, it has to operate on the DOM Element member of the jQuery component.
      case 'getBoundingClientRect': {
        if (this.selector === 'window' || this.selector === 'document') {
          break;
        }

        getBoundingClientRect(this, args, memberIdx);

        break;
      }

      case 'html':
      case 'append':
      case 'prepend':
      case 'text': {
        if (args.length) {
          applyMethod(this, method, args, $member);
        }

        let html;
        let text;

        if (Array.isArray($member) && Array.isArray(memberIdx)) {
          if (args.length) {
            if (typeof window === 'object') { // jQuery
              for (let i = 0; i < memberIdx.length; i++) {
                const idx = memberIdx[i];

                if (this[idx]) {
                  if (method === 'html' && args[0] !== null) {
                    html = args[0];
                  }
                  else {
                    html = this[idx].innerHTML;
                  }

                  if (method === 'text' && args[0] !== null) {
                    text = args[0];
                  }
                  else {
                    text = this[idx].textContent;
                  }

                  break;
                }
              }
            }
            else { // Cheerio
              for (let i = 0; i < $member.length; i++) {
                const $elem = $member[i];

                if ($elem) {
                  if (method === 'html' && args[0] !== null) {
                    html = args[0];
                  }
                  else {
                    html = $elem.html();
                  }

                  if (method === 'text' && args[0] !== null) {
                    text = args[0];
                  }
                  else {
                    text = $elem.text();
                  }

                  break;
                }
              }
            }
          }
          else {
            for (let i = 0; i < $member.length; i++) {
              const $elem = $member[i];
              let htmlScoped;
              let textScoped;

              // On each iteration of $member array.
              if (typeof window === 'object') { // jQuery
                if ($elem && $elem[0]) {
                  htmlScoped = $elem[0].innerHTML;
                  textScoped = $elem[0].textContent;
                }
              }
              else { // Cheerio
                if ($elem) {
                  htmlScoped = $elem.html();
                  textScoped = $elem.text();
                }
              }

              store.dispatch({
                type: 'HTML',
                selector: this.selector,
                $org: this,
                method: 'html',
                args: [htmlScoped],
                i
              });

              store.dispatch({
                type: 'TEXT',
                selector: this.selector,
                $org: this,
                method: 'text',
                args: [textScoped],
                i
              });

              if (i === 0) {
                html = htmlScoped;
                text = textScoped;
              }
            }
          }
        }
        else if ($member && typeof memberIdx === 'number') {
          // On $member.
          if (typeof window === 'object') { // jQuery
            if ($member[0]) {
              html = $member[0].innerHTML;
              text = $member[0].textContent;
            }
          }
          else { // Cheerio
            html = $member.html();
            text = $member.text();
          }
        }
        else {
          // On $org.
          if (typeof window === 'object') { // jQuery
            if (this[0]) {
              html = this[0].innerHTML;
              text = this[0].textContent;
            }
          }
          else { // Cheerio
            html = this.html();
            text = this.$members[0].text();
          }
        }

        if (method !== 'html') {
          // eslint-disable-next-line eqeqeq
          if (html != null) {
            store.dispatch({
              type: 'HTML',
              selector: this.selector,
              $org: this,
              method: 'html',
              args: [html],
              memberIdx
            });
          }
        }

        if (method !== 'text') {
          // eslint-disable-next-line eqeqeq
          if (text != null) {
            store.dispatch({
              type: 'TEXT',
              selector: this.selector,
              $org: this,
              method: 'text',
              args: [text],
              memberIdx
            });
          }
        }

        // eslint-disable-next-line eqeqeq
        if (method === 'html' && args[0] == null) {
          args[0] = html;
        }

        // eslint-disable-next-line eqeqeq
        if (method === 'text' && args[0] == null) {
          args[0] = text;
        }

        break;
      }

      case 'innerWidth':
      case 'innerHeight':
      case 'outerWidth':
      case 'outerHeight':
      case 'scrollLeft':
      case 'scrollTop':
      case 'width':
      case 'height': {
        let computedStyle = {};

        if (typeof window === 'object') { // jQuery
          if (this.selector !== 'window' && this.selector !== 'document') {
            if (Array.isArray(memberIdx)) {
              for (let i = 0; i < memberIdx.length; i++) {
                if (this[memberIdx[i]]) {
                  computedStyle = window.getComputedStyle(this[memberIdx[i]]);

                  break;
                }
              }
            }
            else if ($member && typeof memberIdx === 'number') {
              if ($member[0]) {
                computedStyle = window.getComputedStyle($member[0]);
              }
            }
            else {
              computedStyle = window.getComputedStyle(this[0]);
            }
          }
        }

        if (args.length) {
          applyMeasurement(this, method, args, $member, memberIdx);
        }
        else {
          getMeasurement(this, method, args, computedStyle, $member); // Mutates args.
        }

        break;
      }

      case 'setActiveOrganism': {
        break;
      }

      case 'setBoundingClientRect': {
        break;
      }

      case 'toggleClass': {
        if (Array.isArray(args[0])) {
          args = args[0];
        }

        applyMethod(this, method, args, $member);

        break;
      }

      // Method applications for other methods.
      default: {
        applyMethod(this, method, args, $member);
      }
    }

    if (membersLength < this.$members.length) {
      this.populateMembers();
    }

    this.prevAction = store.dispatch({
      type,
      selector: this.selector,
      $org: this,
      method,
      args,
      memberIdx
    });

    return this;
  };

  /**
   * Must redefine .empty() because we may need to reset the elements and members of descendent organisms.
   * Same params as jQuery/Cheerio .empty().
   * Do not document.
   */

  const emptyFnOrig = $.prototype.empty;

  $.prototype.empty = function () {
    const descendantsToReset = [];

    for (const orgSelector1 of Object.keys($orgs)) {
      const $org1 = $orgs[orgSelector1];

      // Iterate through organisms and check if this organism (dispatching the 'empty' action) is an ancestor.
      // This is much more efficient than searching through branches of descendants.
      for (let i = 0; i < this.length; i++) {
        if ($org1.parents(this[i]).length) {
          descendantsToReset.push($org1);

          break;
        }
      }
    }

    const retVal = emptyFnOrig.apply(this);

    this.resetElementsAndMembers();

    descendantsToReset.forEach(descendantToReset => descendantToReset.resetElementsAndMembers());

    return retVal;
  };


  /**
### .exclude(selector)
Excludes (temporarily) selected member or members from an organism's `.$members`
array. A `.dispatchAction()` is meant to be ultimately chained to this method.
Invoking `.dispatchAction()` will restore all original `.$members`.

__Returns__: `object` - The organism with its `.$members` winnowed of selected exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object`\|`function` | A selector string, a DOM (or DOM-like) element, a jQuery/Cheerio component, or a function returning true or false. |
*/
  $.prototype.exclude = function (selector) {
    if (typeof selector === 'function') {
      this.each((i, elem) => {
        if (selector.call(elem, i, elem)) {
          // Hack a mismatch between length and number of array elements to signal to repopulate members.
          delete this.$members[i];
        }
      });

      return this;
    }
    else {
      let $exclusions = selector;

      if (selector.constructor !== $) {
        $exclusions = $(selector);
      }

      const $members = [];

      this.each((i) => {
        if (this.$members[i] && this.$members[i][0]) {
          $members.push(this.$members[i][0]);
        }
      });

      for (let i = 0; i < $members.length; i++) {
        $exclusions.each((j, elem) => {
          if ($members[i] === elem) {
            // Hack a mismatch between length and number of array elements to signal to repopulate members.
            delete this.$members[i];
          }
        });
      }

      return this;
    }
  };

  /**
### .focus([options])
A server-side stand-in for client-side `.focus()`.
*/
  if (!$.prototype.focus) {
    $.prototype.focus = function () {};
  }

  /**
   * Internal. Do not document.
   *
   * Create a stand-in for Element.getBoundingClientRect for the server.
   * Cannot be attached to Cheerio Element stand-ins because they frequently reference each other.
   * Working with or around such references creates far too much complexity.
   *
   * @param {number} [memberIdx] - The index of the organism member (if targeting a member).
   */
  if (typeof global === 'object') {
    $.prototype.getBoundingClientRect = function (memberIdx) {
      const state = store.getState()[this.selector];
      let rectState = {};

      if (typeof memberIdx === 'number') {
        if (state.$members[memberIdx] && state.$members[memberIdx].boundingClientRect) {
          rectState = state.$members[memberIdx].boundingClientRect;
        }
      }
      else {
        rectState = state.boundingClientRect;
      }

      for (const i of Object.keys(rectState)) {
        if (rectState[i] !== null) {
          return rectState;
        }
      }

      return {
        bottom: null,
        height: null,
        left: null,
        right: null,
        top: null,
        width: null
      };
    };
  }

  /**
### .getState([memberIdx])
Gets state of Requerio organism or member. Invokes Redux `store.getState()`.

__Returns__: `object`\|`null` - The organism's or member's state or `null` if the state doesn't exist.

| Param | Type | Description |
| --- | --- | --- |
| [memberIdx] | `number` | The index of the organism member (if targeting a member). |
*/
  $.prototype.getState = function (memberIdx) {
    const $member = this.$members[memberIdx];
    let orgIdx = 0;
    let state;
    let updateState = false;

    if (typeof memberIdx === 'number') {
      state = store.getState()[this.selector].$members[memberIdx];
      orgIdx = memberIdx;

      /* istanbul ignore if */
      if (!state) {
        updateState = true;
      }
    }

    // Return null if the memberIdx is out-of-bounds.
    // The case of window and document organisms is already handled in post-inception.js.
    if (!this[orgIdx]) {
      return null;
    }

    if (!state) {
      state = store.getState()[this.selector];
    }

    // If still no state, return null.
    /* istanbul ignore if */
    if (!state) {
      return null;
    }

    /* boundingClientRect */
    /* innerWidth */
    /* innerHeight */
    /* outerWidth */
    /* outerHeight */
    /* scrollLeft */
    /* scrollTop */
    /* width */
    /* height */
    // Do update measurements if changed by dispatchAction or user interaction, e.g., resizing viewport.
    updateState = this.updateMeasurements(state, $member, memberIdx) || updateState;

    /* .attribs */
    // Do update .attribs if an attribute was changed by user interaction, e.g., `checked` attribute. (Not the best
    // example because it should be updated by the 'prop' action.)
    let attribsNow = {};

    if (typeof window === 'object') { // jQuery
      const attributes = this[orgIdx].attributes;

      for (let i = 0; i < attributes.length; i++) {
        attribsNow[attributes[i].name] = attributes[i].value;
      }
    }
    else { // Cheerio
      attribsNow = this[orgIdx].attribs;
    }

    if (JSON.stringify(state.attribs) !== JSON.stringify(attribsNow)) {
      store.dispatch({
        type: 'ATTR',
        selector: this.selector,
        $org: this,
        method: 'attr',
        args: [attribsNow],
        memberIdx
      });

      updateState = true;
    }

    /* .css */
    /* .data */
    // Do not update while getting state.

    /* .html */
    /* .text */
    // Do update .html property in case it was changed by another action.
    let htmlNow;

    if (typeof window === 'object') { // jQuery
      htmlNow = this[orgIdx].innerHTML;
    }
    else { // Cheerio
      if ($member) {
        htmlNow = $member.html();
      }
      else {
        htmlNow = this.html();
      }
    }

    if (state.html && state.html !== htmlNow) {
      store.dispatch({
        type: 'HTML',
        selector: this.selector,
        $org: this,
        method: 'html',
        args: [htmlNow],
        memberIdx
      });

      let textNow;

      // If html has changed, text has probably changed.
      if (typeof window === 'object') { // jQuery
        textNow = this[orgIdx].textContent;
      }
      else { // Cheerio
        if ($member) {
          textNow = $member.text();
        }
        else {
          textNow = this.text();
        }
      }

      if (state.textContent !== textNow) {
        store.dispatch({
          type: 'TEXT',
          selector: this.selector,
          $org: this,
          method: 'text',
          args: [textNow],
          memberIdx
        });
      }

      updateState = true;
    }

    // To update member count if changed by an action on html/text, dispatch an action with an empty method.
    if (typeof memberIdx === 'undefined' && this.length !== state.members) {
      store.dispatch({
        type: '',
        selector: this.selector,
        $org: this
      });

      updateState = true;
    }

    /* .prop */
    // Do update .prop if a property was changed by user interaction, e.g., `checked` property.
    let propNow = {};

    for (const property of Object.keys(state.prop)) {
      if (typeof window === 'object') { // jQuery
        if (property in this[orgIdx]) {
          propNow[property] = this[orgIdx][property];
        }
      }
      else { // Cheerio
        if ($member) {
          propNow[property] = $member.prop(property);
        }
        else {
          propNow[property] = this.prop(property);
        }
      }
    }

    /* istanbul ignore if */
    if (JSON.stringify(state.prop) !== JSON.stringify(propNow)) {
      store.dispatch({
        type: 'PROP',
        selector: this.selector,
        $org: this,
        method: 'prop',
        args: [propNow],
        memberIdx
      });

      updateState = true;
    }

    /* val */
    // Do update form field values if they were changed by user interaction.
    if (typeof state.val !== 'undefined' || typeof this[orgIdx].value !== 'undefined') {
      let valueNow;

      if (typeof window === 'object') { // jQuery
        valueNow = this[orgIdx].value;
      }
      else { // Cheerio
        if ($member) {
          valueNow = $member.val();
        }
        else {
          valueNow = this.val();
        }
      }

      if (valueNow !== state.val) {
        store.dispatch({
          type: 'VAL',
          selector: this.selector,
          $org: this,
          method: 'val',
          args: [valueNow],
          memberIdx
        });

        updateState = true;
      }
    }

    if (updateState) {
      if (typeof memberIdx === 'number') {
        state = store.getState()[this.selector].$members[memberIdx];
      }
      else {
        state = store.getState()[this.selector];
      }
    }

    let stateNow;

    if (typeof memberIdx === 'number') {
      stateNow = JSON.parse(JSON.stringify(state));
      delete stateNow.$members;
      delete stateNow.members;
    }
    else {
      stateNow = state;
    }

    return stateNow;
  };

  /**
### .getStore()
A reference to the Redux `store`. The same reference as `requerio.store`.

__Returns__: `object` - This app's state store.
*/
  $.prototype.getStore = function () {
    return store;
  };

  /**
### .hasChild(selector)
Filters (temporarily) an organism's `.$members` array to include only those with
a child matching the selector. A `.dispatchAction()` is meant to be ultimately
chained to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |
*/
  $.prototype.hasChild = function (selector) {
    for (let i = 0; i < this.$members.length; i++) {
      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      if (this.$members[i]) {
        const $children = this.$members[i].children(selector);

        if ($children.length) {
          if (typeof selector === 'string') {
            continue;
          }
          else if ($children[0] === selector) {
            continue;
          }
        }
      }

      delete this.$members[i];
    }

    return this;
  };

  /**
### .hasElement(element)
Filters (temporarily) an organism's `.$members` to include only those whose
elements match the param. A `.dispatchAction()` is meant to be ultimately
chained to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| element | `object` | A DOM (or DOM-like) element. |
*/
  $.prototype.hasElement = function (element) {
    for (let i = 0; i < this.$members.length; i++) {
      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      if (this.$members[i] && this.$members[i][0] === element) {
        continue;
      }

      delete this.$members[i];
    }

    return this;
  };

  /**
### .hasNext(selector)
Filters (temporarily) an organism's `.$members` array to include only those whose
"next" sibling is matched by the selector. A `.dispatchAction()` is meant to be
ultimately chained to this method. Invoking `.dispatchAction()` will restore all
original `$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |
*/
  $.prototype.hasNext = function (selector) {
    for (let i = 0; i < this.$members.length; i++) {
      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      if (this.$members[i]) {
        const $next = this.$members[i].next(selector);

        if ($next.length) {
          if (typeof selector === 'string') {
            continue;
          }
          else if ($next[0] === selector) {
            continue;
          }
        }
      }

      delete this.$members[i];
    }

    return this;
  };

  /**
### .hasParent(selector)
Filters (temporarily) an organism's `.$members` to include only those with a
parent matching the selector. A `.dispatchAction()` is meant to be ultimately
chained to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |
*/
  $.prototype.hasParent = function (selector) {
    for (let i = 0; i < this.$members.length; i++) {
      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      if (this.$members[i]) {
        const $parent = this.$members[i].parent(selector);

        if ($parent.length) {
          if (typeof selector === 'string') {
            continue;
          }
          else if ($parent[0] === selector) {
            continue;
          }
        }
      }

      delete this.$members[i];
    }

    return this;
  };

  /**
### .hasPrev(selector)
Filters (temporarily) an organism's `.$members` to include only those whose
"prev" sibling is matched by the selector. A `.dispatchAction()` is meant to be
ultimately chained to this method. Invoking `.dispatchAction()` will restore all
original `$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string`\|`object` | A selector string or DOM (or DOM-like) element. No jQuery/Cheerio components. |
*/
  $.prototype.hasPrev = function (selector) {
    for (let i = 0; i < this.$members.length; i++) {
      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      if (this.$members[i]) {
        const $prev = this.$members[i].prev(selector);

        if ($prev.length) {
          if (typeof selector === 'string') {
            continue;
          }
          else if ($prev[0] === selector) {
            continue;
          }
        }
      }

      delete this.$members[i];
    }

    return this;
  };

  /**
### .hasSelector(selector)
Filters (temporarily) an organism's `.$members` to include only those that match
the selector criteria. A `.dispatchAction()` is meant to be ultimately chained
to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string` | A jQuery/Cheerio selector. |
*/
  $.prototype.hasSelector = function (selector) {
    const $selection = $(selector);

    for (let i = 0; i < this.$members.length; i++) {
      /* istanbul ignore if */
      if (!this.$members[i]) {
        continue;
      }

      let hasSelector = false;

      for (let j = 0; j < $selection.length; j++) {
        // Hack a mismatch between length and number of array elements to signal to repopulate members.
        if (this.$members[i][0] === $selection[j]) {
          hasSelector = true;

          break;
        }
      }

      if (!hasSelector) {
        delete this.$members[i];
      }
    }

    return this;
  };

  /**
### .hasSibling(selector)
Filters (temporarily) an organism's `.$members` to include only those with a
sibling matched by the selector. A `.dispatchAction()` is meant to be ultimately
chained to this method. Invoking `.dispatchAction()` will restore all original
`$.members`.

__Returns__: `object` - The organism with its `.$members` winnowed of exclusions.

| Param | Type | Description |
| --- | --- | --- |
| selector | `string` | A selector string. |
*/
  $.prototype.hasSibling = function (selector) {
    for (let i = 0; i < this.$members.length; i++) {
      /* istanbul ignore if */
      if (!this.$members[i]) {
        continue;
      }

      // Hack a mismatch between length and number of array elements to signal to repopulate members.
      const $siblings = this.$members[i].siblings(selector);
      const hasSibling = $siblings.length ? true : false;

      if (!hasSibling) {
        delete this.$members[i];
      }
    }

    return this;
  };

  /**
   * Must redefine .html() because we may need to reset the elements and members of descendent organisms.
   * Same params as jQuery/Cheerio .html(). However, unlike jQuery, does not accept function params.
   * Do not document.
   */
  const htmlFnOrig = $.prototype.html;

  $.prototype.html = function () {
    const descendantsToReset = [];

    if (arguments.length) {
      for (const orgSelector1 of Object.keys($orgs)) {
        const $org1 = $orgs[orgSelector1];

        // Iterate through organisms and check if this organism (dispatching the 'html' action) is an ancestor.
        // This is much more efficient than searching through branches of descendants.
        for (let i = 0; i < this.length; i++) {
          if ($org1.parents(this[i]).length) {
            descendantsToReset.push($org1);

            break;
          }
        }
      }
    }

    const retVal = htmlFnOrig.apply(this, arguments);

    if (arguments.length) {
      this.resetElementsAndMembers();

      descendantsToReset.forEach(descendantToReset => descendantToReset.resetElementsAndMembers());
    }

    return retVal;
  };

  /**
### .populateMembers()
(Re)populate an organism's `.$members` array with its (recalculated) members.
`.$members` are jQuery/Cheerio components, not fully incepted organisms.
*/
  $.prototype.populateMembers = function () {
    if (!this.selector || !(this.selector in $orgs)) {
      return;
    }

    /* istanbul ignore if */
    if (this.selector === 'window' || this.selector === 'document') {
      return;
    }

    const $org = this;
    $org.$members = [];

    $org.each((i, elem) => {
      $org.$members.push($(elem));
    });
  };

  /**
   * Must redefine .prepend() because we may need to reset the elements and members of descendent organisms.
   * Same params as jQuery/Cheerio .prepend().
   * Do not document.
   */
  const prependFnOrig = $.prototype.prepend;

  $.prototype.prepend = function () {
    const descendantsToReset = [];
    const $parent = this.parent();

    if (arguments.length) {
      for (const orgSelector1 of Object.keys($orgs)) {
        const $org1 = $orgs[orgSelector1];

        // Iterate through organisms and check if this organism (dispatching the 'prepend' action) is an ancestor.
        // This is much more efficient than searching through branches of descendants.
        for (let i = 0; i < $parent.length; i++) {
          if ($org1.parents($parent[i]).length) {
            descendantsToReset.push($org1);

            break;
          }
        }
      }
    }

    const retVal = prependFnOrig.apply(this, arguments);

    if (arguments.length) {
      this.resetElementsAndMembers();

      descendantsToReset.forEach(descendantToReset => descendantToReset.resetElementsAndMembers());
    }

    return retVal;
  };

  /**
   * Must redefine .remove() because we need to reset the elements and members of parent organisms.
   * Same params as jQuery .remove().
   * Do not document.
   */
  const removeFnOrig = $.prototype.remove;

  $.prototype.remove = function () {
    const parentsToReset = [];

    for (const orgSelector1 of Object.keys($orgs)) {
      for (let i = 0; i < this.$members.length; i++) {
        if (this.$members[i].parent(orgSelector1).length) {
          parentsToReset.push($orgs[orgSelector1]);

          break;
        }
      }
    }

    removeFnOrig.apply(this);

    parentsToReset.forEach(parentToReset => parentToReset.resetElementsAndMembers());

    return this;
  };

  /**
### .resetElementsAndMembers()
Reset the organism's elements and members as they are added or removed. This is
necessary because neither jQuery nor Cheerio dynamically updates the indexed
elements or length properties on a saved jQuery or Cheerio component.
*/
  $.prototype.resetElementsAndMembers = function () {
    if (!this.selector || !(this.selector in $orgs)) {
      return;
    }

    const $orgReset = $(this.selector);
    let reset = false;

    if (this.length !== $orgReset.length) {
      reset = true;
    }
    else {
      for (let i = 0; i < this.length; i++) {
        if (this[i] !== $orgReset[i]) {
          reset = true;

          break;
        }
      }
    }

    if (reset) {
      for (let i = 0; i < this.length; i++) {
        delete this[i];
      }

      this.length = $orgReset.length;

      $orgReset.each((i, elem) => {
        this[i] = elem;
      });

      this.populateMembers();
    }
  };

  /**
### .setBoundingClientRect(rectObj, [memberIdx])
Give the ability to set `boundingClientRect` properties. Only for server-side
testing.

| Param | Type | Description |
| --- | --- | --- |
| rectObj | `object` | An object of `boundingClientRect` measurements. Does not need to include all of them. |
| [memberIdx] | `number`\|`number[]` | The index (or array of indices) of the organism member(s) if targeting one or more members. |
*/
  if (typeof global === 'object') {
    $.prototype.setBoundingClientRect = function (rectObj, memberIdx) {
      this.dispatchAction('setBoundingClientRect', rectObj, memberIdx);
    };
  }

  /**
   * Must redefine .text() because we may need to reset the elements and members of descendent organisms.
   * Same params as jQuery/Cheerio .text(). However, unlike jQuery, does not accept function params.
   * Do not document.
   */
  const textFnOrig = $.prototype.text;

  $.prototype.text = function () {
    const descendantsToReset = [];

    if (arguments.length) {
      for (const orgSelector1 of Object.keys($orgs)) {
        const $org1 = $orgs[orgSelector1];

        // Iterate through organisms and check if this organism (dispatching the 'text' action) is an ancestor.
        // This is much more efficient than searching through branches of descendants.
        for (let i = 0; i < this.length; i++) {
          if ($org1.parents(this[i]).length) {
            descendantsToReset.push($org1);

            break;
          }
        }
      }
    }

    const retVal = textFnOrig.apply(this, arguments);

    if (arguments.length) {
      this.resetElementsAndMembers();

      descendantsToReset.forEach(descendantToReset => descendantToReset.resetElementsAndMembers());
    }

    return retVal;
  };

  /**
### .updateMeasurements()
Update measurements on the state object as per changes to attributes and styles.

__Returns__: `boolean` - Whether or not to update state based on a change in measurement.

| Param | Type | Description |
| --- | --- | --- |
| state | `object` | The most recent state. |
| [member] | `object`\|`object[]` | The object (or array or objects) representing the organism member(s) (if targeting one or more members). |
| [memberIdx] | `number`\|`number[]` | The index (or array of indices) of the organism member(s) (if targeting one or more members). |
*/
  $.prototype.updateMeasurements = function (state, $member, memberIdx) {
    /* istanbul ignore if */
    if (typeof memberIdx === 'number' && !this[memberIdx]) {
      return false;
    }

    let computedStyle;
    let updateState = false;

    if (typeof window === 'object') { // jQuery
      if (this.selector !== 'window' && this.selector !== 'document') {
        if (Array.isArray($member) && Array.isArray(memberIdx)) {
          for (let i = 0; i < memberIdx.length; i++) {
            if (this[memberIdx[i]]) {
              computedStyle = window.getComputedStyle(this[memberIdx[i]]);

              break;
            }
          }
        }
        else if ($member && typeof memberIdx === 'number') {
          if ($member[0]) {
            computedStyle = window.getComputedStyle($member[0]);
          }
        }
        else {
          computedStyle = window.getComputedStyle(this[0]);
        }
      }
    }

    // Be sure to add to these if more measurements are added to the state object.
    for (const method of [
      'innerWidth',
      'innerHeight',
      'outerWidth',
      'outerHeight',
      'scrollLeft',
      'scrollTop',
      'width',
      'height'
    ]) {
      const args = [];

      getMeasurement(this, method, args, computedStyle, $member, memberIdx); // Mutates args.

      // eslint-disable-next-line eqeqeq
      if (state[method] != args[0]) { // Allow undefined == null to satisfy condition.
        store.dispatch({
          type: convertMethodToType(method),
          selector: this.selector,
          $org: this,
          method,
          args,
          memberIdx
        });

        updateState = true;
      }
    }

    if (this.selector === 'window' || this.selector === 'document') {
      return updateState;
    }

    const args = [];

    // Dependent on dispatches of other measurements to populate members.
    getBoundingClientRect(this, args, memberIdx); // Mutates args.

    for (const measurement in args[0]) {
      if (state.boundingClientRect[measurement] !== args[0][measurement]) {
        store.dispatch({
          type: 'SET_BOUNDING_CLIENT_RECT',
          selector: this.selector,
          $org: this,
          method: 'setBoundingClientRect',
          args,
          memberIdx
        });

        updateState = true;

        break;
      }
    }

    return updateState;
  };

// DO NOT REMOVE FOLLOWING COMMENT.
}; // end export default (requerio)
