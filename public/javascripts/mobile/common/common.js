function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () { document.documentElement.removeChild(WVJBIframe) }, 0)
}

function connectWebViewJavascriptBridge(callback) {
    // web调提供方法给app调用
    if (window.WebViewJavascriptBridge) {
        callback(WebViewJavascriptBridge);
    } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function () {
            callback(WebViewJavascriptBridge);
        }, false);
    }
}

var REGEX_IOS = /(iPhone|iPad|iPod|iOS)/i;

function testUA (str) {
    return navigator.userAgent.indexOf(str) > -1
  }
  
/**
 * 正则表达式：Android
 */
var REGEX_ANDROID = /(Android)/i;
var isIos = (REGEX_IOS).test(navigator.userAgent); // ios
var isAndroid = (REGEX_ANDROID).test(navigator.userAgent); // android
// 判断是iphoneX及以后的iphone手机（即iphone带全面屏的手机）
var isNewIphone = window && testUA('iPhone') && window.screen.height >= 812 && window.devicePixelRatio >= 2;

function initAndroidBridge() {
    connectWebViewJavascriptBridge(function (bridge) {
        // 初始化
        bridge.init(function (message, responseCallback) {
            responseCallback("init");
        });
    })
}

function initWebViewJavascriptBridge(controller, params,callback) {
    if (isIos) {
        setupWebViewJavascriptBridge(function (bridge) {
            bridge.callHandler(controller, params, function (responseData) {
                if (callback) {
                    callback(responseData);
                }
            })
        })
    } else if (isAndroid) {
        connectWebViewJavascriptBridge(function (bridge) {
            bridge.callHandler(controller, params, function (responseData) {
                    if (callback) {
                        callback(responseData);
                    }
                }
            );
        })
    }
    
}
function registWebViewJavascriptBridge(nativeFuncName, jsFunc, callback) {
    if (isIos) {
        setupWebViewJavascriptBridge(function (bridge) {
            bridge.registerHandler(nativeFuncName, function (param, responseCallback) {
                if (jsFunc) {
                    jsFunc(param);
                }
                if (callback != undefined) {
                    responseCallback(callback);
                }
            })
        })
    } else if (isAndroid) {
        connectWebViewJavascriptBridge(function (bridge) {
            bridge.registerHandler(nativeFuncName, function (param, responseCallback) {
                if (jsFunc) {
                    jsFunc(param);
                }
                if (callback != undefined) {
                    responseCallback(callback);
                }    
            });
        })
    }
}

 
/**
 * app端登录后的处理
 *
 * @param successFunc 成功后的函数
 * @param failFunc 失败后的函数
 */
function handleAfterAppLogin(successFunc, failFunc) {
    // 调用app端登录页面
    callAPPLoginPage(function (data) {
        if (JSON.parse(data).loginStatus == 1) {
            if (successFunc) {
                successFunc(data);
            }
        } else {
            if (failFunc) {
                failFunc(data);
            }
        }
    });
}