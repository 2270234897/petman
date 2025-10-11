# PowerShell Script: Rebuild Database to Version 5.0
# Warning: This will delete existing database!

Write-Host "================================================" -ForegroundColor Red
Write-Host "  Database Rebuild Tool - Version 5.0" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""
Write-Host "WARNING: This will delete the existing mydb database!" -ForegroundColor Yellow
Write-Host "All data will be cleared. Please backup important data!" -ForegroundColor Yellow
Write-Host ""

# Check if MySQL is running
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
if ($null -eq $mysqlService -or $mysqlService.Status -ne "Running") {
    Write-Host "ERROR: MySQL service is not running!" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host "MySQL service is running" -ForegroundColor Green
Write-Host ""

# Confirmation
Write-Host "Please confirm:" -ForegroundColor Cyan
$confirm1 = Read-Host "Delete existing database and rebuild? (type YES to continue)"

if ($confirm1 -ne 'YES') {
    Write-Host ""
    Write-Host "Operation cancelled" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 0
}

Write-Host ""
Write-Host "Rebuilding database..." -ForegroundColor Yellow
Write-Host ""

try {
    $sqlFile = Join-Path $PSScriptRoot "database\version5.sql"
    
    if (-not (Test-Path $sqlFile)) {
        Write-Host "ERROR: SQL file not found: $sqlFile" -ForegroundColor Red
        pause
        exit 1
    }
    
    Write-Host "SQL file: $sqlFile" -ForegroundColor Cyan
    Write-Host ""
    
    # Get MySQL password
    Write-Host "Enter MySQL root password:" -ForegroundColor Yellow
    $password = Read-Host -AsSecureString
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
    
    Write-Host ""
    Write-Host "Executing SQL script..." -ForegroundColor Cyan
    
    # Execute SQL via pipeline
    $sqlContent = Get-Content $sqlFile -Raw -Encoding UTF8
    $output = $sqlContent | & mysql -u root "-p$plainPassword" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "  Database Rebuild Successful!" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Completed operations:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  - Deleted old mydb database" -ForegroundColor White
        Write-Host "  - Created new mydb (Version 5.0)" -ForegroundColor White
        Write-Host "  - Created all table structures" -ForegroundColor White
        Write-Host "  - Inserted default data" -ForegroundColor White
        Write-Host "  - Created views and stored procedures" -ForegroundColor White
        Write-Host ""
        
        Write-Host "Version 5.0 Improvements:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  - Picture fields: VARCHAR(500) -> LONGTEXT" -ForegroundColor White
        Write-Host "  - Stock management: Auto-maintained" -ForegroundColor White
        Write-Host "  - Brand optimization: Auto-increment + Unique" -ForegroundColor White
        Write-Host "  - Category examples: Complete 3-level structure" -ForegroundColor White
        Write-Host "  - New view: Product stock summary" -ForegroundColor White
        Write-Host "  - Stored procedure: Stock sync tool" -ForegroundColor White
        Write-Host ""
        
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  1. Restart backend:" -ForegroundColor White
        Write-Host "     .\start-backend.ps1" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  2. Test the system" -ForegroundColor White
        Write-Host ""
        
    } else {
        Write-Host ""
        Write-Host "ERROR: Database rebuild failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error message:" -ForegroundColor Yellow
        Write-Host $output -ForegroundColor Red
        Write-Host ""
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  1. Wrong MySQL password" -ForegroundColor White
        Write-Host "  2. Insufficient permissions" -ForegroundColor White
        Write-Host "  3. SQL file format error" -ForegroundColor White
        Write-Host ""
        pause
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Exception occurred: $_" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
pause
