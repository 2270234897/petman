# PowerShell Script: Rebuild Database (Docker Version)
# For MySQL running in Docker container

Write-Host "================================================" -ForegroundColor Red
Write-Host "  Database Rebuild Tool - Version 5.0 (Docker)" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""
Write-Host "WARNING: This will delete the existing mydb database!" -ForegroundColor Yellow
Write-Host "All data will be cleared. Please backup important data!" -ForegroundColor Yellow
Write-Host ""

# Check if Docker is running
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop first." -ForegroundColor Yellow
        Write-Host ""
        pause
        exit 1
    }
} catch {
    Write-Host "ERROR: Docker is not installed or not running!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Docker is running" -ForegroundColor Green
Write-Host ""

# Find MySQL container
Write-Host "Looking for MySQL container..." -ForegroundColor Cyan
$containers = docker ps --format "{{.Names}}" | Select-String -Pattern "mysql|mariadb|db"

if ($containers) {
    Write-Host "Found MySQL containers:" -ForegroundColor Green
    $containerList = @($containers)
    for ($i = 0; $i -lt $containerList.Count; $i++) {
        Write-Host "  $($i + 1). $($containerList[$i])" -ForegroundColor White
    }
    Write-Host ""
    
    if ($containerList.Count -eq 1) {
        $containerName = $containerList[0].ToString()
        Write-Host "Using container: $containerName" -ForegroundColor Green
    } else {
        $selection = Read-Host "Select container number (1-$($containerList.Count))"
        $containerName = $containerList[[int]$selection - 1].ToString()
    }
} else {
    Write-Host "No MySQL container found. Please enter container name:" -ForegroundColor Yellow
    $containerName = Read-Host "Container name"
}

Write-Host ""
Write-Host "Using MySQL container: $containerName" -ForegroundColor Cyan
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
    Write-Host "Copying SQL file to container..." -ForegroundColor Cyan
    
    # Copy SQL file to container
    docker cp $sqlFile "${containerName}:/tmp/version5.sql"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to copy SQL file to container" -ForegroundColor Red
        pause
        exit 1
    }
    
    Write-Host "Executing SQL script in container..." -ForegroundColor Cyan
    Write-Host ""
    
    # Execute SQL in container
    $output = docker exec -i $containerName mysql -u root "-p$plainPassword" -e "source /tmp/version5.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0 -or ($output -match "成功|Status")) {
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
        Write-Host "  1. Restart backend service:" -ForegroundColor White
        Write-Host "     .\start-backend.ps1" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  2. Test the system" -ForegroundColor White
        Write-Host ""
        
        # Clean up temp file
        docker exec $containerName rm /tmp/version5.sql 2>&1 | Out-Null
        
    } else {
        Write-Host ""
        Write-Host "ERROR: Database rebuild failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error output:" -ForegroundColor Yellow
        Write-Host $output -ForegroundColor Red
        Write-Host ""
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  1. Wrong MySQL password" -ForegroundColor White
        Write-Host "  2. Container name incorrect" -ForegroundColor White
        Write-Host "  3. SQL file format error" -ForegroundColor White
        Write-Host ""
        
        # Clean up temp file
        docker exec $containerName rm /tmp/version5.sql 2>&1 | Out-Null
        
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

