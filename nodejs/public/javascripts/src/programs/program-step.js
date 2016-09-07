/**
 * Created by hz16032113 on 2016/6/27.
 */
define(["SuperSlide","require","helper"],function(SuperSlide,requireJs,helper){
    var Step = {
        init : function(){
            this.render();
            this.initEvents();
        },
        data : {
            stepSelected : {
                step1 : {
                    text : "成人",
                    type : 1
                },
                step2 : {
                    text : ""
                }
            },
            goUrl : "http://www.huize.com/guihua/106"
        },
        render : function(){
            var step2 = helper.url.getUrlVar("step2");
            var shift = helper.cookie.getCookie('programStepSift') || 0;
            $(".plan-slider").slide({mainCell:".plan-slider-wrap ul",defaultIndex:(step2 < 3 ? 0 : shift) || (step2 > 3 ? step2 - 3 : 0),autoPage:true,effect:"left",vis:3,easing:"swing",prevCell:'#planSliderPre',nextCell:'#planSliderNex',pnLoop:'false'});
            requireJs(["fixed-tool-float"], function(toolFloat) { // 加载工具条
                Step.toolFloat=new toolFloat();
            });

        },
        initEvents : function(){
            var localData = this.data;
            $(".js-start-planning").click(function(){//立即规划
                $(".js-plan-index").hide();
                $(".plan-box .plan-step:eq(0)").removeClass("fn-hide");
            });
            $(".plan-slider #planSliderPre").click(function(){
                var shift = helper.cookie.getCookie('programStepSift') || 0;
                shift --;
                helper.cookie.setCookie('programStepSift',shift < 0 ? 0 : shift);
            });
            $(".plan-slider #planSliderNex").click(function(){
                var shift = helper.cookie.getCookie('programStepSift') || 0;
                var itemLen = $(".plan-step-list:visible li").length;
                shift ++;
                helper.cookie.setCookie('programStepSift',shift > itemLen - 3 ? itemLen - 3 : shift);
            });
            $(".plan-step-list li").click(function(){//选择项目
                var index = $(this).index();
                var step1 = helper.url.getUrlVar("step1");
                window.location.href = "?step1=" + step1 + '&step2=' + (index + 1);
            });
            $(".js-ensure-object li").click(function(){
                var index = $(this).index();
                window.location.href = "?step1=" + (index + 1);
            });
            $("#next").click(function(){
                var step1 = helper.url.getUrlVar("step1");
                window.location.href = "http://www.huize.com/guihua/?step1=" + step1 + '&step2=' + (step1 == 3 ? 1 : 2);
                return false;
            });
            $("#submit").click(function(){
                var url = $(".plan-step-list li.active:visible").data("url");
                if(url){
                    window.location.href = url;
                    return false;
                }
            });
        }
    };
    return Step;
});