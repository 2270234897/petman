@echo off
chcp 65001 >nul
echo ====================================
echo    宠物管理系统 - 后端启动脚本
echo ====================================
echo.

REM 检查WSL MySQL是否运行
echo [1/3] 检查WSL MySQL服务...
wsl sudo service mysql status >nul 2>&1
if errorlevel 1 (
    echo MySQL未运行，正在启动...
    wsl sudo service mysql start
    timeout /t 2 /nobreak >nul
) else (
    echo ✓ MySQL已运行
)

REM 测试数据库连接
echo.
echo [2/3] 测试数据库连接...
python backend\test_db_connection.py
if errorlevel 1 (
    echo.
    echo ✗ 数据库连接失败，请检查配置
    pause
    exit /b 1
)

REM 启动Flask服务
echo.
echo [3/3] 启动Flask后端服务...
echo.
echo 服务将在 http://localhost:5000 启动
echo 按 Ctrl+C 停止服务
echo.
echo ====================================
echo.

python backend\app.py



