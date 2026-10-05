<#
  Regenerates optimized images, logo, favicons and the Open Graph image from /Images.
  Usage:  powershell -ExecutionPolicy Bypass -File tools/build-images.ps1 [-SkipPhotos]
  Requires Google Chrome or Microsoft Edge (used headless for canvas WebP encoding).
#>
param([int]$Port = 5599, [switch]$SkipPhotos, [int]$TimeoutSec = 600)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$browser = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw "Chrome or Edge is required." }

$marker = Join-Path $root 'assets\.pipeline-log.txt'
Remove-Item $marker -ErrorAction SilentlyContinue

$server = Start-Process powershell -PassThru -WindowStyle Hidden -ArgumentList @(
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"' + (Join-Path $PSScriptRoot 'serve.ps1') + '"'), '-Port', $Port, '-AllowSave')
Start-Sleep -Seconds 2
$profileDir = Join-Path $env:TEMP 'ohana-pipeline-profile'
try {
  $q = if ($SkipPhotos) { '?skipPhotos' } else { '' }
  $chrome = Start-Process $browser -PassThru -ArgumentList @(
    '--headless=new', '--disable-gpu', '--no-first-run', "--user-data-dir=$profileDir",
    "http://localhost:$Port/tools/image-pipeline.html$q")
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while (-not (Test-Path $marker) -and $sw.Elapsed.TotalSeconds -lt $TimeoutSec) { Start-Sleep -Milliseconds 500 }
  if (Test-Path $marker) { Get-Content $marker -Raw; Remove-Item $marker } else { "Timed out after $TimeoutSec s" }
} finally {
  Get-CimInstance Win32_Process -Filter "Name='chrome.exe' OR Name='msedge.exe'" |
    Where-Object { $_.CommandLine -like "*ohana-pipeline-profile*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
}
