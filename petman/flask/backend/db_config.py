"""
数据库配置文件
Database Configuration for Pet Management System

配置说明：
1. WSL环境下使用 localhost 或 127.0.0.1
2. 如果连接失败，请检查：
   - WSL中MySQL是否绑定到 0.0.0.0 (而不是仅127.0.0.1)
   - 检查MySQL配置文件 /etc/mysql/mysql.conf.d/mysqld.cnf 中的 bind-address
   - 确保Windows防火墙允许3306端口
   - 可以使用 `wsl hostname -I` 查看WSL的IP地址
"""

import os
from pymysql.cursors import DictCursor
from pymysql.constants import CLIENT

# 数据库配置
MYSQL_CONFIG = {
    # WSL环境下使用localhost，WSL2会自动进行端口转发
    'host': os.getenv('DB_HOST', 'localhost'),  # 或使用 '127.0.0.1'
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'FANG'),
    'password': os.getenv('DB_PASSWORD', 'Fang11243.'),
    'database': os.getenv('DB_NAME', 'mydb'),
    'charset': 'utf8mb4',
    'cursorclass': DictCursor,
    'client_flag': CLIENT.MULTI_STATEMENTS,
}

# 备选配置：如果localhost不工作，可以尝试使用WSL的IP地址
# 获取WSL IP的方法：在PowerShell中运行 wsl hostname -I
# 然后将第一个IP地址填入下面的配置
WSL_IP_CONFIG = {
    'host': 'WSL的IP地址',  # 例如：'172.x.x.x'
    'port': 3306,
    'user': 'FANG',
    'password': 'Fang11243.',
    'database': 'mydb',
    'charset': 'utf8mb4',
    'cursorclass': DictCursor,
    'client_flag': CLIENT.MULTI_STATEMENTS,
}

def get_db_config():
    """
    获取数据库配置
    可以根据环境变量决定使用哪个配置
    """
    use_wsl_ip = os.getenv('USE_WSL_IP', 'false').lower() == 'true'
    return WSL_IP_CONFIG if use_wsl_ip else MYSQL_CONFIG



