// const { LengthRequired } = require("http-errors");
var ctxPath = '/sns';

$(function(){
    initDetail();
})
/**
 * @param {导航标题  (默认:发消息)} title 
 * @param {输入文本长度  (默认:1000)} length 
 * @param {页面类型  (默认:0)   0(发消息) 1(评论) 2(转发)} pageType 
 * @param {被评论信息 (如果type==1,必传)   消息/文章/论文} commentTypeId 
 * @param {消息id} forwardTypeId 
 * @param {用户名} userName 
 * @param { 消息文字内容} content 
 */
function jsOpenSendMessageController(title, length, pageType, commentTypeId,forwardTypeId,userName,content){
    var param = {
        title: title,
        limit:{
            length:length
        },
        type:pageType,
        comment_original_message:{
            id:commentTypeId
        },
        forward_original_message:{// 被转发消息信息 (如果type==2,必传)
            id:forwardTypeId,
            user_name:userName,
            content:content
        }
    };
    initWebViewJavascriptBridge('jsOpenSendMessageController',param);
};
/**
 * 
 * @param {图片地址} images 
 * @param {当前点击第几个} currentIndex 
 * @param {} originalUrl 
 * @param {} axiosX 
 * @param {} axiosY 
 * @param {} width 
 * @param {} height 
 */
function jsShowImageBrowser(images, currentIndex,originalUrl,axiosX,axiosY,width,height){
    var params = {
        images:images,
        currentIndex:currentIndex
    };
    initWebViewJavascriptBridge('jsShowImageBrowser',params);
}

/**分页功能
 * @param {消息类型}  messageType 
 * @param {总页数} totalPage 
 * @param {当前页数} currentPage 
 * @param {请求url} url
 * @param {} axiosY 
 * @param {} width 
 * @param {} height 
 */

function getImg(){
    $(document).on('touchend','.person-index-item-imgid li',function(){
        var _this = $(this),urlArr = [],imagesArr = [];
        $(this).parent(".person-index-item-imgid").children('li').each(function(i,item){
            urlArr.push($(this).children("img").attr('src').split("?")[0])
        })
        $.each(urlArr,function(i,item){
            imagesArr.push({url:item})
        })
       jsShowImageBrowser(imagesArr,_this.index());
    })
}

function hadleDeleteMsg(){
    registWebViewJavascriptBridge("msgDelete", msgDelete);
   
    $(document).on("click",'.management-icon',function(event){
        event.stopPropagation();
        // if($(this).attr('disabled')=='disabled'){
        //     return;
        // }
        $('#deleteId').val($(this).parents(".person-index-item-right").siblings('.get-msg-id').prop('id'));
        initWebViewJavascriptBridge('jsShowNativeAlert',{
            actions: [ {
                title: '删除',
                handlerJS:'msgDelete',
            },
            {
                title: '取消',
                handlerJS:'',
            }
            ]
        });
    })
}
function longPress(ele, func,timeout=400) {
    var timeOutEvent;    
    $(document).on('touchstart','.'+ele, function (e) {
        e.stopPropagation();
        // $(this).find('.person-index-item').css('background','#F8F8F8');
        // $(this).find('.person-index-item').css({'background': '#F8F8F8'});
        if($(this).find('.management-icon').length <= 0 ){
           return;
         }
        var _this = $(this);
        // 开启定时器前先清除定时器，防止重复触发
        clearTimeout(timeOutEvent);
        timeOutEvent = setTimeout(function () {
          $('#deleteId').val(_this.find('.get-msg-id').prop('id'));
          registWebViewJavascriptBridge("msgDelete", msgDelete);
          initWebViewJavascriptBridge('jsShowNativeAlert',{
            actions: [ {
                title: '删除',
                handlerJS:'msgDelete',
            },
            {
                title: '取消',
                handlerJS:'',
            }
            ]
        });
        }, timeout); 
    });
    
    $(document).on('touchmove','.'+ele, function (e) {
        // 长按过程中，手指是不能移动的，若移动则清除定时器，中断长按逻辑
        clearTimeout(timeOutEvent);
        // $(this).find('.person-index-item').css('background','#fff');
    });
    
    $(document).on('touchend','.'+ele, function (e) {
        // 若手指离开屏幕时，时间小于我们设置的长按时间，则为点击事件，清除定时器，结束长按逻辑
        clearTimeout(timeOutEvent);
        // $(this).find('.person-index-item').css('background','#fff');
    });
}

