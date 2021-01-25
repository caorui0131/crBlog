$(function(){
    if(isNewIphone){
        $(".status-bar").height(44);
        $(".add-more").css({'top':'54px'});
        $(".writing").css({'top':'82px'});
        $(".head-error").height(88);
        $(".related-my-home").siblings(".message-container").find('.person-index-main').css({'padding-top': '122px'})
       
    }else if(isIos){
      
    }else if(isAndroid){
        $(".person-index-item-topMessage-p").css({' line-height': '37/64rem !important;'});
       
    }
})