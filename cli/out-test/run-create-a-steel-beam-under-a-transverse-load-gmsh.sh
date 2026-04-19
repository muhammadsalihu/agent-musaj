#!/usr/bin/env sh
set -eu
gmsh "create-a-steel-beam-under-a-transverse-load.geo" -3 -format msh2 -o "create-a-steel-beam-under-a-transverse-load.msh"
