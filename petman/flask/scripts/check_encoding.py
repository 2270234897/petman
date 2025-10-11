#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""检查数据库编码问题"""

import pymysql
from backend.db_config import MYSQL_CONFIG

try:
    conn = pymysql.connect(**MYSQL_CONFIG)
    cursor = conn.cursor()
    
    # 检查数据库字符集
    cursor.execute("SHOW VARIABLES LIKE 'character_set%'")
    charset_vars = cursor.fetchall()
    print("数据库字符集配置:")
    for var in charset_vars:
        print(f"  {var['Variable_name']}: {var['Value']}")
    
    print("\n" + "="*50)
    
    # 检查分类数据
    cursor.execute("SELECT classify1_ID, name FROM classify_level1 LIMIT 5")
    rows = cursor.fetchall()
    print("\n分类数据 (原始):")
    for row in rows:
        print(f"  ID: {row['classify1_ID']}")
        print(f"  名称原始: {repr(row['name'])}")
        print(f"  名称显示: {row['name']}")
        print()
    
    # 检查品牌数据
    cursor.execute("SELECT brandID, brandname FROM brand LIMIT 3")
    brands = cursor.fetchall()
    print("品牌数据:")
    for brand in brands:
        print(f"  ID: {brand['brandID']}")
        print(f"  名称原始: {repr(brand['brandname'])}")
        print(f"  名称显示: {brand['brandname']}")
        print()
        
finally:
    if conn:
        conn.close()


