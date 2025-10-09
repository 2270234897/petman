"""
Gemini API Client for natural language and image processing
"""

import os
import base64
from typing import Optional, Dict, Any, List
import google.generativeai as genai
from PIL import Image
import io


class GeminiClient:
    """Client for interacting with Google Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini client
        
        Args:
            api_key: Google Gemini API key. If not provided, reads from environment
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # 配置代理（如果需要科学上网）
        proxy_port = os.getenv('PROXY_PORT', '7890')
        if proxy_port:
            os.environ['HTTP_PROXY'] = f'http://127.0.0.1:{proxy_port}'
            os.environ['HTTPS_PROXY'] = f'http://127.0.0.1:{proxy_port}'
            print(f"[Gemini] 使用代理: 127.0.0.1:{proxy_port}")
        
        genai.configure(api_key=self.api_key)
        
        # Generation config for better control
        self.generation_config = {
            'temperature': 0.4,  # 降低温度以获得更一致的输出
            'top_p': 0.95,
            'top_k': 40,
            'max_output_tokens': 8192,
        }
        
        # Safety settings
        self.safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE",
            },
        ]
        
        # Initialize models (使用 gemini-2.0-flash-exp - 测试验证可用)
        model_name = 'gemini-2.0-flash-exp'
        print(f"[Gemini] 初始化模型: {model_name}")
        
        self.vision_model = genai.GenerativeModel(
            model_name,
            generation_config=self.generation_config,
            safety_settings=self.safety_settings
        )
        self.text_model = genai.GenerativeModel(
            model_name,
            generation_config=self.generation_config,
            safety_settings=self.safety_settings
        )
        
    def analyze_product_image(self, image_data: bytes, additional_context: str = "") -> Dict[str, Any]:
        """
        Analyze product image to extract information
        
        Args:
            image_data: Image bytes
            additional_context: Additional text context about the product
            
        Returns:
            Dict containing extracted product information
        """
        try:
            print(f"[Gemini] 开始分析图片，大小: {len(image_data)} bytes")
            
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            print(f"[Gemini] 图片尺寸: {image.size}, 格式: {image.format}")
            
            prompt = self._build_image_analysis_prompt(additional_context)
            
            print("[Gemini] 正在调用 Gemini API...")
            # 按照官方文档推荐的方式传递内容
            # 将提示词放在图片之后
            response = self.vision_model.generate_content([image, prompt])
            
            # 等待响应完成
            response.resolve()
            print("[Gemini] API 调用成功")
            
            return {
                'success': True,
                'data': response.text,
                'raw_response': response.text
            }
        except Exception as e:
            print(f"[Gemini] 错误: {type(e).__name__}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def extract_product_info_from_text(self, text: str) -> Dict[str, Any]:
        """
        Extract structured product information from natural language text
        
        Args:
            text: Natural language description of the product
            
        Returns:
            Dict containing structured product information
        """
        try:
            print(f"[Gemini] 开始从文本提取，长度: {len(text)} 字符")
            
            prompt = self._build_text_extraction_prompt(text)
            
            print("[Gemini] 正在调用 Gemini API...")
            response = self.text_model.generate_content(prompt)
            
            # 等待响应完成
            response.resolve()
            print("[Gemini] API 调用成功")
            
            return {
                'success': True,
                'data': response.text,
                'raw_response': response.text
            }
        except Exception as e:
            print(f"[Gemini] 错误: {type(e).__name__}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def process_audio(self, audio_data: bytes) -> Dict[str, Any]:
        """
        Process audio input for product information extraction
        
        Args:
            audio_data: Audio file bytes
            
        Returns:
            Dict containing extracted product information
        """
        try:
            print(f"[Gemini] 开始分析音频，大小: {len(audio_data)} bytes")
            
            # 创建音频文件对象
            import io
            audio_file = io.BytesIO(audio_data)
            
            prompt = """
请从这段语音中提取宠物商品信息：

请严格按照以下JSON格式返回（不要添加任何额外文字）：
{
    "product_name": "商品名称",
    "brand": "品牌名称",
    "specification": "规格",
    "category": "类别",
    "target_animal": "适用动物",
    "barcode": "条形码数字",
    "shelf_life": 18,
    "origin": "产地",
    "quantity": 1,
    "unit_price": 99.99,
    "features": "产品特点描述"
}

