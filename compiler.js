const subscriber = require("./lib/subscriber");
subscriber.setHooks("checkout","SyncHook",["compilation"]);

class compilerClass{
	constructor(options){
		this.$options = options;
	}
	hooksTap(name,callback){
		this.$compiler.hooks[name].tap("fileCheckoutPlugin",function(){
			// console.log(`webpack-image-loader===${name}===start`);
			callback.apply(this,arguments);
			// console.log(`webpack-image-loader===${name}===end`);
		});
	}
	apply(compiler){
		this.$compiler = compiler;
		// 设置记录文件路劲
		subscriber.setPath(compiler.options.output.path,this.$options.fileName);
		// 在编译启动时推入记录数据
		this.hooksTap("environment",compilation => {
			// subscriber.$hooks.checkout.call(compiler);
			subscriber.updata();
		});
		// 编译结束时向资源推入记录数据
		this.hooksTap("emit",compilation => {
			const fileData = JSON.stringify(subscriber.$fileResourceData);
			compilation.assets[this.$options.fileName] = {
				source(){
					return fileData;
				},
				size() {
					return fileData.length;
				}
			}
		});
	}
}

module.exports = compilerClass;