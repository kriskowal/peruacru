#!/bin/bash

HERE=$(cd -L "$(dirname -- "$0")" || exit 1; cd ..; pwd)
TMP="$HERE"/.tmp

FROM="$HERE"'/images/backgrounds/background hills empty.jpg' 

SIZE=$(identify "$FROM" | cut -d' ' -f5)
WIDTH=$(echo "$SIZE" | cut -dx -f1)
HEIGHT=$(echo "$SIZE" | cut -dx -f2)

if [ "$WIDTH" -lt "$HEIGHT" ]; then
    LEN="$WIDTH"
else
    LEN="$HEIGHT"
fi

convert "$FROM" -gravity center -crop "$LEN"x"$LEN" -resize "1024x1024" "$TMP"/splash.png

mv "$TMP"/splash-0.png "$TMP"/splash.png
rm "$TMP"/splash-1.png
