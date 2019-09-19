const htmlParser = require('html-parse-stringify2')
const pretty = require('pretty')
const fs = require('fs')
const { promisify } = require('util')
const builtInPath = require('path')

// the table of template engine configure
const tmpTable = {}

function getPathRelativeOfRoot (path) {
    // root
    const root = './'
    return builtInPath.resolve(root, path)
}

function Parser ({ confs } = {}) {
    if (typeof confs === 'string') {
        this.confs = require(confs)
    }
    else if (typeof confs === 'object') {
        this.confs = confs
    } else {
        this.confs = require(getPathRelativeOfRoot('ergate-complier-conf'))
    }
    this._htmlStr = ''
    this.confs.forEach(function (conf, idx) {
        // record the index of template configure
        tmpTable[conf.tagName] = idx
        // apply plugin
        if (typeof conf.plugin === 'function') {
            conf.plugin(conf)
        }
    })
}

Parser.prototype = {
    constructor: Parser,
    parse: function (content) {
        this._ast = htmlParser.parse(content)
        return this
    },
    parseFile: async function (path) {
        const readFile = promisify(fs.readFile)
        content = await readFile(getPathRelativeOfRoot(path), { encoding: 'utf8' })
        return this.parse(content)
    },
    codegen: function (nodes = this._ast) {
        nodes.forEach((node) => {
            if (typeof tmpTable[node.name] === 'number') {
                this._htmlStr += this.confs[tmpTable[node.name]].conf.codegen(node)
            } else {
                if (node.type === 'tag') {
                    let attrStr = ''
                    for (let [key, val] of Object.entries(node.attrs)) {
                        attrStr += ` ${key}="${val}"`
                    }
                    this._htmlStr += `<${node.name}${attrStr}`
                    if (node.children.length) {
                        this._htmlStr += '>'
                        this.codegen(node.children)
                        this._htmlStr += `</${node.name}>`
                    } else {
                        this._htmlStr += ' />'
                    }
                } else {
                    this._htmlStr += node.content
                }
            }
        })
        return this
    },
    getCode: function () {
        return pretty(this._htmlStr)
    },
    dest: function (path) {
        fs.writeFileSync((getPathRelativeOfRoot(path)), this.getCode(), { encoding: 'utf8' })
    }
}

module.exports = Parser