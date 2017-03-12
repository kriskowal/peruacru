#!/bin/bash
set -e

HERE=$(cd -L "$(dirname -- "$0")"; cd ..; pwd)
PATH="$HERE/node_modules/.bin:$PATH"
GIT_DIR="$HERE/.git"
GIT_INDEX_FILE=$(mktemp "$GIT_DIR/TEMP.XXXXXX")

blob() {
    # usage: blob entry source
    # generates an entry for a tree, suitable for piping into git mktree.
    # e.g., blob bundle.js <(bundle essays/digger/index.js)
    echo "100644 blob $(git hash-object -w "$2")"$'\t'"$1"
}

tree() {
    # usage: tree entry source
    # generates an entry for a subtree, suitable for piping into mktree.
    # the source must also be a file/named-pipe suitable for piping into
    # mktree.
    # e.g., tree docs <(gendocs)
    echo "040000 tree $(git mktree < "$2")"$'\t'"$1"
}

assets() {
    cd assets
    find . -type file -depth 1 | while read -r path; do
        file=$(basename "$path")
        blob "$file" "$file"
    done
}

genroot() {
	cd -- "$HERE"
    # update local peruacru.json, can't bundle from git database
    kni peruacru.kni -j > peruacru.json

    blob CNAME CNAME
    blob index.html bundle.html
    blob index.css index.css
    blob index.js <(sysjs index.js)
    tree assets <(assets)
}

OVERLAY=$(genroot | git mktree)
git read-tree --empty
git read-tree --prefix=/ "$OVERLAY"
TREE=$(git write-tree --missing-ok)
# PARENT=$(git rev-parse refs/heads/master)
COMMIT=$(git commit-tree "$TREE" < <(echo Bundle))
git update-ref refs/heads/gh-pages "$COMMIT"

rm -- "$GIT_INDEX_FILE"