//删除消息
function msgDelete(){
    var messageId = $('#deleteId').val();
    var message = confirm('确定删除这条消息？')
    if(!message){
        return false;
    }
   // $('.management-icon').attr('disabled',true);
   initWebViewJavascriptBridge("jsShowNativeQueryTipHUD",{message:'请稍后...'});
    $.ajax({
        url: ctxPath+'/mobile/deleteMsg',
        data: { messageId: messageId },
        type: 'get',
        dataType: 'json',
        success: function (data) {
            $("#deleteId").val('')
            if (data.status == 200) {
                initWebViewJavascriptBridge('jsHideNativeQueryTipHUD');
                initWebViewJavascriptBridge('jsShowNativeTipHUD',{
                    message:'删除成功'
                },function(){
                    if($('.searchInputUrl').val()){//若在搜索列表中转发
                        var searchContent=$('.searchContent').val();
                        var searchType=$('.searchType').val();
                        var sectionTime=$('.sectionTime').val();
                        var sendTime=$('.sendTime').val();
                        var href = $('.searchInputUrl').val();
                        var paramList = {messageType: 5, searchContent: encodeURIComponent(searchContent), searchType: searchType,sectionTime:sectionTime,sendTime:sendTime};
                        setTimeout(getMessage({ href:href, paramList: paramList}),1000);
                    }else{//若在非搜索列表中转发
                        setTimeout(function(){location.reload()},500)
                    }
                }); 
            }
        }
    })
}
/**
 *  关注状态
 * @param {Object} childrenEle 当前关注状态元素
 * @param {String} targetId 关注的目标id
 */
