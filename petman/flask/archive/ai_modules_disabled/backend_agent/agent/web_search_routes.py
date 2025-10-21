"""
网络搜索API路由 - AI联网搜索商品并自动创建
"""

from flask import Blueprint, request, jsonify
import pymysql
from db_config import MYSQL_CONFIG
from .web_search_agent import WebSearchAgent
from .product_extractor import ProductExtractor

web_search_bp = Blueprint('web_search', __name__, url_prefix='/api/search')

# 初始化搜索代理
try:
    search_agent = WebSearchAgent()
    product_extractor = ProductExtractor()
    print("[Web Search] 搜索代理初始化成功")
except Exception as e:
    print(f"[Web Search] 初始化失败: {e}")
    search_agent = None
    product_extractor = None


@web_search_bp.route('/product', methods=['POST'])
def search_product():
    """
    搜索商品信息
    
    Request:
        {
            "query": "皇家猫粮成猫2kg"
        }
    
    Response:
        {
            "success": true,
            "product_data": {...},
            "search_query": "原始查询"
        }
    """
    if not search_agent:
        return jsonify({
            'error': 'AI搜索服务未初始化，请配置GEMINI_API_KEY'
        }), 503
    
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({'error': '请提供商品名称'}), 400
        
        print(f"\n[Search Product] 搜索查询: {query}")
        
        # AI联网搜索
        result = search_agent.search_and_extract_product(query)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'error': result.get('error', '搜索失败')
            }), 500
        
        product_data = result['product_data']
        
        print(f"[Search Product] 找到商品: {product_data.get('product_name')}")
        
        return jsonify({
            'success': True,
            'product_data': product_data,
            'search_query': query,
            'raw_response': result.get('raw_response')
        })
        
    except Exception as e:
        print(f"[Search Product] 错误: {str(e)}")
        return jsonify({'error': str(e)}), 500


@web_search_bp.route('/product/quick', methods=['POST'])
def quick_search():
    """快速搜索"""
    if not search_agent:
        return jsonify({'error': 'AI搜索服务未初始化'}), 503
    
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({'error': '请提供商品名称'}), 400
        
        result = search_agent.quick_search(query)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@web_search_bp.route('/product/compare-prices', methods=['POST'])
def compare_prices():
    """价格对比"""
    if not search_agent:
        return jsonify({'error': 'AI搜索服务未初始化'}), 503
    
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({'error': '请提供商品名称'}), 400
        
        result = search_agent.compare_prices(query)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@web_search_bp.route('/product/create-from-search', methods=['POST'])
def create_product_from_search():
    """
    AI搜索并创建商品（一键创建）
    
    Request:
        {
            "query": "皇家猫粮成猫2kg",
            "auto_save": true,
            "initial_stock": 10  # 可选，初始库存
        }
    
    Response:
        {
            "success": true,
            "product_id": 123,
            "spec_id": 456,
            "message": "商品创建成功",
            "product_data": {...}
        }
    """
    if not search_agent:
        return jsonify({'error': 'AI搜索服务未初始化'}), 503
    
    connection = None
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        auto_save = data.get('auto_save', True)
        initial_stock = data.get('initial_stock', 0)
        
        if not query:
            return jsonify({'error': '请提供商品名称'}), 400
        
        print(f"\n[Create from Search] 开始搜索并创建: {query}")
        
        # 1. AI联网搜索商品信息
        search_result = search_agent.search_and_extract_product(query)
        
        if not search_result['success']:
            return jsonify({
                'success': False,
                'error': '搜索失败: ' + search_result.get('error', '未知错误')
            }), 500
        
        product_data = search_result['product_data']
        
        # 如果不自动保存，只返回搜索结果
        if not auto_save:
            return jsonify({
                'success': True,
                'product_data': product_data,
                'message': '商品信息已找到，请确认后保存',
                'auto_saved': False
            })
        
        # 2. 自动保存到数据库
        print("[Create from Search] 开始保存到数据库...")
        
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 处理品牌
            brand_name = product_data.get('brand', '未知品牌')
            cursor.execute("SELECT brandID FROM brand WHERE brandName = %s", (brand_name,))
            brand_result = cursor.fetchone()
            
            if brand_result:
                brand_id = brand_result['brandID']
            else:
                cursor.execute("INSERT INTO brand (brandName) VALUES (%s)", (brand_name,))
                brand_id = cursor.lastrowid
                print(f"[Create from Search] 创建新品牌: {brand_name}")
            
            # 处理分类
            category_name = product_data.get('category', '其他')
            cursor.execute("SELECT classify1_ID FROM classify_level1 WHERE classify1_name = %s", (category_name,))
            classify_result = cursor.fetchone()
            
            if classify_result:
                classify_id = classify_result['classify1_ID']
            else:
                cursor.execute("INSERT INTO classify_level1 (classify1_name) VALUES (%s)", (category_name,))
                classify_id = cursor.lastrowid
                print(f"[Create from Search] 创建新分类: {category_name}")
            
            # 创建商品
            product_name = product_data.get('product_name')
            shelf_life = product_data.get('shelf_life')
            origin = product_data.get('origin', '')
            
            # 组合产品详情
            features = product_data.get('features', '')
            ingredients = product_data.get('ingredients', '')
            additional_info = product_data.get('additional_info', '')
            
            product_details = f"{features}\n\n成分：{ingredients}\n\n{additional_info}".strip()
            
            sql = """
            INSERT INTO product (product_name, classify_level1_classify1_ID, product_baozhiqi, local, brand_brandID, product_details)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                product_name,
                classify_id,
                shelf_life,
                origin,
                brand_id,
                product_details
            ))
            
            product_id = cursor.lastrowid
            print(f"[Create from Search] 创建商品成功: {product_name} (ID: {product_id})")
            
            # 创建规格
            specification = product_data.get('specification', '标准规格')
            barcode = product_data.get('barcode', '')
            
            # 使用建议零售价作为单价
            unit_price = product_data.get('suggested_retail_price', 0)
            
            spec_sql = """
            INSERT INTO spec (product_productID, barcode, spec_info, spec_quantity)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(spec_sql, (
                product_id,
                barcode if barcode else 0,
                specification,
                1
            ))
            spec_id = cursor.lastrowid
            
            # 如果指定了初始库存，创建库存记录
            if initial_stock > 0:
                stock_sql = """
                INSERT INTO stock (spec_specID, stock_quantity, stock_price)
                VALUES (%s, %s, %s)
                """
                cursor.execute(stock_sql, (spec_id, initial_stock, unit_price))
                print(f"[Create from Search] 创建初始库存: {initial_stock}件")
            
        connection.commit()
        
        # 返回完整信息
        return jsonify({
            'success': True,
            'product_id': product_id,
            'spec_id': spec_id,
            'message': f'✅ 商品 "{product_name}" 已成功创建！',
            'product_data': product_data,
            'auto_saved': True,
            'details': {
                'brand': brand_name,
                'category': category_name,
                'specification': specification,
                'price': unit_price,
                'initial_stock': initial_stock,
                'market_price_range': f"¥{product_data.get('market_price_min', 0)} - ¥{product_data.get('market_price_max', 0)}",
                'search_confidence': product_data.get('search_confidence', '中')
            }
        })
        
    except Exception as e:
        if connection:
            connection.rollback()
        print(f"[Create from Search] 错误: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()


@web_search_bp.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({
        'status': 'ok' if search_agent else 'error',
        'message': '搜索服务运行正常' if search_agent else '搜索服务未初始化',
        'features': {
            'google_search': True,
            'product_extraction': True,
            'auto_create': True,
            'price_comparison': True
        }
    })

