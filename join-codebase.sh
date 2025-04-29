#!/bin/bash

find bin -type f -exec sh -c 'echo ":: File: $1"; cat "$1"; echo;echo' _ {} \;
find src -type f -exec sh -c 'echo ":: File: $1"; cat "$1"; echo;echo' _ {} \;
find test -type f -exec sh -c 'echo ":: File: $1"; cat "$1"; echo;echo' _ {} \;
