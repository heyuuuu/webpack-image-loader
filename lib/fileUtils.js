const fs = require("fs");
const subscriber = require("./subscriber");
const fileResourceData = subscriber.$fileResourceData;

class fileUtilsClass{
	constructor(resourcePath){
		this.$name = resourcePath;
		this.$data = fileResourceData[resourcePath] ? fileResourceData[resourcePath] : fileResourceData[resourcePath] = {
			stat: {},
			alias: null
		};
	}
	existsSync(){
		return fs.existsSync(this.$name);
	}
	statSync(){
		const stat = fs.statSync(this.$name);
		return {
			mtimeMs: stat.mtimeMs,
			size: stat.size
		}
	}
	getBuffer(){
		return fs.readFileSync(this.$name);
	}
	isChange(callback){
		const nowStat = this.statSync();
		const oldStat = this.getStat();
		const state = nowStat.mtimeMs === oldStat.mtimeMs && nowStat.size === oldStat.size;
		if(!state){
			this.$data.stat = nowStat;
			callback(this.getBuffer())
		};
		return state;
	}
	getStat(name){
		const stat = this.$data.stat;
		return name ? stat[name] : stat;
	}
	targetPath(url){
		return url ? this.$data.alias = url : this.$data.alias;
	}
}

module.exports = fileUtilsClass;