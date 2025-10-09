"""
测试Flask API端点
Test Flask API Endpoints
"""

import requests
import time
import sys

# 服务器配置
BASE_URL = "http://localhost:5000"
API_URL = f"{BASE_URL}/api"

# 测试端点列表
ENDPOINTS = {
    "客户管理": [
        ("GET", "/api/customers/get", "获取客户列表"),
    ],
    "宠物管理": [
        ("GET", "/api/pets/", "获取宠物列表"),
    ],
    "预约管理": [
        ("GET", "/api/appointments/get", "获取预约列表"),
        ("GET", "/api/appointments/services/get", "获取服务列表"),
    ],
    "库存管理": [
        ("GET", "/api/inventory/classify", "获取分类列表"),
        ("GET", "/api/inventory/brands", "获取品牌列表"),
        ("GET", "/api/inventory/products", "获取产品列表"),
        ("GET", "/api/inventory/dealers", "获取经销商列表"),
        ("GET", "/api/inventory/spec-types", "获取规格类型列表"),
    ],
}

def wait_for_server(max_wait=30):
    """等待服务器启动"""
    print("等待Flask服务器启动...")
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        try:
            response = requests.get(BASE_URL, timeout=1)
            print("[成功] 服务器已启动！")
            return True
        except requests.exceptions.ConnectionError:
            time.sleep(1)
            print(".", end="", flush=True)
        except Exception as e:
            print(f"\n[警告] 连接异常: {e}")
            time.sleep(1)
    
    print(f"\n[失败] 服务器在{max_wait}秒内未启动")
    return False

def test_endpoint(method, endpoint, description):
    """测试单个API端点"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json={}, timeout=5)
        else:
            print(f"  [跳过] 不支持的方法: {method}")
            return None
        
        # 检查状态码
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('status') == 'success':
                    data_count = len(data.get('data', []))
                    print(f"  [OK] {description} - 返回 {data_count} 条记录")
                    return True
                else:
                    print(f"  [警告] {description} - 状态: {data.get('status')}")
                    return False
            except:
                print(f"  [OK] {description} - 返回HTML页面")
                return True
        else:
            print(f"  [失败] {description} - HTTP {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"  [失败] {description} - 请求超时")
        return False
    except requests.exceptions.ConnectionError:
        print(f"  [失败] {description} - 无法连接服务器")
        return False
    except Exception as e:
        print(f"  [失败] {description} - {type(e).__name__}: {str(e)}")
        return False

def run_tests():
    """运行所有测试"""
    print("=" * 60)
    print("Flask API 测试")
    print("=" * 60)
    
    # 等待服务器启动
    if not wait_for_server():
        print("\n[失败] 无法连接到Flask服务器")
        print("请确保服务器正在运行: python backend/app.py")
        return False
    
    print(f"\n服务器地址: {BASE_URL}")
    print("=" * 60)
    
    # 测试所有端点
    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    
    for category, endpoints in ENDPOINTS.items():
        print(f"\n【{category}】")
        for method, endpoint, description in endpoints:
            total_tests += 1
            result = test_endpoint(method, endpoint, description)
            if result is True:
                passed_tests += 1
            elif result is False:
                failed_tests += 1
    
    # 汇总结果
    print("\n" + "=" * 60)
    print("测试汇总")
    print("=" * 60)
    print(f"总测试数: {total_tests}")
    print(f"通过: {passed_tests}")
    print(f"失败: {failed_tests}")
    print(f"跳过: {total_tests - passed_tests - failed_tests}")
    
    if failed_tests == 0:
        print("\n[成功] 所有API测试通过！")
        return True
    else:
        print(f"\n[警告] 有 {failed_tests} 个测试失败")
        return False

if __name__ == '__main__':
    try:
        success = run_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n测试被用户中断")
        sys.exit(1)



