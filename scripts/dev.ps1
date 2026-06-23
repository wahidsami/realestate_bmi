param()

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiRoot = Join-Path $repoRoot 'apps\api'
$rootBin = Join-Path $repoRoot 'node_modules\.bin'
$tmpDir = Join-Path $repoRoot '.tmp'
$previousTemp = $env:TEMP
$previousTmp = $env:TMP
$previousHome = $env:HOME
$previousUserProfile = $env:USERPROFILE
$previousHomeDrive = $env:HOMEDRIVE
$previousHomePath = $env:HOMEPATH
$previousDisableHmr = $env:DISABLE_HMR
$startedProcesses = @()

New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
$env:TEMP = $tmpDir
$env:TMP = $tmpDir
$env:HOME = $repoRoot
$env:USERPROFILE = $repoRoot
$env:HOMEDRIVE = 'D:'
$env:HOMEPATH = '\Waheed\MypProjects\BMI Realestate'
$env:DISABLE_HMR = 'true'

function Test-PortInUse {
  param(
    [int] $Port
  )

  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $asyncResult = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
    if (-not $asyncResult.AsyncWaitHandle.WaitOne(250, $false)) {
      return $false
    }

    $client.EndConnect($asyncResult)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

function Stop-OurProcessOnPort {
  param(
    [int] $Port
  )

  $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  foreach ($connection in $connections) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($connection.OwningProcess)" -ErrorAction SilentlyContinue
    if (-not $process) {
      continue
    }

    $commandLine = $process.CommandLine
    $isOurProcess = $false
    if ($commandLine -and $commandLine.Contains($repoRoot)) {
      $isOurProcess = $true
    }
    elseif ($process.Name -match 'node|tsx|vite') {
      $isOurProcess = $true
    }

    if ($isOurProcess) {
      Write-Host "Stopping stale process on port $Port (PID $($process.ProcessId))"
      Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
  }
}

foreach ($port in @(3000, 3001, 4000)) {
  Stop-OurProcessOnPort -Port $port
}

$frontendPort = $null
foreach ($candidate in @(3000, 3001)) {
  if (-not (Test-PortInUse -Port $candidate)) {
    $frontendPort = $candidate
    break
  }
}

if (-not $frontendPort) {
  $frontendPort = 3000
}

$frontendUrl = "http://localhost:$frontendPort"
$adminUrl = "$frontendUrl/admin"

Write-Host "Starting frontend on $frontendUrl"
Write-Host 'Starting API on http://localhost:4000'

if (-not (Test-PortInUse -Port $frontendPort)) {
  $frontend = Start-Process `
    -FilePath (Join-Path $rootBin 'vite.cmd') `
    -ArgumentList @("--port=$frontendPort", '--host=0.0.0.0') `
    -WorkingDirectory $repoRoot `
    -PassThru `
    -WindowStyle Hidden
  $startedProcesses += $frontend
}

if (-not (Test-PortInUse -Port 4000)) {
  $api = Start-Process `
    -FilePath (Join-Path $rootBin 'tsx.cmd') `
    -ArgumentList @('watch', 'src\index.ts') `
    -WorkingDirectory $apiRoot `
    -PassThru `
    -WindowStyle Hidden
  $startedProcesses += $api
}

Start-Sleep -Seconds 5

Write-Host "Opening website: $frontendUrl"
Write-Host "Opening admin: $adminUrl"

Start-Process $frontendUrl
Start-Process $adminUrl

try {
  while ($true) {
    $running = @($startedProcesses | Where-Object { $_ -and -not $_.HasExited })
    $portsOpen = (Test-PortInUse -Port $frontendPort) -or (Test-PortInUse -Port 4000)
    if ($running.Count -eq 0 -and -not $portsOpen) {
      break
    }
    Start-Sleep -Seconds 1
  }
}
  finally {
  foreach ($process in $startedProcesses) {
    if ($process -and -not $process.HasExited) {
      Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
  }
  $env:TEMP = $previousTemp
  $env:TMP = $previousTmp
  $env:HOME = $previousHome
  $env:USERPROFILE = $previousUserProfile
  $env:HOMEDRIVE = $previousHomeDrive
  $env:HOMEPATH = $previousHomePath
  $env:DISABLE_HMR = $previousDisableHmr
}
