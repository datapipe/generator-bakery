$currentDir = (Get-Item -Path ".\" -Verbose).FullName

$packerfile = Join-Path "$currentDir" "packer.json"
$packervars = Join-Path "$currentDir" "packer-vars.json"

packer build -var-file="$packervars" "$packerfile"
