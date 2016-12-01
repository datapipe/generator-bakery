#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

packer build -var-file="${DIR}/packer-vars.json" "${DIR}/packer.json"
