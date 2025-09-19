# inventory_py.py
from flask import Blueprint, jsonify, request, render_template
import pymysql
from pymysql.cursors import DictCursor
from datetime import datetime

inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')

MYSQL_CONFIG = {
    'host': '192.168.1.15',
    'port': 3306,
    'user': 'FANG',
    'password': 'Fang11243.',
    'database': 'mydb',
    'charset': 'utf8mb4',
    'cursorclass': DictCursor,
}

@inventory_bp.route('/view')
def inventory_view():
    return render_template('inventory_html.html')

# 分类管理接口
@inventory_bp.route('/classify', methods=['GET'])
def get_classify():
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            SELECT c1.classify1_ID, c1.name, c2.name as parent_name
            FROM classify_level1 c1
            LEFT JOIN classify_level1 c2 ON c1.parentID = c2.classify1_ID
            ORDER BY c1.classify1_ID
            """
            cursor.execute(sql)
            data = cursor.fetchall()
            return jsonify({
                'status': 'success',
                'data': data
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/classify', methods=['POST'])
def add_classify():
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = "INSERT INTO classify_level1 (name, parentID) VALUES (%s, %s)"
            cursor.execute(sql, (data['name'], data.get('parentID')))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '分类添加成功'
            })
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/classify/<int:classify_id>', methods=['PUT'])
def update_classify(classify_id):
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = "UPDATE classify_level1 SET name=%s, parentID=%s WHERE classify1_ID=%s"
            cursor.execute(sql, (data['name'], data.get('parentID'), classify_id))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '分类更新成功'
            })
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/classify/<int:classify_id>', methods=['DELETE'])
def delete_classify(classify_id):
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 检查是否有产品引用该分类
            check_sql = "SELECT COUNT(*) as count FROM product WHERE classify_level1_classify1_ID = %s"
            cursor.execute(check_sql, (classify_id,))
            result = cursor.fetchone()
            
            if result['count'] > 0:
                return jsonify({
                    'status': 'error',
                    'message': f'无法删除分类，有{result["count"]}个产品正在使用此分类，请先删除相关产品或修改产品分类后再尝试删除'
                }), 400
            
            # 检查是否有子分类引用该分类作为父分类
            check_parent_sql = "SELECT COUNT(*) as count FROM classify_level1 WHERE parentID = %s"
            cursor.execute(check_parent_sql, (classify_id,))
            parent_result = cursor.fetchone()
            
            if parent_result['count'] > 0:
                return jsonify({
                    'status': 'error',
                    'message': f'无法删除分类，有{parent_result["count"]}个子分类正在引用此分类作为父分类，请先处理子分类后再尝试删除'
                }), 400
            
            # 如果没有关联数据，则可以安全删除
            sql = "DELETE FROM classify_level1 WHERE classify1_ID=%s"
            cursor.execute(sql, (classify_id,))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '分类删除成功'
            })
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

# 品牌管理接口
@inventory_bp.route('/brands', methods=['GET'])
def get_brands():
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = "SELECT brandID, brandname FROM brand ORDER BY brandID"
            cursor.execute(sql)
            data = cursor.fetchall()
            return jsonify({
                'status': 'success',
                'data': data
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/brands', methods=['POST'])
def add_brand():
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 修复：brand表的brandID不是自增字段，需要指定ID值
            # 获取当前最大brandID并加1
            cursor.execute("SELECT MAX(brandID) as max_id FROM brand")
            result = cursor.fetchone()
            new_id = (result['max_id'] or 0) + 1
            
            sql = "INSERT INTO brand (brandID, brandname) VALUES (%s, %s)"
            cursor.execute(sql, (new_id, data['brandname']))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '品牌添加成功',
                'brand_id': new_id
            })
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/brands/<int:brand_id>', methods=['PUT'])
def update_brand(brand_id):
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = "UPDATE brand SET brandname=%s WHERE brandID=%s"
            cursor.execute(sql, (data['brandname'], brand_id))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '品牌更新成功'
            })
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/brands/<int:brand_id>', methods=['DELETE'])
def delete_brand(brand_id):
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 检查是否有产品引用该品牌
            check_sql = "SELECT COUNT(*) as count FROM product WHERE brand_brandID = %s"
            cursor.execute(check_sql, (brand_id,))
            result = cursor.fetchone()
            
            if result['count'] > 0:
                return jsonify({
                    'status': 'error',
                    'message': f'无法删除品牌，有{result["count"]}个产品正在使用此品牌，请先删除相关产品或修改产品品牌后再尝试删除'
                }), 409
            
            # 如果没有关联数据，则可以安全删除
            sql = "DELETE FROM brand WHERE brandID=%s"
            cursor.execute(sql, (brand_id,))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '品牌删除成功'
            }), 200
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

# 产品管理接口
@inventory_bp.route('/products', methods=['GET'])
def get_products():
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 获取所有产品信息
            product_sql = """
            SELECT p.productID, p.product_name, p.classify_level1_classify1_ID, 
                   c.name AS classify_name, p.brand_brandID, b.brandname, 
                   p.product_baozhiqi, p.local
            FROM product p
            JOIN classify_level1 c ON p.classify_level1_classify1_ID = c.classify1_ID
            JOIN brand b ON p.brand_brandID = b.brandID
            ORDER BY p.productID
            """
            cursor.execute(product_sql)
            products = cursor.fetchall()
            
            # 获取所有规格信息
            spec_sql = """
            SELECT s.specID, s.product_productID, s.spec_name, s.spec_value, 
                   s.barcode, s.picture, s.总库存
            FROM spec s
            ORDER BY s.product_productID, s.specID
            """
            cursor.execute(spec_sql)
            specs = cursor.fetchall()
            
            # 将规格信息按产品ID分组
            specs_by_product = {}
            for spec in specs:
                product_id = spec['product_productID']
                if product_id not in specs_by_product:
                    specs_by_product[product_id] = []
                specs_by_product[product_id].append(spec)
            
            # 将规格信息合并到产品信息中
            for product in products:
                product_id = product['productID']
                product['specs'] = specs_by_product.get(product_id, [])
            
            return jsonify({
                'status': 'success',
                'data': products
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 检查品牌是否存在
            brand_check_sql = "SELECT COUNT(*) as count FROM brand WHERE brandID = %s"
            cursor.execute(brand_check_sql, (data['brand_brandID'],))
            brand_result = cursor.fetchone()
            if brand_result['count'] == 0:
                return jsonify({
                    'status': 'error',
                    'message': f'品牌ID {data["brand_brandID"]} 不存在'
                }), 400
            
            # 检查分类是否存在
            classify_check_sql = "SELECT COUNT(*) as count FROM classify_level1 WHERE classify1_ID = %s"
            cursor.execute(classify_check_sql, (data['classify_level1_classify1_ID'],))
            classify_result = cursor.fetchone()
            if classify_result['count'] == 0:
                return jsonify({
                    'status': 'error',
                    'message': f'分类ID {data["classify_level1_classify1_ID"]} 不存在'
                }), 400
            
            # 插入产品数据
            sql = """
            INSERT INTO product (product_name, classify_level1_classify1_ID, product_baozhiqi, local, brand_brandID)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                data['product_name'],
                data['classify_level1_classify1_ID'],
                data['product_baozhiqi'],
                data.get('local', ''),  # 使用get方法提供默认值
                data['brand_brandID']
            ))
            
            product_id = cursor.lastrowid
            
            # 处理规格数据（如果存在）
            if 'specs' in data and isinstance(data['specs'], list):
                for spec in data['specs']:
                    # 获取当前最大specID并加1
                    cursor.execute("SELECT MAX(specID) as max_id FROM spec")
                    result = cursor.fetchone()
                    new_spec_id = (result['max_id'] or 0) + 1
                    
                    spec_sql = """
                    INSERT INTO spec (specID, product_productID, spec_name, spec_value, barcode, picture, 总库存)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(spec_sql, (
                        new_spec_id,
                        product_id,
                        spec.get('spec_name', ''),
                        spec.get('spec_value', ''),
                        spec.get('barcode', 0),
                        spec.get('picture', ''),
                        spec.get('总库存', 0)
                    ))
            
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '产品添加成功',
                'product_id': product_id
            }), 200
    except Exception as e:
        if connection:
            connection.rollback()
        # 打印详细错误信息用于调试
        print(f"创建商品时发生错误: {str(e)}")
        print(f"请求数据: {data}")
        return jsonify({
            'status': 'error',
            'message': f'创建商品失败: {str(e)}'
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            UPDATE product SET product_name=%s, classify_level1_classify1_ID=%s, 
                              product_baozhiqi=%s, local=%s, brand_brandID=%s
            WHERE productID=%s
            """
            cursor.execute(sql, (
                data['product_name'],
                data['classify_level1_classify1_ID'],
                data['product_baozhiqi'],
                data.get('local', ''),
                data['brand_brandID'],
                product_id
            ))
            
            # 处理规格数据（如果存在）
            if 'specs' in data and isinstance(data['specs'], list):
                # 先删除现有的规格
                delete_spec_sql = "DELETE FROM spec WHERE product_productID = %s"
                cursor.execute(delete_spec_sql, (product_id,))
                
                # 插入新的规格
                for spec in data['specs']:
                    # 获取当前最大specID并加1
                    cursor.execute("SELECT MAX(specID) as max_id FROM spec")
                    result = cursor.fetchone()
                    new_spec_id = (result['max_id'] or 0) + 1
                    
                    spec_sql = """
                    INSERT INTO spec (specID, product_productID, spec_name, spec_value, barcode, picture, 总库存)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(spec_sql, (
                        new_spec_id,
                        product_id,
                        spec.get('spec_name', ''),
                        spec.get('spec_value', ''),
                        spec.get('barcode', 0),
                        spec.get('picture', ''),
                        spec.get('总库存', 0)
                    ))
            
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '产品更新成功'
            }), 200
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 先删除关联的规格记录
            spec_sql = "DELETE FROM spec WHERE product_productID=%s"
            cursor.execute(spec_sql, (product_id,))
            
            # 再删除商品记录
            product_sql = "DELETE FROM product WHERE productID=%s"
            cursor.execute(product_sql, (product_id,))
            
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '产品删除成功'
            })
    except Exception as e:
        if connection:
            connection.rollback()
        print(f"删除商品时发生错误: {str(e)}")  # 添加调试信息
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

# 规格管理接口
@inventory_bp.route('/specs', methods=['GET'])
def get_specs():
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            SELECT s.specID, s.spec_name, s.spec_value, s.barcode, s.picture, s.总库存,
                   p.product_name, p.productID
            FROM spec s
            JOIN product p ON s.product_productID = p.productID
            ORDER BY s.specID
            """
            cursor.execute(sql)
            specs = cursor.fetchall()
            return jsonify({
                'status': 'success',
                'data': specs
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/specs', methods=['POST'])
def add_spec():
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 修复：spec表的specID不是自增字段，需要指定ID值
            # 获取当前最大specID并加1
            cursor.execute("SELECT MAX(specID) as max_id FROM spec")
            result = cursor.fetchone()
            new_id = (result['max_id'] or 0) + 1
            
            sql = """
            INSERT INTO spec (specID, product_productID, spec_name, spec_value, barcode, picture, 总库存)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                new_id,
                data.get('product_productID') or data.get('product_id', 0),
                data.get('spec_name', ''),
                data.get('spec_value', ''),
                data.get('barcode', 0),
                data.get('picture', ''),
                data.get('总库存') or data.get('spec_stock', 0)
            ))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '规格添加成功',
                'spec_id': new_id
            }), 200
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/specs/<int:spec_id>', methods=['PUT'])
def update_spec(spec_id):
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'No data provided'}), 400
        
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 检查规格是否存在
            check_sql = "SELECT specID FROM spec WHERE specID = %s"
            cursor.execute(check_sql, (spec_id,))
            if not cursor.fetchone():
                return jsonify({'status': 'error', 'message': '规格不存在'}), 404

            # 执行更新
            sql = """
            UPDATE spec SET 
                spec_name = %s, 
                spec_value = %s, 
                barcode = %s, 
                picture = %s, 
                总库存 = %s,
                product_productID = %s
            WHERE specID = %s
            """
            cursor.execute(sql, (
                data.get('spec_name', ''),
                data.get('spec_value', ''),
                data.get('barcode', 0),
                data.get('picture', ''),
                data.get('总库存', 0) or data.get('spec_stock', 0),
                data.get('product_productID') or data.get('product_id', 0),
                spec_id
            ))
            
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '规格更新成功'
            }), 200
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/specs/<int:spec_id>', methods=['DELETE'])
def delete_spec(spec_id):
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = "DELETE FROM spec WHERE specID=%s"
            cursor.execute(sql, (spec_id,))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '规格删除成功'
            })
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

# 经销商管理接口
@inventory_bp.route('/dealers', methods=['GET'])
def get_dealers():
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = "SELECT dealerID, dealer_name, dealer_tel, dealer_address FROM dealer ORDER BY dealerID"
            cursor.execute(sql)
            dealers = cursor.fetchall()
            return jsonify({
                'status': 'success',
                'data': dealers
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/dealers', methods=['POST'])
def add_dealer():
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 修复：dealer表的dealerID不是自增字段，需要指定ID值
            # 获取当前最大dealerID并加1
            cursor.execute("SELECT MAX(dealerID) as max_id FROM dealer")
            result = cursor.fetchone()
            new_id = (result['max_id'] or 0) + 1
            
            sql = "INSERT INTO dealer (dealerID, dealer_name, dealer_tel, dealer_address) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (new_id, data['dealer_name'], data['dealer_tel'], data['dealer_address']))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '经销商添加成功',
                'dealer_id': new_id
            })
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/dealers/<int:dealer_id>', methods=['PUT'])
def update_dealer(dealer_id):
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = "UPDATE dealer SET dealer_name=%s, dealer_tel=%s, dealer_address=%s WHERE dealerID=%s"
            cursor.execute(sql, (data['dealer_name'], data['dealer_tel'], data['dealer_address'], dealer_id))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '经销商更新成功'
            })
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/dealers/<int:dealer_id>', methods=['DELETE'])
def delete_dealer(dealer_id):
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 检查是否有入库记录引用该经销商
            check_sql = "SELECT COUNT(*) as count FROM stock_in WHERE dealer_dealerID = %s"
            cursor.execute(check_sql, (dealer_id,))
            result = cursor.fetchone()
            
            if result['count'] > 0:
                return jsonify({
                    'status': 'error',
                    'message': f'无法删除经销商，有{result["count"]}条入库记录正在使用此经销商，请先删除相关入库记录后再尝试删除'
                }), 409
            
            # 如果没有关联数据，则可以安全删除
            sql = "DELETE FROM dealer WHERE dealerID=%s"
            cursor.execute(sql, (dealer_id,))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '经销商删除成功'
            }), 200
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

# 入库管理接口
@inventory_bp.route('/stock_in_records', methods=['GET'])
def get_stock_in_records():
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            SELECT si.stock_inID, d.dealer_name, si.stock_in_date, si.total_amount,
                   sid.quantity, sid.price_in, sid.product_date,
                   p.product_name, s.spec_name, s.spec_value
            FROM stock_in si
            JOIN dealer d ON si.dealer_dealerID = d.dealerID
            JOIN stock_in_detail sid ON si.stock_inID = sid.stock_inID
            JOIN spec s ON sid.spec_specID = s.specID
            JOIN product p ON s.product_productID = p.productID
            ORDER BY si.stock_inID DESC
            """
            cursor.execute(sql)
            records = cursor.fetchall()
            return jsonify({
                'status': 'success',
                'data': records
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/stock_in', methods=['POST'])
def add_stock_in():
    data = request.get_json()
    required_fields = ['dealer_id', 'total_amount', 'items']
    if not all(field in data for field in required_fields):
        return jsonify({
            'status': 'error',
            'message': 'Missing required fields'
        }), 400

    # 确保 total_amount 是数值类型
    try:
        total_amount = float(data['total_amount'])
    except (ValueError, TypeError):
        return jsonify({
            'status': 'error',
            'message': 'total_amount must be a number'
        }), 400

    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 获取当前最大stock_inID并加1
            cursor.execute("SELECT MAX(stock_inID) as max_id FROM stock_in")
            result = cursor.fetchone()
            stock_in_id = (result['max_id'] or 0) + 1
            
            sql = "INSERT INTO stock_in (stock_inID, stock_in_date, total_amount, dealer_dealerID) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (stock_in_id, datetime.now(), total_amount, data['dealer_id']))
            
            # 处理入库明细
            for item in data['items']:
                # 获取当前最大stock_in_detail并加1
                cursor.execute("SELECT MAX(stock_in_detail) as max_detail_id FROM stock_in_detail")
                detail_result = cursor.fetchone()
                detail_id = (detail_result['max_detail_id'] or 0) + 1
                
                sql_detail = """
                INSERT INTO stock_in_detail (stock_in_detail, stock_inID, spec_specID, quantity, price_in, product_date)
                VALUES (%s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql_detail, (
                    detail_id,
                    stock_in_id,
                    item['spec_id'],
                    item['quantity'],
                    item['price_in'],
                    item['product_date']
                ))

            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '入库成功',
                'stock_in_id': stock_in_id
            }), 201
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()