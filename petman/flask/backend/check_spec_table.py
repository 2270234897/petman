"""检查spec表的列结构"""
import pymysql
from db_config import MYSQL_CONFIG

try:
    connection = pymysql.connect(**MYSQL_CONFIG)
    with connection.cursor() as cursor:
        # 查看spec表结构
        cursor.execute("DESCRIBE spec")
        columns = cursor.fetchall()
        
        print("\nspec表的列结构:")
        print("-" * 60)
        for col in columns:
            print(f"  列名: {col['Field']:<20} 类型: {col['Type']:<15} 允许NULL: {col['Null']}")
        print("-" * 60)
        
        # 查看实际数据示例
        cursor.execute("SELECT * FROM spec LIMIT 1")
        sample = cursor.fetchone()
        if sample:
            print("\n示例数据:")
            for key, value in sample.items():
                print(f"  {key}: {value}")
        else:
            print("\nspec表当前没有数据")
            
finally:
    if connection:
        connection.close()



