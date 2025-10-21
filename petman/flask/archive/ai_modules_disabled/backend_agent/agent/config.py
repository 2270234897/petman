"""
Configuration for agent module
"""

import os
from typing import Dict, Any


class AgentConfig:
    """Configuration settings for AI agent"""
    
    # Gemini API settings
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL_VISION = os.getenv('GEMINI_MODEL_VISION', 'gemini-1.5-flash')
    GEMINI_MODEL_TEXT = os.getenv('GEMINI_MODEL_TEXT', 'gemini-1.5-flash')
    
    # Image processing settings
    MAX_IMAGE_SIZE = int(os.getenv('MAX_IMAGE_SIZE', 5 * 1024 * 1024))  # 5MB
    MAX_IMAGE_WIDTH = int(os.getenv('MAX_IMAGE_WIDTH', 2048))
    MAX_IMAGE_HEIGHT = int(os.getenv('MAX_IMAGE_HEIGHT', 2048))
    
    # Upload settings
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads/agent')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # Agent behavior settings
    AUTO_SAVE = os.getenv('AGENT_AUTO_SAVE', 'false').lower() == 'true'
    CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', 0.7))
    
    # Language settings
    DEFAULT_LANGUAGE = os.getenv('DEFAULT_LANGUAGE', 'zh-CN')
    
    @classmethod
    def validate(cls) -> tuple[bool, list[str]]:
        """
        Validate configuration
        
        Returns:
            Tuple of (is_valid, list of error messages)
        """
        errors = []
        
        if not cls.GEMINI_API_KEY:
            errors.append("GEMINI_API_KEY is not set")
        
        if cls.MAX_IMAGE_SIZE <= 0:
            errors.append("MAX_IMAGE_SIZE must be positive")
        
        if cls.MAX_IMAGE_WIDTH <= 0 or cls.MAX_IMAGE_HEIGHT <= 0:
            errors.append("Image dimensions must be positive")
        
        return len(errors) == 0, errors
    
    @classmethod
    def to_dict(cls) -> Dict[str, Any]:
        """Convert configuration to dictionary"""
        return {
            'gemini_model_vision': cls.GEMINI_MODEL_VISION,
            'gemini_model_text': cls.GEMINI_MODEL_TEXT,
            'max_image_size': cls.MAX_IMAGE_SIZE,
            'max_image_width': cls.MAX_IMAGE_WIDTH,
            'max_image_height': cls.MAX_IMAGE_HEIGHT,
            'upload_folder': cls.UPLOAD_FOLDER,
            'allowed_extensions': list(cls.ALLOWED_EXTENSIONS),
            'auto_save': cls.AUTO_SAVE,
            'confidence_threshold': cls.CONFIDENCE_THRESHOLD,
            'default_language': cls.DEFAULT_LANGUAGE,
            'api_key_configured': bool(cls.GEMINI_API_KEY)
        }

