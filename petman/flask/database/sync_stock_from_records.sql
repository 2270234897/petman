-- 同步库存：根据入库记录重新计算spec表的总库存
-- 用于修复之前入库时没有更新库存的历史数据

USE mydb;

-- Reset all spec total stock to 0
UPDATE spec SET total_stock = 0;

-- Recalculate total stock for each spec based on stock_in_detail
UPDATE spec s
SET total_stock = (
    SELECT COALESCE(SUM(sid.quantity), 0)
    FROM stock_in_detail sid
    WHERE sid.spec_specID = s.specID
);

-- Verify results
SELECT 
    s.specID,
    p.product_name,
    s.spec_name,
    s.spec_value,
    s.total_stock as current_stock,
    (SELECT COALESCE(SUM(sid.quantity), 0) FROM stock_in_detail sid WHERE sid.spec_specID = s.specID) as calculated_stock
FROM spec s
JOIN product p ON s.product_productID = p.productID
WHERE s.total_stock > 0
ORDER BY s.total_stock DESC
LIMIT 20;

SELECT 'Stock sync completed!' AS Status;

