#!/usr/bin/env bash

exportPath=package-export
execPath=$(dirname $(dirname "$0"))
dirName=$1    #201701122246
dirPrefix=$2       #"namespace/appName"
repoDir=$3
commitIds=($4)      #(27222 27221)

# 导出文件列表,给gulpfile使用
execFilePaths=

# 下面的git命令需要在git仓库里执行
cd $repoDir

for commit in ${commitIds[@]}
do
    echo "-------files to export in commitID: $commit"

    # git 1.7.1 : --pretty=format:"", git 2.16: --format=""即可
    for file in $(git show $commit --name-only --pretty=format:"")
    do
        # 过滤掉非版本库文件，scss文件
        if [[ ! $file =~ \.scss$ ]];then
            outfile="$execPath/$exportPath/$dirName/$dirPrefix/$file"

            if [ -f $outfile ];then continue;fi

            mkdir -p $(dirname $outfile)
            cp $repoDir/$file $outfile

            execFilePaths=$execFilePaths,$outfile
        fi
    done
done

srcDir=$execPath/$exportPath/$dirName
if [ ! -d $srcDir ]; then exit 1; fi

cd $srcDir

gulp --filepaths=$execFilePaths

zip -r $dirName.zip ./*
mv $dirName.zip ../$dirName.zip

exit 0
