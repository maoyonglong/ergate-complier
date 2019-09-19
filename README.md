# ergate-compiler
----
This module allows you to use the template engine as you would with HTML tags.
本模块让你能够像使用html标签一样使用模板引擎的模板。

# A simple example
### example/index.xml
```xml
<div class="button-group">
    <!-- is denotes the template used, and text is a custom property whose value is assigned to a variable named text in the template file-->
    <!-- is表示使用的模板， text是自定义的属性，它的值将赋予模板文件中名为text的变量 -->
    <ejs is="button" text="button1" />
    <ejs is="button" text="button2" />
</div>
<div class="archor-group">
    <pug is="archor" text="archor1" />
    <pug is="archor" text="archor2" />
</div>
```
### example/button.ejs
```xml
<button><%= text %></button>
```
### example/archor.pug
```xml
a(href="") #{text}
```
### ergate-compiler-conf.js (configure file)
```js
const ejsConf = require('./node_modules/ergate-complier/ejs-conf')
const pugConf = require('./node_modules/ergate-complier/pug-conf')

module.exports = [
    {
        // the tag name, <ejs> denotes template rendering
        // 使用的标签名 <ejs>表示使用模板渲染
        tagName: 'ejs',
        conf: {
            ...ejsConf,
            // template position name:path <ejs is="button" /> => use the example/button.ejs to render
            // 模板位置 名字:模板路径 <ejs is="button" /> => 使用example/button.ejs渲染
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
```
### index.js
```js
const Parser = require('ergate-complier')

const parser = new Parser()

parser.parseFile('example/index.xml').then((parser) => {
    parser.codegen().dest('example/index.html')
})
```
Running the index.js file above with node generates the `example/index.html'file as follows:
用node运行上面的index.js文件，会生成`example/index.html`文件如下：   
```xml
<div class="button-group">
    <button>button1</button>
    <button>button2</button>
</div>
<div class="archor-group"> 
    <a href="">archor1</a>
    <a href="">archor2</a>
</div>
```
> 注意(notice)：  
> the paths used above must be relative to the root directory
> 涉及的路径必须是`相对于根目录`的相对路径

# API
## Parser
* new Parser(options)
     新建一个解析器
     * ### options
        * confs {String | Object} custom path of configure file or a configure array 自定义的配置文件路径或者数组
* parse(content) -> void
    解析content为ast parse content to ast
* parseFile(path) -> void
    解析file为ast parse file to ast
* codegen(void) -> void
    生成ast对应的code generate code
* getCode() -> String
    返回codegen生成的字符串 get code after generating
* dest(path) -> void
    生成文件 generate file 

# 配置文件 configure file
The default configuration file is the `ergate-complier-conf.js'file in the root directory.  
默认的配置文件是根目录的`ergate-complier-conf.js`文件。  

Its contents are as follows:  
它的内容如下：   
```js
module.exports = [
    {
        tagName: 'ejs',
        conf: {
            /**
             * Rendering Method of Template
             * When a tag with the same name and tagName is encountered, the method is called to generate   * its corresponding code.
             * By rewriting the CodeGen method, the results of the template analysis can be changed.
             * The callback of the method receives a node object whose content is:
             * 模板的渲染方法
             * 当遇到名字和tagName相同的标签时，会调用该方法生成其对应的代码。
             * 通过重写codegen方法，可以改变模板的解析结果。
             * 方法的回调会接收一个node对象，它的内容是：
             * {
             *  tag: 'ejs', // tagName对应的名字 // the tagName 
             *  attrs: {
             *      is: '', // 使用的模板 // used template
             *      // ... 其它自定义标签属性（模板变量） // other custom property(attribute)
             *  }
             * }
            */
            codegen: function (node) {
                const attrs = node.attrs
                const is = attrs.is
                delete attrs.is
                const tmpPath = path.resolve(__dirname, `${this.template[is]}${this.extname}`)
                const tmpStr = ejs.fileLoader(tmpPath, 'utf-8')
                return ejs.render(tmpStr, {filename: tmpPath, ...attrs})
            },
            extname: '.ejs',
            // 模板路径，相对于根目录 // template path, relative to root directory
            template: {
                button: 'example/button'
            }
        }
    }
]
```
The configuration file exports an array in order to achieve the simultaneous use of multiple template engines.
For example, EJS and Pug are parsed simultaneously.

配置文件导出一个数组，这是为了实现同时使用多个模板引擎的情况。  
例如要同时解析ejs和pug。
```js
module.exports = [
    {
        tagName: 'ejs',
        conf: {
            codegen: function () {
                // ...
            },
            template: {
                // ...
            }
        }
    },
    {
        tagName: 'pug',
        conf: {
            codegen: function () {
                // ...
            },
            template: {
                // ...
            }
        }
    }
]
```
This allows you to use both `pug />'and `ejs />' tags in a file.

这样就可以在一个文件中同时使用`<pug />`和`<ejs />`标签了

# codegen
Currently only CodeGen of EJS and pug is implemented

Their corresponding CodeGen configuration files `ejs-conf.js'and `pug-conf.js' under `. / node_modules/ergate-complier/``

They are used in the following ways:
目前只实现了ejs和pug的codegen 
它们对应的codegen配置文件在`./node_modules/ergate-complier/`下的`ejs-conf.js`和`pug-conf.js`   
它们的使用方式是：
```js
// use ejs-conf
const ejsConf = require('./node_modules/ergate-complier/ejs-conf')

module.exports = [
    {
        tagName: 'ejs',
        conf: {
            ...ejsConf,
            template: {
                button: 'example/button'
            }
        }
    }
]

// or use pug-conf
const pugConf = require('.node_modules/ergate-compiler/pug-conf')

module.exports = [
    {
        // 使用的标签名 <ejs>表示使用模板渲染
        tagName: 'ejs',
        conf: {
            ...pugConf,
            // 模板 名字:模板路径 <ejs is="button" /> => 使用example/button.ejs渲染
            template: {
                button: 'example/button'
            }
        }
    }
]

// of course, you can use pug and ejs at the same time
```