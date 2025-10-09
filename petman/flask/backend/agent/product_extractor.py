"""
Product information extractor and validator
"""

import json
import re
from typing import Dict, Any, Optional, List
from datetime import datetime


class ProductExtractor:
    """Extract and validate product information from AI responses"""
    
    # Category mapping - 中文到数据库字段
    CATEGORY_MAPPING = {
        '食品': 'food',
        '零食': 'snack',
        '主粮': 'main_food',
        '罐头': 'canned',
        '玩具': 'toy',
        '用品': 'supplies',
        '清洁': 'cleaning',
        '医疗': 'medical',
        '美容': 'grooming',
        '服装': 'clothing',
        '其他': 'other'
    }
    
    # Animal type mapping
    ANIMAL_MAPPING = {
        '狗': 'dog',
        '猫': 'cat',
        '兔': 'rabbit',
        '鸟': 'bird',
        '鱼': 'fish',
        '仓鼠': 'hamster',
        '通用': 'all'
    }
    
    def __init__(self):
        pass
    
    def extract_from_response(self, response_text: str) -> Optional[Dict[str, Any]]:
        """
        Extract structured product information from AI response
        
        Args:
            response_text: Raw text response from AI
            
        Returns:
            Structured product dictionary or None if extraction fails
        """
        try:
            # Try to find JSON in response
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                json_str = json_match.group(0)
                data = json.loads(json_str)
                return self._normalize_product_data(data)
            else:
                # If no JSON found, try to parse as plain text
                return self._parse_plain_text(response_text)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            return self._parse_plain_text(response_text)
        except Exception as e:
            print(f"Extraction error: {e}")
            return None
    
    def _normalize_product_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize extracted data to match database schema
        
        Args:
            data: Raw extracted data
            
        Returns:
            Normalized product data
        """
        normalized = {
            'product_name': self._clean_string(data.get('product_name')),
            'brand': self._clean_string(data.get('brand')),
            'specification': self._clean_string(data.get('specification')),
            'category': self._map_category(data.get('category')),
            'quantity': self._parse_number(data.get('quantity'), default=1),
            'unit_price': self._parse_price(data.get('unit_price')),
            'supplier': self._clean_string(data.get('supplier')),
            'target_animal': self._map_animal(data.get('target_animal')),
            'features': self._extract_features(data.get('features')),
            'barcode': self._clean_string(data.get('barcode')),
            'notes': self._clean_string(data.get('notes')),
            'extraction_time': datetime.now().isoformat()
        }
        
        # Remove None values
        return {k: v for k, v in normalized.items() if v is not None}
    
    def _parse_plain_text(self, text: str) -> Dict[str, Any]:
        """
        Parse plain text response when JSON is not available
        
        Args:
            text: Plain text response
            
        Returns:
            Extracted product data
        """
        data = {}
        
        # Try to extract common patterns
        patterns = {
            'product_name': r'(?:商品名称|产品名称|名称)[:：]\s*(.+?)(?:\n|$)',
            'brand': r'(?:品牌)[:：]\s*(.+?)(?:\n|$)',
            'specification': r'(?:规格|型号)[:：]\s*(.+?)(?:\n|$)',
            'category': r'(?:类别|分类)[:：]\s*(.+?)(?:\n|$)',
            'unit_price': r'(?:价格|单价)[:：]\s*(.+?)(?:\n|$)',
            'supplier': r'(?:供应商|经销商)[:：]\s*(.+?)(?:\n|$)',
        }
        
        for key, pattern in patterns.items():
            match = re.search(pattern, text)
            if match:
                data[key] = match.group(1).strip()
        
        return self._normalize_product_data(data) if data else None
    
    def _clean_string(self, value: Any) -> Optional[str]:
        """Clean and validate string value"""
        if value is None or value == 'null' or value == '':
            return None
        return str(value).strip()
    
    def _parse_number(self, value: Any, default: int = 0) -> int:
        """Parse number from various formats"""
        if value is None or value == 'null':
            return default
        
        try:
            # Remove non-numeric characters except decimal point
            cleaned = re.sub(r'[^\d.]', '', str(value))
            return int(float(cleaned)) if cleaned else default
        except:
            return default
    
    def _parse_price(self, value: Any) -> Optional[float]:
        """Parse price from various formats"""
        if value is None or value == 'null':
            return None
        
        try:
            # Remove currency symbols and clean
            cleaned = re.sub(r'[^\d.]', '', str(value))
            return float(cleaned) if cleaned else None
        except:
            return None
    
    def _map_category(self, category: Any) -> Optional[str]:
        """Map category to database value"""
        if not category:
            return None
        
        category_str = str(category).strip()
        
        # Direct match
        if category_str in self.CATEGORY_MAPPING:
            return self.CATEGORY_MAPPING[category_str]
        
        # Fuzzy match
        for key, value in self.CATEGORY_MAPPING.items():
            if key in category_str or category_str in key:
                return value
        
        return 'other'
    
    def _map_animal(self, animal: Any) -> Optional[str]:
        """Map animal type to database value"""
        if not animal:
            return None
        
        animal_str = str(animal).strip()
        
        # Direct match
        if animal_str in self.ANIMAL_MAPPING:
            return self.ANIMAL_MAPPING[animal_str]
        
        # Fuzzy match
        for key, value in self.ANIMAL_MAPPING.items():
            if key in animal_str:
                return value
        
        return 'all'
    
    def _extract_features(self, features: Any) -> Optional[str]:
        """Extract and format features"""
        if not features:
            return None
        
        if isinstance(features, list):
            return ', '.join(str(f).strip() for f in features if f)
        else:
            return str(features).strip()
    
    def validate_product_data(self, data: Dict[str, Any]) -> tuple[bool, List[str]]:
        """
        Validate product data for completeness
        
        Args:
            data: Product data dictionary
            
        Returns:
            Tuple of (is_valid, list of error messages)
        """
        errors = []
        
        # Required fields
        if not data.get('product_name'):
            errors.append("商品名称不能为空")
        
        # Optional but recommended fields
        warnings = []
        if not data.get('brand'):
            warnings.append("建议填写品牌信息")
        if not data.get('category'):
            warnings.append("建议填写商品类别")
        
        is_valid = len(errors) == 0
        
        return is_valid, errors + warnings
    
    def format_for_database(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format product data for database insertion
        
        Args:
            data: Validated product data
            
        Returns:
            Database-ready product data
        """
        # This will be customized based on your actual database schema
        db_data = {
            'name': data.get('product_name'),
            'brand': data.get('brand'),
            'specification': data.get('specification'),
            'category': data.get('category'),
            'unit_price': data.get('unit_price'),
            'supplier': data.get('supplier'),
            'description': data.get('features'),
            'barcode': data.get('barcode'),
            'notes': data.get('notes'),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        return {k: v for k, v in db_data.items() if v is not None}

