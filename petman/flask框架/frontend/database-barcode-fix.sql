-- 数据库条形码字段调整SQL脚本
-- 执行前请务必备份数据库！

-- ============================================
-- 1. 备份现有数据
-- ============================================
CREATE TABLE specs_backup AS SELECT * FROM specs;
CREATE TABLE barcode_backup AS 
SELECT id, barcode, CAST(barcode AS CHAR(50)) as barcode_str 
FROM specs 
WHERE barcode IS NOT NULL;

-- ============================================
-- 2. 添加新的条形码字段（VARCHAR类型）
-- ============================================
ALTER TABLE specs 
ADD COLUMN barcode_new VARCHAR(50);

-- ============================================
-- 3. 数据迁移
-- ============================================
-- 将现有条形码数据迁移到新字段
UPDATE specs 
SET barcode_new = CASE 
    WHEN barcode IS NULL THEN NULL
    WHEN LENGTH(CAST(barcode AS CHAR)) > 20 THEN CONCAT('ERR_', id)  -- 超长条形码标记为错误
    ELSE CAST(barcode AS CHAR(50))
END;

-- ============================================
-- 4. 删除旧字段，重命名新字段
-- ============================================
ALTER TABLE specs DROP COLUMN barcode;
ALTER TABLE specs CHANGE COLUMN barcode_new barcode VARCHAR(50);

-- ============================================
-- 5. 添加约束和索引
-- ============================================
-- 添加非空约束
ALTER TABLE specs 
MODIFY COLUMN barcode VARCHAR(50) NOT NULL;

-- 添加唯一约束
ALTER TABLE specs 
ADD CONSTRAINT uk_specs_barcode UNIQUE (barcode);

-- 添加索引提高查询性能
CREATE INDEX idx_specs_barcode ON specs(barcode);

-- ============================================
-- 6. 验证结果
-- ============================================
-- 检查表结构
DESCRIBE specs;

-- 检查约束
SHOW INDEX FROM specs WHERE Key_name = 'uk_specs_barcode';

-- 检查数据
SELECT COUNT(*) as total_specs, 
       COUNT(barcode) as specs_with_barcode,
       COUNT(DISTINCT barcode) as unique_barcodes
FROM specs;

-- 检查是否有错误标记的条形码
SELECT * FROM specs WHERE barcode LIKE 'ERR_%';

-- ============================================
-- 7. 如果需要回滚（紧急情况）
-- ============================================
-- 注意：回滚前请确认已备份数据
/*
-- 删除新约束和索引
ALTER TABLE specs DROP INDEX uk_specs_barcode;
ALTER TABLE specs DROP INDEX idx_specs_barcode;

-- 恢复原始表结构
ALTER TABLE specs DROP COLUMN barcode;
ALTER TABLE specs ADD COLUMN barcode INT;

-- 从备份恢复数据
UPDATE specs s 
JOIN specs_backup sb ON s.id = sb.id 
SET s.barcode = sb.barcode;
*/
