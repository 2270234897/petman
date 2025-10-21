"""
Image processing utilities for agent
"""

import io
import os
from typing import Optional, Tuple
from PIL import Image
import base64


class ImageProcessor:
    """Process and prepare images for AI analysis"""
    
    # Supported formats
    SUPPORTED_FORMATS = {'JPEG', 'PNG', 'WEBP', 'GIF'}
    
    # Max dimensions for processing (降低到1024以加快处理速度)
    MAX_WIDTH = 1024
    MAX_HEIGHT = 1024
    
    # Max file size (5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024
    
    def __init__(self):
        pass
    
    def validate_image(self, image_data: bytes) -> Tuple[bool, Optional[str]]:
        """
        Validate image data
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Check file size
            if len(image_data) > self.MAX_FILE_SIZE:
                return False, f"图片文件过大，最大支持 {self.MAX_FILE_SIZE / 1024 / 1024}MB"
            
            # Try to open image
            image = Image.open(io.BytesIO(image_data))
            
            # Check format
            if image.format not in self.SUPPORTED_FORMATS:
                return False, f"不支持的图片格式: {image.format}。支持的格式: {', '.join(self.SUPPORTED_FORMATS)}"
            
            return True, None
        except Exception as e:
            return False, f"图片验证失败: {str(e)}"
    
    def process_image(self, image_data: bytes, resize: bool = True) -> bytes:
        """
        Process image for AI analysis
        
        Args:
            image_data: Raw image bytes
            resize: Whether to resize large images
            
        Returns:
            Processed image bytes
        """
        try:
            image = Image.open(io.BytesIO(image_data))
            
            # Convert RGBA to RGB if needed
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
                image = background
            
            # Resize if needed
            if resize and (image.width > self.MAX_WIDTH or image.height > self.MAX_HEIGHT):
                image = self._resize_image(image)
            
            # Convert back to bytes (降低质量以减小文件大小)
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=75, optimize=True)
            return output.getvalue()
        except Exception as e:
            raise ValueError(f"图片处理失败: {str(e)}")
    
    def _resize_image(self, image: Image.Image) -> Image.Image:
        """
        Resize image while maintaining aspect ratio
        
        Args:
            image: PIL Image object
            
        Returns:
            Resized PIL Image
        """
        # Calculate new dimensions
        ratio = min(self.MAX_WIDTH / image.width, self.MAX_HEIGHT / image.height)
        new_width = int(image.width * ratio)
        new_height = int(image.height * ratio)
        
        return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    def image_to_base64(self, image_data: bytes) -> str:
        """
        Convert image bytes to base64 string
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Base64 encoded string
        """
        return base64.b64encode(image_data).decode('utf-8')
    
    def base64_to_image(self, base64_string: str) -> bytes:
        """
        Convert base64 string to image bytes
        
        Args:
            base64_string: Base64 encoded image string
            
        Returns:
            Raw image bytes
        """
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        return base64.b64decode(base64_string)
    
    def save_image(self, image_data: bytes, save_path: str) -> str:
        """
        Save image to disk
        
        Args:
            image_data: Raw image bytes
            save_path: Path to save image
            
        Returns:
            Saved file path
        """
        try:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            with open(save_path, 'wb') as f:
                f.write(image_data)
            
            return save_path
        except Exception as e:
            raise IOError(f"保存图片失败: {str(e)}")
    
    def get_image_info(self, image_data: bytes) -> dict:
        """
        Get image metadata
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary with image information
        """
        try:
            image = Image.open(io.BytesIO(image_data))
            
            return {
                'format': image.format,
                'mode': image.mode,
                'width': image.width,
                'height': image.height,
                'size_bytes': len(image_data),
                'size_mb': round(len(image_data) / 1024 / 1024, 2)
            }
        except Exception as e:
            return {'error': str(e)}

