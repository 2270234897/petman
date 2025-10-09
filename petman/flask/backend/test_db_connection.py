"""
测试数据库连接
Test Database Connection for WSL MySQL
"""

import pymysql
from db_config import MYSQL_CONFIG
import sys

def test_connection():
    """测试数据库连接"""
    print("=" * 60)
    print("测试数据库连接 (Testing Database Connection)")
    print("=" * 60)
    
    # 打印配置信息（隐藏密码）
    print(f"\n连接配置:")
    print(f"  主机 (Host): {MYSQL_CONFIG['host']}")
    print(f"  端口 (Port): {MYSQL_CONFIG['port']}")
    print(f"  用户 (User): {MYSQL_CONFIG['user']}")
    print(f"  数据库 (Database): {MYSQL_CONFIG['database']}")
    print(f"  字符集 (Charset): {MYSQL_CONFIG['charset']}")
    
    connection = None
    try:
        print("\n正在连接数据库...")
        connection = pymysql.connect(**MYSQL_CONFIG)
        print("[成功] 数据库连接成功！")
        
        with connection.cursor() as cursor:
            # 测试查询
            print("\n执行测试查询...")
            
            # 1. 查询数据库版本
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"  MySQL版本: {version['VERSION()']}")
            
            # 2. 查询当前数据库
            cursor.execute("SELECT DATABASE()")
            db = cursor.fetchone()
            print(f"  当前数据库: {db['DATABASE()']}")
            
            # 3. 查询所有表
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"\n  数据库中的表 (共{len(tables)}个):")
            for table in tables:
                table_name = list(table.values())[0]
                cursor.execute(f"SELECT COUNT(*) as count FROM `{table_name}`")
                count = cursor.fetchone()['count']
                print(f"    - {table_name}: {count} 条记录")
            
            # 4. 测试客户表
            print("\n测试读取customers表...")
            cursor.execute("SELECT COUNT(*) as count FROM customers")
            customer_count = cursor.fetchone()['count']
            print(f"  [OK] 客户数量: {customer_count}")
            
            # 5. 测试产品表
            print("\n测试读取product表...")
            cursor.execute("SELECT COUNT(*) as count FROM product")
            product_count = cursor.fetchone()['count']
            print(f"  [OK] 产品数量: {product_count}")
            
            # 6. 测试宠物表
            print("\n测试读取pets表...")
            cursor.execute("SELECT COUNT(*) as count FROM pets")
            pets_count = cursor.fetchone()['count']
            print(f"  [OK] 宠物数量: {pets_count}")
            
        print("\n" + "=" * 60)
        print("[成功] 所有测试通过！数据库连接正常")
        print("=" * 60)
        return True
        
    except pymysql.err.OperationalError as e:
        print(f"\n[失败] 数据库连接失败 (OperationalError):")
        print(f"  错误代码: {e.args[0]}")
        print(f"  错误信息: {e.args[1]}")
        print("\n可能的原因:")
        print("  1. WSL中的MySQL服务未启动")
        print("     解决: 在WSL中运行 'sudo service mysql start'")
        print("  2. MySQL未绑定到0.0.0.0")
        print("     解决: 检查 /etc/mysql/mysql.conf.d/mysqld.cnf 中的 bind-address")
        print("  3. 用户名或密码错误")
        print("  4. 数据库不存在")
        return False
        
    except pymysql.err.ProgrammingError as e:
        print(f"\n[失败] SQL语法错误 (ProgrammingError):")
        print(f"  错误信息: {e}")
        return False
        
    except Exception as e:
        print(f"\n[失败] 发生未知错误:")
        print(f"  错误类型: {type(e).__name__}")
        print(f"  错误信息: {e}")
        return False
        
    finally:
        if connection:
            connection.close()
            print("\n数据库连接已关闭")

if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)