function flowStat(childrenEle, targetId) {
    var folwNumEle = $('.person-sentiment-num').find('em');
    var fansNumEle = $('.person-sentiment-fans').find('em');
    flowFlag = false;
    var hasBusiness = false; //是否点击的是名片关注按钮
    var businessFolw = childrenEle.parents('.buiness_card-focus-operation');
    if (businessFolw.length) {
        hasBusiness = true;
    }
    //粉丝列表的目标用户的粉丝数量
    var modifyFanEle = childrenEle.parents('.person-attention-list-item').find('.person-attention-list-item-fensi i');
    if (childrenEle.hasClass('person-attention-list-item-foucI_be') || childrenEle.hasClass('person-attention-list-item-foucI_no')) {
        $.ajax({
            url: ctxPath + '/addFolw',
            type : 'get',
            dataType: 'json',
            async : true,
            data: { targetId: targetId },
            success: function (data) {
                if (data.status == 200) {
                    if (childrenEle.hasClass('person-attention-list-item-foucI_be')) {
                        if (hasBusiness) {
                            businessFolw.parents('.person-attention-list-item').find('.person-followstart i').removeClass('person-attention-list-item-foucI_be').addClass('person-attention-list-item-foucI_same').text('互相关注');
                        }
                        childrenEle.removeClass('person-attention-list-item-foucI_be').addClass('person-attention-list-item-foucI_same').text('互相关注');
                        $("#pay-attention-in").removeClass('person-attention-list-item-foucI_no').addClass('person-attention-list-item-foucI_same').text('互相关注');
                        $("#pay-attention-out").removeClass('person-attention-list-item-foucI_no').addClass('person-attention-list-item-foucI_same').text('互相关注');
                    } else {
                        if (hasBusiness) {
                            businessFolw.parents('.person-attention-list-item').find('.person-followstart i').removeClass('person-attention-list-item-foucI_no').addClass('person-attention-list-item-foucI').text('已关注');
                        }
                        childrenEle.removeClass('person-attention-list-item-foucI_no').addClass('person-attention-list-item-foucI').text('已关注');
                        $("#pay-attention-in").removeClass('person-attention-list-item-foucI_no').addClass('person-attention-list-item-foucI').text('已关注');
                        $("#pay-attention-out").removeClass('person-attention-list-item-foucI_no').addClass('person-attention-list-item-foucI').text('已关注');
                    }
                    if (!$('.pay-attention').length) {
                        var numNew = Number(folwNumEle.text()) + 1;
                        folwNumEle.text(numNew);
                    }
                    if (childrenEle.is($('.pay-attention'))) {
                        var numNewFans = parseInt(fansNumEle.text(), 10) + 1;
                        fansNumEle.text(numNewFans);
                    } else {
                        var modifyFanNUm = Number(modifyFanEle.text()) + 1;
                        modifyFanEle.text(modifyFanNUm);
                    }
                    if (childrenEle.parents('.sns-business_card').find('.business_card-fans em').length) {
                        var businessCardNum = childrenEle.parents('.sns-business_card').find('.business_card-fans em');
                        businessCardNum.text(Number(businessCardNum.text()) + 1);
                        businessFolw.parents('.person-attention-list-item').find('.person-attention-list-item-fensi i').text(businessCardNum.text());
                    }
                } else {
                    showMessageTip(data.errMsg);
                }
                flowFlag = true;
            },
            error: function (error) {
                console.log(error);
                flowFlag = true;
            }
        });
    }
    if (childrenEle.hasClass('person-attention-list-item-foucI') || childrenEle.hasClass('person-attention-list-item-foucI_same')) {
        $.ajax({
            url: ctxPath + '/cancelFolw',
            type : 'get',
            dataType: 'json',
            async : true,
            data: { targetId: targetId },
            success: function (data) {
                if (data.status == 200) {
                    if (childrenEle.hasClass('person-attention-list-item-foucI')) {
                        if (hasBusiness) {
                            businessFolw.parents('.person-attention-list-item').find('.person-followstart i').removeClass('person-attention-list-item-foucI').addClass('person-attention-list-item-foucI_no').text('+关注');
                        }
                        childrenEle.removeClass('person-attention-list-item-foucI').addClass('person-attention-list-item-foucI_no').text('+关注');
                        $("#pay-attention-in").removeClass('person-attention-list-item-foucI').addClass('person-attention-list-item-foucI_no').text('+关注');
                        $("#pay-attention-out").removeClass('person-attention-list-item-foucI').addClass('person-attention-list-item-foucI_no').text('+关注');
                    } else {
                        if (hasBusiness) {
                            businessFolw.parents('.person-attention-list-item').find('.person-followstart i').removeClass('person-attention-list-item-foucI_same').addClass('person-attention-list-item-foucI_be').text('→关注');
                        }
                        childrenEle.removeClass('person-attention-list-item-foucI_same').addClass('person-attention-list-item-foucI_be').text('→关注');
                        $("#pay-attention-in").removeClass('person-attention-list-item-foucI').addClass('person-attention-list-item-foucI_be').text('→关注');
                        $("#pay-attention-out").removeClass('person-attention-list-item-foucI').addClass('person-attention-list-item-foucI_be').text('→关注');
                    }
                    if (!$('.pay-attention').length) {
                        var numNew = Number(folwNumEle.text()) - 1;
                        folwNumEle.text(numNew);
                    }
                    if (childrenEle.is($('.pay-attention'))) {
                        var numNewFans = Number(fansNumEle.text()) - 1;
                        fansNumEle.text(numNewFans);
                    } else {
                        var modifyFanNUm = Number(modifyFanEle.text()) - 1;
                        modifyFanEle.text(modifyFanNUm);
                    }
                    if (childrenEle.parents('.sns-business_card').find('.business_card-fans em').length) {
                        var businessCardNum = childrenEle.parents('.sns-business_card').find('.business_card-fans em');
                        businessCardNum.text(Number(businessCardNum.text()) - 1);
                        businessFolw.parents('.person-attention-list-item').find('.person-attention-list-item-fensi i').text(businessCardNum.text());
                    }
                 } 
                flowFlag = true;
            },
            error: function (error) {
                flowFlag = true;
                console.log(error);
            }
        });
    }
}

