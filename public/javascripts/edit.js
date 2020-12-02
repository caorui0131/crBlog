$(function(){
    (function($,window) {
        var editorMarkdown = $('#article_editor-mardown'); //编写Markdown区域
        var editorPreview = $('#article_editor-preview'); // 預覽區域
        var writeArticleStatr = $('.write-article-start'); //點擊開始創建文章
        var aritcleTitle = $('.article_pulished-title-conent');//文章標題
        var articleTitleTip = $('.article_pulished-title-tip');
        var snsUrl = $('#snsUrlId').val();
        var timeLog = Number(new Date()); //保證最新
        var rollSyncFlag = true;
        var formUpImgFile = new FormData(); //图片上传FormData对象
        return editor = {
            voteHand:function() {
                $(document).on('change','select[name="vote-input-type"]',$.proxy(this.voteType,null,this)); //投票单选多选
                $(document).on('click','.chice-add',$.proxy(this.chiceAdd,null,this)); //添加选项
                $(document).on('click','.chice-minus',$.proxy(this.chiceMinus,null,this)); //移除选项
                $(document).on('click','.vote-submit',$.proxy(this.voteSubmit,null,this)); //确定投票规则
            },
            voteType:function() {
                if($(this).val() === 'checkbox') {
                    $('select[name="vote-type-minnum"]').show();
                    $('select[name="vote-type-maxnum"]').show();
                }else {
                    $('select[name="vote-type-minnum"]').hide();
                    $('select[name="vote-type-maxnum"]').hide();
                }
            },
            chiceAdd:function() {
                var _this = $(this);
                var liEle = _this.parents('li');
                var ulEle = liEle.parents('.vote-content-options');
                var minNumEle = $('select[name="vote-type-minnum"]');
                var maxNumele = $('select[name="vote-type-maxnum"]');
                var liHtml = `<li>
                        <input type="text" placeholder="请填写选项内容">
                        <span class="chice-add"> + </span>
                        <span class="chice-minus"> - </span>
                    </li>`;
                liEle.after(liHtml);
                setTimeout(function() {
                    liEle.next().focus();
                },10);
                minNumEle.append('<option value='+ulEle.find('li').length+'>至少选'+ulEle.find('li').length+'项</option>');
                maxNumele.append('<option value='+ulEle.find('li').length+'>最多选'+ulEle.find('li').length+'项</option>');
            },
            chiceMinus:function() {
                var _this = $(this);
                var liEle = _this.parents('li');
                var ulEle = liEle.parents('.vote-content-options');
                var minNumEle = $('select[name="vote-type-minnum"]');
                var maxNumele = $('select[name="vote-type-maxnum"]');
                if(ulEle.find('li').length <= 1) {
                    $('.vote-num-tip').show(500).text('请至少保留1个选项');
                    setTimeout(function() {
                        $('.vote-num-tip').hide(500);
                    },2000);
                }else {
                    liEle.remove();
                    minNumEle.children('option:last-child').remove();
                    maxNumele.children('option:last-child').remove();
                }
            },
            voteSubmit:function(obj) {
                var titile = $('.vote-content-title').find('textarea').val();
                var asDate = $('#asDate').val();
                var type = $('select[name="vote-input-type"]').val();
                var minNumEle = $('select[name="vote-type-minnum"]');
                var maxNumele = $('select[name="vote-type-maxnum"]');
                var minNum = type === 'checkbox' ? minNumEle.val() : 'no';
                var maxNume = type === 'checkbox' ? maxNumele.val() : 'no';
                var selectList = {};
                selectList.type = type;
                selectList.minNumEle = minNum;
                selectList.maxNume = maxNume;
                selectList.opt = [];
                if(!titile) {
                    $('.vote-num-tip').show(500).text('请填写标题');
                    setTimeout(function() {
                        $('.vote-num-tip').hide(500);
                    },2000);
                    return;
                }
                if(!asDate) {
                    $('.vote-num-tip').show(500).text('请填写日期');
                    setTimeout(function() {
                        $('.vote-num-tip').hide(500);
                    },2000);
                    return;
                }
                $('.vote-content-options').find('li').each(function(index,ele) {
                    var inputEle = $(ele).find('input[type="text"]');
                    var name = inputEle.val() ? inputEle.val() : '选项内容';
                    selectList.opt.push({option:index+1,name:name});
                });
                $.ajax({
                    url:'/createVote',
                    type: 'POST',
                    data:{
                        articleId:$('.named-article-active').attr('data-id'),
                        validate:asDate,
                        title:titile,
                        type:selectList.type,
                        optionLeast: minNum === 'no' ? '' : minNum,
                        optionMost: maxNume === 'no' ? '' : maxNume
                    },
                    success:function( data ) {
                        if(data.status === 200 ) {
                            //发送接口渲染
                            var optHtml = '';
                            for(var i=0,len=selectList.opt.length; i< len; i++) {
                                optHtml += '<li  data-option=choose'+selectList.opt[i].option+'><div class="vote-input">'+selectList.opt[i].name+'</div></li>';
                            } 
                            var voteHtml = '<div class="vote" data-id='+data.successText.voteId+'><div class="title_question">'+titile+'</div><ul class="vote-list" data-type='+selectList.type+'>'+optHtml+'</ul><div class="vote-choose-submit"><button>投票</button></div></div>';
                            $('.common-mask-layer').hide();
                            $('.common-mask-content').removeClass('position').hide().find('btn-submit').removeClass().addClass('btn-submit').val('确定');
                            $('.common-mask-content').find('.common-mask-con').html('');
                            obj.acen_edit.insert(voteHtml);
                            editorPreview.html(marked(obj.acen_edit.getValue()));
                        } else {
                            common.showMessageTip(data.errMsg);
                        }
                    }
                });

            },

            // hiddenFunction:function() {
            //     var _this = this;
            
            //     $(document).on('click','.deleAritcle-btn-submit',$.proxy(this.deleSubmitHandle,null,this)); //删除提交事件
            //     $(document).on('click','.article_push,.article-submit,.article-submit_updata',$.proxy(this.pushHandle,null,this)); //文章发布
            //     $(document).on('click','.article_delete',$.proxy(this.deleHandle,null,this)); //文章删除
            //     $(document).on('click','.article_cancle',$.proxy(this.cancleHandle,null,this)); //文章取消
            //     $(document).on('click','.named-article',$.proxy(this.switchList,null,this)); //草稿箱和已发布切换
            //     $(document).on('click','.article-save',$.proxy(this.saveArticleHandle,null,this,'','')); //文章保存
            //     $(document).on('click','.article-submit_cancle',$.proxy(this.cancleHandle,null,this)); //取消发布
            //     $(document).on('input propertychange focus','.article_pulished-title-conent',$.proxy(this.countTextInput,null)); //焦点事件处理
            //     $(document).on('click','.close-preview',$.proxy(this.closePreview,null,this)); //关闭预览
            //     $(document).on('click','.open-preview',$.proxy(this.openPreview,null,this)); //打开预览
            //     $(document).on('click','.off-roll_sync',$.proxy(this.offRollSync,null,this)); //关闭滚动同步
            //     $(document).on('click','.roll_sync',$.proxy(this.rollSync,null,this)); //滚动同步

            //     $(document).on('click','.article_editor-bold',$.proxy(this.boldEntireLine,null,this));//点击加粗
            //     // $(document).on('click','.article_editor-switchH',$.proxy(this.switchTitleHandle,null,this));//点击标题
            //     $(document).on('click','.article_editor-italic',$.proxy(this.italicHandle,null,this));//点击倾斜
            //     $(document).on('click','.article_editor-unorder',$.proxy(this.unorderHandle,null,this));//点击无序列表
            //     $(document).on('click','.article_editor-order',$.proxy(this.orderHandle,null,this));//点击有序列表
            //     $(document).on('click','.article_editor-reference',$.proxy(this.referenceHandle,null,this));//点击引用
            //     $(document).on('click','.article_editor-code',$.proxy(this.editorCodecHandle,null,this));//点击写代码
            //     $(document).on('click','.article_editor-hyperlinks',$.proxy(this.hyperLinks,null,this));//插入超链接
            //     $(document).on('click','.hyper-linkes-submit',$.proxy(this.hyperLinksHandle,null,this));//插入超链接提交
            //     $(document).on('click','.article_editor-vote',$.proxy(this.voteHandle,null,this));//点击投票
            //     this.switchTitleHandle();//标题

            //     $('.article_editor-more').hover($.proxy(this.editorMoreShow,null,this),$.proxy(this.editorMoreHide,null,this)); //显示更多按钮
            //     editorMarkdown.keydown($.proxy(this.keydownSaveHandle,null,this)); //ctrl+s
            //     $('.article_pulished-title-conent').keydown($.proxy(this.keydownSaveHandle,null,this)); //ctrl+s
            //     $('#upImg').change($.proxy(this.upImg,null,this)); //图片上传
            //     $('#upFile').change($.proxy(this.upFile,null,this)); //附件上传
            //     if($('.article-list').find('.named-article-active').length) {
            //         this.markdownInit();
            //         var articleId = $('.named-article-active').attr('data-id');
            //         this.getArticleDetail(articleId,this);
            //         aritcleTitle.attr('disabled',false);
            //         $('.article_editor-toolbar-hide').hide();
            //     }else{
            //         aritcleTitle.attr('disabled',true);
            //         $('.article_editor-toolbar-hide').show();
            //     }
            //     window.addEventListener('beforeunload', function(event) {
            //         if($('.named-article-active').length) {
            //             _this.saveArticleHandle(_this,'','');
            //         }
            //     });
            //     if($('.draft_box-active').hasClass('published_box')) {
            //         $('.article_published-tip').hide();
            //     }
            // },
            // clickContent:function(){
            //     $('.article_editor-mardown').click(function(event){
            //         event.stopPropagation(); 
            //         editor.getCookie();
            //     });
            // },
            // getCookie:function(){
            //     if(!$.cookie('CASTGC')){
            //         window.location.reload();
            //     }
            //     if($.cookie('snsBlogAccessToken')){
            //         //获取当前页面用户的归属
            //         if($('.thisPageUser').val() != $.cookie('curr')){
            //             $.cookie('snsBlogAccessToken',$('.thisPageUser').val());
            //             window.location.reload();
            //         }
            //         if($.cookie('curr') != $.cookie('snsBlogAccessToken')) {
            //             window.location.reload();
            //         }
            //     }
            // },
            // //获取cookie放到页面上 判断当前页面的归属
            // saveCookieToInput:function(){
            //     if($.cookie('curr')){
            //         $('.article_head').append('<input type=\'hidden\' class=\'thisPageUser\' value=\''+$.cookie('curr')+'\'/>');
            //     }
            // },

            init:function( ){
                // this.saveCookieToInput();
                // this.clickContent();
                // this.clickWrite();
                // this.editorHandle();
                // this.hiddenFunction();
                // this.switchTab();
                // this.rollSyncHandle(); 
                this.voteHand();
            }
        };
    })(jQuery,window).init();
});
function downloadFile(id,name){
    $.ajax({
        url:'/statisticas',
        type: 'POST',
        data: {
            id:id,
            name:name
        }
    });   
}

