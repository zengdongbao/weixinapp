var cache = require('../../utils/cache/cache');
var util = require('../../utils/util.js');

Page({
    data: {
        key: '',
        data: '',
        expire: '',
        dialog: {
            title: '',
            content: '',
            hidden: true
        }
    },
    keyChange: function (e) {
        this.data.key = e.detail.value;
    },
    dataChange: function (e) {
        this.data.data = e.detail.value;
    },
    expireChange: function (e) {
        this.data.expire = e.detail.value;
    },
    getStorage: function () {
        var key = this.data.key,
            data = this.data.data;
        var expire = this.data.expire;
        var storageData;

        if (key.length === 0) {
            this.setData({
                key: key,
                data: data,
                expire: expire,
                'dialog.hidden': false,
                'dialog.title': '读取数据失败',
                'dialog.content': 'key 不能为空'
            })
        } else {
            storageData = cache.get(key);
            if (storageData === null) {
                this.setData({
                    key: key,
                    data: data,
                    expire: expire,
                    'dialog.hidden': false,
                    'dialog.title': '读取数据失败',
                    'dialog.content': '找不到 key 对应的数据'
                })
            } else {
                var content =  "data: '"+ storageData + "'";
                if(cache.timestamp(key)){
                    content+=";expired at: " + util.formatTime(new Date(cache.timestamp(key)));
                }
                this.setData({
                    key: key,
                    data: data,
                    expire: expire,
                    'dialog.hidden': false,
                    'dialog.title': '读取数据成功',
                    'dialog.content': content
                })
            }
        }
    },
    setStorage: function () {
        var key = this.data.key;
        var data = this.data.data;
        var expire = this.data.expire;
        if (key.length === 0) {
            this.setData({
                key: key,
                data: data,
                expire: expire,
                'dialog.hidden': false,
                'dialog.title': '保存数据失败',
                'dialog.content': 'key 不能为空'
            })
        } else {
            cache.set(key, data, expire);
            console.log(cache);
            this.setData({
                key: key,
                data: data,
                expire: expire,
                'dialog.hidden': false,
                'dialog.title': '存储数据成功'
            })
        }
    },
    removeStorage: function () {
        cache.remove(this.data.key);
        this.setData({
            key: '',
            data: '',
            'dialog.hidden': false,
            'dialog.title': '删除指定数据成功',
            'dialog.content': ''
        })
    },
    clearStorage: function () {
        cache.clear();
        this.setData({
            key: '',
            data: '',
            'dialog.hidden': false,
            'dialog.title': '清除所有数据成功',
            'dialog.content': ''
        })
    },
    confirm: function () {
        this.setData({
            'dialog.hidden': true,
            'dialog.title': '',
            'dialog.content': ''
        })
    }
});
