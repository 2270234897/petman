#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""修复数据库编码问题"""

import pymysql
from backend.db_config import MYSQL_CONFIG

# 正确的分类数据
CLASSIFY_DATA = [
    (1, '宠物用品', None),
    (2, '食品', 1),
    (3, '玩具', 1),
    (4, '护理用品', 1),
    (5, '狗粮', 2),
    (6, '猫粮', 2),
    (7, '狗玩具', 3),
    (8, '猫玩具', 3),
]

# 正确的品牌数据
BRAND_DATA = [
    (1, '皇家'),
    (2, '希尔斯'),
    (3, '冠能'),
    (4, '比瑞吉'),
    (5, '麦顿'),
    (6, '其他'),
]

def fix_encoding():
    """修复编码问题"""
    try:
        conn = pymysql.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        
        print("开始修复编码问题...")
        
        # 禁用外键检查
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        # 1. 清空并重新插入分类数据
        print("\n[1/2] 修复分类数据...")
        cursor.execute("DELETE FROM classify_level1")
        
        for classify_id, name, parent_id in CLASSIFY_DATA:
            cursor.execute(
                "INSERT INTO classify_level1 (classify1_ID, name, parentID) VALUES (%s, %s, %s)",
                (classify_id, name, parent_id)
            )
            print(f"  插入分类: {name} (ID: {classify_id})")
        
        # 2. 清空并重新插入品牌数据
        print("\n[2/2] 修复品牌数据...")
        cursor.execute("DELETE FROM brand")
        
        for brand_id, brand_name in BRAND_DATA:
            cursor.execute(
                "INSERT INTO brand (brandID, brandname) VALUES (%s, %s)",
                (brand_id, brand_name)
            )
            print(f"  插入品牌: {brand_name} (ID: {brand_id})")
        
        # 重新启用外键检查
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        
        # 提交事务
        conn.commit()
        print("\n[成功] 编码问题修复完成！")
        
        # 验证修复结果
        print("\n验证修复结果:")
        cursor.execute("SELECT classify1_ID, name FROM classify_level1 ORDER BY classify1_ID")
        results = cursor.fetchall()
        for row in results:
            print(f"  分类ID {row['classify1_ID']}: {row['name']}")
        
    except Exception as e:
        print(f"[失败] 修复过程中出现错误: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    fix_encoding()
