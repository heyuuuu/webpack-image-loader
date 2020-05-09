const path = require("path");
const loaderUtils = require("loader-utils");
const formaPathClass = require("./lib/formaPath")
const fileClass = require("./lib/fileUtils");
const subscriber = require("./lib/subscriber");

subscriber.$hooks.checkout.tap("checkout" , compilation => {
	// console.log("subscriber.$hooks.checkout",compilation);
});

module.exports = async function(resource){

	// 默认配置
	const defaultOPtions = {
		root:       "/",
		name:       '[path][name].[ext]'
	};
	// 最后生成的配置
	const options = Object.assign( defaultOPtions , loaderUtils.getOptions(this) );

    // 取出所有匹配文件
    resource = resource.replace(/([^'"\s]+)\.(jpg|png|gif|svg|icon)/g, (fullMatch) => {
        // 判断是否是网络图片
        if(/^(http|https):\/\//.test(fullMatch)){
            return fullMatch;
        };
		const IMG = new formaPathClass(this,fullMatch);
		const fullPath = IMG.absolute();
		const FULL = new fileClass(fullPath);

		// 判断文件是否存在
		if(FULL.existsSync()){
			FULL.isChange( buffer => {
				// 判断是否开启了自动检出
				const imgRlativePath = loaderUtils.interpolateName({resourcePath: IMG.relative()}, options.name , {content: Buffer.from(fullPath)});;
				const relativePath = path.join(options.root,imgRlativePath);
				this.emitFile(relativePath,buffer);
				FULL.targetPath(relativePath);
			});
			return IMG.revise(FULL.targetPath());
		}else{
			return fullMatch;
		}
    });

	return resource;
}