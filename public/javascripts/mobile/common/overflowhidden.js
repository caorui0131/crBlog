/**
 * 超出部分显示省略号 *
 * @param {String} ele 元素的类名
 * @param {Number} rows 多少行后截断
 */
url = window.location.pathname;
url = url.substring(url.lastIndexOf('/') + 1, url.length);
// alert(url);
if(url!=='getReplaceDetailHeader'){
    var overflowUtil = {
        ininWordArr: [],
        nowWordArr: [],
        textMore:'<i class="text-more flag">阅读全文</i>',
        num:0,
        overflowhidden: function (ele,rows) {
            var _this = this;
            $(ele).each(function (index, element) {
                _this.singleOverflowhidden(element, rows);
               
            });
        },
        overflowhiddenAdd: function (ele,rows,num,parentEle) {
            var _this = this;
            $(ele).each(function (index, element) {
                if(index>($(parentEle).length-1-num)){
                    _this.singleOverflowhidden(element, rows);
                }
            });
        },
        singleOverflowhidden: function (element, rows, isFrontEle) {
            var ininWord = $(element).html(); //文本开始的内容
            var lineHight = $(element).css('lineHeight'); //获取文本行高
            var countHeight = rows * parseInt(lineHight);   //需要截断的行高
            var tempstr = $(element).html();                       //获取到所有文本
            var len = tempstr.length; //文本的长度
            if ($(element).height() <= countHeight) { //没要到截取条件
                $('.person-index-item-right-hide').removeClass('person-index-item-right-hide');
                return;
            } else {
                this.ininWordArr.push(ininWord);
                var low = 0;
                var high = len;
                var middle;
                $(element).html(tempstr);
                while ($(element).height() > countHeight) {
                    middle = (low + high) / 2;
                    var middleText = tempstr.substring(0, middle);
                    $(element).html(middleText);
                    if ($(element).height() < countHeight) {
                        $(element).html(tempstr.substring(0, high));
                        low = middle;
                    } else {
                        high = middle - 1;
                    }
                }
                tempstr = tempstr.substring(0, high) + '...';
                $(element).html(tempstr);
                if ($(element).height() > countHeight) {
                    tempstr = tempstr.substring(0, high -1) + '...';
                }
                $(element).html(tempstr);
                $(element).append(this.textMore)
            }
            this.nowWordArr.push(tempstr);
            $(element).attr('data-index', this.nowWordArr.length - 1);
            $('.person-index-item-right-hide').removeClass('person-index-item-right-hide');
        }
    }
    
    // $(document).on('click', '.text-more', function () {
    //     var i = $(this).parent().attr('data-index');
    //     var parentEle = $(this).parent();
    //     parentEle.html(overflowUtil.ininWordArr[i]);
    //     parentEle.append('<i class="text-close flag">收起</i>')
    //     //parentEle.parents('.person-index-item-right').removeClass('person-index-item-right-hide');
    //     MathJax.Hub.Queue(
    //         ['Typeset',MathJax.Hub,parentEle.text()]//第三个参数识别的范围
    //     );
    // });
    
    $(document).on('touchend', '.text-close', function () {
        var i = $(this).parent().attr('data-index');
        var parentEle = $(this).parent();
       // parentEle.parents('.person-index-item-right').addClass('person-index-item-right-hide');
        parentEle.html(overflowUtil.nowWordArr[i]);
        parentEle.append('<i class="text-more flag">阅读全文</i>');
        MathJax.Hub.Queue(
            ['Typeset',MathJax.Hub,parentEle.text()]//第三个参数识别的范围
        );
    });
}
