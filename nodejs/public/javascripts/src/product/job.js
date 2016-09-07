/**
 * Created by hz16032113 on 2016/4/8.
 */
define(["underscore",'message'], function(_,message) {
    'use strict';
    var Job = {
        init: function() {
            Job.message = new Message();
            this.initEvents();
        },
        initEvents: function() {
            $("#jobSearchBtn").click(function(){
                Job.command.search($.trim($("#searchJob").val() || ""));
            });
        },
        command : {
            search : function(selectText) {
                if (selectText === "") {
                    return;
                }
                Job.message.show("正在搜索...","loading");
                var searchCount = 0;
                var newHtml = "",
                    reg = new RegExp(selectText.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)'), 'g'),
                    regNon = /<strong class="highlight">([\w\W]+)<\/strong>/gi;
                $(".search-keywords").text(selectText);
                var $tds = $("#jobDetails td"),
                    len = $tds.length;
                var hasSelected = {},
                    expSelected = {};
                for(var i =0; i < len;i++){
                    var $this = $tds.eq(i);
                    if ($this.text().indexOf(selectText) > -1) {
                        if ($this.find(".highlight").text() === selectText) {
                            searchCount = $(".jobs-count").text();
                            break;
                        }
                        newHtml = $this.text().replace(reg, function (value) {
                            searchCount++;
                            return "<strong class='highlight'>" + value + "</strong>";
                        });
                        hasSelected[i] = newHtml;
                    }
                    else if($this.find(".highlight").length > 0){
                        newHtml = $this.html().replace(/<[^>]+>/g,"");
                        expSelected[i] = newHtml;
                    }
                }
                for(var j in hasSelected){
                    $tds.eq(j).html(hasSelected[j]);
                }
                for(var j in expSelected){
                    $tds.eq(j).html(expSelected[j]);
                }
                $("#searchKeywords").text(selectText);
                if(searchCount !== 0){
                    $("#searchTotal").find(".jobs-count").text(searchCount);
                    $("#searchEmpty").hide();
                    $("#searchTotal").show();
                }
                else{
                    $("#searchTotal").hide();
                    $("#searchEmpty").show();
                }
                Job.message.hide();
                $("#searchTipTitle").hide();
                $(".job-search-content").addClass('it-non-class');
            }

        }
    };
    return Job;
});