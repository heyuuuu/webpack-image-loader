const path = require("path");

class formatPathClass{
	constructor(scope,fullMatch){
		this.$scope = scope;
		this.$fullMatch = fullMatch;
	}
	// 完整路径
	absolute(){
		const { root } = path.parse(this.$fullMatch);
		if(root){
			return this.$fullMatch;
		}else{
			const parentPath = path.parse(this.$scope.resourcePath).dir;
			const resourcePath = path.join(parentPath,this.$fullMatch);
			return resourcePath;
		}
	}
	// 相对路径
	relative(){
		const resourcePath = this.absolute();
		const relativePath = path.relative(this.$scope.rootContext,resourcePath);
		return relativePath;
	}
	// 格式化
	parse(name){
		const resourcePath = this.absolute();
		const parse = path.parse(resourcePath);
		return name ? parse[name] : parse;
	}
	// 修正路径
	revise(url){
		const sep = '/';
		const path = url || this.relative();
		return sep + path.split(/[\\//]/).filter( v => v).join(sep);
	}
}

module.exports = formatPathClass;