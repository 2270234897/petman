#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""添加示例数据"""

import pymysql
from backend.db_config import MYSQL_CONFIG
from datetime import datetime

def add_sample_data():
    """添加示例数据"""
    try:
        conn = pymysql.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        
        print("开始添加示例数据...")
        
        # 禁用外键检查
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        # 1. 添加示例客户
        print("\n[1/4] 添加示例客户...")
        customers = [
            ('张三', '男', '北京市朝阳区', '13800138001', 2, 500.00),
            ('李四', '女', '上海市浦东新区', '13800138002', 1, 200.00),
            ('王五', '男', '广州市天河区', '13800138003', 3, 1000.00),
        ]
        
        for customer in customers:
            cursor.execute("""
                INSERT INTO customers (customername, gender, address, telphone, Membershiplevel, membership_balance)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, customer)
            print(f"  添加客户: {customer[0]}")
        
        # 2. 添加示例宠物
        print("\n[2/4] 添加示例宠物...")
        pets = [
            (1, '小白', '狗', '金毛', '公', 2, False, '活泼好动'),
            (2, '咪咪', '猫', '英短', '母', 1, False, '温顺可爱'),
            (3, '小黑', '狗', '哈士奇', '公', 3, True, '调皮捣蛋'),
        ]
        
        for pet in pets:
            cursor.execute("""
                INSERT INTO pets (customer_id, petname, pet_species, pet_breeds, pet_gender, pet_age, neuter, pet_character)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, pet)
            print(f"  添加宠物: {pet[1]} (主人ID: {pet[0]})")
        
        # 3. 添加示例产品
        print("\n[3/4] 添加示例产品...")
        products = [
            ('皇家幼犬粮', 1, 24, '进口', 1),  # 宠物用品 > 食品 > 狗粮
            ('希尔斯成猫粮', 2, 18, '进口', 2),  # 宠物用品 > 食品 > 猫粮
            ('狗咬胶玩具', 3, None, '国产', 3),  # 宠物用品 > 玩具 > 狗玩具
        ]
        
        for product in products:
            cursor.execute("""
                INSERT INTO product (product_name, classify_level1_classify1_ID, product_baozhiqi, local, brand_brandID)
                VALUES (%s, %s, %s, %s, %s)
            """, product)
            print(f"  添加产品: {product[0]}")
        
        # 4. 添加示例规格
        print("\n[4/4] 添加示例规格...")
        # 获取刚插入的产品ID
        cursor.execute("SELECT productID FROM product ORDER BY productID DESC LIMIT 3")
        product_ids = [row['productID'] for row in cursor.fetchall()]
        
        specs = [
            (product_ids[0], '重量', '2.5kg', '1234567890123'),  # 皇家幼犬粮
            (product_ids[0], '重量', '5kg', '1234567890124'),   # 皇家幼犬粮
            (product_ids[1], '重量', '3.5kg', '1234567890125'), # 希尔斯成猫粮
            (product_ids[2], '尺寸', '大号', '1234567890126'),   # 狗咬胶玩具
        ]
        
        for i, spec in enumerate(specs, 1):
            cursor.execute("""
                INSERT INTO spec (specID, product_productID, spec_name, spec_value, barcode)
                VALUES (%s, %s, %s, %s, %s)
            """, (i, spec[0], spec[1], spec[2], spec[3]))
            print(f"  添加规格: {spec[1]} - {spec[2]}")
        
        # 重新启用外键检查
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        
        # 提交事务
        conn.commit()
        print("\n[成功] 示例数据添加完成！")
        
        # 验证数据
        print("\n数据统计:")
        cursor.execute("SELECT COUNT(*) as count FROM customers")
        customer_count = cursor.fetchone()['count']
        print(f"  客户数量: {customer_count}")
        
        cursor.execute("SELECT COUNT(*) as count FROM pets")
        pet_count = cursor.fetchone()['count']
        print(f"  宠物数量: {pet_count}")
        
        cursor.execute("SELECT COUNT(*) as count FROM product")
        product_count = cursor.fetchone()['count']
        print(f"  产品数量: {product_count}")
        
        cursor.execute("SELECT COUNT(*) as count FROM spec")
        spec_count = cursor.fetchone()['count']
        print(f"  规格数量: {spec_count}")
        
    except Exception as e:
        print(f"[失败] 添加数据时出现错误: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    add_sample_data()


