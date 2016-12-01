$currentDir = (Get-Item -Path ".\" -Verbose).FullName

If (Test-Path "$curentDir\\berks-cookbooks"){
	Remove-Item "$curentDir\\berks-cookbooks"
}

cd $currentDir
berks vendor

$packerfile = Join-Path "$currentDir" "packer.json"
$packervars = Join-Path "$currentDir" "packer-vars.json"

packer build "$packerfile" -var-file="$packervars"
