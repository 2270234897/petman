# PowerShell脚本：同步库存数据
# 根据入库记录重新计算所有规格的总库存

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  同步库存数据" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查MySQL是否在运行
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
if ($null -eq $mysqlService -or $mysqlService.Status -ne "Running") {
    Write-Host "❌ MySQL服务未运行，请先启动MySQL服务！" -ForegroundColor Red
    exit 1
}

Write-Host "✅ MySQL服务正在运行" -ForegroundColor Green
Write-Host ""

# 执行SQL脚本
Write-Host "⚠️  警告：此操作将重置所有规格的总库存并根据入库记录重新计算" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "是否继续？(y/n)"

if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "操作已取消" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "正在同步库存数据..." -ForegroundColor Yellow

try {
    # 使用mysql命令行执行SQL脚本
    $sqlFile = Join-Path $PSScriptRoot "database\sync_stock_from_records.sql"
    
    if (-not (Test-Path $sqlFile)) {
        Write-Host "❌ SQL文件不存在: $sqlFile" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "执行SQL文件: $sqlFile" -ForegroundColor Cyan
    
    # 提示用户输入MySQL密码
    Write-Host ""
    Write-Host "请输入MySQL root密码:" -ForegroundColor Yellow
    $password = Read-Host -AsSecureString
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
    
    # 执行SQL
    $mysqlCmd = "mysql -u root -p$plainPassword < `"$sqlFile`""
    Invoke-Expression $mysqlCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 库存同步成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "已完成以下操作：" -ForegroundColor Cyan
        Write-Host "  1. 重置所有规格的总库存为0" -ForegroundColor White
        Write-Host "  2. 根据入库记录重新计算总库存" -ForegroundColor White
        Write-Host "  3. 显示了前20个有库存的规格" -ForegroundColor White
        Write-Host ""
        Write-Host "现在商品管理中应该能看到正确的库存了！" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ 同步失败，请检查MySQL密码或SQL文件" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ 执行出错: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

