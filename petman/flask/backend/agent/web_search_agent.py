"""
网络搜索AI助手 - 自动搜索商品信息并创建商品实体
"""

import os
import json
from typing import Dict, Any, Optional
import google.generativeai as genai


class WebSearchAgent:
    """AI网络搜索助手 - 自动获取商品信息"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        
        # 配置代理
        proxy_port = os.getenv('PROXY_PORT', '7890')
        if proxy_port:
            os.environ['HTTP_PROXY'] = f'http://127.0.0.1:{proxy_port}'
            os.environ['HTTPS_PROXY'] = f'http://127.0.0.1:{proxy_port}'
        
        genai.configure(api_key=self.api_key)
        
        # 使用支持搜索的模型
        self.model = genai.GenerativeModel(
            'gemini-2.0-flash-exp',
            generation_config={
                'temperature': 0.4,
                'top_p': 0.95,
                'max_output_tokens': 8192,
            }
        )
        
        print("[Web Search Agent] 初始化成功")
    
    def search_and_extract_product(self, product_query: str) -> Dict[str, Any]:
        """
        联网搜索商品信息并提取结构化数据
        
        Args:
            product_query: 商品查询（如："皇家猫粮成猫2kg"）
            
        Returns:
            结构化的商品信息
        """
        try:
            print(f"[Web Search] 开始搜索商品: {product_query}")
            
            prompt = f"""
你是一个专业的宠物行业商品专家。请基于你的知识为以下宠物商品提供详细信息：

商品查询：{product_query}

请提供这个商品的详细信息，包括：

1. **商品基本信息**：
   - 完整的商品名称（规范化）
   - 品牌名称
   - 准确的规格/型号（如2kg、500g、M号等）
   - 产品类别（食品、零食、主粮、罐头、玩具、用品、清洁、医疗、美容、服装等）
   - 适用动物（狗、猫、兔、鸟、鱼、仓鼠或通用）

2. **价格信息**（基于市场行情估算）：
   - 参考市场价格区间（中国市场）
   - 建议零售价

3. **产品详情**：
   - 产地/原产国（如果知道）
   - 保质期（月数）
   - 主要成分/材质
   - 产品特点和卖点
   - 条形码（如果知道，否则留空）

4. **推荐信息**：
   - 建议库存量（根据商品类型）
   - 进货渠道建议（线上/线下）

请严格按照以下JSON格式返回（只返回JSON，不要有其他文字）：

{{
    "product_name": "完整商品名称",
    "brand": "品牌名称",
    "specification": "规格（如2kg）",
    "category": "类别",
    "target_animal": "适用动物",
    "barcode": "条形码（如果有）",
    "origin": "产地",
    "shelf_life": 保质期月数,
    "ingredients": "主要成分",
    "features": "产品特点和卖点",
    "market_price_min": 最低市场价,
    "market_price_max": 最高市场价,
    "market_price_avg": 平均市场价,
    "suggested_retail_price": 建议零售价,
    "suggested_stock_quantity": 建议库存量,
    "supplier_suggestions": ["进货渠道1", "进货渠道2"],
    "search_confidence": "搜索置信度（高/中/低）",
    "data_sources": ["数据来源1", "数据来源2"],
    "additional_info": "其他重要信息"
}}

