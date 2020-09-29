# Why Requerio?

In order to answer "Why Requerio?" we need to ask "What's the Problem?"

### Is jQuery the Problem?

Does jQuery cause problems for manipulating the DOM? Does it cause problems when 
expecting the same results in different browsers? Does it expose a problematic 
API such that an abstracted layer like Requerio would find it difficult or 
impossible to override the jQuery prototype, or apply jQuery methods in a 
predictable manner?

The answer to these questions is an emphatic "no."

Then, does jQuery cause problems when a frontend web application becomes 
complex? Does jQuery make it difficult to determine what event dispatches what 
actions, and what the repercussions could be for changing anything?

jQuery doesn't _cause_ any of these things. Simply removing jQuery won't make 
developers architect their applications any better.

### State Machines/Containers/Organisms?

The state machine concept is generally purposed for describing engineering 
models. A system with on and off states and an on/off switch is a very basic 
state machine.

Requerio uses Redux, which is described as a "state container." An application 
using Requerio or Redux would in turn be a logical state machine where the state 
is "contained" in the container so the application, and its developers, can have 
a single source of truth from which to garner a sense of what's going on, and to 
determine what further steps to take based on this state.

If you're reading this, you may already have experience with Redux with React, 
or the state management that occurs in a framework like Vue.js. Requerio isn't 
really meant to compete with them. There are no plans to make Requerio fetch 
data from remote APIs or render templates. The development of Requerio arose 
from a situation where remote data and templates were _not_ needed.

With the scope of work determined, we then determined we could not simply make 
Redux work with the DOM alone. An abstraction layer needed to sit between Redux 
and the DOM, so a consistent API would be exposed, and so API methods would work 
consistently across browsers. If a facimile for this abstraction layer existed 
for Node, then the state contained by Redux could be tested in Node. jQuery and 
Cheerio fit this bill nicely.

Requerio enables state at the HTML element level. jQuery (from here on out, when 
we say "jQuery," we also mean Cheerio) encapsulates an HTML element within a 
unique object. Requerio applies Redux to give state to that jQuery object. In 
the Requerio context, state is what distinguishes a living thing from non-living 
things. Therefore, an HTML element with state is alive, and hence, an organism.

### The Problem Again, and the Solution

The problem again is disorganized application architecture. Requerio helps keep 
applications organized in a number of ways. First, organisms are declared about 
as simply as possible. They must exist as plain HTML. Their selector names must 
be declared in an object submitted to the Requerio constructor. At this point, 
markup is in one place, and executable code in another. After the Requerio 
object is instantiated and initialized, actions can be dispatched. The state 
resulting from these actions can then be tested.

By removing templates from the equation, Requerio enables a case where designers 
can play a greater role in determining markup and styles. If you're reading 
this, you may already feel that testing code is a necessity. Do you really 
prefer tasking a single developer with _both_ writing tests _and_ presentation, 
particularly as a project grows in size and complexity? Or imagine you're not 
reading this, and your specialty is presentation. Do you really prefer tasking a 
single developer with _both_ presentation _and_ writing tests?
