/**
 *
 */
define(['jquery','fix-float'], function($,fixFloat) {

    var car = {
        init: function() {
            var fix=new fixFloat({el:$("#compareFloat"),fixPanel:$("#comparePanel"),fixClass:"fixed-detail-tab-wrap",callback:function(result){
                if(result==="add"){
                    $("#compareFloat").removeClass("fn-hide");
                }else{
                    $("#compareFloat").addClass("fn-hide");
                }
            }});
        },
        initAction:function(){

        }
    };
    return car;
});