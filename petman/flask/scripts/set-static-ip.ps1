# -*- coding: utf-8 -*-
# 设置静态IP地址脚本
# 需要以管理员权限运行

# 设置控制台输出编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 设置错误处理
$ErrorActionPreference = "Continue"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "      Static IP Configuration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
try {
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
} catch {
    Write-Host "Error: Cannot check admin privileges: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

if (-not $isAdmin) {
    Write-Host "Error: This script requires administrator privileges!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'." -ForegroundColor Yellow
    Write-Host "Or run the batch file which will request admin privileges automatically." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "=== Network Adapter Information ===" -ForegroundColor Cyan
Write-Host ""

# 获取所有活动的网络适配器
try {
    $adapters = Get-NetAdapter | Where-Object {$_.Status -eq "Up"}
    
    if ($adapters.Count -eq 0) {
        Write-Host "Error: No active network adapters found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit
    }
} catch {
    Write-Host "Error: Cannot get network adapters: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# 显示适配器列表
$index = 1
foreach ($adapter in $adapters) {
    try {
        $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
        $gateway = Get-NetRoute -InterfaceIndex $adapter.ifIndex -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue
        
        Write-Host "[$index] $($adapter.Name)" -ForegroundColor Green
        Write-Host "    Description: $($adapter.InterfaceDescription)"
        Write-Host "    Status: $($adapter.Status)"
        if ($ipConfig) {
            Write-Host "    Current IP: $($ipConfig.IPAddress)"
            Write-Host "    Prefix Length: $($ipConfig.PrefixLength)"
        }
        if ($gateway) {
            Write-Host "    Gateway: $($gateway.NextHop)"
        }
        Write-Host ""
    } catch {
        Write-Host "    Warning: Cannot get full information" -ForegroundColor Yellow
        Write-Host ""
    }
    $index++
}

# 选择网络适配器
$selection = Read-Host "Select network adapter number (1-$($adapters.Count))"

try {
    $selectionNum = [int]$selection
    if ($selectionNum -lt 1 -or $selectionNum -gt $adapters.Count) {
        throw "Selection out of range"
    }
    $selectedAdapter = $adapters[$selectionNum - 1]
} catch {
    Write-Host "Invalid selection!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

if (-not $selectedAdapter) {
    Write-Host "Invalid selection!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host ""
Write-Host "Selected: $($selectedAdapter.Name)" -ForegroundColor Green
Write-Host ""

# 获取当前配置
$currentIP = Get-NetIPAddress -InterfaceIndex $selectedAdapter.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
$currentGateway = Get-NetRoute -InterfaceIndex $selectedAdapter.ifIndex -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue
$currentDNS = Get-DnsClientServerAddress -InterfaceIndex $selectedAdapter.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue

# 显示当前配置
Write-Host "=== Current Configuration ===" -ForegroundColor Cyan
if ($currentIP) {
    Write-Host "Current IP: $($currentIP.IPAddress)"
    Write-Host "Prefix Length: $($currentIP.PrefixLength) (e.g., 24 = 255.255.255.0)"
}
if ($currentGateway) {
    Write-Host "Current Gateway: $($currentGateway.NextHop)"
}
if ($currentDNS) {
    Write-Host "Current DNS: $($currentDNS.ServerAddresses -join ', ')"
}
Write-Host ""

# 输入静态IP配置
Write-Host "=== Configure Static IP ===" -ForegroundColor Cyan
Write-Host "Tip: Press Enter to use current value" -ForegroundColor Yellow
Write-Host ""

$defaultIP = if ($currentIP) { $currentIP.IPAddress } else { "192.168.1.11" }
$ipAddress = Read-Host "IP Address [Default: $defaultIP]"
if ([string]::IsNullOrWhiteSpace($ipAddress)) { $ipAddress = $defaultIP }

$defaultPrefix = if ($currentIP) { $currentIP.PrefixLength } else { "24" }
$prefixLength = Read-Host "Subnet Prefix Length (8-32) [Default: $defaultPrefix]"
if ([string]::IsNullOrWhiteSpace($prefixLength)) { $prefixLength = $defaultPrefix }

$defaultGateway = if ($currentGateway) { $currentGateway.NextHop } else { "192.168.1.1" }
$gateway = Read-Host "Default Gateway [Default: $defaultGateway]"
if ([string]::IsNullOrWhiteSpace($gateway)) { $gateway = $defaultGateway }

$defaultDNS1 = if ($currentDNS -and $currentDNS.ServerAddresses.Count -gt 0) { $currentDNS.ServerAddresses[0] } else { "8.8.8.8" }
$dns1 = Read-Host "Primary DNS Server [Default: $defaultDNS1]"
if ([string]::IsNullOrWhiteSpace($dns1)) { $dns1 = $defaultDNS1 }

$defaultDNS2 = if ($currentDNS -and $currentDNS.ServerAddresses.Count -gt 1) { $currentDNS.ServerAddresses[1] } else { "8.8.4.4" }
$dns2 = Read-Host "Secondary DNS Server [Default: $defaultDNS2]"
if ([string]::IsNullOrWhiteSpace($dns2)) { $dns2 = $defaultDNS2 }

# 确认配置
Write-Host ""
Write-Host "=== Configuration to Apply ===" -ForegroundColor Cyan
Write-Host "Network Adapter: $($selectedAdapter.Name)"
Write-Host "IP Address: $ipAddress"
Write-Host "Subnet Mask: /$prefixLength"
Write-Host "Default Gateway: $gateway"
Write-Host "Primary DNS: $dns1"
Write-Host "Secondary DNS: $dns2"
Write-Host ""

$confirm = Read-Host "Confirm to apply this configuration? (Y/N)"
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "Operation cancelled" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# 应用配置
Write-Host ""
Write-Host "Applying configuration..." -ForegroundColor Yellow

try {
    # 移除现有的IP配置
    Write-Host "Removing existing IP configuration..."
    Remove-NetIPAddress -InterfaceIndex $selectedAdapter.ifIndex -AddressFamily IPv4 -Confirm:$false -ErrorAction SilentlyContinue
    Remove-NetRoute -InterfaceIndex $selectedAdapter.ifIndex -DestinationPrefix "0.0.0.0/0" -Confirm:$false -ErrorAction SilentlyContinue
    
    # 设置静态IP地址
    Write-Host "Setting IP address: $ipAddress/$prefixLength"
    New-NetIPAddress -InterfaceIndex $selectedAdapter.ifIndex -IPAddress $ipAddress -PrefixLength $prefixLength -DefaultGateway $gateway -ErrorAction Stop | Out-Null
    
    # 设置DNS服务器
    Write-Host "Setting DNS servers: $dns1, $dns2"
    Set-DnsClientServerAddress -InterfaceIndex $selectedAdapter.ifIndex -ServerAddresses @($dns1, $dns2) -ErrorAction Stop
    
    Write-Host ""
    Write-Host "Configuration successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "New network configuration:" -ForegroundColor Cyan
    Get-NetIPAddress -InterfaceIndex $selectedAdapter.ifIndex -AddressFamily IPv4 | Format-Table -AutoSize
    
    Write-Host "Testing network connection..." -ForegroundColor Yellow
    $pingResult = Test-Connection -ComputerName $gateway -Count 2 -Quiet
    if ($pingResult) {
        Write-Host "Gateway connection successful!" -ForegroundColor Green
    } else {
        Write-Host "Warning: Cannot ping gateway!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Configuration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check if IP address conflicts or network settings are correct" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