function initDetail(){
    initWebViewJavascriptBridge('jsConfigNavAlpha', {alpha:0})
}

//转发  
function forwardNews(ele,flag){
    var forwardTypeId,userName,content;
    $(document).on("touchend",ele,function(event){
        event.stopPropagation();
        if(flag=='outer'){
            forwardTypeId = $(this).parents('.person-index-item').find(".get-msg-id").attr("id");
            userName = $(this).parents('.person-index-item').find(".commentusername").attr("data-name");
            content = $(this).parents('.person-index-item').find(".person-index-item-title-p").text();
        }else if(flag=='inside'){
            forwardTypeId = $(this).parents('.person-index-item').find(".person-index-item-forward-title").attr("data-id");
            userName = $(this).parents('.person-index-item').find(".at-item").attr("data-id");
            content = $(this).parents('.person-index-item').find(".person-index-item-forward-title").text();
        }else if(flag=='bottom'){
            forwardTypeId = $(".get-msg-id").attr("id");
            userName = $(".commentusername").attr("data-name");
            content = $(".person-index-item-title-p").text();
        }else if(flag=='article'){
            forwardTypeId = $(this).parents('.person-index-item_active').siblings(".othermessage").attr("data-id");
            // userName = $(this).parents('.person-index-item_active').siblings(".othermessage").find("#articleUserId").val();
            content = '';
        }else{
            forwardTypeId = $(this).parents('.forward-detail-item').find(".forward-detail-item-title").attr("id");
            userName = $(this).parents('.forward-detail-item').find(".forward-user-name").text();
            content = atUser + atUserText;
        }
        var params = {
            title:'转发',
            type:'2',
            forward_original_message:{// 被转发消息信息 (如果type==2,必传)
                id:forwardTypeId,
                user_name:userName,
                content:content
            }
        }
        initWebViewJavascriptBridge('jsOpenSendMessageController',params,function(data){
            var result = JSON.parse(data)
            if(result.code == 200){
                if($('.searchInputUrl').val()){//若在搜索列表中转发
                    var searchContent=$('.searchContent').val();
                    var searchType=$('.searchType').val();
                    var sectionTime=$('.sectionTime').val();
                    var sendTime=$('.sendTime').val();
                    var href = $('.searchInputUrl').val();
                    var paramList = {messageType: 5, searchContent: encodeURIComponent(searchContent), searchType: searchType,sectionTime:sectionTime,sendTime:sendTime};
                    setTimeout(getMessage({ href:href, paramList: paramList}),1000);
                    // getMessage({ href:href, paramList: paramList})
                }else{//若在非搜索列表中转发
                    setTimeout(function(){location.reload()},1000)
                }
            }
        });
    })
}
function getMessage (params) {
    timeLog = Number(new Date());
    let nowTime = timeLog;
    var _this = this;
    if(params){
        $('.message-container').html('');
        $.get('/sns/mobile/changeMessageType', params.paramList,function (data) {
            $('.wfApp-nav').css('display',"block");
            $('.message-container').css('display',"block");
            $('.message-container').html(data);
        });
    }
}
// 打开消息详情页头部
function getReplaceDetailHeader(ele,flag){
    $(document).on("touchend",ele,function(event){
        console.log($(this).find('.person-index-item'))
        // $(this).find('.person-index-item').css('background-color','red');
        // $(this).find('.person-index-item').css({'background-color': 'red'});
        event.stopPropagation();    
        event.stopImmediatePropagation();
        var messageId;
        var otherId;
        // window.open(ctxPath+'/mobile/getReplaceDetailHeader?msgId='+messageId+'&otherId='+otherId+'&navHidden=1','_blank')
        //原：点里面展示里面的消息和里面的转发列表；点外面展示外面的消息和里面的转发列表。
        if(flag=='outer'){//点击外层消息
            if($(this).find('.othermessage').length){//点击带论文/文章卡片的消息
                messageId = $(this).find('.person-index-item-title').attr('id');
                otherId = $(this).find('.othermessage').attr('data-id');
                window.open(ctxPath+'/mobile/getReplaceDetailHeader?msgId='+messageId+'&otherId='+otherId+'&navHidden=1','_blank')
            }else{
                messageId = $(this).find('.person-index-item-title').attr('id');
                var innerMsgId =$(this).find(".person-index-item-forward-title").attr("data-id");
                //现：点里面展示里面的消息和里面的转发列表；点外面展示里面的消息和里面的转发列表。
                if(innerMsgId=='undefined'||!innerMsgId){//无转发情况下点击外层消息
                    if($(this).find('.forward-ele .clearfix .person-index-item-title').text()=='原消息已经被删除!'){
                        window.open(ctxPath+'/mobile/getReplaceDetailHeader?msgId=' + messageId+'&navHidden=1'+'&innerMsgId='+innerMsgId+'&errorMsg=errorMsg','_blank')
                        return;
                    }
                    window.open(ctxPath+'/mobile/getReplaceDetailHeader?msgId=' + messageId+'&navHidden=1'+'&innerMsgId='+innerMsgId,'_blank')
                }else{//有转发情况下点击外层消息
                    window.open(ctxPath+'/mobile/getReplaceDetailHeader?msgId=' + innerMsgId+'&navHidden=1'+'&innerMsgId='+innerMsgId,'_blank')
                }
               
            }
        }else{//点击里层消息
            if($(this).find('.person-index-item-title').text()=='原消息已经被删除!'){
                return;
            }
            if($(this).children(":first").attr('id') == 'othermessage'){
                messageId =$(this).siblings('.person-index-item-title').attr("id");
                otherId = $(this).find('.othermessage').attr('data-id');
                window.open(ctxPath+'/mobile/getReplaceDetailHeader?msgId=' + messageId+'&otherId='+otherId+'&navHidden=1','_blank')
            }else{
                messageId =$(this).parents('.person-index-item').find(".person-index-item-forward-title").attr("data-id");
                window.open(ctxPath+'/mobile/getReplaceDetailHeader?msgId=' + messageId+'&navHidden=1','_blank')
            } 
        }
    })
}

