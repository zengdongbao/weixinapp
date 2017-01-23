"use strict";

/**
 * 微信播放器
 * version 1.0.1
 *
 * 封装微信音乐播放API
 *
 *
 */

var VERSION = "1.0.1";

//播放状态
var PLAYING = 1;
var STOPPED = 2;
var PAUSED = 0;

//播放模式
var LOOP = 1;
var LOOPONE = 2;
var RANDOM = 3;

//基础函数
var _isArray = undefined;
if (!Array.isArray) {
    _isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
    };
} else {
    _isArray = Array.isArray;
}
var isArray = _isArray;

function objectOrFunction(x) {
    return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
    return typeof x === 'function';
}

function isObject(x){
    return typeof x === 'object' && x !== null;
}

if (typeof Object.assign != 'function') {
    Object.assign = function (target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

function random(min,max){
    return Math.round(Math.random() * (max - min)) + min;
}


function PlayError(msg){
    return Error(msg);
}

//播放器状态
var data = {
    status : STOPPED,
    audio : null,
    mode : LOOP
};
//状态重置
function reset(){

    data.status = STOPPED;
    data.index = null;
    data.prev_index = null;
    data.audio = null;

    return data;
}

//播放列表对象
var list = (function(){
    var _singles = [];
    var _queue = [];
    var _id = null;
    var _prev_id = null;
    var _queue_index = null;
    var _queue_prev_index = null;
    var _single_index = null;
    var _single_prev_index = null;


    return {

        //创建播放列表
        create:function(singles,id){
            if(_id !== id){
                _singles = [];
                singles.forEach(function(item,index){
                    item._id = index;
                    _singles.push(item);
                });
                _prev_id = _id;
                _id = id;
                _queue_index = null;
                _queue_prev_index = null;
                _single_index = null;
                _single_prev_index = null;
                this.setQueue(data.mode);
            }
        },
        //获取列表信息
        info:function(){
            return {
                id:_id,
                prev_id:_prev_id,
                index:_single_index,
                prev_index:_single_prev_index,
                singles:_singles,
                single:this.current()
            };
        },
        //同步播放索引
        syncIndex:function(single){
            var queue_index = _queue.findIndex(function(item){
                return item._id === single._id;
            });
            if(queue_index !== -1 && queue_index !== _queue_index){
                _queue_prev_index = _queue_index;
                _queue_index = queue_index;
            }

            if(single._id !==_single_index){
                _single_prev_index = _single_index;
                _single_index = single._id;
            }

        },
        //清空列表
        clear:function(){
            _id = null;
            _queue_index = null;
            _queue_prev_index = null;
            _single_index = null;
            _single_prev_index = null;
            _queue = [];
            _singles = [];
        },
        get:function(index){
            return _queue[index];
        },
        //获取当前歌曲
        current:function(){
            if(_queue_index === null){
                return null;
            }else{
                return this.get(_queue_index);
            }
        },
        //第一首歌
        first:function(){
            return this.get(0);
        },

        //下一首歌
        next:function(){
            var index = _queue_index;
            if(index === null || index >= _queue.length-1){
                index = 0;
            }else{
                index++;
            }
            return this.get(index);
        },
        //上一首歌
        prev:function(){
            var index = _queue_index;
            if(index === null || index  === 0){
                index = _queue.length -1;
            }else{
                index--;
            }
            return this.get(index);
        },
        setQueue:function(mode){
            _queue = _singles.slice(0);
            if(mode === RANDOM){
                _queue.sort(function(){ return 0.5 - Math.random() });
            }
        },
        getQueue:function(){
            return _queue;
        }
    }
})();



//事件对象
var event = (function(){
    var _hold=[],
        _fn={},
        _default={};

    return {
        defaults:function(action){
            _default = action;
        },
        on:function(name,callback){
            _fn[name] = callback;
        },
        off:function(name){
            if(typeof name === 'undefined'){
                _fn = [];
            }else if(isFunction(_fn[name])){
                delete _fn[name];
            }
        },
        hold:function(name){
            if(_hold.indexOf(name) === -1){
                _hold.push(name);
            }
        },
        isHold:function(name){
            return _hold.indexOf(name) !== -1;
        },
        hasEvent:function(name){
            return isFunction(_default[name]) || isFunction(_fn[name]);
        },
        resume:function(name){
            var index = _hold.indexOf(name);
            if(index !== -1){
                _hold.splice(index,1);
            }
        },
        trigger:function(name){

            if(_hold.indexOf(name) !== -1){
                return false;
            }

            var arg = [];
            for(var i=1,len=arguments.length;i<len;i++){
                arg.push(arguments[i]);
            }

            if(isFunction(_default[name])){

                if(isFunction(_fn[name])){
                    arg.unshift(_fn[name]);
                }
                _default[name].apply(null,arg);

            }else if(isFunction(_fn[name])){
                _fn[name].apply(null,arg);
            }

        }
    };
})();


function cb(){
    if(isFunction(arguments[0])){
        var arg = [];
        for(var i=1,len=arguments.length;i<len;i++){
            arg.push(arguments[i]);
        }
        arguments[0].apply(null,arg);
    }
}


event.defaults({
    //开始播放
    play:function(){
        data.status = PLAYING;

        if(event.isHold('timeupdate')){
            event.resume('timeupdate');
            bindTimeupdate();
        }
        cb.apply(null,arguments);
    },
    //播放暂停
    pause:function(){
        data.status = PAUSED;
        event.hold('timeupdate');
        cb.apply(null,arguments);
    },
    //停止播放
    //BUG: 终端歌曲播放完成后,停止事件会触发两次
    //通过状态标识来避免重复执行
    stop:function(){
        var prev = data.status;
        data.status = STOPPED;
        event.hold('timeupdate');
        if(prev === PLAYING){
            //触发播放结束
            event.trigger('end');
        }
        cb.apply(null,arguments);
    },
    //播放结束
    end:function(){
        play(data.mode === LOOPONE ? list.current() : list.next());
        cb.apply(null,arguments);
    },
    //播放进度
    timeupdate:function(fn,callback,data){
        wx.getBackgroundAudioPlayerState({
            success:function(res){
                fn.apply(null,[res,data]);
                if(isFunction(callback)){
                    callback.apply(null,res);
                }
            },
            fail:function(){
                console.log('fail');
            }
        })
    },
    preplay:function(){
        cb.apply(null,arguments);
    }
});


//播放歌曲
function play(single,options){
    if(!isObject(single)){
        throw new PlayError('未找到歌曲数据,请先载入播放列表');
    }

    var _status = data.status;

    var obj = Object.assign({},single);
    var success;
    var fail;
    var complete;

    if(isFunction(options)){
        success = options;
    }else if(isObject(options)){
        if(isFunction(options['success'])){
            success = options['success'];
        }
        if(isFunction(options['fail'])){
            fail = options['fail'];
        }
        if(isFunction(options['complete'])){
            complete = options['complete'];
        }
    }

    obj.success = function(){
        //BUG: Andriod从暂停状态恢复播放,不会触发播放事件
        //fixed: 通过回调触发
        var res = wx.getSystemInfoSync();
        if(res && _status===PAUSED && /android/i.test(res.system)){
            event.trigger('play',data);
        }
        isFunction(success) && success.call(null,arguments);
    };

    obj.fail = function(){
        data.status = STOPPED;
        isFunction(fail) && fail.call(null,arguments);
    };

    obj.complete = function(){
        //恢复监听
        event.resume('stop');
        isFunction(complete) && complete.call(null,arguments);
    };

    //提供预处理接口
    event.trigger('preplay',single,function(single){
        //BUG: 微信后台播放器如果处于暂停状态时,播放其他歌曲会变成继续播放当前歌曲
        //fixed: 播放其他歌曲前,先停止后台播放
        if(!isObject(data.audio) || single.id !== data.audio.id){
            //需要挂起事件监听,避免自动下一首,播放成功后重新监听
            console.log('先停后播');
            event.hold('stop');
            stop();
        }



        //播放器事件监听方法比调用回调先触发。
        //在监听事件里调取状态，状态需要提前设置
        data.status = PLAYING;
        data.audio = single;

        Object.assign(obj,single);
        list.syncIndex(single);
        wx.playBackgroundAudio(obj);
    });

}


//暂停播放
function pause(){
    data.status = PAUSED;
    wx.pauseBackgroundAudio();
}

//停止播放
function stop(){
    data.status = STOPPED;
    wx.stopBackgroundAudio();
}

//指定播放
function invoke(index){
    stop();
    play(list.get(index));
}


//继续播放
function resume(){
    play(data.audio);
}

//开始播放
function start(){
    play(list.first());
}


//BUG: 手机端设置播放进度后,播放器会变得不稳定,进度显示错误,以及不会触发停止事件
//todo: 官方不修复前,先不做~
function seek(position){
    wx.seekBackgroundAudio({
        position:position
    });
}


//下一首
function next(){
    play(list.next());
}
//上一首
function prev(){
    play(list.prev());
}


//切换播放模式
function toggleMode(){
    if(++data.mode > RANDOM){
        data.mode = LOOP;
    }
    //重新生成播放队列
    list.setQueue(data.mode);
    if(isObject(data.audio)){
        list.syncIndex(data.audio);
    }
}


var _process_time;
function bindTimeupdate(){
    _process_time = setTimeout(function(){
        event.trigger('timeupdate',bindTimeupdate,data);
    },250);
}
//代理微信播放器事件
function proxyEvent(){
    wx.onBackgroundAudioPlay(function(){
        event.trigger('play',data);
    });
    wx.onBackgroundAudioStop(function(){
        event.trigger('stop',data);
    });
    wx.onBackgroundAudioPause(function(){
        event.trigger('pause',data);
    });

    //默认先挂起
    event.hold('timeupdate');
}





function Player(){
    this.version = VERSION;
    proxyEvent();
}



Player.prototype = {
    constructor: Player,
    event:event,
    list:list,
    data:function(){
        return data;
    },
    start:start,
    invoke:invoke,
    play:play,
    pause:pause,
    stop:stop,
    resume:resume,
    seek:seek,
    next:next,
    prev:prev,
    toggleMode:toggleMode,
    isPlaying:function(){
        return data.status === PLAYING;
    },
    isStopped:function(){
        return data.status === STOPPED;
    },
    isPaused:function(){
        return data.status === PAUSED;
    },

};


module.exports = Player;


