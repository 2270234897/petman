-- 修复规格图片字段长度问题
-- 将picture字段从VARCHAR(500)改为LONGTEXT以支持base64图片

USE mydb;

-- 修改spec表的picture字段
ALTER TABLE `spec` 
MODIFY COLUMN `picture` LONGTEXT NULL COMMENT '规格图片（支持base64编码），可为空';

-- 修改product表的cover_image字段（如果需要）
ALTER TABLE `product` 
MODIFY COLUMN `cover_image` LONGTEXT NULL COMMENT '商品封面图片（支持base64编码），可为空';

SELECT 'Picture field updated successfully!' AS Status;

