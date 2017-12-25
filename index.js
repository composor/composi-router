/**
  * Route type
  * @constructor
  *
  * Creates a Route object for general use
  * 
  * @param {String} path
  * @param {type} name
  */
function Router(w, isModule) {
  let routes = []
  let map = {}
  let reference = 'router'
  let oldReference = window[reference]
  let oldUrl

  class Route {
    constructor(path, name) {
      this.name = name
      this.path = path
      this.keys = []
      this.fns = []
      this.params = {}
      this.pathToRegexp = (path, keys, sensitive, strict) => {
        if (path instanceof RegExp) return path
        if (path instanceof Array) path = '(' + path.join('|') + ')'
        path = path
          .concat(strict ? '' : '/?')
          .replace(/\/\(/g, '(?:/')
          .replace(/\+/g, '__plus__')
          .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
            keys.push({ name: key, optional: !! optional })
            slash = slash || ''
            return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '')
          })
          .replace(/([/.])/g, '\\$1')
          .replace(/__plus__/g, '(.+)')
          .replace(/\*/g, '(.*)')
        return new RegExp('^' + path + '$', sensitive ? '' : 'i')
      }
      this.regex = this.pathToRegexp(this.path, this.keys, false, false)
    }

    /**
     * Adds a handler for "this" route
     * 
     * @param {Function} fn
     */
    addHandler(fn) {
      this.fns.push(fn)
    }

    /**
     * Removes specific handler for this route
     * 
     * @param {Function} fn
     * @return {void}
     */
    removeHandler(fn) {
      for (let i = 0, c = this.fns.length; i < c; i++) {
        let f = this.fns[i]
        if (fn == f) {
          this.fns.splice(i, 1)
          return
        }
      }
    }

    /**
     * Executes this route with specified params
     * 
     * @param {Object} params
     * @return {void}
     */
    run(params) {
      for (let i = 0, c = this.fns.length; i < c; i++) {
        if (this.fns[i].apply(this, params) === false)
          return false
      }
      return true
    }

    /**
     * Tests a path of this route and runs if it's successed
     * @param {String} path
     * @param {Object} params
     * @return {Bool}
     */
    match(path, params){
      let m = this.regex.exec(path)
      if (!m) return false
      for (let i = 1, len = m.length; i < len; ++i) {
        let key = this.keys[i - 1]
        let val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i]
        if (key) {
          this.params[key.name] = val
        }
        params.push(val)
      }
      return true
    }
  }

  /**
   * This is the main constructor for router object
   * Creates a route or navigates it if second parameter is empty
   * 
   * @param {String} path name of to route to register or to navigate
   * @param {Function} fn callback founction for this route
   * @returns {void}
   */
  const router = (path, fn) => {
    let addHandler = (path, fn) => {
      let s = path.split(' ')
      let name = (s.length == 2) ? s[0] : null
      path = (s.length == 2) ? s[1] : s[0]

      if (!map[path]) {
        map[path] = new Route(path, name)
        routes.push(map[path])
      }
      map[path].addHandler(fn)
    }
    if (typeof fn == 'function') {
      addHandler(path, fn)
      router.reload()
    } else if (typeof path == 'object') {
      for (let p in path) {
        addHandler(p, path[p])
      }
      router.reload()
    } else if (typeof fn === 'undefined') {
      router.navigate(path)
    }
  }

  /**
   * Removes specified handlerfor specified path
   * Remeber that: one path can have multiple handlers/callbacks functions
   * you should specify exact object that refers handler
   * 
   * @param  {String} path target path to remove
   * @param  {Function} fn handler function
   * @return {void}
   */
  router.remove = (path, fn) => {
    let route = map[path]
    if (!route)
      return
    route.removeHandler(fn)
  }

  /**
   * Removes all handlers and routes
   * 
   * @return {void}
   */
  router.removeAll = () => {
    map = {}
    routes = []
    oldUrl = ''
  }

  /**
   * Navigates current route to desired one
   * 
   * @param  {String} path target path to navigate
   * @param  {Object} options options for this navigate
   * @return {void}
   */
  router.navigate = (path, options) => {
    options = options || {}
    let silent = options.silent || false

    if (silent) {
      removeListener()
    }
    setTimeout(() => {
      window.location.hash = path

      if (silent) {
        setTimeout(() => addListener(), 1)
      }

    }, 1)
  }

  /**
   * Creates a reference for prevent conflicts
   * @return {Object}
   */
  router.noConflict = () => {
    w[reference] = oldReference
    return router
  }
  
  /**
   * Reload the page without changing the hash
   * @param {String} path 
   */
  router.load = (path) => {
    map[path].run()
  }

  /**
   * Get the location hash
   * @return {String}
   */
  const getHash = () => window.location.hash.substring(1)

  /**
   * Checks to see if a hash matches a route
   * @param {String} hash 
   * @param {String} route 
   */
  const checkRoute = (hash, route) => {
    let params = []
    if (route.match(hash, params)) {
      return (route.run(params) !== false ? 1 : 0)
    }
    return -1
  }

  /**
   * Check whether location hash has changes
   */
  const hashChanged = router.reload = () => {
    let hash = getHash()
    for (let i = 0, c = routes.length; i < c; i++) {
      let route = routes[i]
      let state = checkRoute(hash, route)
      if (state === 1) {
        // route processed:
        oldUrl = hash
        break
      } else if (state === 0){
        // route rejected:
        router.navigate(oldUrl, { silent:true })
        break
      }
    }
  }

  /**
   * Add haschange event listener
   */
  const addListener = () => {
    if (w.addEventListener) {
      w.addEventListener('hashchange', hashChanged, false)
    } else {
      w.attachEvent('onhashchange', hashChanged)
    }
  }

  /**
   * Remove hashchange event listener
   */
  const removeListener = () => {
    if (w.removeEventListener) {
      w.removeEventListener('hashchange', hashChanged)
    } else {
      w.detachEvent('onhashchange', hashChanged)
    }
  }

  addListener()
  oldUrl = getHash()

  if (isModule){
    return router
  } else {
    w[reference] = router
  }

}

if (typeof module == 'undefined') {
  Router(window)
} else {
  module.exports = Router(window, true)
  module.exports.default = module.exports
}
