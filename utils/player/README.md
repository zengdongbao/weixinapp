# 音乐播放器


在官方的[后台音乐播放API](https://mp.weixin.qq.com/debug/wxadoc/dev/api/media-background-audio.html)的基础上, 封装了播放器的常用功能。


## 使用

```php
//引入
var Player=require('player.js');

//创建一个播放器实例
var player = new Player();

player.list.create([
    {
        dataUrl:'your_music_url',
        title:'music title'
        id:'music id'
    }
]);

player.start();


```


### API

#### player

播放器控制方法

- `invoke(int index)`  
播放列表中的指定歌曲, index为歌曲在列表中的索引。

- `start()`  
开始播放, 等同于 invoke(0)

- `pause()`  
暂停播放

- `resume()`  
恢复播放

- `stop()`  
停止播放

- `next()`  
播放下一首

- `prev()`  
播放上一首

- `toggleMode()`  
切换播放模式  
return :  *int*   
当前的模式标识 `1:列表循环` `2:单曲循环` `3:随机`

- `data()`  
获取播放器信息  
return: *object*   
```
{
    status : 1,     //状态 1:播放中 2:停止 0:暂停
    audio : {},     //当前播放歌曲对象
    mode : 1        //播放模式
}
```

- `isPlaying()`
是否播放中  
return : *boolean*

- `isStopped()`
是否停止  
return : *boolean*

- `isPaused()`
是否暂停  
return : *boolean*


#### player.list

播放列表方法

- `create(array list[, list_id])`  
创建播放列表
params:  
    `list` *array* 歌曲列表  
    ``` 
    [
        {
            id:'music id'                   //歌曲ID,必填
            dataUrl:'your_music_url',       //播放地址
            title:'music title'             //歌曲名
            coverImgUrl:'cover_url'         //歌曲封面
            custom:'....'                   //其他自定义属性
        }
    ]
    ```  
    `list_id` *int | string* 列表ID
    
- `clear()`  
清空播放列表

- `current()`  
获取当前歌曲  
return : *object*

- `first()`  
获取列表的第一首歌曲  
return : *object*

- `next()`  
获取下一首歌曲  
return : *object*

- `prev()`  
获取上一首歌曲  
return : *object*

- `get(int index)`  
获取指定索引歌曲  
return : *object*


#### player.event

播放器事件方法

- `on(string name,function callback)`  
开始监听事件  

- `off(string name)`  
停止监听事件  

- `hold(string name)`  
暂停监听事件  

- `isHold(string name)`  
事件是否被暂停  

- `resume(string name)`  
继续监听事件  

- `trigger(string name)`  
触发指定事件
  
- `defaults(object events)`  
设置事件的默认回调, 该回调优先于普通回调执行。


默认支持的事件列表  
- `play`          开始播放
- `pause`         暂停
- `stop`          停止播放
- `end`           播放结束
- `timeupdate`    播放中,该事件的触发时间间隔为`250ms`
- `preplay`       准备播放


**自定义事件**  
```
player.event.on('listchange',function(data){
    console.log('播放列表更改!');
    player.stop();
});
//设置播放列表
player.list.create(data,1);
player.event.trigger('listchange');
```



**关于`preplay`事件**  
在某些项目中, 在创建播放列表时, 只会设置一个歌曲ID, 
等需要播放时再实时去获取歌曲的详细信息, 包括播放地址等, 那么就需要用到这个事件了。  
该事件的触发会传一个当前准备播放的歌曲对象,已经另一个回调。  
例如:
```
player.event.on('preplay',function(data,next){
    console.log('播放预处理!');
    console.log(data);

    data.title_sub = '重新处理';
    //最后必须执行回调,完成播放。
    next(data);
});
```

 
 




