# 宠物管理系统 - 后端启动脚本 (PowerShell)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   宠物管理系统 - 后端启动脚本" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 检查WSL MySQL服务
Write-Host "[1/3] 检查WSL MySQL服务..." -ForegroundColor Yellow
try {
    $mysqlStatus = wsl sudo service mysql status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "MySQL未运行，正在启动..." -ForegroundColor Yellow
        wsl sudo service mysql start
        Start-Sleep -Seconds 2
        Write-Host "✓ MySQL已启动" -ForegroundColor Green
    } else {
        Write-Host "✓ MySQL已运行" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ 无法检查MySQL状态: $_" -ForegroundColor Red
    Write-Host "请手动在WSL中运行: sudo service mysql start" -ForegroundColor Yellow
}

# 测试数据库连接
Write-Host ""
Write-Host "[2/3] 测试数据库连接..." -ForegroundColor Yellow
$testResult = python backend\test_db_connection.py
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ 数据库连接失败，请检查配置" -ForegroundColor Red
    Read-Host "按Enter键退出"
    exit 1
}

# 启动Flask服务
Write-Host ""
Write-Host "[3/3] 启动Flask后端服务..." -ForegroundColor Yellow
Write-Host ""
Write-Host "服务将在 http://localhost:5000 启动" -ForegroundColor Green
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Cyan
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 启动Flask
python backend\app.py



