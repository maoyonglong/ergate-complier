const ejsConf = require('./ejs-conf')
const pugConf = require('./pug-conf')

module.exports = [
    {
        tagName: 'ejs',
        conf: {
            ...ejsConf,
            template: {
                button: 'example/button'
            }
        }
    },
    {
        tagName: 'pug',
        conf: {
            ...pugConf,
            template: {
                archor: 'example/archor'
            }
        }
    }
]
