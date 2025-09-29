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
            SELECT c1.classify1_ID, c1.name, c1.parentID, c2.name as parent_name
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
            # 获取当前最大classify1_ID并加1
            cursor.execute("SELECT MAX(classify1_ID) as max_id FROM classify_level1")
            result = cursor.fetchone()
            new_id = (result['max_id'] or 0) + 1
            
            sql = "INSERT INTO classify_level1 (classify1_ID, name, parentID) VALUES (%s, %s, %s)"
            cursor.execute(sql, (new_id, data['name'], data.get('parentID')))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '分类添加成功',
                'classify_id': new_id
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
            # 检查是否试图将分类设置为自己或子分类的父分类（防止循环引用）
            if data.get('parentID') == classify_id:
                return jsonify({
                    'status': 'error',
                    'message': '不能将分类设置为自己的父分类'
                }), 400
            
            # 检查是否试图将分类设置为子分类的父分类
            if data.get('parentID'):
                cursor.execute("SELECT COUNT(*) as count FROM classify_level1 WHERE parentID = %s", (classify_id,))
                result = cursor.fetchone()
                if result['count'] > 0:
                    return jsonify({
                        'status': 'error',
                        'message': '不能将分类设置为有子分类的分类的父分类'
                    }), 400
            
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
            SELECT s.specID, s.product_productID, s.spec_type_id, s.spec_name, s.spec_value, 
                   s.barcode, s.picture, s.总库存, st.unit as spec_unit
            FROM spec s
            LEFT JOIN spec_type st ON s.spec_type_id = st.spec_type_id
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
    print(f"收到创建商品请求: {data}")  # 添加调试信息
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
                # 获取当前最大specID，避免在循环中重复查询
                cursor.execute("SELECT MAX(specID) as max_id FROM spec")
                result = cursor.fetchone()
                base_spec_id = (result['max_id'] or 0)
                
                for i, spec in enumerate(data['specs']):
                    new_spec_id = base_spec_id + i + 1
                    
                    # 处理规格类型
                    spec_type_id = None
                    if spec.get('spec_type_id'):
                        spec_type_id = spec['spec_type_id']
                    elif spec.get('spec_name'):
                        # 如果提供了规格名称但没有spec_type_id，尝试查找或创建规格类型
                        cursor.execute("SELECT spec_type_id FROM spec_type WHERE spec_name = %s", (spec['spec_name'],))
                        type_result = cursor.fetchone()
                        if type_result:
                            spec_type_id = type_result['spec_type_id']
                        else:
                            # 创建新的规格类型
                            cursor.execute("INSERT INTO spec_type (spec_name, unit, description) VALUES (%s, %s, %s)", 
                                         (spec['spec_name'], spec.get('unit', ''), f'自动创建的规格类型: {spec["spec_name"]}'))
                            spec_type_id = cursor.lastrowid
                    
                    # 检查条形码唯一性（允许同一商品的不同规格使用相同条形码）
                    barcode = spec.get('barcode', 0)
                    if barcode and barcode != 0:
                        # 检查条形码是否被其他商品使用（不包括当前正在创建的商品）
                        cursor.execute("SELECT COUNT(*) as count FROM spec WHERE barcode = %s AND product_productID != %s", (barcode, product_id))
                        barcode_result = cursor.fetchone()
                        if barcode_result['count'] > 0:
                            return jsonify({
                                'status': 'error',
                                'message': f'条形码 {barcode} 已被其他商品使用，请使用其他条形码'
                            }), 400
                    
                    # 确保spec_type_id不为None
                    if spec_type_id is None:
                        spec_type_id = 1  # 使用默认的规格类型ID
                    
                    spec_sql = """
                    INSERT INTO spec (specID, product_productID, spec_type_id, spec_name, spec_value, barcode, picture, 总库存)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(spec_sql, (
                        new_spec_id,
                        product_id,
                        spec_type_id,
                        spec.get('spec_name', ''),
                        spec.get('spec_value', ''),
                        barcode,
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
                # 获取现有的规格ID列表
                cursor.execute("SELECT specID FROM spec WHERE product_productID = %s", (product_id,))
                existing_spec_ids = [row['specID'] for row in cursor.fetchall()]
                
                # 更新或插入规格
                for i, spec in enumerate(data['specs']):
                    # 处理规格类型
                    spec_type_id = None
                    if spec.get('spec_type_id'):
                        spec_type_id = spec['spec_type_id']
                    elif spec.get('spec_name'):
                        # 如果提供了规格名称但没有spec_type_id，尝试查找或创建规格类型
                        cursor.execute("SELECT spec_type_id FROM spec_type WHERE spec_name = %s", (spec['spec_name'],))
                        type_result = cursor.fetchone()
                        if type_result:
                            spec_type_id = type_result['spec_type_id']
                        else:
                            # 创建新的规格类型
                            cursor.execute("INSERT INTO spec_type (spec_name, unit, description) VALUES (%s, %s, %s)", 
                                         (spec['spec_name'], spec.get('unit', ''), f'自动创建的规格类型: {spec["spec_name"]}'))
                            spec_type_id = cursor.lastrowid
                    
                    if i < len(existing_spec_ids):
                        # 检查条形码唯一性（排除当前规格，允许同一商品的不同规格使用相同条形码）
                        barcode = spec.get('barcode', 0)
                        if barcode and barcode != 0:
                            cursor.execute("SELECT COUNT(*) as count FROM spec WHERE barcode = %s AND specID != %s AND product_productID != %s", 
                                         (barcode, existing_spec_ids[i], product_id))
                            barcode_result = cursor.fetchone()
                            if barcode_result['count'] > 0:
                                return jsonify({
                                    'status': 'error',
                                    'message': f'条形码 {barcode} 已被其他商品使用，请使用其他条形码'
                                }), 400
                        
                        # 更新现有规格
                        spec_sql = """
                        UPDATE spec SET spec_type_id=%s, spec_name=%s, spec_value=%s, barcode=%s, picture=%s, 总库存=%s
                        WHERE specID=%s
                        """
                        cursor.execute(spec_sql, (
                            spec_type_id,
                            spec.get('spec_name', ''),
                            spec.get('spec_value', ''),
                            barcode,
                            spec.get('picture', ''),
                            spec.get('总库存', 0),
                            existing_spec_ids[i]
                        ))
                    else:
                        # 检查条形码唯一性（允许同一商品的不同规格使用相同条形码）
                        barcode = spec.get('barcode', 0)
                        if barcode and barcode != 0:
                            cursor.execute("SELECT COUNT(*) as count FROM spec WHERE barcode = %s AND product_productID != %s", (barcode, product_id))
                            barcode_result = cursor.fetchone()
                            if barcode_result['count'] > 0:
                                return jsonify({
                                    'status': 'error',
                                    'message': f'条形码 {barcode} 已被其他商品使用，请使用其他条形码'
                                }), 400
                        
                        # 插入新规格
                        cursor.execute("SELECT MAX(specID) as max_id FROM spec")
                        result = cursor.fetchone()
                        new_spec_id = (result['max_id'] or 0) + 1
                        
                        spec_sql = """
                        INSERT INTO spec (specID, product_productID, spec_type_id, spec_name, spec_value, barcode, picture, 总库存)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """
                        cursor.execute(spec_sql, (
                            new_spec_id,
                            product_id,
                            spec_type_id,
                            spec.get('spec_name', ''),
                            spec.get('spec_value', ''),
                            barcode,
                            spec.get('picture', ''),
                            spec.get('总库存', 0)
                        ))
                
                # 删除多余的规格（如果有的话）
                if len(data['specs']) < len(existing_spec_ids):
                    # 检查要删除的规格是否被引用
                    for spec_id in existing_spec_ids[len(data['specs']):]:
                        # 检查是否被stock_in_detail引用
                        cursor.execute("SELECT COUNT(*) as count FROM stock_in_detail WHERE spec_specID = %s", (spec_id,))
                        stock_result = cursor.fetchone()
                        
                        # 检查是否被order_deatil引用
                        cursor.execute("SELECT COUNT(*) as count FROM order_deatil WHERE spec_specID = %s", (spec_id,))
                        order_result = cursor.fetchone()
                        
                        if stock_result['count'] == 0 and order_result['count'] == 0:
                            # 没有被引用，可以安全删除
                            cursor.execute("DELETE FROM spec WHERE specID = %s", (spec_id,))
                        else:
                            # 被引用，不能删除，保持原样
                            print(f"规格ID {spec_id} 被引用，无法删除")
            
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
            # 检查是否有入库记录引用该商品的规格
            check_sql = """
            SELECT COUNT(*) as count 
            FROM stock_in_detail sid 
            JOIN spec s ON sid.spec_specID = s.specID 
            WHERE s.product_productID = %s
            """
            cursor.execute(check_sql, (product_id,))
            stock_result = cursor.fetchone()
            
            if stock_result['count'] > 0:
                return jsonify({
                    'status': 'error',
                    'message': f'无法删除商品，有{stock_result["count"]}条入库记录正在使用此商品的规格，请先删除相关入库记录后再尝试删除'
                }), 409
            
            # 检查是否有订单记录引用该商品的规格
            order_check_sql = """
            SELECT COUNT(*) as count 
            FROM order_deatil od 
            JOIN spec s ON od.spec_specID = s.specID 
            WHERE s.product_productID = %s
            """
            cursor.execute(order_check_sql, (product_id,))
            order_result = cursor.fetchone()
            
            if order_result['count'] > 0:
                return jsonify({
                    'status': 'error',
                    'message': f'无法删除商品，有{order_result["count"]}条订单记录正在使用此商品的规格，请先删除相关订单记录后再尝试删除'
                }), 409
            
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

# 入库管理接口 - 获取入库单列表（基本信息）
@inventory_bp.route('/stock_in_records', methods=['GET'])
def get_stock_in_records():
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            SELECT si.stock_inID, d.dealer_name, si.stock_in_date, si.total_amount,
                   COUNT(sid.stock_in_detail) as item_count
            FROM stock_in si
            JOIN dealer d ON si.dealer_dealerID = d.dealerID
            LEFT JOIN stock_in_detail sid ON si.stock_inID = sid.stock_inID
            GROUP BY si.stock_inID, d.dealer_name, si.stock_in_date, si.total_amount
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

# 获取单个入库单详情
@inventory_bp.route('/stock_in_records/<int:stock_in_id>', methods=['GET'])
def get_stock_in_record_detail(stock_in_id):
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 获取入库单基本信息
            sql = """
            SELECT si.stock_inID, d.dealer_name, d.dealer_tel, d.dealer_address,
                   si.stock_in_date, si.total_amount
            FROM stock_in si
            JOIN dealer d ON si.dealer_dealerID = d.dealerID
            WHERE si.stock_inID = %s
            """
            cursor.execute(sql, (stock_in_id,))
            stock_in_info = cursor.fetchone()
            
            if not stock_in_info:
                return jsonify({
                    'status': 'error',
                    'message': '入库单不存在'
                }), 404
            
            # 获取入库单明细
            detail_sql = """
            SELECT sid.stock_in_detail, sid.quantity, sid.price_in, sid.product_date,
                   p.product_name, b.brandname, c.name as classify_name,
                   s.spec_name, s.spec_value, s.barcode
            FROM stock_in_detail sid
            JOIN spec s ON sid.spec_specID = s.specID
            JOIN product p ON s.product_productID = p.productID
            JOIN brand b ON p.brand_brandID = b.brandID
            JOIN classify_level1 c ON p.classify_level1_classify1_ID = c.classify1_ID
            WHERE sid.stock_inID = %s
            ORDER BY sid.stock_in_detail
            """
            cursor.execute(detail_sql, (stock_in_id,))
            details = cursor.fetchall()
            
            return jsonify({
                'status': 'success',
                'data': {
                    'stock_in_info': stock_in_info,
                    'details': details
                }
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

@inventory_bp.route('/stock_in/<int:stock_in_id>', methods=['PUT'])
def update_stock_in(stock_in_id):
    """更新入库记录"""
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 检查入库记录是否存在
            cursor.execute("SELECT stock_inID FROM stock_in WHERE stock_inID = %s", (stock_in_id,))
            if not cursor.fetchone():
                return jsonify({
                    'status': 'error',
                    'message': '入库记录不存在'
                }), 404
            
            # 更新入库记录基本信息
            if 'total_amount' in data or 'dealer_id' in data:
                update_fields = []
                update_values = []
                
                if 'total_amount' in data:
                    update_fields.append("total_amount = %s")
                    update_values.append(float(data['total_amount']))
                
                if 'dealer_id' in data:
                    update_fields.append("dealer_dealerID = %s")
                    update_values.append(data['dealer_id'])
                
                if update_fields:
                    update_values.append(stock_in_id)
                    sql = f"UPDATE stock_in SET {', '.join(update_fields)} WHERE stock_inID = %s"
                    cursor.execute(sql, update_values)
            
            # 如果有明细数据，更新明细
            if 'items' in data and isinstance(data['items'], list):
                # 删除现有明细
                cursor.execute("DELETE FROM stock_in_detail WHERE stock_inID = %s", (stock_in_id,))
                
                # 添加新明细
                for item in data['items']:
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
                'message': '入库记录更新成功'
            }), 200
            
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': f'更新失败: {str(e)}'
        }), 500
    finally:
        if connection:
            connection.close()

@inventory_bp.route('/stock_in/<int:stock_in_id>', methods=['DELETE'])
def delete_stock_in(stock_in_id):
    """删除入库记录"""
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 检查入库记录是否存在
            cursor.execute("SELECT stock_inID FROM stock_in WHERE stock_inID = %s", (stock_in_id,))
            if not cursor.fetchone():
                return jsonify({
                    'status': 'error',
                    'message': '入库记录不存在'
                }), 404
            
            # 删除入库明细
            cursor.execute("DELETE FROM stock_in_detail WHERE stock_inID = %s", (stock_in_id,))
            
            # 删除入库记录
            cursor.execute("DELETE FROM stock_in WHERE stock_inID = %s", (stock_in_id,))
            
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '入库记录删除成功'
            }), 200
            
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': f'删除失败: {str(e)}'
        }), 500
    finally:
        if connection:
            connection.close()

# 规格类型管理接口
@inventory_bp.route('/spec-types', methods=['GET'])
def get_spec_types():
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            SELECT spec_type_id, spec_name, unit, description, is_active, 
                   created_at, updated_at
            FROM spec_type 
            WHERE is_active = TRUE
            ORDER BY spec_name
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

@inventory_bp.route('/spec-types', methods=['POST'])
def add_spec_type():
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 检查规格名称是否已存在
            check_sql = "SELECT COUNT(*) as count FROM spec_type WHERE spec_name = %s"
            cursor.execute(check_sql, (data['spec_name'],))
            result = cursor.fetchone()
            
            if result['count'] > 0:
                return jsonify({
                    'status': 'error',
                    'message': '规格名称已存在'
                }), 400
            
            sql = """
            INSERT INTO spec_type (spec_name, unit, description, is_active)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (
                data['spec_name'],
                data.get('unit', ''),
                data.get('description', ''),
                data.get('is_active', True)
            ))
            connection.commit()
            
            spec_type_id = cursor.lastrowid
            return jsonify({
                'status': 'success',
                'message': '规格类型添加成功',
                'spec_type_id': spec_type_id
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

@inventory_bp.route('/spec-types/<int:spec_type_id>', methods=['PUT'])
def update_spec_type(spec_type_id):
    data = request.get_json()
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 检查规格名称是否与其他记录重复
            check_sql = "SELECT COUNT(*) as count FROM spec_type WHERE spec_name = %s AND spec_type_id != %s"
            cursor.execute(check_sql, (data['spec_name'], spec_type_id))
            result = cursor.fetchone()
            
            if result['count'] > 0:
                return jsonify({
                    'status': 'error',
                    'message': '规格名称已存在'
                }), 400
            
            sql = """
            UPDATE spec_type SET spec_name=%s, unit=%s, description=%s, is_active=%s
            WHERE spec_type_id=%s
            """
            cursor.execute(sql, (
                data['spec_name'],
                data.get('unit', ''),
                data.get('description', ''),
                data.get('is_active', True),
                spec_type_id
            ))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '规格类型更新成功'
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

@inventory_bp.route('/spec-types/<int:spec_type_id>', methods=['DELETE'])
def delete_spec_type(spec_type_id):
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 检查是否有规格正在使用该规格类型
            check_sql = "SELECT COUNT(*) as count FROM spec WHERE spec_type_id = %s"
            cursor.execute(check_sql, (spec_type_id,))
            result = cursor.fetchone()
            
            if result['count'] > 0:
                return jsonify({
                    'status': 'error',
                    'message': f'无法删除规格类型，有{result["count"]}个规格正在使用此规格类型，请先删除相关规格后再尝试删除'
                }), 400
            
            # 软删除：将is_active设置为False
            sql = "UPDATE spec_type SET is_active=FALSE WHERE spec_type_id=%s"
            cursor.execute(sql, (spec_type_id,))
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '规格类型删除成功'
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

# 批量导入商品数据接口
@inventory_bp.route('/import/products', methods=['POST'])
def import_products():
    """批量导入商品数据"""
    connection = None
    try:
        data = request.get_json()
        if not data or 'products' not in data:
            return jsonify({
                'status': 'error',
                'message': '请求数据格式错误'
            }), 400
        
        connection = pymysql.connect(**MYSQL_CONFIG)
        success_count = 0
        error_count = 0
        errors = []
        
        with connection.cursor() as cursor:
            for index, product_data in enumerate(data['products']):
                try:
                    # 验证必要字段
                    required_fields = ['product_name', 'brand_name', 'classify_name', 'spec_name', 'spec_value']
                    missing_fields = [field for field in required_fields if not product_data.get(field)]
                    if missing_fields:
                        raise ValueError(f"缺少必要字段: {missing_fields}")
                    
                    # 获取或创建品牌
                    brand_id = get_or_create_brand(cursor, product_data['brand_name'])
                    
                    # 获取或创建分类
                    classify_id = get_or_create_classify(
                        cursor, 
                        product_data['classify_name'], 
                        product_data.get('parent_classify_name')
                    )
                    
                    # 创建商品
                    product_id = create_product(cursor, product_data, classify_id, brand_id)
                    
                    # 创建规格
                    create_spec(cursor, product_data, product_id)
                    
                    success_count += 1
                    
                except Exception as e:
                    error_count += 1
                    errors.append(f"第{index + 1}行: {str(e)}")
                    continue
            
            connection.commit()
            
        return jsonify({
            'status': 'success',
            'message': f'导入完成！成功: {success_count} 条，失败: {error_count} 条',
            'success_count': success_count,
            'error_count': error_count,
            'errors': errors[:10]  # 只返回前10个错误
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

def get_or_create_brand(cursor, brand_name):
    """获取或创建品牌"""
    brand_name = brand_name.strip()
    if not brand_name:
        raise ValueError("品牌名称不能为空")
    
    # 查找现有品牌
    cursor.execute("SELECT brandID FROM brand WHERE brandname = %s", (brand_name,))
    result = cursor.fetchone()
    
    if result:
        return result['brandID']
    
    # 创建新品牌
    cursor.execute("SELECT MAX(brandID) as max_id FROM brand")
    max_result = cursor.fetchone()
    new_brand_id = (max_result['max_id'] or 0) + 1
    
    cursor.execute("INSERT INTO brand (brandID, brandname) VALUES (%s, %s)", 
                   (new_brand_id, brand_name))
    return new_brand_id

def get_or_create_classify(cursor, classify_name, parent_classify_name=None):
    """获取或创建分类"""
    classify_name = classify_name.strip()
    if not classify_name:
        raise ValueError("分类名称不能为空")
    
    parent_id = None
    if parent_classify_name and parent_classify_name.strip():
        # 查找父分类
        cursor.execute("SELECT classify1_ID FROM classify_level1 WHERE name = %s", 
                       (parent_classify_name.strip(),))
        parent_result = cursor.fetchone()
        if parent_result:
            parent_id = parent_result['classify1_ID']
    
    # 查找现有分类
    if parent_id:
        cursor.execute("SELECT classify1_ID FROM classify_level1 WHERE name = %s AND parentID = %s", 
                       (classify_name, parent_id))
    else:
        cursor.execute("SELECT classify1_ID FROM classify_level1 WHERE name = %s AND parentID IS NULL", 
                       (classify_name,))
    
    result = cursor.fetchone()
    if result:
        return result['classify1_ID']
    
    # 创建新分类
    cursor.execute("SELECT MAX(classify1_ID) as max_id FROM classify_level1")
    max_result = cursor.fetchone()
    new_classify_id = (max_result['max_id'] or 0) + 1
    
    cursor.execute("INSERT INTO classify_level1 (classify1_ID, name, parentID) VALUES (%s, %s, %s)", 
                   (new_classify_id, classify_name, parent_id))
    return new_classify_id

def create_product(cursor, product_data, classify_id, brand_id):
    """创建商品"""
    cursor.execute("SELECT MAX(productID) as max_id FROM product")
    max_result = cursor.fetchone()
    new_product_id = (max_result['max_id'] or 0) + 1
    
    sql = """
    INSERT INTO product (productID, product_name, classify_level1_classify1_ID, 
                       brand_brandID, product_baozhiqi, local, product_details, cover_image)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        new_product_id,
        product_data['product_name'],
        classify_id,
        brand_id,
        product_data.get('product_baozhiqi', 12),
        product_data.get('local', ''),
        product_data.get('product_details', ''),
        product_data.get('cover_image', '')
    ))
    return new_product_id

def create_spec(cursor, product_data, product_id):
    """创建规格"""
    cursor.execute("SELECT MAX(specID) as max_id FROM spec")
    max_result = cursor.fetchone()
    new_spec_id = (max_result['max_id'] or 0) + 1
    
    sql = """
    INSERT INTO spec (specID, product_productID, spec_name, spec_value, 
                    barcode, picture, 总库存)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        new_spec_id,
        product_id,
        product_data['spec_name'],
        product_data['spec_value'],
        product_data.get('barcode'),
        product_data.get('picture'),
        product_data.get('总库存', 0)
    ))
    return new_spec_id