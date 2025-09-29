-- V3到V4数据库迁移脚本
-- 修复商品创建500错误的关键修改
-- 执行前请备份数据库！

USE mydb;

-- 1. 修改product表，使product_baozhiqi字段允许NULL
ALTER TABLE `product` 
MODIFY COLUMN `product_baozhiqi` INT NULL COMMENT '保质期（月），可为空，支持无保质期商品';

-- 2. 修改product表，使cover_image字段允许NULL
ALTER TABLE `product` 
MODIFY COLUMN `cover_image` VARCHAR(500) NULL DEFAULT NULL COMMENT '商品封面图片，可为空';

-- 3. 为product表添加时间戳字段
ALTER TABLE `product` 
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `cover_image`,
ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- 4. 为product表添加索引
ALTER TABLE `product` 
ADD INDEX `idx_product_name` (`product_name` ASC),
ADD INDEX `idx_product_created` (`created_at` ASC);

-- 5. 修改spec表，使barcode字段为VARCHAR类型并允许NULL
ALTER TABLE `spec` 
MODIFY COLUMN `barcode` VARCHAR(50) NULL COMMENT '条形码，VARCHAR类型，可为空，支持同一商品不同规格使用相同条形码';

-- 6. 修改spec表，使spec_type_id字段允许NULL
ALTER TABLE `spec` 
MODIFY COLUMN `spec_type_id` INT NULL COMMENT '规格类型ID，关联spec_type表，可为空';

-- 7. 修改spec表，使spec_name字段允许NULL
ALTER TABLE `spec` 
MODIFY COLUMN `spec_name` VARCHAR(45) NULL COMMENT '规格名称，可为空';

-- 8. 修改spec表，使spec_value字段允许NULL
ALTER TABLE `spec` 
MODIFY COLUMN `spec_value` VARCHAR(45) NULL COMMENT '规格值，可为空';

-- 9. 修改spec表，使picture字段允许NULL
ALTER TABLE `spec` 
MODIFY COLUMN `picture` VARCHAR(500) NULL COMMENT '规格图片，可为空';

-- 10. 修改spec表，使总库存字段允许NULL
ALTER TABLE `spec` 
MODIFY COLUMN `总库存` INT NULL DEFAULT 0 COMMENT '总库存，可为空，默认为0';

-- 11. 为spec表添加unit字段
ALTER TABLE `spec` 
ADD COLUMN `unit` VARCHAR(20) NULL COMMENT '单位，可为空' AFTER `总库存`;

-- 12. 为spec表添加时间戳字段
ALTER TABLE `spec` 
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `unit`,
ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- 13. 为spec表添加索引
ALTER TABLE `spec` 
ADD INDEX `idx_spec_barcode` (`barcode` ASC),
ADD INDEX `idx_spec_created` (`created_at` ASC);

-- 14. 删除spec表的条形码唯一约束（如果存在）
-- 注意：这个操作可能会失败，如果约束不存在
ALTER TABLE `spec` DROP INDEX `idx_barcode_unique`;

-- 15. 确保spec_type表存在并插入默认数据
INSERT IGNORE INTO `spec_type` (`spec_type_id`, `spec_name`, `unit`, `description`, `is_active`) VALUES 
(1, '默认规格', '', '系统默认规格类型', TRUE),
(2, '颜色', '', '颜色规格', TRUE),
(3, '尺寸', 'cm', '尺寸规格', TRUE),
(4, '重量', 'g', '重量规格', TRUE),
(5, '容量', 'ml', '容量规格', TRUE);

-- 16. 插入示例品牌数据（如果不存在）
INSERT IGNORE INTO `brand` (`brandID`, `brandname`) VALUES 
(1, '示例品牌1'),
(2, '示例品牌2'),
(3, '示例品牌3'),
(4, '皇家'),
(5, '希尔斯'),
(6, '冠能');

-- 17. 插入示例分类数据（如果不存在）
INSERT IGNORE INTO `classify_level1` (`classify1_ID`, `name`, `parentID`) VALUES 
(1, '宠物用品', NULL),
(2, '食品', 1),
(3, '玩具', 1),
(4, '护理用品', 1),
(5, '狗粮', 2),
(6, '猫粮', 2),
(7, '狗玩具', 3),
(8, '猫玩具', 3);

-- 18. 插入示例经销商数据（如果不存在）
INSERT IGNORE INTO `dealer` (`dealerID`, `dealer_name`, `dealer_tel`, `dealer_address`) VALUES 
(1, '示例经销商1', '1234567890', '示例地址1'),
(2, '示例经销商2', '1234567891', '示例地址2'),
(3, '宠物用品批发商', '13800138000', '北京市朝阳区'),
(4, '宠物食品供应商', '13900139000', '上海市浦东区');

-- 19. 插入示例服务数据（如果不存在）
INSERT IGNORE INTO `services` (`service_id`, `service_name`, `description`, `duration`, `price`, `is_active`) VALUES 
(1, '基础洗澡', '宠物基础洗澡服务', 60, 50.00, TRUE),
(2, '美容修剪', '宠物美容修剪服务', 90, 80.00, TRUE),
(3, '健康检查', '宠物健康检查服务', 30, 30.00, TRUE),
(4, '疫苗接种', '宠物疫苗接种服务', 20, 100.00, TRUE);

-- 20. 显示修复结果
SELECT 'V3到V4迁移完成！' as status;
SELECT 'Product表结构:' as info;
DESCRIBE `product`;
SELECT 'Spec表结构:' as info;
DESCRIBE `spec`;
SELECT 'Spec_type表数据:' as info;
SELECT * FROM `spec_type`;
