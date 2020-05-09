const path = require("path");
const fs = require("fs");
const hooks = require("tapable");
// const {
//     SyncHook,
//     SyncBailHook,
//     SyncWaterfallHook,
//     SyncLoopHook,
//     AsyncParallelHook,
//     AsyncParallelBailHook,
//     AsyncSeriesHook,
//     AsyncSeriesBailHook,
//     AsyncSeriesWaterfallHook
// } = require("tapable");

class subscriberClass {
	constructor(){
		this.$fileResourceData = {};
		this.$hooks = {};
	}
	setPath(outputPath,fileName){
		this.$filePath = path.join(outputPath,fileName);
	}
	updata(){
		try{
			const fileResourceDataBuffer = fs.readFileSync(this.$filePath);
			this.$fileResourceData = JSON.parse(fileResourceDataBuffer.toString());
		}catch(e){

		};
	}
	setHooks(taskName,name,params = []){
		if(hooks.hasOwnProperty(name)){
			if(!this.$hooks[taskName]){
				this.$hooks[taskName] = new hooks[name](params);
			};
			return this.$hooks[taskName];
		}else{
			throw "该hooks上没有找到该函数!";
		}
	}
}

const subscrib = new subscriberClass;

module.exports = subscrib;
