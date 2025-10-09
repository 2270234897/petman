@echo off
chcp 65001 >nul
:: 以管理员权限运行PowerShell脚本

echo ====================================
echo       静态IP地址配置工具
echo ====================================
echo.

:: 检查PowerShell脚本是否存在
if not exist "%~dp0set-static-ip.ps1" (
    echo 错误: 找不到 set-static-ip.ps1 文件！
    echo 请确保该文件与此批处理文件在同一目录下。
    echo.
    pause
    exit /b 1
)

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% == 0 (
    echo 正在启动IP配置脚本...
    echo.
    powershell.exe -NoExit -ExecutionPolicy Bypass -File "%~dp0set-static-ip.ps1"
) else (
    echo 正在请求管理员权限...
    echo 请在弹出的UAC对话框中点击"是"
    echo.
    powershell.exe -Command "Start-Process PowerShell -ArgumentList '-NoExit -ExecutionPolicy Bypass -File \"%~dp0set-static-ip.ps1\"' -Verb RunAs"
)

