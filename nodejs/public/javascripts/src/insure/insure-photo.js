define([
    "webuploader"
], function(
    webUploader
) {
    'use strict';
    /*
     * @constructor InsureArea
     * @author
     * @version 0.0.1
     * @description 上传照片模块
     */
    var InsurePhoto = function() {

    };
    var photoHtml = [
        '<dd id="uploadImg" class="fn-hide  mb10"><label class="label-item">证件照片</label><div class="inline-block  file-upload-item"><div class="inline-block clearfix" id="thumbPhoto"><div class="fl pic-placeholder p5 bgfb mr10"><img src="//img.huizecdn.com/hz/www/page/default-credentials-pic.png" defaultImg width="150" height="150px"></div></div>',
        '<div class="inline-block f12">',
        '<p class="fc6 mb5">请上传投保人证件，要求可以看清证件号码；</p>',
        '<p class="fc6 mb5">限JPG、JPEG、PNG格式，<br>单张图片大小不得大于5M</p>',
        '<input type="hidden" data-moduleid="10" name="idCardFileIDList" value=""/>',
        '<div id="uploadBtn"><a class="hz-button hz-button-small hz-button-action" href="javascript:;">上传</a></div>',
        '</div>',
        '</div>',
        '</dd>'
    ];
    InsurePhoto.prototype = {
        eventBindBtn: function(callback) { //判断页面上是否有上传按钮，有的话绑定
            var _uploader,
                _this = this;

            _uploader = new webUploader.Uploader({
                auto: true,
                swf: _this.uploadSWFUrl,
                server: _this.uploadUrl,
                accept: { //指定接受哪些类型的文件
                    title: 'filetype', //文字描述
                    extensions: 'gif,jpg,jpeg,png' //允许的文件后缀，不带点，多个用逗号分割。
                },
                fileSingleSizeLimit: _this.SIZE_UPLOAD_IMAGE * _this.SIZE_FILE
            });
            _uploader.addButton({
                id: '#uploadBtn' //innerHTML: '测试'
            });
            _uploader.on("fileQueued", function(file) { //选择文件后
                _this.message.show(_this.TEXT_UPLOAD_IMG_UPLOADING, 'loading')
                _uploader.upload(file.id);
            });
            _uploader.on('error', function(errorType, err) {
                var message = '';
                _this.info(errorType, err);

                switch (errorType) {
                    case 'F_EXCEED_SIZE':
                        message = _this.TEXT_UPLOAD_MAX_SIZE_FN();
                        break;
                    case 'Q_TYPE_DENIED':
                        message = _this.TEXT_UPLOAD_FORMAT_ERROR;
                        break;
                }
                _this.message.show(message, 'warning', _this.messageTimeOut);
            });
            _uploader.on("uploadSuccess", function(message, res) { //上传成功
                if (callback) {
                    callback(res);
                }
                _uploader.reset();
                _this.message.hide();
            });
        },
        showUploadImg: function(showPhotoUpload) { //显示隐藏上传图片组件
            var _this = this;
            if (showPhotoUpload) {
                if ($("#uploadImg").hasClass('fn-hide')) {
                    $("#uploadImg").removeClass("fn-hide");
                    _this.eventBindBtn(function(res) {
                        _this.photoUploadCallBack(res);
                    });
                }
            } else {
                $("#uploadImg").addClass("fn-hide");
            }

        },
        setIDCardUploadStatus: function() {
            var _this = this,
                val = $.trim(_this.$idCardFileIDList.val()) || '',
                $uploadBtn = $('#uploadBtn');

            if (val.split(',').length >= 2) {
                $uploadBtn.css({
                    width: 0,
                    height: 0,
                    overflow: 'hidden'
                });
                status = false;
            } else {
                $uploadBtn.css({
                    width: '',
                    height: '',
                    overflow: ''
                });
            }

        },
        addPhotoUpload: function() { //添加证件上传字段
            var _this = this,
                that = _this,
                $idCardFileIDList;

            $("#module-10").append(photoHtml.join(""));
            _this.$idCardFileIDList = $("[name='idCardFileIDList']");
            this.eventBindBtn(function(res) {
                _this.photoUploadCallBack(res);
            });
            $("#module-10")
                .on("click", "span[delId]", function() { //点击删除照片
                    var _this = $(this),
                        _delId = _this.attr("delId"),
                        _cardFileStr = $("[name='idCardFileIDList']").val();
                    that.confirm(that.TEXT_DEL, function() {
                        _this.parent().remove();
                        var _cardFiles = _cardFileStr.split(',') || [],
                            _newcardFiles = [];
                        $.each(_cardFiles, function(index, item) {
                            if (_delId !== item) {
                                _newcardFiles.push(item);
                            }
                        });
                        _cardFileStr = _newcardFiles.join(',');
                        $("[name='idCardFileIDList']").val(_cardFileStr);
                        that.setIDCardUploadStatus();
                    });
                });
        },
        photoUploadCallBack: function(res) {
            var _this = this;
            if ($('#thumbPhoto img[defaultImg]').length) { //判断是否有默认图片,有的话清掉
                $('#thumbPhoto').html("");
            }
            $("#thumbPhoto").append("<div class='fl pic-placeholder p5 bgfb mr10'><span class='iconfont delete-icon fb' title='删除' delId='" + res.result[0].fileId + "'>&#xe70a;</span><img src='" + res.result[0].fileUrl + "' width=\"150\" height=\"150\"/></div>");
            _this.$idCardFileIDList.val((_this.$idCardFileIDList.val() ? (_this.$idCardFileIDList.val() + ',') : '') + res.result[0].fileId);
            _this.setIDCardUploadStatus();
        },
    };
    return InsurePhoto;
});