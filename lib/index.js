const loaderUtils = require("loader-utils");
const path = require("path");
const fs = require("fs");
const { storageClass } = require("./storage");

// 压缩依赖
const imagemin = require("imagemin");
const imageminPluins = {
    imageminJpegtran:require('imagemin-jpegtran'),
    imageminPngquant:require('imagemin-pngquant'),
    imageminMozjpeg :require('imagemin-mozjpeg')
}

// 局部缓存，防止重复使用
const $cache = new storageClass();

module.exports = async function(resource){
    // 默认配置
    const defaultOPtions = {
        root:       "/",
        name:       '[path][name].[ext]',
        base64:     0,
        imagemin:   null
    };
    // 获取父级目录
    const parentPath = path.parse(this.resourcePath).dir;

    // 获取项目根目录
    const rootContext = this.rootContext;

    // 最后生成的配置
    const options = Object.assign( defaultOPtions , loaderUtils.getOptions(this) || {} );

    function getPath(fullMatch){
		const resourcePath = path.join(parentPath,fullMatch);
		const relativePath = path.relative(rootContext,resourcePath);
		const { ext } = path.parse(resourcePath);
		return {fullPath: resourcePath,relativePath ,ext };
	}

    // 取出所有匹配文件
    resource = resource.replace(/([^'"\s]+)\.(jpg|png|gif|svg|icon)/g, (fullMatch) => {
        // 判断是否是网络图片
        if(/^(http|https):\/\//.test(fullMatch)){
            return fullMatch;
        };

        const { fullPath , relativePath , ext } = getPath(fullMatch);

        // 判断文件是否存在
        if(fs.existsSync(fullPath)){
            const imageState = fs.statSync(fullPath);

            // 是否从缓存中读取
            if($cache.isexist(fullPath,imageState.ctime)){

                return $cache.get(fullPath).content;

            }else{

                // 读取buffer
                const buffer = fs.readFileSync(fullPath);

                // 判断是否需要用base64编码替换
                if(buffer.length < options.base64){
                    // 自动添加base64类型
                    const minetype = {
                        ".png"  : "png",
                        ".jpg"  : "jpeg",
                        ".gif"  : "gif",
                        ".icon" : "x-icon",
                        ".svg"  : "svg+xml"
                    }[ext];
                    const base64 = "data:image/"+ minetype+";base64," + buffer.toString("base64");
                    $cache.set(fullPath,base64,imageState.ctime);
                    return base64;
                };

                // 唯一标识符
                const imgRlativePath = loaderUtils.interpolateName({resourcePath: relativePath}, options.name , { content: buffer });

                // 生成图片路径
                const imgPath = path.join(options.root,imgRlativePath);

                //转换图片路径
                const tranImgPath = imgPath.split(path.sep).join('/');

                // 判断是否启动图片压缩
                if(options.imagemin){
                    const plugins = Object.keys(options.imagemin).map(type => imageminPluins[type](options.imagemin[type]));
                    imagemin.buffer(buffer,{plugins}).then( buffer => this.emitFile(imgPath,buffer));
                }else{
                    // 写入缓存中
                    this.emitFile(imgPath,buffer);
                };
                
                // 写入缓存之中
                $cache.set(fullPath,tranImgPath,imageState.ctime);

                return tranImgPath;
            }
        }else{
            return fullMatch;
        }

    });
    return resource;
}