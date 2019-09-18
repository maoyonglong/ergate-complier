const Parser = require('../parser')

// relative of root
const parser = new Parser()

parser.parseFile('example/index.xml').then((parser) => {
    parser.codegen().dest('example/index.html')
})