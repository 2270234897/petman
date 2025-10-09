#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""检查前后端服务状态"""

import requests
import time

def check_service(name, url):
    """检查单个服务"""
    try:
        response = requests.get(url, timeout=3)
        print(f"  [OK] {name} 运行正常 (状态码: {response.status_code})")
        return True
    except requests.exceptions.ConnectionError:
        print(f"  [失败] {name} 无法连接")
        return False
    except requests.exceptions.Timeout:
        print(f"  [失败] {name} 请求超时")
        return False
    except Exception as e:
        print(f"  [失败] {name} 错误: {e}")
        return False

if __name__ == "__main__":
    print("\n" + "="*50)
    print("   前后端服务状态检查")
    print("="*50 + "\n")
    
    time.sleep(2)
    
    print("[1/2] 检查后端服务 (http://localhost:5000)...")
    backend_ok = check_service("后端", "http://localhost:5000")
    
    print("\n[2/2] 检查前端服务 (http://localhost:5173)...")
    frontend_ok = check_service("前端", "http://localhost:5173")
    
    print("\n" + "="*50)
    print("访问地址:")
    print("  前端: http://localhost:5173")
    print("  后端: http://localhost:5000")
    print("="*50 + "\n")
    
    if backend_ok and frontend_ok:
        print("[成功] 所有服务运行正常！\n")
    else:
        print("[警告] 部分服务未正常运行\n")



