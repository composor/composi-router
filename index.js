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
      this.pathToRegexp = function(path, keys, sensitive, strict) {
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
    addHandler(fn) {
      this.fns.push(fn)
    }
    removeHandler(fn) {
      for (let i = 0, c = this.fns.length; i < c; i++) {
        let f = this.fns[i]
        if (fn == f) {
          this.fns.splice(i, 1)
          return
        }
      }
    }
    run(params) {
      for (let i = 0, c = this.fns.length; i < c; i++) {
        if (this.fns[i].apply(this, params) === false)
          return false
      }
      return true
    }
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
    toURL(params) {
      let path = this.path
      for (let param in params) {
        path = path.replace('/:'+param, '/'+params[param])
      }
      path = path.replace(/\/:.*\?/g, '/').replace(/\?/g, '')
      if (path.indexOf(':') != -1) {
        throw new Error('missing parameters for url: '+path)
      }
      return path
    }
  }

  const router = function(path, fn) {
    let addHandler = function(path, fn) {
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

  router.lookup = function(name, obj) {
    for (let i = 0, c = routes.length; i < c; i++) {
      let route = routes[i]
      if (route.name == name) {
        return route.toURL(obj)
      }
    }
  }

  router.remove = function(path, fn) {
    let route = map[path]
    if (!route)
      return
    route.removeHandler(fn)
  }

  router.removeAll = function() {
    map = {}
    routes = []
    oldUrl = ''
  }

  router.navigate = function(path, options) {
    options = options || {}
    let silent = options.silent || false

    if (silent) {
      removeListener()
    }
    setTimeout(function() {
      window.location.hash = path

      if (silent) {
        setTimeout(function() { 
          addListener()
        }, 1)
      }

    }, 1)
  }

  router.noConflict = function() {
    w[reference] = oldReference
    return router
  }

  const getHash = function() {
    return window.location.hash.substring(1)
  }

  const checkRoute = function(hash, route) {
    let params = []
    if (route.match(hash, params)) {
      return (route.run(params) !== false ? 1 : 0)
    }
    return -1
  }

  const hashChanged = router.reload = function() {
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

  const addListener = function() {
    if (w.addEventListener) {
      w.addEventListener('hashchange', hashChanged, false)
    } else {
      w.attachEvent('onhashchange', hashChanged)
    }
  }

  const removeListener = function() {
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
