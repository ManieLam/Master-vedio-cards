//app.js
import Require from 'utils/Require.js';
import Auth from 'utils/Auth.js';
App({
    onLaunch: function() {
        //调用API从本地缓存中获取数据
        // var logs = wx.getStorageSync('logs') || []
        // logs.unshift(Date.now())
        // wx.setStorageSync('logs', logs)

    },

    changeOption(options = {}) {
        this.globalData.playIndex = options.playIndex;
        this.globalData.ablumn_Playing = options.ablumn_Playing;
        this.globalData.playing = options.playing;
        this.globalData.isPlay_info = options.isPlay_info;
    },
    globalData: {
        userInfo: null,
        token: null,
        encryptedData: null,
        iv: null,
        code: null,

        playIndex: null,
        playData: null,
        playList: null,
        playing: null,
        songState: null,
    }
})