const crypto = require("crypto");

// md5加密
function md5(content){
    return crypto
    .createHmac('sha256', "hy")
    .update(content)
    .digest('hex');
};

// guid
function guid(content){
    return md5(content);
}

// 局部缓存，防止重复使用
class storageClass
{
	constructor(){
		this.$data  = {};
	}
	isexist(url,createTime){
		return this.get(url).createTime == toString(createTime);
	}
	get(url){
		if(url){
			return this.$data[guid(url)] || {};
		}else{
			return this.$data;
		};
	}
	set(url,content,createTime){
		this.$data[guid(url)] = { content , createTime: toString(createTime) };
	}
	
}

module.exports = {
    md5,
    guid,
    storageClass
};