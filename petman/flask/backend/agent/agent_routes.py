"""
API routes for agent functionality
"""

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from typing import List
from .gemini_client import GeminiClient
from .product_extractor import ProductExtractor
from .image_processor import ImageProcessor


# Create blueprint
agent_bp = Blueprint('agent', __name__, url_prefix='/api/agent')

# Initialize components
try:
    gemini_client = GeminiClient()
    product_extractor = ProductExtractor()
    image_processor = ImageProcessor()
except Exception as e:
    print(f"Warning: Agent initialization failed: {e}")
    gemini_client = None
    product_extractor = None
    image_processor = None


@agent_bp.route('/health', methods=['GET'])
def health_check():
    """Check agent service health"""
    if gemini_client is None:
        return jsonify({
            'status': 'error',
            'message': 'Gemini client not initialized. Please check GEMINI_API_KEY.'
        }), 500
    
    return jsonify({
        'status': 'ok',
        'message': 'Agent service is running'
    })


@agent_bp.route('/extract-from-text', methods=['POST'])
def extract_from_text():
    """
    Extract product information from natural language text
    
    Request body:
        {
            "text": "商品描述文字"
        }
    """
    if gemini_client is None:
        return jsonify({'error': 'Agent service not available'}), 500
    
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': '请提供商品描述文字'}), 400
        
        # Extract information using Gemini
        result = gemini_client.extract_product_info_from_text(text)
        
        if not result.get('success'):
            return jsonify({'error': result.get('error', '提取失败')}), 500
        
        # Parse and normalize the response
        product_data = product_extractor.extract_from_response(result['data'])
        
        if product_data is None:
            return jsonify({
                'error': '无法解析AI响应',
                'raw_response': result['data']
            }), 500
        
        # Validate data
        is_valid, messages = product_extractor.validate_product_data(product_data)
        
        return jsonify({
            'success': True,
            'product_data': product_data,
            'is_valid': is_valid,
            'messages': messages,
            'raw_response': result.get('raw_response')
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@agent_bp.route('/extract-from-image', methods=['POST'])
def extract_from_image():
    """
    Extract product information from image
    
    Request: multipart/form-data
        - image: image file
        - context: (optional) additional text context
    """
    if gemini_client is None:
        return jsonify({
            'status': 'error',
            'message': 'AI Agent服务未配置，请设置GEMINI_API_KEY环境变量',
            'details': 'Agent service not available - GEMINI_API_KEY not configured'
        }), 503
    
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({'error': '请上传商品图片'}), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({'error': '未选择图片文件'}), 400
        
        # Read image data
        image_data = image_file.read()
        
        # Validate image
        is_valid, error_msg = image_processor.validate_image(image_data)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Process image
        processed_image = image_processor.process_image(image_data)
        
        # Get additional context
        context = request.form.get('context', '')
        
        # Extract information using Gemini
        result = gemini_client.analyze_product_image(processed_image, context)
        
        if not result.get('success'):
            return jsonify({'error': result.get('error', '分析失败')}), 500
        
        # Parse and normalize the response
        product_data = product_extractor.extract_from_response(result['data'])
        
        if product_data is None:
            return jsonify({
                'error': '无法解析AI响应',
                'raw_response': result['data']
            }), 500
        
        # Validate data
        is_valid, messages = product_extractor.validate_product_data(product_data)
        
        # Get image info
        image_info = image_processor.get_image_info(image_data)
        
        return jsonify({
            'success': True,
            'product_data': product_data,
            'is_valid': is_valid,
            'messages': messages,
            'image_info': image_info,
            'raw_response': result.get('raw_response')
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@agent_bp.route('/extract-mixed', methods=['POST'])
def extract_mixed():
    """
    Extract product information from both text and images
    
    Request: multipart/form-data
        - text: natural language description
        - images: one or more image files
    """
    print("\n" + "="*50)
    print("[Agent Route] 收到 /extract-mixed 请求")
    
    if gemini_client is None:
        print("[Agent Route] 错误: Gemini 客户端未初始化")
        return jsonify({'error': 'Agent service not available'}), 500
    
    try:
        text = request.form.get('text', '').strip()
        
        # Get all uploaded images
        image_files = request.files.getlist('images')
        
        # Get audio file if present
        audio_file = request.files.get('audio')
        
        print(f"[Agent Route] 文本: {text[:100] if text else '(空)'}")
        print(f"[Agent Route] 图片数量: {len(image_files)}")
        print(f"[Agent Route] 音频: {'有' if audio_file else '无'}")
        
        if not text and not image_files and not audio_file:
            return jsonify({'error': '请提供文字描述、图片或语音'}), 400
        
        # Process images
        processed_images = []
        for image_file in image_files:
            if image_file.filename:
                image_data = image_file.read()
                
                # Validate
                is_valid, error_msg = image_processor.validate_image(image_data)
                if not is_valid:
                    return jsonify({'error': f'图片 {image_file.filename}: {error_msg}'}), 400
                
                # Process
                processed = image_processor.process_image(image_data)
                processed_images.append(processed)
        
        # Process audio if present
        audio_data = None
        if audio_file:
            audio_data = audio_file.read()
            print(f"[Agent Route] 音频大小: {len(audio_data)} bytes")
        
        # Extract information using Gemini
        print(f"[Agent Route] 开始调用 Gemini API...")
        if processed_images or audio_data:
            result = gemini_client.process_mixed_input(text, processed_images, audio_data)
        else:
            result = gemini_client.extract_product_info_from_text(text)
        
        print(f"[Agent Route] Gemini 返回: success={result.get('success')}")
        
        if not result.get('success'):
            print(f"[Agent Route] 错误: {result.get('error')}")
            return jsonify({'error': result.get('error', '提取失败')}), 500
        
        # Parse and normalize the response
        product_data = product_extractor.extract_from_response(result['data'])
        
        if product_data is None:
            return jsonify({
                'error': '无法解析AI响应',
                'raw_response': result['data']
            }), 500
        
        # Validate data
        is_valid, messages = product_extractor.validate_product_data(product_data)
        
        print(f"[Agent Route] 处理完成，返回数据")
        print("="*50 + "\n")
        
        return jsonify({
            'success': True,
            'product_data': product_data,
            'is_valid': is_valid,
            'messages': messages,
            'images_processed': len(processed_images),
            'raw_response': result.get('raw_response')
        })
        
    except Exception as e:
        print(f"[Agent Route] 异常: {type(e).__name__}: {str(e)}")
        print("="*50 + "\n")
        return jsonify({'error': str(e)}), 500


@agent_bp.route('/chat', methods=['POST'])
def chat():
    """
    Interactive chat with agent for product entry
    
    Request body:
        {
            "message": "用户消息",
            "conversation_history": [...] (optional)
        }
    """
    if gemini_client is None:
        return jsonify({'error': 'Agent service not available'}), 500
    
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': '请输入消息'}), 400
        
        # For now, treat it as a simple extraction
        # In the future, this can maintain conversation context
        result = gemini_client.extract_product_info_from_text(message)
        
        if not result.get('success'):
            return jsonify({
                'success': True,
                'response': '抱歉，我无法理解您的描述。请提供更多商品信息。',
                'requires_more_info': True
            })
        
        # Try to extract product info
        product_data = product_extractor.extract_from_response(result['data'])
        
        if product_data:
            is_valid, messages = product_extractor.validate_product_data(product_data)
            
            if is_valid:
                response = "我已经提取了商品信息，请确认是否正确。"
            else:
                response = "我提取了部分信息，但还需要补充：" + "、".join(messages)
            
            return jsonify({
                'success': True,
                'response': response,
                'product_data': product_data,
                'is_valid': is_valid,
                'messages': messages
            })
        else:
            return jsonify({
                'success': True,
                'response': '我理解了您的描述，但需要更多信息才能创建商品记录。',
                'requires_more_info': True
            })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@agent_bp.route('/save-product', methods=['POST'])
def save_product():
    """
    Save extracted product information to database
    
    Request body:
        {
            "product_data": {...}
        }
    """
    import pymysql
    from db_config import MYSQL_CONFIG
    
    connection = None
    try:
        data = request.get_json()
        product_data = data.get('product_data')
        
        if not product_data:
            return jsonify({'error': '未提供商品数据'}), 400
        
        print(f"[Agent Save] 收到商品数据: {product_data}")
        
        # Validate
        is_valid, messages = product_extractor.validate_product_data(product_data)
        
        if not is_valid:
            return jsonify({
                'error': '商品数据验证失败',
                'messages': messages
            }), 400
        
        # 连接数据库
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 1. 处理品牌 - 如果不存在则创建
            brand_name = product_data.get('brand', '未知品牌')
            cursor.execute("SELECT brandID FROM brand WHERE brandName = %s", (brand_name,))
            brand_result = cursor.fetchone()
            
            if brand_result:
                brand_id = brand_result['brandID']
                print(f"[Agent Save] 找到品牌: {brand_name} (ID: {brand_id})")
            else:
                # 创建新品牌
                cursor.execute("INSERT INTO brand (brandName) VALUES (%s)", (brand_name,))
                brand_id = cursor.lastrowid
                print(f"[Agent Save] 创建新品牌: {brand_name} (ID: {brand_id})")
            
            # 2. 处理分类 - 使用默认分类或创建
            category_name = product_data.get('category', '其他')
            cursor.execute("SELECT classify1_ID FROM classify_level1 WHERE classify1_name = %s", (category_name,))
            classify_result = cursor.fetchone()
            
            if classify_result:
                classify_id = classify_result['classify1_ID']
                print(f"[Agent Save] 找到分类: {category_name} (ID: {classify_id})")
            else:
                # 使用默认分类或创建新分类
                cursor.execute("SELECT classify1_ID FROM classify_level1 ORDER BY classify1_ID LIMIT 1")
                default_classify = cursor.fetchone()
                if default_classify:
                    classify_id = default_classify['classify1_ID']
                    print(f"[Agent Save] 使用默认分类 (ID: {classify_id})")
                else:
                    # 创建新分类
                    cursor.execute("INSERT INTO classify_level1 (classify1_name) VALUES (%s)", (category_name,))
                    classify_id = cursor.lastrowid
                    print(f"[Agent Save] 创建新分类: {category_name} (ID: {classify_id})")
            
            # 3. 插入商品
            product_name = product_data.get('product_name')
            specification = product_data.get('specification', '')
            
            # 组合商品名称（不含规格，规格放在spec表）
            full_name = product_name
            
            # 处理保质期（必须是int或NULL）
            shelf_life = product_data.get('shelf_life')
            if shelf_life:
                try:
                    shelf_life = int(shelf_life)
                except:
                    shelf_life = None
            
            # 处理产地
            origin = product_data.get('origin', '')
            
            # 处理产品详情
            features = product_data.get('features', '')
            
            sql = """
            INSERT INTO product (product_name, classify_level1_classify1_ID, product_baozhiqi, local, brand_brandID, product_details)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                full_name,
                classify_id,
                shelf_life,  # 保质期（int或NULL）
                origin,      # 产地
                brand_id,
                features     # 产品详情
            ))
            
            product_id = cursor.lastrowid
            print(f"[Agent Save] 创建商品: {full_name} (ID: {product_id})")
            
            # 4. 创建规格记录（总是创建，即使没有条形码）
            barcode = product_data.get('barcode')
            spec_info = specification or '标准规格'
            quantity = product_data.get('quantity', 1)  # 默认数量为1
            
            # 处理条形码（可能是字符串或数字）
            if barcode:
                try:
                    barcode = str(barcode).strip()
                    # 如果条形码无效，设为0
                    if not barcode or barcode.lower() == 'null':
                        barcode = 0
                except:
                    barcode = 0
            else:
                barcode = 0
            
            spec_sql = """
            INSERT INTO spec (product_productID, barcode, spec_info, spec_quantity)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(spec_sql, (
                product_id,
                barcode,
                spec_info,
                quantity
            ))
            spec_id = cursor.lastrowid
            print(f"[Agent Save] 创建规格: {spec_info}, 条形码: {barcode}, 数量: {quantity} (specID: {spec_id})")
        
        connection.commit()
        print(f"[Agent Save] 保存成功！商品ID: {product_id}")
        
        return jsonify({
            'success': True,
            'message': f'商品 "{full_name}" 保存成功！\n规格: {spec_info}\n条形码: {barcode if barcode != 0 else "无"}',
            'product_id': product_id,
            'spec_id': spec_id
        })
        
    except Exception as e:
        if connection:
            connection.rollback()
        print(f"[Agent Save] 错误: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()

