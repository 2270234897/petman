#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""测试关键API端点"""

import requests

APIS = [
    ("产品API", "http://localhost:5000/api/inventory/products"),
    ("品牌API", "http://localhost:5000/api/inventory/brands"),
    ("分类API", "http://localhost:5000/api/inventory/classify"),
    ("客户API", "http://localhost:5000/api/customers/get"),
    ("宠物API", "http://localhost:5000/api/pets/"),
]

print("\n" + "="*50)
print("   测试关键API端点")
print("="*50 + "\n")

all_ok = True
for i, (name, url) in enumerate(APIS, 1):
    print(f"[{i}/{len(APIS)}] 测试 {name}...")
    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                count = len(data.get('data', []))
                print(f"  [OK] {name} 正常 (返回 {count} 条记录)")
            else:
                print(f"  [失败] {name} 状态异常: {data.get('status')}")
                all_ok = False
        else:
            print(f"  [失败] {name} HTTP错误: {response.status_code}")
            all_ok = False
    except Exception as e:
        print(f"  [失败] {name} 异常: {e}")
        all_ok = False

print("\n" + "="*50)
if all_ok:
    print("[成功] 所有API测试通过！")
else:
    print("[警告] 部分API测试失败")
print("="*50 + "\n")

