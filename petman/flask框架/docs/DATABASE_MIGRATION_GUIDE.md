# 数据库迁移指南

## 概述
本指南用于将数据库结构更新以匹配代码修改。修改包括：
1. 为pets表添加图片字段
2. 修改pets表绝育字段为布尔类型
3. 为customers表添加会员余额字段
4. 创建会员充值记录表
5. 统一数据库命名规则
6. 添加条形码唯一性约束
7. 优化数据库性能

## 执行前准备

### 1. 备份数据库
```bash
# 备份整个数据库
mysqldump -u username -p database_name > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# 或者只备份相关表
mysqldump -u username -p database_name pets customers spec product > backup_tables_$(date +%Y%m%d_%H%M%S).sql
```

### 2. 检查当前数据库结构
```sql
-- 检查pets表结构
DESCRIBE pets;

-- 检查customers表结构
DESCRIBE customers;

-- 检查spec表结构
DESCRIBE spec;

-- 检查现有数据
SELECT COUNT(*) as pet_count FROM pets;
SELECT COUNT(*) as customer_count FROM customers;
SELECT COUNT(*) as spec_count FROM spec;
```

## 执行步骤

### 方案一：安全执行（推荐）
使用 `database_migration_safe.sql` 文件，分步骤执行：

1. **第一步：添加新字段**
```sql
-- 执行文件中的第一部分（添加字段）
-- 这些操作是安全的，不会影响现有数据
```

2. **第二步：检查数据**
```sql
-- 检查neuter字段的数据分布
SELECT DISTINCT neuter, COUNT(*) as count FROM pets GROUP BY neuter;
```

3. **第三步：修改字段类型**
```sql
-- 只有在数据检查通过后才执行
ALTER TABLE pets MODIFY COLUMN neuter BOOLEAN DEFAULT FALSE COMMENT '是否已绝育';
```

4. **第四步：创建新表**
```sql
-- 创建会员充值记录表
```

5. **第五步：添加约束**
```sql
-- 检查条形码重复情况
SELECT barcode, COUNT(*) as count 
FROM spec 
WHERE barcode IS NOT NULL AND barcode != 0 
GROUP BY barcode 
HAVING COUNT(*) > 1;
```

### 方案二：快速执行
使用 `database_migration.sql` 文件，一次性执行所有修改。

## 验证修改

### 1. 检查表结构
```sql
-- 验证pets表
DESCRIBE pets;
SELECT COUNT(*) FROM pets;

-- 验证customers表
DESCRIBE customers;
SELECT COUNT(*) FROM customers;

-- 验证新创建的membership_recharge表
DESCRIBE membership_recharge;
```

### 2. 检查数据完整性
```sql
-- 检查pets表数据
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN neuter IS NULL THEN 1 END) as null_neuter_count,
    COUNT(CASE WHEN pet_image IS NULL OR pet_image = '' THEN 1 END) as empty_image_count
FROM pets;

-- 检查customers表数据
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN membership_balance IS NULL THEN 1 END) as null_balance_count,
    COUNT(CASE WHEN address = '' OR address IS NULL THEN 1 END) as empty_address_count
FROM customers;
```

### 3. 测试新功能
```sql
-- 测试会员充值功能
CALL RechargeMember(1, 100.00, 10.00);

-- 检查充值记录
SELECT * FROM membership_recharge WHERE customer_id = 1;

-- 检查客户余额更新
SELECT customer_id, customername, membership_balance FROM customers WHERE customer_id = 1;
```

## 回滚方案

如果出现问题，可以使用以下回滚脚本：

```sql
-- 删除新添加的字段
ALTER TABLE pets DROP COLUMN IF EXISTS pet_image;
ALTER TABLE customers DROP COLUMN IF EXISTS membership_balance;
ALTER TABLE product DROP COLUMN IF EXISTS product_details;
ALTER TABLE product DROP COLUMN IF EXISTS cover_image;

-- 删除新创建的表
DROP TABLE IF EXISTS membership_recharge;

-- 删除新创建的索引
DROP INDEX IF EXISTS idx_pets_customer_id ON pets;
DROP INDEX IF EXISTS idx_pets_species ON pets;
DROP INDEX IF EXISTS idx_customers_phone ON customers;
DROP INDEX IF EXISTS idx_customers_membership ON customers;
DROP INDEX IF EXISTS idx_spec_product_id ON spec;
DROP INDEX IF EXISTS idx_barcode_unique ON spec;

-- 删除视图和存储过程
DROP VIEW IF EXISTS customer_membership_view;
DROP PROCEDURE IF EXISTS RechargeMember;
```

## 注意事项

1. **生产环境**：在生产环境执行前，务必在测试环境先验证
2. **数据备份**：执行前必须备份数据库
3. **分批执行**：建议分步骤执行，每步都验证结果
4. **监控性能**：执行过程中监控数据库性能
5. **测试功能**：执行完成后测试所有相关功能

## 常见问题

### Q1: 如果条形码有重复怎么办？
A: 执行前先检查重复数据，可以使用以下脚本处理：
```sql
UPDATE spec SET barcode = CONCAT(barcode, '_', specID) 
WHERE barcode IN (
    SELECT barcode FROM (
        SELECT barcode FROM spec 
        WHERE barcode IS NOT NULL AND barcode != 0 
        GROUP BY barcode HAVING COUNT(*) > 1
    ) AS duplicates
);
```

### Q2: 如果neuter字段有非布尔值怎么办？
A: 先检查数据，然后清理：
```sql
-- 检查数据
SELECT DISTINCT neuter FROM pets;

-- 清理数据（根据实际情况调整）
UPDATE pets SET neuter = FALSE WHERE neuter NOT IN (0, 1, '0', '1', 'false', 'true');
```

### Q3: 执行过程中出现错误怎么办？
A: 立即停止执行，检查错误信息，必要时使用回滚脚本恢复数据库。

## 联系支持

如果在执行过程中遇到问题，请：
1. 保存错误信息
2. 检查数据库日志
3. 联系技术支持团队
