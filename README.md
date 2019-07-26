# webpack-image-loader

基于webpack4，处理css以及spa页面中的本地图片引用。

自带转base64编码，基于imagemin的图片压缩功能。

## 如何配置该loader的options项?

> * root 设置相对于输出目录的根目录。
例如: root:'/image'，打包目录是dist，那么生成的目录就是 /dist/image

> * name 设置生成文件的名称，基于interpolateName生成。
可使用以下变量: \[path\]\[name\]\[ext\]\[hash\]等等扩展参数,[更多参考](https://www.npmjs.com/package/loader-utils#user-content-interpolatename)
假设使用\[hash\]\[name\].\[ext\],./home/image/header.png => e4da3b7fbbce2345d7772b0674a318d5header.png

> * base64 设置需要转换的图片大小。
比如设置为3000，那么表示小于3kb的图片会自动转换为base64编码

> * imagemin 图片压缩配置。
以下是支持压缩的图片格式:
- [x] imagemin-jpegtran ， 对应参数imageminJpegtran
- [x] imagemin-pngquant ， 对应参数imageminPngquant
- [x] imagemin-mozjpeg  ， 对应参数imageminMozjpeg
例如:
{
    imageminJpegtran:{},
    imageminPngquant:{quality:\[0.75,.9\]},
    imageminMozjpeg:{quality:75}
}