// function getReplaceDetail(ele,flag){
//     // $(document).on("touchend",ele,function(event){
//         console.log($(this).find('.person-index-item'))
//         // $(this).find('.person-index-item').css('background-color','red');
//         // $(this).find('.person-index-item').css({'background-color': 'red'});
//         event.stopPropagation();    
//         event.stopImmediatePropagation();
//         var messageId;
//         var otherId;
//         //原：点里面展示里面的消息和里面的转发列表；点外面展示外面的消息和里面的转发列表。
//         if(flag=='outer'){//点击外层消息
//             if($(this).find('.othermessage').length){//点击带论文/文章卡片的消息
//                 messageId = $(this).find('.person-index-item-title').attr('id');
//                 otherId = $(this).find('.othermessage').attr('data-id');
//                 window.open(ctxPath+'/mobile/getReplaceDetail?msgId='+messageId+'&otherId='+otherId+'&navHidden=1','_blank')
//             }else{
//                 messageId = $(this).find('.person-index-item-title').attr('id');
//                 var innerMsgId =$(this).find(".person-index-item-forward-title").attr("data-id");
//                 //现：点里面展示里面的消息和里面的转发列表；点外面展示里面的消息和里面的转发列表。
//                 if(innerMsgId=='undefined'||!innerMsgId){//无转发情况下点击外层消息
//                     if($(this).find('.forward-ele .clearfix .person-index-item-title').text()=='原消息已经被删除!'){
//                         window.open(ctxPath+'/mobile/getReplaceDetail?msgId=' + messageId+'&navHidden=1'+'&innerMsgId='+innerMsgId+'&errorMsg=errorMsg','_blank')
//                         return;
//                     }
//                     window.open(ctxPath+'/mobile/getReplaceDetail?msgId=' + messageId+'&navHidden=1'+'&innerMsgId='+innerMsgId,'_blank')
//                 }else{//有转发情况下点击外层消息
//                     window.open(ctxPath+'/mobile/getReplaceDetail?msgId=' + innerMsgId+'&navHidden=1'+'&innerMsgId='+innerMsgId,'_blank')
//                 }
               
