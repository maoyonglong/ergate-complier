const ejs = require('ejs')
const path = require('path')

module.exports = {
    codegen: function (node) {
        const attrs = node.attrs
        const is = attrs.is
        delete attrs.is
        const tmpPath = path.resolve(__dirname, `${this.template[is]}${this.extname}`)
        const tmpStr = ejs.fileLoader(tmpPath, 'utf-8')
        return ejs.render(tmpStr, {filename: tmpPath, ...attrs})
    },
    extname: '.ejs'
}