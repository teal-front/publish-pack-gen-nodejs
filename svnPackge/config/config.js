'use strict';

module.exports =
    {
        "repoMap": {
            // 应用名
            "node": {
                // 应用的特征路径，用来匹配版本记录中属于当前应用的路径
                "keyword": "node-all/jumi-node/",
                // svn repo url
                "url": "https://192.168.10.100/svn/jumi/trunk/node-all/jumi-node",
                // 打包路径
                "dirPrefix": "jm/jumi-node"
            },
            "node-cps": {
                "keyword": "jumi-node-cps/node-server",
                "url": "https://192.168.10.100/svn/jumi/trunk/node-all/jumi-node-cps/node-server",
                "dirPrefix": "jm/jumi-node-cps"
            },
            "node-cps-pc": {
                "keyword": "jumi-node-cps-pc",
                "url": "https://192.168.10.100/svn/jumi/trunk/node-all/jumi-node-cps-pc/src",
                "dirPrefix": "jm/jumi-node-cps-pc"
            },
            "node-shop": {
                "keyword": "jumi-node-shop",
                "url": "https://192.168.10.100/svn/jumi/trunk/node-all/jumi-node-shop",
                "dirPrefix": "jm/jumi-node-shop"
            },
            "node-agent": {
                "keyword": "jumi-node-agent",
                "url": "https://192.168.10.100/svn/jumi/trunk/node-all/jumi-node-agent",
                "dirPrefix": "jm/jumi-node-agent"
            },
            "node-weshop": {
                "keyword": "jumi-node-weshop",
                "url": "https://192.168.10.100/svn/jumi/trunk/node-all/jumi-node-weshop",
                "dirPrefix": "jm/jumi-node-weshop"
            },
            "node-sc": {
                "keyword": "node-all/jumi-node-sc/",
                "url": "https://192.168.10.100/svn/jumi/trunk/node-all/jumi-node-sc",
                "dirPrefix": "jm/jumi-node-sc"
            },
            "m.jumi18.com": {
                "keyword": "Hzins.JuMi.Web",
                "url": "https://192.168.10.100/svn/jumi/trunk/h5/Hzins.JuMi.Web",
                "dirPrefix": "jm/m.jumi18.com"
            },
            "www.jumi18.com": {
                "keyword": "HzIns.Channel.Web.Jumi",
                "url": "https://192.168.10.100/svn/jumi/trunk/pc/HzIns.Channel.Web.Jumi",
                "dirPrefix": "jm/www.jumi18.com"
            },
            "agent.jumi18.com": {
                "keyword": "HzIns.Channel.Web.Jumi.Agent",
                "url": "https://192.168.10.100/svn/jumi/trunk/pc/HzIns.Channel.Web.Jumi.Agent",
                "dirPrefix": "jm/agent.jumi18.com"
            },
            "cps.jumi18.com": {
                "keyword": "HzIns.Channel.Web.Jumi.CPS",
                "url": "https://192.168.10.100/svn/jumi/trunk/pc/HzIns.Channel.Web.Jumi.CPS",
                "dirPrefix": "jm/cps.jumi18.com"
            },
            "static.huizecdn.com": {
                "keyword": "static.huizecdn.com",
                "url": "https://192.168.10.100/svn/web/trunk/static.huizecdn.com",
                "dirPrefix": "mg/static.huizecdn.com"
            },
            "img.huizecdn.com": {
                "keyword": "img.huizecdn.com",
                "url": "https://192.168.10.100/svn/web/trunk/img.huizecdn.com",
                "dirPrefix": "mg/img.huizecdn.com"
            },
            "images.hzins.com": {
                "keyword": "images.hzins.com",
                "url": "https://192.168.10.100/svn/HzInsSystem/images.hzins.com",
                "dirPrefix": "mg/images.hzins.com"
            }
        }
    }
