#
# from: http://stackoverflow.com/questions/9631205/svn-export-modified-files-of-revisions-committed-with-specific-comment
#

#!/usr/bin/env bash

exportPath=package-export
dirName=$1    #201701122246
repoUrl=$2      #"https://192.168.10.100/svn/jumi/trunk/node"
zipPath=$3       #"jm/jumi-node"
revision=($4)      #(27222 27221)

accessTime=$5
ip=$6
appName=$7
comments=$8

# 导出文件列表,给gulpfile使用
execFilePaths=

for r in ${revision[@]}
do
    echo "-------files to export in r$r ($repoUrl)"

    for file in $(svn diff --summarize -r$r:$(($r - 1)) $repoUrl)
    do
        if [[ $file =~ ^http ]];then
            escapePath=`echo $file | sed "s|$repoUrl||g"`
            outfile="/home/teal/svnPackage/$exportPath/$dirName/$zipPath$escapePath"
                
            if [ -f $outfile ];then continue;fi
            
            mkdir -p $(dirname $outfile)
            echo $file
            # --depth=empty: Include only the immediate target of the operation, not any of its file or directory children
            svn export -r $r --force --depth=empty $file $outfile

            execFilePaths=$execFilePaths,$outfile
        fi
    done
done

# 2017-07-07 09:34:00|192.168.10.104|jumi-node|2393|活动添加背景音乐需求
sqlite3 /home/teal/svnPackage/db/main.sqlite3 "insert into access_log values (NULL, '$accessTime', '$ip', '$appName', '$revision', '$comments')"

cd /home/teal/svnPackage/$exportPath/$dirName

gulp --filepaths=$execFilePaths

zip -r $dirName.zip ./*
mv $dirName.zip ../$dirName.zip

# numeric argument required, exit的参数只能是整数
#exit "/home/teal/svnPackage/package-export/$dirName.zip"

exit 0
