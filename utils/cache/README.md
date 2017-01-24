# 缓存

在官方的[数据缓存API](https://mp.weixin.qq.com/debug/wxadoc/dev/api/data.html#wxsetstorageobject)的基础上, 增加了失效时间的设置。

## 使用方法:

```
var cache = require('cache.js');

cache.get(key);                 //获取缓存, 过期或为空返回null
cache.set(key,value,expire);    //设置缓存, expire为有效时间的单位分钟数, 为空或0时表示永不过期
cache.remove(key);              //删除指定缓存
cache.clear();                  //清空所有缓存

```


## 注意

缓存里用了一个key为`__timestamp`的对象,来存储每个key对应的过期时间戳。  
所以在设置缓存的时候注意不要和这个对象重名, 当然也可以自己在源码里面改。




