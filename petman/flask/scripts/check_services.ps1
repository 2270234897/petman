# 服务状态检查脚本
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "   前后端服务状态检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查后端
Write-Host "[1/2] 检查后端服务 (http://localhost:5000)..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 3 -UseBasicParsing
    Write-Host "  ✓ 后端服务正常运行" -ForegroundColor Green
    Write-Host "  - 状态码: $($backend.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ 后端服务异常" -ForegroundColor Red
}

Write-Host ""

# 检查前端
Write-Host "[2/2] 检查前端服务 (http://localhost:5173)..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -UseBasicParsing
    Write-Host "  ✓ 前端服务正常运行" -ForegroundColor Green
    Write-Host "  - 状态码: $($frontend.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ 前端服务异常" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "访问地址:" -ForegroundColor Green
Write-Host "  前端: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  后端: http://localhost:5000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""



