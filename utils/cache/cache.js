//缓存封装，增加过期时间支持
const time_key='timestamp';
//获取缓存
function get(key){
    try{
        let value = wx.getStorageSync(key);
        let time = timestamp(key);

        if(time && isExpired(time)){
            return null;
        }else{
            return value;
        }
    }catch(e){
        return null;
    }
}

//设置缓存
function set(key,data,minute=null){
    try{
        wx.setStorageSync(key,data);
        if(minute){
            setExpired(key,minute);
        }
        return true;
    }catch(e){
        return false;
    }
}

//删除缓存
function remove(key){
    try{
        wx.removeStorageSync(key);
        setExpired(key,0);
        return true;
    }catch(e){
        return false;
    }
}

function clear(){
    try{
        wx.clearStorageSync();
        return true;
    }catch(e){
        return false;
    }
}

//获取缓存时间表
function timestamp(key=null){
    try{
        let value = wx.getStorageSync(time_key);
        if(!key){
            return value;
        }
        if(typeof value[key] != 'undefined'){
            return value[key];
        }else{
            return false;
        }
    }catch(e){
        return false;
    }
}

//过期判断
function isExpired(time){
    return time < Date.now();
}

//设置过期时间
function setExpired(key,minutes){
    let times = timestamp() || {};

    if(!minutes){
        //清除
        if(timestamp(key)){
            delete times[key];
        }
    }else{
        //设置
        times[key] = Date.now()+minutes*60*1000;
    }

    try{
        wx.setStorageSync(time_key,times);
        return true;
    }catch(e){
        return false;
    }
}


module.exports={
    get:get,
    set:set,
    remove:remove,
    clear:clear,
    timestamp:timestamp
};