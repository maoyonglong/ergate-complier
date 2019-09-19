const pug = require('pug')
const path = require('path')

module.exports = {
    codegen: function (node) {
        const attrs = node.attrs
        const is = attrs.is
        delete attrs.is
        const tmpPath = path.resolve(__dirname, `${this.template[is]}${this.extname}`)
        return pug.renderFile(tmpPath, {filename: tmpPath, ...attrs})
    },
    extname: '.pug'
}