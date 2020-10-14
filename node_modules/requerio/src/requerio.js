import organismsIncept from './organisms-incept.js';
import postInception from './post-inception.js';
import prototypeOverride from './prototype-override.js';
import reducerGet from './reducer-get.js';

class Requerio {

  /**
   * @param {object} $ - jQuery or Cheerio.
   * @param {object} Redux - Redux.
   * @param {object} $organisms - Key:value pairs of selector names and null values.
   * @param {function} [customReducer] - Custom Redux reducer for extending the built-in reducer.
   * @param {function} [storeEnhancer] - A function to extend the Redux store with additional capabilities.
   */
  constructor($, Redux, $organisms, customReducer, storeEnhancer) {
    this.$ = $;
    this.Redux = Redux;
    this.$orgs = $organisms;
    this.customReducer = customReducer;
    this.storeEnhancer = storeEnhancer;
    this.store = null;
  }

  /**
   * A distinct initialization method allows end-users to extend this class and perform operations between instantiation
   * and initialization if desired.
   */
  init() {
    const reducer = reducerGet(this.$orgs, this.Redux, this.customReducer);
    this.store = this.Redux.createStore(reducer, this.storeEnhancer);

    prototypeOverride(this);
    organismsIncept(this.$orgs, this.$);
    postInception(this);
  }

  /**
   * @param {...string} selectors - jQuery/Cheerio selectors.
   */
  incept(...selectors) {
    const $organisms = {};

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];

      if (typeof this.$orgs[selector] === 'undefined') {
        $organisms[selector] = null;
      }
    }

    organismsIncept($organisms, this.$);

    for (const i in $organisms) {
      this.$orgs[i] = $organisms[i];
    }

    postInception(this);

    const reducer = reducerGet(this.$orgs, this.Redux, this.customReducer);
    this.store.replaceReducer(reducer);
  }
}

if (typeof define === 'function') {
  define(function () {
    return Requerio;
  });
}
else if (typeof window === 'object') {
  window.Requerio = Requerio;
}

export default Requerio;
