const ejsConf = require('./ejs-conf')

module.exports = [
    {
        tagName: 'ejs',
        conf: {
            ...ejsConf,
            template: {
                button: 'example/button',
                buttonGroup: 'example/button-group'
            }
        }
    }
]
