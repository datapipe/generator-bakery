#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

packer build "${DIR}/packer.json" -var-file="${DIR}/packer-vars.json"
