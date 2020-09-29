/**
 * Populate $orgs values with jQuery or Cheerio components.
 *
 * @param {object} $orgs - Organisms keyed by selector.
 * @param {object} $ - jQuery or Cheerio.
 */
export default ($orgs, $) => {
  for (let i of Object.keys($orgs)) {
    /* istanbul ignore if */
    if ($orgs[i] && $orgs[i].hasRequerio) {
      continue;
    }

    let $org;

    if (i === 'document') {
      if (typeof document === 'object') {
        $org = $(document);
      }
      else {
        $org = $(i);

        $org.$members.push({});
      }
    }

    if (i === 'window') {
      if (typeof window === 'object') {
        $org = $(window);
      }
      else {
        $org = $(i);

        $org.$members.push({});
      }
    }

    if (!$org) {
      $org = $(i);
    }

    // Use this property to save the Redux action object returned by a Redux dispatch.
    $org.prevAction = null;

    // Cheerio doesn't have .selector property.
    // .selector property was removed in jQuery 3.
    // Needs to get set here and not in the prototype override because $org.populateMembers() depends on it and there
    // doesn't seem to be an easy way to determine it from within the prototype.
    if (typeof $org.selector === 'undefined') {
      $org.selector = i;
    }

    if (i !== 'document' && i !== 'window') {
      $org.populateMembers();
    }

    // /////////////////////////////////////////////////////////////////////////
    // Set methods that server-side tests are likely to depend on.
    // They need to be defined here and not in the prototype override because
    // `document` and `window` organisms are not Cheerio components.
    // /////////////////////////////////////////////////////////////////////////

    /**
     * @param {number} [distance] - Distance.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.innerWidth === 'undefined') {
      $org.innerWidth = (distance) => {
        if (typeof distance === 'undefined') {
          if ($org.$members[0]) {
            return $org.$members[0]._innerWidth;
          }
          else {
            return null;
          }
        }
        else {
          for (let i = 0; i < $org.$members.length; i++) {
            $org.$members[i]._innerWidth = distance;
          }

          return $org;
        }
      };
    }

    /**
     * @param {number} [distance] - Distance.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.innerHeight === 'undefined') {
      $org.innerHeight = (distance) => {
        if (typeof distance === 'undefined') {
          if ($org.$members[0]) {
            return $org.$members[0]._innerHeight;
          }
          else {
            return null;
          }
        }
        else {
          for (let i = 0; i < $org.$members.length; i++) {
            $org.$members[i]._innerHeight = distance;
          }

          return $org;
        }
      };
    }

    /**
     * @param {number} [distance] - Distance.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.scrollTop === 'undefined') {
      $org.scrollTop = (distance) => {
        if (typeof distance === 'undefined') {
          if ($org.$members[0]) {
            return $org.$members[0]._scrollTop;
          }
          else {
            return null;
          }
        }
        else {
          for (let i = 0; i < $org.$members.length; i++) {
            $org.$members[i]._scrollTop = distance;
          }

          return $org;
        }
      };
    }

    /**
     * @param {number} [distance] - Distance.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.width === 'undefined') {
      $org.width = (distance) => {
        if (typeof distance === 'undefined') {
          if ($org.$members[0]) {
            return $org.$members[0]._width;
          }
          else {
            return null;
          }
        }
        else {
          for (let i = 0; i < $org.$members.length; i++) {
            $org.$members[i]._width = distance;
          }

          return $org;
        }
      };
    }

    /**
     * @param {number} [distance] - Distance.
     * @returns {object} Organism.
     */
    if (typeof $org.height === 'undefined') {
      $org.height = (distance) => {
        if (typeof distance === 'undefined') {
          if ($org.$members[0]) {
            return $org.$members[0]._height;
          }
          else {
            return null;
          }
        }
        else {
          for (let i = 0; i < $org.$members.length; i++) {
            $org.$members[i]._height = distance;
          }

          return $org;
        }
      };
    }

    // /////////////////////////////////////////////////////////////////////////
    // Attach the organism to the object of organisms and finish.
    // /////////////////////////////////////////////////////////////////////////

    $orgs[i] = $org;
  }
};
