# composi-router
Client-side router for Composi applications.

This is an adaptation of [Routie](https://github.com/jgallen23/routie) for Composi. It's been updated to use ES6 and cancel routes by returning false in the route callback.

Composi-Router works on browsers back to IE9.


Installation
------------

```bash
npm i -D composi-router
```

Import and Use
--------------

Import `Router` into your `app.js` file:

```javascript
import {h, Component} from 'composi'
import {Router} from 'composi-router'
```

Importing `Router` creates a new instance of the router and exposes it on the window object as `router`. You can use `router` to define routes. To do so, pass an object with key/value pairs where keys are routes and values are callbacks to execute when the route loads:

```javascript
import {h, Component} from 'composi'
import {Router} from 'composi-router'

router({
  "/": () => {
    // Do something when main page loads
  },
  "/about": () => {
    // load an "About" widget?
  },
  "/users/:name": (name) => {
    if (name === 'joe') alert('Hey, Joe!!!')
    else console.log(name)
  }
})
```

Normally you would use a route to handle loading a component. The best way to do this is to use a functional component. Set a property on the state that you can use to render a component conditionally:

```javascript
// Set up routes to set state on Component
router({
  '/': function() {
    app.setState({activeComponent: 'dashboard'})
  },

  '/dashboard': function() {
    app.setState({activeComponent: 'dashboard'})
  },

  '/heroes': function() {
    app.setState({activeComponent: 'heroes'})
  },

  '/detail/:id': function(id) {
    const state = app.state
    const position = state.heroes.findIndex(person => person.id === id)
    const hero = state.heroes[position]
    hero.originalName = hero.name
    app.setState({activeComponent: 'detail', selectedHero: hero})
  }
})

// In component:

class App extends Component {
  constructor(props) {
    super(props) 
    this.container = 'section'
    this.state = {
      // Default component to show:
      activeComponent: 'dashboard',
    }
  }

  render(state) {

    return (
      <div class="app-root">
        {
          state.activeComponent === 'dashboard' && 
            <HeroDashboard 
              heroes={this.state.heroes}
              search={this.search.bind(this)}
              searchResults={this.state.searchResults} 
              blurSearchInput={this.blurSearchInput.bind(this)} />
        }
        {
          state.activeComponent === 'heroes' && 
            <HeroList 
              heroes={this.state.heroes} 
              deleteItem={this.deleteItem.bind(this)} 
              addHero={this.addHero.bind(this)} />
        }
        {
          state.activeComponent === 'detail' && 
            <HeroDetail 
              hero={this.state.selectedHero} 
              deleteItem={this.deleteItem}
              onHeroNameChange={this.onHeroNameChange.bind(this)} 
              resetName={this.resetName.bind(this)} 
              saveName={this.saveName.bind(this)} />
        }
      </div>
    )
  }
}
```

Optional Parameters
-------------------

```javascript
router('users/:name?', function(name) {
    console.log(name)
})
router('users/') // logs `undefined`
router('users/bob') // logs `'bob'`
```

Wildcard
--------

Using `*` with catch any routes that do not match previously defined routes. Use this as a catch all for any unexpected routes or for a 404:

```javascript
router('users/*', function() {
  console.log('Caught unexpected route!')
})
router('users/12312312')
```

Blocking a Route
----------------

You can block a route by returning false:

```javascript
router('/whatever', function() {
    return false
})
```