//             }
//         }else{//点击里层消息
//             if($(this).find('.person-index-item-title').text()=='原消息已经被删除!'){
//                 return;
//             }
//             if($(this).children(":first").attr('id') == 'othermessage'){
//                 messageId =$(this).siblings('.person-index-item-title').attr("id");
//                 otherId = $(this).find('.othermessage').attr('data-id');
//                 window.open(ctxPath+'/mobile/getReplaceDetail?msgId=' + messageId+'&otherId='+otherId+'&navHidden=1','_blank')
//             }else{
//                 messageId =$(this).parents('.person-index-item').find(".person-index-item-forward-title").attr("data-id");
//                 window.open(ctxPath+'/mobile/getReplaceDetail?msgId=' + messageId+'&navHidden=1','_blank')
//             } 
//         }
//     // })
// }


//阻止消息中点击a标签冒泡
function stopATagPropagation(){
    $(document).on("touchend",'.person-index-item-img',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.search-condition',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.person-index-item-title-p a',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.person-index-item-forward-title a',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.business_card-show',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.comments-msg',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.at-item',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.at-comments',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.management-post',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.comments-msg-inside',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.person-index-item-imgid li',function(event){
        event.stopPropagation();
    })
    
    $(document).on("touchend",'.share-link',function(event){
        event.stopPropagation();
    })
    $(document).on("touchend",'.message-url',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.person-index-item-img',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.search-condition',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.person-index-item-title-p a',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.person-index-item-forward-title a',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.business_card-show',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.comments-msg',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.management-post',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.comments-msg-inside',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.person-index-item-imgid li',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.management-icon',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.forward-ele',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.writing-item',function(event){
        event.stopPropagation();
    })
    // $(document).on("touchstart",'.person-index-item-con',function(event){
    //     event.stopPropagation();
    // });
    $(document).on("touchstart",'.at-item',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.at-comments',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.share-link',function(event){
        event.stopPropagation();
    })
    $(document).on("touchstart",'.message-url',function(event){
        event.stopPropagation();
    })
}
// 手机端禁止手指滑动屏幕触发点击事件
function stopTouchendPropagationAfterScroll(){//停止触摸结束冒泡后滚动
        var locked = false;
	window.addEventListener('touchmove', function(ev){
		locked || (locked = true, window.addEventListener('touchend', stopTouchendPropagation, true));
	}, true);
			    
	function stopTouchendPropagation(ev){//停止触摸冒泡
		ev.stopPropagation();//阻止事件冒泡
		window.removeEventListener('touchend', stopTouchendPropagation, true);
		locked = false;
    }
}
//原生触发刷新
function nativeBackFromOtherPage(){
    registWebViewJavascriptBridge('nativeBackFromOtherPage',reloadBack);
}
function reloadBack(){
    location.reload();
}

function otherEventHandle(){
    clickAt();
    shareLine();
    pushJournal();
}

