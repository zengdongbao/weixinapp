
Page({
    data:{
        menus:[
            {
                'title':'缓存',
                'url':'/pages/cache/cache'
            },
            {
                'title':'音乐播放器',
                'url':'/pages/audioPlayer/audioPlayer'
            }
        ]
    },
    nav:function(event){
        var url = event.target.dataset.url;
        wx.navigateTo({
            url: url
        });
    }
});