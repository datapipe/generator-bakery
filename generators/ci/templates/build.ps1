if !(Get-Variable foo -Scope Global -ErrorAction SilentlyContinue) {
   $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

$packerfile = Join-Path "$PSScriptRoot" "packer.json"
$packervars = Join-Path "$PSScriptRoot" "packer-vars.json"

packer build "$packerfile" -var-file="$packervars"
