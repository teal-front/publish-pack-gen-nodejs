#!/bin/sh

# to be continue
# 也可以考虑写成函数调用，难度有点高

# http://svnbook.red-bean.com/en/1.7/svn.ref.svn.c.log.html


fn=$1
repo=$2
arg1=$3
arg2=$4
arg3=$5

case "$fn" in
listRevisions)
	author=$arg1
	svn log -l 15 --search $author -v --xml $repo
	echo 'list';;
getFilePaths)
	revision=$arg1
	filePath=$arg2
	outPath=$arg3
	svn diff --summarize -r$(revision):$[revision - 1] $repo | egrep "^(M|A)"
	
	svn export -r $revision "$filePath" "$outPath"  $repo
	echo 'getFilePaths';;
zipFiles)
	targetZip=$arg1
	file=$arg2
	zip $targetZip  $file
	echo 'zipFiles';;
*)
	echo 'sorry, wrong args';;
esac

