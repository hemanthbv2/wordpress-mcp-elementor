$ErrorActionPreference = 'Stop'

$brainDir = "C:\Users\HP\.gemini\antigravity\brain\c5c230c2-90b4-4fe7-b358-32b81fcbace0"
$workspaceDir = "D:\wordpress-mcp-elementor-main"
$testDir = "d:\hemanth bv\test"

Write-Host "=== 1. Package RVPU North with Assets ==="
$northStage = Join-Path $env:TEMP "pkg_north"
if (Test-Path $northStage) { Remove-Item $northStage -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $northStage "assets") | Out-Null
Copy-Item (Join-Path $workspaceDir "rvpu_north_elementor_template.json") (Join-Path $northStage "rvpu-north-homepage-new-elementor-template.json") -Force
Get-ChildItem -Path (Join-Path $brainDir "scratch\rvpu_north\assets") -Filter "north_*.png" | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $northStage "assets\$($_.Name)") -Force
}
$northZip = Join-Path $workspaceDir "rvpu-north-homepage-new-elementor-package.zip"
if (Test-Path $northZip) { Remove-Item $northZip -Force }
Compress-Archive -Path (Join-Path $northStage "*") -DestinationPath $northZip -Force
Remove-Item $northStage -Recurse -Force
Write-Host "North Package: $((Get-Item $northZip).Length) bytes"

Write-Host "=== 2. Package RVPU South with Assets ==="
$southStage = Join-Path $env:TEMP "pkg_south"
if (Test-Path $southStage) { Remove-Item $southStage -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $southStage "assets") | Out-Null
Copy-Item (Join-Path $workspaceDir "rvpu_south_elementor_template.json") (Join-Path $southStage "rvpu-south-homepage11-elementor-template.json") -Force
Get-ChildItem -Path (Join-Path $brainDir "scratch\rvpu_south\assets") -Filter "south_*.png" | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $southStage "assets\$($_.Name)") -Force
}
$southZip = Join-Path $workspaceDir "rvpu-south-homepage11-elementor-package.zip"
if (Test-Path $southZip) { Remove-Item $southZip -Force }
Compress-Archive -Path (Join-Path $southStage "*") -DestinationPath $southZip -Force
Remove-Item $southStage -Recurse -Force
Write-Host "South Package: $((Get-Item $southZip).Length) bytes"

Write-Host "=== 3. Package RVPU Mysuru with Assets ==="
$mysuruStage = Join-Path $env:TEMP "pkg_mysuru"
if (Test-Path $mysuruStage) { Remove-Item $mysuruStage -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $mysuruStage "assets") | Out-Null
Copy-Item (Join-Path $workspaceDir "rvpu_mysuru_elementor_template.json") (Join-Path $mysuruStage "rvpu-mysuru-homepage2-elementor-template.json") -Force
Get-ChildItem -Path (Join-Path $brainDir "scratch\rvpu_mysuru\assets") -Filter "mysuru_*.png" | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $mysuruStage "assets\$($_.Name)") -Force
}
$mysuruZip = Join-Path $workspaceDir "rvpu-mysuru-homepage2-elementor-package.zip"
if (Test-Path $mysuruZip) { Remove-Item $mysuruZip -Force }
Compress-Archive -Path (Join-Path $mysuruStage "*") -DestinationPath $mysuruZip -Force
Remove-Item $mysuruStage -Recurse -Force
Write-Host "Mysuru Package: $((Get-Item $mysuruZip).Length) bytes"

Write-Host "=== 4. Copy updated files to test directory ==="
$syncFiles = @(
    "rvpu_north_elementor_template.json",
    "rvpu_south_elementor_template.json",
    "rvpu_mysuru_elementor_template.json",
    "rvpu_ecity_elementor_template.json",
    "rvpu-north-homepage-new-elementor-package.zip",
    "rvpu-south-homepage11-elementor-package.zip",
    "rvpu-mysuru-homepage2-elementor-package.zip",
    "rebuild_all_campuses_clean.mjs",
    "README.md"
)

foreach ($f in $syncFiles) {
    Copy-Item (Join-Path $workspaceDir $f) (Join-Path $testDir $f) -Force
    Write-Host "Synced $f to test directory"
}

Write-Host "=== All packages and files successfully prepared! ==="
