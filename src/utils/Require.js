// var Promise = require('./es6-promise').Promise;
import { APP_ID, API_HOST } from 'config.js';
const Auth = require('Auth.js');

function noop() {}
var defaultOptions = {
    method: 'GET',
    header: {
        'content-type': 'application/x-www-form-urlencoded'
    },
    success: noop,
    fail: noop,
    complete: noop
};
/**公用调用接口模块
 * @param  {object} options
 * @param  {Promise} *
 */
const call = function(options = {}) {
        let me = this;
        return new Promise((resolve, reject) => {
            wx.canIUse('showLoading') ? wx.showLoading({ title: '拼命加载中' }) : wx.showToast({ title: '拼命加载中', icon: 'loading' });
            var params = Object.assign({}, defaultOptions, options);
            params.url = options.url || (API_HOST + params.api);

            params.success = function(res) {
                if (res.statusCode == 200) {
                    wx.canIUse('showLoading') ? wx.hideLoading() : null;
                    if (res.data.errcode == 0) {
                        resolve(res.data);
                    } else {
                        reject(res.data);
                    }
                } else {
                    reject(res.data);
                }
            }

            params.fail = function(res) {
                reject(res);
            }

            wx.request(params);
        });

    }
    /**
     * 需要授权的接口调用
     * @param  {Function} fn
     * @return {Promise}
     */
const guard = function(fn) {
    console.info(1111)
    const self = this
    return function() {
        if (Auth.check()) {
            return fn.apply(self, arguments)
        } else {
            return Auth.login()
                .then(data => {
                    return fn.apply(self, arguments)
                })
        }
    }
}


module.exports = {
    call: call,
}