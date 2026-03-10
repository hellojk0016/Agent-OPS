param (
    [int]$port = 3000
)

$Host.UI.RawUI.WindowTitle = "Agent OPS - Persistent Tunnel"
Write-Host "--- Agent OPS Persistent Tunnel Manager ---" -ForegroundColor Cyan
Write-Host "Monitoring port: $port"

function Start-Tunnel {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting new tunnel..." -ForegroundColor Yellow
    
    # Start localtunnel using npx directly
    # We use -PassThru to get the process object
    $process = Start-Process -FilePath "npx.cmd" -ArgumentList "-y localtunnel --port $port" -PassThru -NoNewWindow
    
    return $process
}

while ($true) {
    $tunnelProcess = Start-Tunnel
    
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Tunnel is ACTIVE. Monitoring for crashes..." -ForegroundColor Green
    
    # Wait for the process to exit
    while ($null -ne $tunnelProcess -and -not $tunnelProcess.HasExited) {
        Start-Sleep -Seconds 10
    }
    
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Tunnel CRASHED or CLOSED! Restarting in 5 seconds..." -ForegroundColor Red
    Start-Sleep -Seconds 5
}
