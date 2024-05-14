if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) { Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs; exit }

# Stop Docker Compose services
#docker-compose down

# Prune everything that is not running in Docker
docker system prune -a -f

# Shut down WSL
wsl --shutdown

# Find the path to the Docker virtual machine VHDX
$vmPath = Get-ChildItem -Path "$env:USERPROFILE\AppData\Local\Docker\wsl\data\ext4.vhdx" -Recurse -File | Select-Object -ExpandProperty FullName
Write-Host "VHDX file: $($vmPath)"

# Check if the VHDX file was found
if ($null -ne $vmPath) {
    Optimize-VHD -Path $vmPath -Mode Full
    Write-Host "VHDX optimization complete."
    wsl
}
else {
    Write-Host "Error: VHDX file not found."
}

Pause