注意：
- 价格必须是数字，单位为元
- 保质期必须是数字（月数）或null
- 如果某些信息无法找到，设置为null
- 尽量提供准确的市场价格信息
"""
            
            print("[Web Search] 正在调用Gemini搜索API...")
            response = self.model.generate_content(prompt)
            response.resolve()
            
            print("[Web Search] 搜索完成，解析结果...")
            
            # 解析JSON
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            
            if json_match:
                product_data = json.loads(json_match.group())
                
                # 数据验证和清理
                cleaned_data = self._clean_product_data(product_data)
                
                print(f"[Web Search] 成功提取商品信息: {cleaned_data.get('product_name')}")
                
                return {
                    'success': True,
                    'product_data': cleaned_data,
                    'raw_response': response.text,
                    'search_query': product_query
                }
            else:
                return {
                    'success': False,
                    'error': '无法解析AI响应',
                    'raw_response': response.text
                }
                
        except Exception as e:
            print(f"[Web Search] 错误: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _clean_product_data(self, data: Dict) -> Dict:
        """清理和验证商品数据"""
        cleaned = {}
        
        # 必填字段
        cleaned['product_name'] = data.get('product_name') or '未知商品'
        cleaned['brand'] = data.get('brand') or '未知品牌'
        
        # 可选字段
        cleaned['specification'] = data.get('specification') or ''
        cleaned['category'] = data.get('category') or '其他'
        cleaned['target_animal'] = data.get('target_animal') or ''
        cleaned['barcode'] = data.get('barcode') or ''
        cleaned['origin'] = data.get('origin') or ''
        cleaned['ingredients'] = data.get('ingredients') or ''
        cleaned['features'] = data.get('features') or ''
        
        # 数字字段处理
        try:
            cleaned['shelf_life'] = int(data.get('shelf_life')) if data.get('shelf_life') else None
        except:
            cleaned['shelf_life'] = None
        
        # 价格字段
        try:
            cleaned['market_price_min'] = float(data.get('market_price_min', 0))
            cleaned['market_price_max'] = float(data.get('market_price_max', 0))
            cleaned['market_price_avg'] = float(data.get('market_price_avg', 0))
            cleaned['suggested_retail_price'] = float(data.get('suggested_retail_price', 0))
        except:
            cleaned['market_price_min'] = 0
            cleaned['market_price_max'] = 0
            cleaned['market_price_avg'] = 0
            cleaned['suggested_retail_price'] = 0
        
        # 库存建议
        try:
            cleaned['suggested_stock_quantity'] = int(data.get('suggested_stock_quantity', 10))
        except:
            cleaned['suggested_stock_quantity'] = 10
        
        # 其他信息
        cleaned['supplier_suggestions'] = data.get('supplier_suggestions', [])
        cleaned['search_confidence'] = data.get('search_confidence', '中')
        cleaned['data_sources'] = data.get('data_sources', [])
        cleaned['additional_info'] = data.get('additional_info', '')
        
        return cleaned
    
    def quick_search(self, product_name: str) -> Dict[str, Any]:
        """
        快速搜索商品 - 返回简化信息
        
        Args:
            product_name: 商品名称
            
        Returns:
            简化的商品信息
        """
        try:
            prompt = f"""
请快速搜索商品：{product_name}

只返回JSON格式的基本信息：
{{
    "product_name": "商品全名",
    "brand": "品牌",
    "specification": "规格",
    "price": 参考价格,
    "found": true/false
}}
"""
            
            response = self.model.generate_content(prompt)
            response.resolve()
            
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            
            if json_match:
                return {
                    'success': True,
                    'data': json.loads(json_match.group())
                }
            
            return {'success': False, 'error': '解析失败'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def compare_prices(self, product_name: str) -> Dict[str, Any]:
        """
        价格对比 - 搜索多个平台的价格
        
        Args:
            product_name: 商品名称
            
        Returns:
            价格对比信息
        """
        try:
            prompt = f"""
请搜索以下商品在不同电商平台的价格：{product_name}

返回JSON格式：
{{
    "product": "商品名",
    "prices": [
        {{"platform": "淘宝", "price": 价格, "url": "链接"}},
        {{"platform": "京东", "price": 价格, "url": "链接"}},
        {{"platform": "拼多多", "price": 价格, "url": "链接"}}
    ],
    "lowest_price": 最低价,
    "highest_price": 最高价,
    "average_price": 平均价
}}
"""
            
            response = self.model.generate_content(prompt)
            response.resolve()
            
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            
            if json_match:
                return {
                    'success': True,
                    'comparison': json.loads(json_match.group())
                }
            
            return {'success': False, 'error': '解析失败'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

