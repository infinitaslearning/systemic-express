# systemic-express
A [systemic](https://github.com/guidesmiths/systemic) express component

## Usage
```js
const System = require('systemic')
const server = require('systemic-express').server
const app = require('systemic-express').app
const defaultMiddleware = require('systemic-express').defaultMiddleware
const routes = require('./lib/routes')

new System()
    .configure({
        server: {
            port: 3000
        },
        app: {
            etag: true
        }
    })
    .add('app', app()).dependsOn('config')
    .add('routes', routes()).dependsOn('app')
    .add('middleware.default', defaultMiddleware()).dependsOn('routes', 'app')
    .add('server', server()).dependsOn('config', 'app', 'middleware.default')
    .start((err, components) => {
        // Do stuff with components
    })
```
