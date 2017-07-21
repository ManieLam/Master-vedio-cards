// pages/musicList/index/index.js
const app = getApp();
let that;
const Require = require("../../../utils/Require.js");
const Util = require("../../../utils/util.js");
let MusicCtr = require('../../../utils/musicControll');

Page({
    data: {
        playAblumn: {}, //当前播放的专辑列表
        showAllDes: false,
        playIndex: 0,
        // songState: {},
    },
    onLoad: function(options) {
        that = this;
        that.setData({ id: options.id })
        that.getMusics();
    },

    onShow: function() {
        //获取后台音乐状态
        that.setMusicData();

    },

    //获取音乐详情
    getMusics() {
        let setName = "playAblumn";
        let setObj = that.data[setName];
        let params = { id: that.data.id }
        Require.call({
                api: 'mag.album.get.json',
                data: params,
            }).then(res => {
                wx.setNavigationBarTitle({ title: res.page_title })
                that.setData({ playAblumn: res.album, share_title: res.share_title, })
            }, err => {})
            // console.info("playAblumn::", that.data.playAblumn)
    },



    //播放专辑
    playAblumnList(e) {
        that.startPlay()
    },


    /* 播放音乐方法--开始播放 */
    startPlay(e) {
        let index = e ? e.currentTarget.dataset.index : 0;
        // let lists = e ? that.data.playAblumn : wx.getStorageSync("playList")
        MusicCtr.playMusic({ lists: that.data.playAblumn, index: index })
        that.setData({
                playing: true,
                curPlay: that.data.playAblumn[index],
                playIndex: index,
            })
            // that.songPlay();
        that.setMusicData();
    },

    //暂停
    stopMusic() {
        MusicCtr.stopMusic();
        that.setData({ playing: false, "musicData.playing": false })
        wx.setStorageSync("playing", false)
    },
    //下一曲
    playNext() {
        MusicCtr.playNext();
        that.setMusicData()
    },

    //设置播放条数据
    setMusicData() {
        let musicData = MusicCtr.getMusicData();
        that.songPlay();
        //判断播放的是否为当前专辑
        let isCurPlay = musicData.playList.id == that.data.id ? true : false;
        //多个页面数据
        that.setData({
            musicData: musicData,
            playIndex: wx.getStorageSync("playIndex"),
            playing: wx.getStorageSync("playing"),
            isCurPlay: isCurPlay,
        })

        console.log("musicData::", that.data.musicData);
    },
    /* 播放进度状态控制 */
    songPlay() {
        clearInterval(timer);
        let timer = setInterval(function() {
            wx.getBackgroundAudioPlayerState({ // 调用小程序播放控制api
                success(res) {
                    let status = res.status;
                    if (status === 0) { clearInterval(timer); }
                    that.setData({
                        "musicData.songState": {
                            progress: res.currentPosition / res.duration * 100,
                            currentPosition: Util.timeToString(res.currentPosition), // 调用转换时间格式
                            duration: Util.timeToString(res.duration) // 调用转换时间格式 
                        }
                    });
                }
            })
        }, 1000);
        //监听音乐停止,自动下一曲
        wx.onBackgroundAudioStop(() => {
            console.info("停止")
            that.playNext();
        })

    },

    showAllDes() {
        that.setData({ showAllDes: !that.data.showAllDes })
    },

    onPullDownRefresh: function() {

    },

    onReachBottom: function() {

    },

    onShareAppMessage: function() {
        return {
            title: that.data.share_title,
            path: "/pages/musicList/index/index?id=" + that.data.id,
        }
    }
})