# Extensibility

#### The `$` prototype can be extended before it is submitted to the Requerio constructor.

```javascript
$.prototype.killExtensibility = function () {
  delete $.prototype;
};
```

#### A custom reducer function can be submitted to Requerio as well.

`customReducer` is run as part of Requerio's built-in reducer. In state 
management, it is crucial that new states are copied from, and dereferenced 
from, old states in the process of reduction. But this is not necessary in the 
`customReducer` function. The state, as submitted to `customReducer`, is a work 
in progress. It has already been dereferenced from the old state earlier, and 
will be submitted to Redux as the new state after this function returns. The old 
state can be referenced from the `prevState` argument.

In Requerio, reduction is normally keyed off of `action.method`, not 
`action.type`. `dispatchAction()` will apply this method on the organism, 
assuming the method is defined on the prototype, as per the first example. 
However, nothing forbids keying reduction off of `action.type`. In that 
reduction case, no method is applied on the organism. Just be sure not to enact 
side-effects in the reducer.

```javascript
function customReducer(state, action, $organism, prevState) {
  switch (action.method) {
    case 'killExtensibility':
      state.extensible = false;
      break;
  }

  return state;
}
```

#### Requerio also accepts custom Redux middleware.

`customMiddleware` will be plugged into the Redux store if it is submitted as a 
Redux store enhancer to the Requerio constructor. Middleware runs before the 
reducer. A common (and well-documented) use-case for Redux middleware is 
asynchronous operation.

```javascript
const customMiddleware = store => next => action => {
  switch (action.method) {
    case 'timebombExtensibility':
      action.promise = new Promise(resolve => {
        setTimeout(() => {
          action.$org.dispatchAction('killExtensibility');
          resolve('MECHANIC: SOMEBODY SET UP US THE BOMB.');
        }, 10000);
      });

      return next(action);

    default:
      return next(action);
  }
};
```

This middleware declares a `timebombExtensibility` action, which in turn 
dispatches the `killExtensibility` action 10 seconds later. `.dispatchAction()` 
returns the organism with a `.prevAction` property. In this example, the promise 
is returned as the `.promise` property on `.prevAction`, to be resolved or 
rejected appropriately.

```javascript
requerio.$orgs['#main'].dispatchAction('timebombExtensibility').prevAction.promise.then(
  res => {console.log(res);},
  err => {console.error(err);}
);

```

#### The `action` object.

The `action` object passed into Requerio reducers and middleware comes with 
these properties by default:

| Property | Type | Description |
| --- | --- | --- |
| type | `string` | Required by Redux. Internally in Requerio, always empty string. |
| selector | `string` | The organism's identifying selector. |
| $org | `object` | The organism instance. |
| method | `string` | The method being applied, or empty string. The 1st param to `.dispatchAction()`. |
| args | `*` | The arguments being submitted for the method, as per jQuery/Cheerio documentation. The 2nd param to `.dispatchAction()`. |
| memberIdx | `number`\|`undefined` | The index of the targeted organism member (if targeting a member). The 3rd param to `.dispatchAction()`. |

When using Redux's native `store.dispatch()` method, be sure to construct the 
`action` object with these properties. In this way, the side-effects enacted by 
`.dispatchAction()` can be skipped.

```javascript
requerio.$orgs['#main'].getStore().dispatch(action);
```

The `action` object can also be extended as per the middleware example, wherein 
a `.promise` property was added.

#### Instantiate, initialize, and dispatch.

`customMiddleware` from the earlier example needs to be submitted as a Redux 
store enhancer. Run it through Redux's`.applyMiddleware()` method prior to 
instantiation.

```javascript
const storeEnhancer = Redux.applyMiddleware(customMiddleware);
const requerio = new Requerio($, Redux, $organisms, customReducer, storeEnhancer);

requerio.init();
requerio.$orgs['#main'].dispatchAction('killExtensibility');

// Do it again 10 seconds later.
requerio.$orgs['#main'].dispatchAction('timebombExtensibility').promise.then(
  res => {console.log(res);},
  err => {console.error(err);}
);
```

#### Behaviors

Requerio implementations are likely to dispatch actions and perform other 
operations in greater functions. It is recommended to call these functions 
"behaviors" (in keeping with the "living thing" theme).

```javascript
function forGreatJusticeBehavior() {
  const selector = '#main';
  const $org = requerio.$orgs[selector];

  $org.dispatchAction('killExtensibility');

  const args = {opacity: Math.random()};
  const action = {
    type: '',
    selector,
    $org,
    method: 'css',
    args
  };

  $orgs['#cheshire-cat'].animate(
    args,
    {
      complete: () => $org.getStore().dispatch(action)
    }
  );
}
```

jQuery's `.animate()` method can be applied directly on the organism (as can any 
jQuery/Cheerio method). Requerio has no plans to set state on each frame render 
for the case of animation. Therefore, the state needs to be set at the end of 
the animation. Since calling `.dispatchMethod()` with the `css` method would 
apply an unnecessary jQuery/Cheerio `.css()` invocation, it is better to call 
Redux's `store.dispatch()` with the `action` argument.
