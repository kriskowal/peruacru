#!/bin/bash
set -e

HERE=$(cd -L $(dirname -- $0); pwd)
export PATH="$HERE/node_modules/.bin":"$PATH"
export GIT_DIR="$HERE/.git"
export GIT_INDEX_FILE=$(mktemp "$GIT_DIR/TEMP.XXXXXX")

function blob() {
    # usage: blob entry source
    # generates an entry for a tree, suitable for piping into git mktree.
    # e.g., blob bundle.js <(bundle essays/digger/index.js)
    echo "100644 blob $(git hash-object -w $2)"$'\t'"$1"
}

function tree() {
    # usage: tree entry source
    # generates an entry for a subtree, suitable for piping into mktree.
    # the source must also be a file/named-pipe suitable for piping into
    # mktree.
    # e.g., tree docs <(gendocs)
    echo "040000 tree $(git mktree < $2)"$'\t'"$1"
}

function genroot() {
    blob CNAME CNAME
    blob index.html bundle.html
    blob index.css index.css
    kni peruacru.kni -j > peruacru.json
    blob index.js <(bundle index.js)
}

OVERLAY=$(genroot | git mktree)
git read-tree --empty
git read-tree --prefix=/ $OVERLAY
TREE=$(git write-tree --missing-ok)
# PARENT=$(git rev-parse refs/heads/master)
COMMIT=$(git commit-tree $TREE < <(echo Bundle))
git update-ref refs/heads/gh-pages $COMMIT

rm $GIT_INDEX_FILE
