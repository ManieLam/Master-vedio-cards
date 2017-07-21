function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds();


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}
/**获取当前正在播放的音乐专辑 */
function getMusicInfo() {
    return wx.getStorageInfo("ablumn_Playing");
}
/* 转换时间格式 */
function timeToString(duration) {
    let str = '';
    let minute = parseInt(duration / 60) < 10 ?
        ('0' + parseInt(duration / 60)) :
        (parseInt(duration / 60));
    let second = duration % 60 < 10 ?
        ('0' + duration % 60) :
        (duration % 60);
    str = minute + ':' + second;
    return str;
}
module.exports = {
    formatTime: formatTime,
    getMusicInfo: getMusicInfo,
    timeToString: timeToString,

}