#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ -d "${DIR}/berks-cookbooks" ]; then
  rm -rf "${DIR}/berks-cookbooks"
fi

cd $DIR
berks vendor

packer build -var-file="${DIR}/packer-vars.json" "${DIR}/packer.json"
