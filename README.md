# ergate-compiler
----
本模块让你能够像使用html标签一样使用模板引擎的模板。

# 一个简单的例子
### example/index.xml
```xml
<div class="button-group">
    <!-- is表示使用的模板， text是自定义的属性，它的值将赋予模板文件中名为text的变量 -->
    <ejs is="button" text="button1" />
    <ejs is="button" text="button2" />
</div>
```
### button对应的模板
```xml
<button><%= text %></button>
```
### 默认的配置文件
```js
const ejsConf = require('./node_modules/ergate-compiler/ejs-conf')

module.exports = [
    {
        // 使用的标签名 <ejs>表示使用模板渲染
        tagName: 'ejs',
        conf: {
            ...ejsConf,
            // 模板 名字:模板路径 <ejs is="button" /> => 使用example/button.ejs渲染
            template: {
                button: 'example/button'
            }
        }
    }
]
```
### index.js
```js
const Parser = require('../parser')

const parser = new Parser()

parser.parseFile('example/index.xml').then((parser) => {
    parser.codegen().dest('example/index.html')
})
```
用node运行上面的index.js文件，会生成`example/index.html`文件如下：   
```xml
<div class="button-group">
    <button>button1</button>
    <button>button2</button>
</div>
```
> 注意：  
> 涉及的路径必须是`相对于根目录`的相对路径

# API
## Parser
* ## new Parser(options)
     新建一个解析器
     * ### options
        * confs {String | Object} 自定义的配置文件路径或者对象
* ## parse(content) -> void
    解析content为ast
* ## parseFile(path) -> void
    解析content为ast
* ## codegen(void) -> void
    生成ast对应的code
* ## getCode() -> String
    返回codegen生成的字符串
* ## dest(path) -> void
    生成的文件的路径

# 配置文件
默认的配置文件是根目录的`ergate-compiler-conf.js`文件。  
它的内容如下：   
```js
module.exports = [
    {
        tagName: 'ejs',
        conf: {
            /**
             * 模板的渲染方法
             * 当遇到名字和tagName相同的标签时，会调用该方法生成其对应的代码。
             * 通过重写codegen方法，可以改变模板的解析结果。
             * 方法的回调会接收一个node对象，它的内容是：
             * {
             *  tag: 'ejs', // tagName对应的名字
             *  attrs: {
             *      is: '', // 使用的模板
             *      // ... 其它自定义标签属性（模板变量）
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
            // 模板路径，相对于根目录
            template: {
                button: 'example/button'
            }
        }
    }
]
```
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
这样就可以在一个文件中同时使用`<pug />`和`<ejs />`标签了

# 支持
目前只默认支持`<ejs />`