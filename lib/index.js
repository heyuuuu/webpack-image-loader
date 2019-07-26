const loaderUtils = require("loader-utils");
const path = require("path");
const fs = require("fs");

// 压缩依赖
const imagemin = require("imagemin");
const imageminPluins = {
    imageminJpegtran:require('imagemin-jpegtran'),
    imageminPngquant:require('imagemin-pngquant'),
    imageminMozjpeg :require('imagemin-mozjpeg')
}

// 局部缓存，防止重复使用
const $cache = {};

module.exports = async function(resource){
    // 默认配置
    const defaultOPtions = {
        root:       "/images",
        name:       '/[hash:12].[ext]',
        base64:     0,
        imagemin:   null
    };
    // 获取父级目录
    const parentPath = path.parse(this.resourcePath).dir;
    // 获取项目根目录
    const rootPath = path.resolve( '.'+ path.sep );

    // 最后生成的配置
    const options = Object.assign(defaultOPtions,this.options||{});

    // 取出所有匹配文件
    resource = resource.replace(/([^'"]+)\.(jpg|png)/g, (fullMatch) => {
        const { root , ext } = path.parse(fullMatch);
        
        const fullPath = path.join(root ? rootPath : parentPath , fullMatch );

        // 判断文件是否存在
        if(fs.existsSync(fullPath)){
            const imageState = fs.statSync(fullPath);

            // 获取运行时缓存
            const imageCache = $cache[fullPath];

            // 是否从缓存中读取
            if(imageCache && imageCache.createTime == imageState.ctime){

                return imageCache.content;

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
                        ".icon" : "x-icon"
                    }[ext];
                    const base64 = "data:image/"+ minetype+";base64," + buffer.toString("base64");
                    $cache[fullPath] = { content: base64 , createTime: imageState.ctime };
                    return base64;
                };

                // 唯一标识符
                const guid = loaderUtils.interpolateName({resourcePath:fullPath}, options.name , { content: buffer });

                // 生成图片路径
                const imgPath = path.join(options.root,guid);

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
                $cache[fullPath] = { content: tranImgPath , createTime: imageState.ctime };

                return tranImgPath;
            }
        }else{
            return " ";
        }

    });
    return resource;
}