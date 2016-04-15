/**
 * Created by hz16032113 on 2016/4/8.
 */
define(["underscore"],function (_) {
    var Job = {
        init : function(){
            var
                jobsArr,
                data = [];
            try {
                jobsArr = $.parseJSON(jobs);//jobs在从页面中读取
            }
            catch(e) {
                jobsArr = [];
            }
            $.each(jobsArr,function(i,v){
                data[data.length] = {
                    text : v.name
                };
                $.each(v.childList,function(ii,vv){
                    data[data.length] = {
                        text : vv.name
                    };
                    $.each(vv.childList,function(iii,vvv){
                        data[data.length] = {
                            text : vvv.name
                        };
                    });
                });
            });
            this.initEvents(data);
            $(".jobs-count").text(data.length);
        },
        initEvents: function (data) {
            var jobData = data || [];
            jobData.length !== 0 &&
            $(".job-search-form").autoComplete({
                input : "#searchJob",
                submit : "#jobSearchBtn",
                data : jobData,
                onSelect : function(v){
                },
                onSubmit : function(data){
                    var
                        selectText = (data || {}).text || $(this).val() || "",
                        reg = new RegExp(selectText,'g'),
                        regNon = /<strong class="highlight">([\w\W]+)<\/strong>/g,
                        newHtml = "",
                        searchCount = 0;
                    if(selectText === "") return;
                    $("#jobDetails td").each(function(i,v){
                        if($(this).text().indexOf(selectText) > -1){
                            if($(this).find(".highlight").text() === selectText ){
                                return ;
                            }
                            newHtml = $(this).text().replace(reg,function(value){
                                searchCount ++;
                                return "<strong class='highlight'>" + value + "</strong>";
                            });
                        }
                        else{
                            newHtml = $(this).html().replace(regNon,"$1");
                        }
                        $(this).html(newHtml);
                        $(".jobs-count").text(searchCount);
                    });
                }
            });
        }
    };
    return Job;
});