//点击at跳转
function clickAt() {
    $(document).on('touchend','.at-item', function () {
        if(!$(this).parents('.forward-detail-text').length){
            var userId = $(this).attr('data-id');
            var userType =$(this).parents('.person-index-item').find(".at-item").attr("data-userType");
            if(userType==='journal_user_type'){
                window.open('http://www.wanfangdata.com.cn/sns/mobile/perio/detail.do?user_id='+encodeURIComponent(userId));
            }else{
                window.open(ctxPath+'/mobile/user/'+encodeURIComponent(userId)+'?&navHidden=1');
            }
        }
    });
    $(document).on('touchend','.at-comments', function () {
        var atCommentsUserId = $(this).attr('data-id');
        var atCommentsUserType ;
        $.ajax({
            url: ctxPath+'/mobile/getUserType',
            data: { userId: atCommentsUserId },
            type: 'get',
            async:false,
            success:function(data){
                if(data.status == 200){
                    atCommentsUserType = data.result.userType;
                    if(atCommentsUserType ==='journal_user_type'){
                        window.open('http://www.wanfangdata.com.cn/sns/mobile/perio/detail.do?user_id='+encodeURIComponent(atCommentsUserId));
                    }else{
                        window.open(ctxPath+'/mobile/user/'+encodeURIComponent(atCommentsUserId)+'?&navHidden=1');
                    }
                }else{
                    // $('.message-container').html(data)
                    window.open(ctxPath+'/mobile/getUserType?errorMsg=errorMsg&navHidden=1' );
                }
            }
        });
    });
}
//查看分享链接
function shareLine(){
    $(document).on('touchend','.share-link',function () {
        var _this = $(this);
        var meassageUrl = _this.attr('data-shortlink');
        // $.get(ctxPath + '/mobile/share/getResourceUrl', { shortLink: $(this).attr('data-shortlink') }, function (data) {
        //     if (data.status == 200) {
        //         function UrlRegEx(url){      
        //             //如果加上/g参数，那么只返回$0匹配。也就是说arr.length = 0   
        //             var re = /(\w+):\/\/([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(#.*)?(\?.*)?/i;   
        //             //re.exec(url);   
        //             var arr = url.match(re);   
        //             return arr; 
        //         }     
        //         function getPath(){
        //             return UrlRegEx(data.url)[5];     
        //         } 
        //         // alert(getPath());
        //         perioUserId=getPath();
        //         window.open(data.url+'&navHidden=1','_blank')
        //         window.open('http://www.wanfangdata.com.cn/sns/mobile/perio/detail.do?user_id='+perioUserId);
        //     } else {
        //         showMessageTip('打开链接失败');
        //     }
        // });
        $.ajax({
            url: ctxPath + '/mobile/share/getResourceUrl',
            data: { shortLink: meassageUrl},
            type: 'get',
            async:false,
            success:function(data){
                // alert(data)
                console.log(data)
                if (data.status == 200) {
                    function UrlRegEx(url){      
                        //如果加上/g参数，那么只返回$0匹配。也就是说arr.length = 0   
                        var re = /(\w+):\/\/([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(#.*)?(\?.*)?/i;   
                        //re.exec(url);   
                        var arr = url.match(re);   
                        return arr; 
                    }     
                    function getPath(){
                        return UrlRegEx(data.url)[5];   
                        // return UrlRegEx('http://www.wanfangdata.com.cn/sns/user/qkdwj1')[5];  
                    } 
                    // alert(getPath());
                    var perioUserId=getPath();
                    // window.open(data.url+'&navHidden=1','_blank')
                    window.open('http://www.wanfangdata.com.cn/sns/mobile/perio/detail.do?user_id='+perioUserId+'&navHidden=1','_blank');
                    // window.open('http://www.wanfangdata.com.cn/sns/mobile/perio/detail.do?user_id='+'&navHidden=1','_blank');
                } else {
                    showMessageTip('打开链接失败');
                }
            }
        });
    });
}
//查看推送
function pushJournal(){
    $(document).on('touchend','.message-url',function () {
        var _this = $(this);
        var meassageUrl = _this.attr('data-messageurl');
        // var windowBlank = window.open('_blank');//在移动端windowBlank是null,无法调用
        // $.get(ctxPath + '/mobile/share/getResourceUrl', {async:false, shortLink: meassageUrl }, function (data) {
        //     if (data.status == 200) {
        //         // windowBlank.location = data.url;
        //         window.open(data.url+'&navHidden=1','_blank')
        //     } else {
        //         showMessageTip('打开链接失败');
        //     }
        // });
        $.ajax({
            url: ctxPath + '/mobile/share/getResourceUrl',
            data: { shortLink: meassageUrl},
            type: 'get',
            async:false,
            success:function(data){
                console.log(data)
                if (data.status == 200) {
                    // windowBlank.location = data.url;
                    window.open(data.url+'&navHidden=1','_blank')
                } else {
                    showMessageTip('打开链接失败');
                }
            }
        });
    });
}