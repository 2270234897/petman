# PowerShell脚本：更新数据库中的图片字段
# 将picture字段从VARCHAR(500)改为LONGTEXT以支持base64图片

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  更新数据库图片字段" -ForegroundColor Cyan
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
Write-Host "正在更新数据库字段..." -ForegroundColor Yellow

try {
    # 使用mysql命令行执行SQL脚本
    $sqlFile = Join-Path $PSScriptRoot "database\fix_picture_field.sql"
    
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
        Write-Host "✅ 数据库字段更新成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "已完成以下更新：" -ForegroundColor Cyan
        Write-Host "  1. spec.picture 字段: VARCHAR(500) → LONGTEXT" -ForegroundColor White
        Write-Host "  2. product.cover_image 字段: VARCHAR(500) → LONGTEXT" -ForegroundColor White
        Write-Host ""
        Write-Host "现在可以存储大型base64图片了！" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ 更新失败，请检查MySQL密码或SQL文件" -ForegroundColor Red
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