重要：
- brand必填，如未提及请填"未知品牌"
- shelf_life必须是数字（月数）或null
- quantity必须是数字或null，默认为1
- unit_price必须是数字或null
- 如果某些信息未提及，请设置为null（不是字符串"null"）
- 只返回JSON，不要有其他解释文字
"""
            
            print("[Gemini] 正在调用 Gemini API（音频分析）...")
            
            # 上传音频文件
            from google.generativeai import upload_file
            uploaded_file = upload_file(audio_file, mime_type="audio/webm")
            
            response = self.vision_model.generate_content([prompt, uploaded_file])
            response.resolve()
            
            print("[Gemini] 音频分析成功")
            
            return {
                'success': True,
                'data': response.text,
                'raw_response': response.text
            }
        except Exception as e:
            print(f"[Gemini] 音频分析错误: {type(e).__name__}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def process_mixed_input(self, text: str, images: List[bytes], audio: Optional[bytes] = None) -> Dict[str, Any]:
        """
        Process text, images, and audio together for product information extraction
        
        Args:
            text: Natural language description
            images: List of image bytes
            audio: Optional audio bytes
            
        Returns:
            Dict containing extracted product information
        """
        try:
            print(f"[Gemini] 混合模式：文本长度 {len(text)}, 图片数量 {len(images)}, 音频: {'有' if audio else '无'}")
            
            # 如果只有音频，直接处理音频
            if audio and not text and not images:
                return self.process_audio(audio)
            
            prompt = self._build_mixed_input_prompt(text)
            
            # Prepare content list
            content = [prompt]
            
            # Add images
            for idx, img_data in enumerate(images):
                image = Image.open(io.BytesIO(img_data))
                print(f"[Gemini] 图片 {idx+1}: {image.size}, {image.format}")
                content.append(image)
            
            # Add audio if provided
            if audio:
                print(f"[Gemini] 添加音频，大小: {len(audio)} bytes")
                from google.generativeai import upload_file
                audio_file = io.BytesIO(audio)
                uploaded_audio = upload_file(audio_file, mime_type="audio/webm")
                content.append(uploaded_audio)
            
            print("[Gemini] 正在调用 Gemini API...")
            response = self.vision_model.generate_content(content)
            
            # 等待响应完成
            response.resolve()
            print("[Gemini] API 调用成功")
            
            return {
                'success': True,
                'data': response.text,
                'raw_response': response.text
            }
        except Exception as e:
            print(f"[Gemini] 错误: {type(e).__name__}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _build_image_analysis_prompt(self, additional_context: str = "") -> str:
        """Build prompt for image analysis"""
        base_prompt = """
请仔细分析这张宠物商品图片，提取以下信息：

必填信息（尽量提取）：
1. 商品名称 - 完整的产品名称
2. 品牌 - 品牌名称，如果不可见请填写"未知品牌"
3. 规格/型号 - 如"500g"、"1kg"、"M号"等

可选信息（如果图片中可见）：
4. 产品类别 - 从以下选择：食品、零食、主粮、罐头、玩具、用品、清洁、医疗、美容、服装、其他
5. 适用动物 - 狗、猫、兔、鸟、鱼、仓鼠或通用
6. 条形码 - 如果图片中可见完整条形码，请提取数字
7. 保质期 - 如果可见，以月为单位的数字（例如：18个月请填写18）
8. 产地 - 制造地或产地
9. 产品特点 - 简短描述主要卖点

请严格按照以下JSON格式返回（不要添加任何额外文字）：
{
    "product_name": "商品名称",
    "brand": "品牌名称",
    "specification": "规格",
    "category": "类别",
    "target_animal": "适用动物",
    "barcode": "条形码数字",
    "shelf_life": 18,
    "origin": "产地",
    "features": "产品特点描述"
}

重要：
- 如果某信息不可见，请设为null（不是字符串"null"）
- brand字段必填，如不可见请填"未知品牌"
- shelf_life必须是数字（月数）或null
- 只返回JSON，不要有其他解释文字
"""
        if additional_context:
            base_prompt += f"\n\n用户补充信息：{additional_context}"
        
        return base_prompt
    
    def _build_text_extraction_prompt(self, text: str) -> str:
        """Build prompt for text extraction"""
        return f"""
请从以下描述中提取宠物商品信息：

描述：{text}

请严格按照以下JSON格式返回（不要添加任何额外文字）：
{{
    "product_name": "商品名称",
    "brand": "品牌名称",
    "specification": "规格",
    "category": "类别",
    "target_animal": "适用动物",
    "barcode": "条形码",
    "shelf_life": 18,
    "origin": "产地",
    "unit_price": 99.99,
    "features": "产品特点"
}}

重要：
- brand必填，如未提及请填"未知品牌"
- shelf_life必须是数字（月数）或null
- unit_price必须是数字或null
- 如果某些信息未提及，请设置为null（不是字符串"null"）
- 只返回JSON，不要有其他解释文字
"""
    
    def _build_mixed_input_prompt(self, text: str) -> str:
        """Build prompt for mixed text and image input"""
        prompt = """
请综合分析提供的文字描述和图片，提取完整的宠物商品信息：
"""
        if text:
            prompt += f"\n文字描述：{text}\n"
        
        prompt += """
请严格按照以下JSON格式返回（不要添加任何额外文字）：
{
    "product_name": "商品名称",
    "brand": "品牌名称",
    "specification": "规格",
    "category": "类别",
    "target_animal": "适用动物",
    "barcode": "条形码数字",
    "shelf_life": 18,
    "origin": "产地",
    "quantity": 1,
    "unit_price": 99.99,
    "features": "产品特点描述"
}

重要：
- 请优先使用图片中的信息，文字描述作为补充
- brand必填，如不可见请填"未知品牌"
- shelf_life必须是数字（月数）或null
- quantity必须是数字或null，默认为1
- unit_price必须是数字或null
- 如果某些信息未提及或不可见，请设置为null（不是字符串"null"）
- 只返回JSON，不要有其他解释文字
"""
        return prompt

