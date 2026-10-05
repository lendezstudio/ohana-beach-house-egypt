<#
  Ohana Beach House: local preview server (no dependencies).

  Usage (from the project root):
    powershell -ExecutionPolicy Bypass -File tools/serve.ps1            # http://localhost:5500
    powershell -ExecutionPolicy Bypass -File tools/serve.ps1 -Port 8080

  -AllowSave enables POST /__save?path=assets/... so tools/image-pipeline.html
  can write generated images to disk. Never needed for normal previewing.
#>
param(
  [int]$Port = 5500,
  [switch]$AllowSave
)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'
  '.json'='application/json; charset=utf-8'; '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'
  '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.avif'='image/avif'; '.ico'='image/x-icon'
  '.webmanifest'='application/manifest+json'; '.txt'='text/plain; charset=utf-8'; '.xml'='application/xml'
  '.woff2'='font/woff2'; '.pdf'='application/pdf'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Ohana preview running at http://localhost:$Port/  (Ctrl+C to stop)"
Write-Host "Serving $root"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request; $res = $ctx.Response
    try {
      $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')

      if ($AllowSave -and $req.HttpMethod -eq 'POST' -and $rel -eq '__save') {
        $target = $req.QueryString['path']
        $full = [System.IO.Path]::GetFullPath((Join-Path $root $target))
        if (-not $full.StartsWith((Join-Path $root 'assets'))) { throw "Refusing to write outside assets/: $target" }
        New-Item -ItemType Directory -Force (Split-Path $full) | Out-Null
        $fs = [System.IO.File]::Create($full); $req.InputStream.CopyTo($fs); $fs.Close()
        $res.StatusCode = 204; Write-Host "saved $target"
      }
      else {
        if ($rel -eq '' -or $rel.EndsWith('/')) { $rel += 'index.html' }
        $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
        if (-not $full.StartsWith($root) -or -not (Test-Path $full -PathType Leaf)) {
          $res.StatusCode = 404
          $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: /$rel")
        } else {
          $ext = [System.IO.Path]::GetExtension($full).ToLower()
          $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
          $res.Headers.Add('Cache-Control', 'no-cache')
          $bytes = [System.IO.File]::ReadAllBytes($full)
        }
        $res.ContentLength64 = $bytes.Length
        if ($req.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
        Write-Host ("{0} {1} /{2}" -f $res.StatusCode, $req.HttpMethod, $rel)
      }
    } catch {
      $res.StatusCode = 500; Write-Host "error: $_"
    } finally {
      try { $res.OutputStream.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
