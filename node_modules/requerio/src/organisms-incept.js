function getMeasurement($org, measurement, idx) {
  /* istanbul ignore else */
  if ($org.$members[idx]) {
    return $org.$members[idx]['_' + measurement];
  }
  else {
    return null;
  }
}

function setMeasurement($org, measurement, distance_, idx) {
  for (let i = 0; i < $org.$members.length; i++) {
    if (typeof idx === 'number' && idx !== i) {
      continue;
    }

    let distance;

    if (typeof distance_ === 'function') {
      distance = parseFloat(distance_.call($org[i], i, $org.$members[i]['_' + measurement]));
    }
    else {
      distance = parseFloat(distance_);
    }

    $org.$members[i]['_' + measurement] = distance;
  }

  return $org;
}

/**
 * Populate $orgs values with jQuery or Cheerio components.
 *
 * @param {object} $orgs - Organisms keyed by selector.
 * @param {object} $ - jQuery or Cheerio.
 */
export default ($orgs, $) => {
  for (const i of Object.keys($orgs)) {
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
     * @param {number|string|function} [distance] - Distance.
     * @param {number} [memberIdx] - The index of the member within $org.$members if targeting a member.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.innerWidth === 'undefined') {
      $org.innerWidth = (distance, memberIdx) => {
        // eslint-disable-next-line eqeqeq
        if (distance == null) {
          return getMeasurement($org, 'innerWidth', memberIdx || 0);
        }
        else {
          return setMeasurement($org, 'innerWidth', distance, memberIdx);
        }
      };
    }

    /**
     * @param {number|string|function} [distance] - Distance.
     * @param {number} [memberIdx] - The index of the member within $org.$members if targeting a member.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.innerHeight === 'undefined') {
      $org.innerHeight = (distance, memberIdx) => {
        // eslint-disable-next-line eqeqeq
        if (distance == null) {
          return getMeasurement($org, 'innerHeight', memberIdx || 0);
        }
        else {
          return setMeasurement($org, 'innerHeight', distance, memberIdx);
        }
      };
    }

    /**
     * @param {number|string|function} [distance] - Distance.
     * @param {number} [memberIdx] - The index of the member within $org.$members if targeting a member.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.outerWidth === 'undefined') {
      $org.outerWidth = (distance, memberIdx) => {
        // eslint-disable-next-line eqeqeq
        if (distance == null) {
          return getMeasurement($org, 'outerWidth', memberIdx || 0);
        }
        else {
          return setMeasurement($org, 'outerWidth', distance, memberIdx);
        }
      };
    }

    /**
     * @param {number|string|function} [distance] - Distance.
     * @param {number} [memberIdx] - The index of the member within $org.$members if targeting a member.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.outerHeight === 'undefined') {
      $org.outerHeight = (distance, memberIdx) => {
        // eslint-disable-next-line eqeqeq
        if (distance == null) {
          return getMeasurement($org, 'outerHeight', memberIdx || 0);
        }
        else {
          return setMeasurement($org, 'outerHeight', distance, memberIdx);
        }
      };
    }

    /**
     * @param {number|string|function} [distance] - Distance.
     * @param {number} [memberIdx] - The index of the member within $org.$members if targeting a member.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.scrollLeft === 'undefined') {
      $org.scrollLeft = (distance, memberIdx) => {
        // eslint-disable-next-line eqeqeq
        if (distance == null) {
          return getMeasurement($org, 'scrollLeft', memberIdx || 0);
        }
        else {
          return setMeasurement($org, 'scrollLeft', distance, memberIdx);
        }
      };
    }

    /**
     * @param {number|string|function} [distance] - Distance.
     * @param {number} [memberIdx] - The index of the member within $org.$members if targeting a member.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.scrollTop === 'undefined') {
      $org.scrollTop = (distance, memberIdx) => {
        // eslint-disable-next-line eqeqeq
        if (distance == null) {
          return getMeasurement($org, 'scrollTop', memberIdx || 0);
        }
        else {
          return setMeasurement($org, 'scrollTop', distance, memberIdx);
        }
      };
    }

    /**
     * @param {number|string|function} [distance] - Distance.
     * @param {number} [memberIdx] - The index of the member within $org.$members if targeting a member.
     * @returns {number|null|object} Distance, null, or organism.
     */
    if (typeof $org.width === 'undefined') {
      $org.width = (distance, memberIdx) => {
        // eslint-disable-next-line eqeqeq
        if (distance == null) {
          return getMeasurement($org, 'width', memberIdx || 0);
        }
        else {
          return setMeasurement($org, 'width', distance, memberIdx);
        }
      };
    }

    /**
     * @param {number|string|function} [distance] - Distance.
     * @param {number} [memberIdx] - The index of the member within $org.$members if targeting a member.
     * @returns {object} Organism.
     */
    if (typeof $org.height === 'undefined') {
      $org.height = (distance, memberIdx) => {
        // eslint-disable-next-line eqeqeq
        if (distance == null) {
          return getMeasurement($org, 'height', memberIdx || 0);
        }
        else {
          return setMeasurement($org, 'height', distance, memberIdx);
        }
      };
    }

    // /////////////////////////////////////////////////////////////////////////
    // Attach the organism to the object of organisms and finish.
    // /////////////////////////////////////////////////////////////////////////

    $orgs[i] = $org;
  }
};
