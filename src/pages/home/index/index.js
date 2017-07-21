// pages/home/index/index.js
const app = getApp();
let that;
let hSwiper = require("../../../component/hSwiper/hSwiper.js");
const Require = require("../../../utils/Require.js");
const Api = require("../../../utils/Api")
let MusicCtr = require('../../../utils/musicControll');
let Util = require("../../../utils/util");
let swiper; //滚动组件

let isPull = false
let isLoading = false

let firstCursor = 0; //存放下拉前最后一个的cursor
let firstFir = 0; //存放上滚前最后一个的first
Page({
    data: {
        hSwiperVar: {},
        ablumnData: {
            reduceDistance: 60, //确定每个滚动元素的的宽度
            varStr: "hSwiperVar", //插件操作data下的的数据
            templateName: 'musicBlock', //专辑模板
            list: [], //专辑详情
        },
        playAblumn: null, // 保存播放列表(当前专辑列表)
        isPlay_info: {}, //当前正在播放的歌曲信息
        songUrl: '', // 保存歌曲地址
        playing: false, //当前是否正在播放
        playIndex: 0, //当前选中的歌曲

        mode: 0,
        topics: [],
        next_first: 0,
        next_cursor: 0,
        isDone: false,

        musicData: {}, //播放条数据

    },
    preview: function(e) {
        const current = e.currentTarget.dataset.url
        const images = this.data.topics[e.currentTarget.dataset.topic].images
        wx.previewImage({
            current: current,
            urls: images.map(item => item.original)
        })
    },
    //获取节目列表
    getAblumnList(args = {}) {
        let setName = "ablumnData";
        let setObj = that.data[setName]

        Require.call({
            api: 'mag.album.list.json',
            data: args,
        }).then(res => {
            if (res.errcode == 0) {
                // wx.setNavigationBarTitle({ title: res.page_title })
                // console.log("res.mode", res.mode);
                setObj.list = isPull ? [].concat(res.albums, setObj.list) : [].concat(setObj.list, res.albums);
                let mode = parseInt(res.mode);
                if (isPull) {
                    res.next_cursor = firstCursor;
                    firstCursor = 0;
                }
                if (isLoading) {
                    res.next_first = firstFir;
                    firstFir = 0;
                }

                that.setData({
                    [setName]: setObj,
                    share_title: res.share_title,
                    mode: mode,
                    next_cursor: res.next_cursor,
                    next_first: res.next_first,
                })
                if (mode) {
                    that.loadTopics();
                } else {
                    //更新swiper数据
                    swiper.updateList(setObj.list);
                }

            }
        }, err => {})

    },
    loadTopics: function(args) {
        if (isLoading || this.data.isDone) return
        const self = this
        isLoading = true
        Api.queryTopics(args)
            .then(res => {
                // 列表数据合并
                const topics = isPull ? [].concat(res.topics, this.data.topics) : [].concat(this.data.topics, res.topics)
                this.setData({
                        topics: topics,
                        next_cursor: res.next_cursor,
                        next_first: res.next_first,
                        isDone: res.next_cursor === 0 ? true : false,
                        mode: res.mode
                    })
                    // 如果是下拉刷新, 则重置
                isPull = false
                isLoading = false
                wx.stopPullDownRefresh()
            })
            .catch(err => {
                isPull = false
                isLoading = false
                wx.stopPullDownRefresh()
            })
    },

    //点击播放该节目单
    playAblumnList(e) {
        let albumn_id = e.currentTarget.dataset.id;
        let albumn_choose = that.data.ablumnData.list.find(item => {
            return item.id === albumn_id
        })

        that.setData({
            playAblumn: albumn_choose,
            playIndex: 0, //默认每次从头开始播放
        })
        that.playMusic()
    },
    /* 开始播放 */
    playMusic(e) {
        let index = e ? e.currentTarget.dataset.index : 0;
        let lists = e ? wx.getStorageSync("playList") : that.data.playAblumn
        MusicCtr.playMusic({ lists: lists, index: index })
        that.setData({
                playing: true,
                curPlay: lists[index],
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
        // that.setData({ playIndex: wx.getStorageSync("playIndex") })
        that.setMusicData()
    },
    //设置播放条数据
    setMusicData() {
        let musicData = MusicCtr.getMusicData();
        that.songPlay();
        //判断播放的是否为当前专辑
        // let isCurPlay = musicData.playList.id == that.data.id ? true : false;
        //多个页面数据
        that.setData({
            musicData: musicData,
            playIndex: wx.getStorageSync("playIndex"),
            playing: wx.getStorageSync("playing"),
            // isCurPlay: isCurPlay,
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



    //查看专辑列表详情
    musicDetail(e) {
        wx.navigateTo({
            url: '/pages/musicList/index/index?id=' + e.currentTarget.dataset.id
        })
    },

    getSysInfo() {
        wx.getSystemInfo({
            success: res => {
                that.setData({
                    windowHeight: res.windowHeight,
                    windowWidth: res.windowWidth,
                    scrollHight: res.windowHeight - 100,
                })
            }
        })
    },
    onLoad: function(options) {
        that = this;
        that.getSysInfo()
        that.getAblumnList();
        swiper = new hSwiper(that.data.ablumnData); //初始化swiper

        that.setData({ playing: false, "musicData.playing": false })
        wx.setStorageSync("playing", false)
            // if (wx.getStorageInfo('songState')) {
            //     that.setData({ isPlay_info: wx.getStorageInfo('songState') })
            // }
    },
    onShow: function() {
        // that.getPlyerState();

        if (!that.data.mode) {
            swiper.onLastView = function(data, index) {
                if (that.data.next_cursor) {
                    isLoading = true;
                    firstFir = that.data.next_first;
                    that.getAblumnList({ cursor: that.data.next_cursor })
                }
            };
            that.setMusicData();
            that.songPlay();
        }
    },

    // onHide: function() {
    //     wx.clearStorageSync();
    // },   
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
        console.log("onPullDownRefresh");
        if (!that.data.next_first) return;
        isPull = true

        if (that.data.mode) {
            //快讯
            this.loadTopics({ first: this.data.next_first })
        } else {
            // 每次下拉把上个加载出的next_cursor存储
            firstCursor = this.data.next_cursor;
            that.getAblumnList({ first: this.data.next_first })
        }

    },

    onReachBottom: function() {
        console.log("onReachBottom");
        if (!that.data.next_cursor) return;
        if (that.data.mode) {
            //快讯
            this.loadTopics({ cursor: this.data.next_cursor })
        }

    },

    onShareAppMessage: function() {
        return {
            title: that.data.share_title,
            path: "/pages/home/index/index",
        }
    }
})