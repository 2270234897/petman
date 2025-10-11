-- MySQL Database Schema Version 5.0
-- Pet Store Management System Database
-- 
-- Updated: 2025-10-10
-- 
-- Main Improvements:
-- 1. Picture fields expanded: VARCHAR(500) to LONGTEXT for base64 images
-- 2. Stock management optimized: Auto-maintained total stock
-- 3. Barcode validation: Allow same barcode for different specs of same product
-- 4. AI assistant integration: Optimized brand and category matching
-- 5. Performance optimization: Added necessary indexes
--
-- =====================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `mydb`;
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mydb`;

-- -----------------------------------------------------
-- Table `mydb`.`customers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`customers` (
  `customer_id` INT NOT NULL AUTO_INCREMENT,
  `customername` VARCHAR(16) NOT NULL,
  `gender` VARCHAR(16) NOT NULL,
  `address` VARCHAR(255) NOT NULL DEFAULT 'Unknown Address',
  `telphone` VARCHAR(20) NOT NULL,
  `Membershiplevel` INT NOT NULL DEFAULT 1,
  `membership_balance` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE INDEX `telphone_UNIQUE` (`telphone` ASC) VISIBLE,
  INDEX `idx_customers_phone` (`telphone` ASC) VISIBLE,
  INDEX `idx_customers_membership` (`Membershiplevel` ASC) VISIBLE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`pets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`pets` (
  `pet_id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `petname` VARCHAR(45) NOT NULL,
  `pet_species` VARCHAR(45) NOT NULL,
  `pet_breeds` VARCHAR(45) NOT NULL,
  `pet_gender` VARCHAR(45) NOT NULL,
  `pet_age` INT NOT NULL DEFAULT 0,
  `neuter` BOOLEAN NOT NULL DEFAULT FALSE,
  `pet_character` VARCHAR(45) NULL,
  `pet_image` VARCHAR(500) NOT NULL DEFAULT '',
  PRIMARY KEY (`pet_id`),
  INDEX `fk_pets_customers1_idx` (`customer_id` ASC) VISIBLE,
  INDEX `idx_pets_customer_id` (`customer_id` ASC) VISIBLE,
  INDEX `idx_pets_species` (`pet_species` ASC) VISIBLE,
  CONSTRAINT `fk_pets_customers1`
    FOREIGN KEY (`customer_id`)
    REFERENCES `mydb`.`customers` (`customer_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`membership_recharge`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`membership_recharge` (
  `recharge_id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `recharge_amount` DECIMAL(10,2) NOT NULL,
  `bonus_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `recharge_time` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`recharge_id`),
  INDEX `idx_customer_id` (`customer_id` ASC) VISIBLE,
  INDEX `idx_recharge_time` (`recharge_time` ASC) VISIBLE,
  CONSTRAINT `fk_membership_recharge_customer`
    FOREIGN KEY (`customer_id`)
    REFERENCES `mydb`.`customers` (`customer_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`classify_level1`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`classify_level1` (
  `classify1_ID` INT NOT NULL AUTO_INCREMENT,
  `parentID` INT NULL,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`classify1_ID`),
  INDEX `parentID_idx` (`parentID` ASC) INVISIBLE,
  CONSTRAINT `parentID`
    FOREIGN KEY (`parentID`)
    REFERENCES `mydb`.`classify_level1` (`classify1_ID`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`brand`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`brand` (
  `brandID` INT NOT NULL AUTO_INCREMENT,
  `brandname` VARCHAR(45) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`brandID`),
  UNIQUE INDEX `brandname_UNIQUE` (`brandname` ASC) VISIBLE,
  INDEX `idx_brand_name` (`brandname` ASC) VISIBLE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`product` (
  `productID` INT NOT NULL AUTO_INCREMENT,
  `classify_level1_classify1_ID` INT NOT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `product_baozhiqi` INT NULL,
  `local` VARCHAR(100) NULL,
  `brand_brandID` INT NOT NULL,
  `product_details` TEXT NULL,
  `cover_image` LONGTEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`productID`),
  INDEX `fk_product_classify_level11_idx` (`classify_level1_classify1_ID` ASC) VISIBLE,
  INDEX `fk_product_brand1_idx` (`brand_brandID` ASC) VISIBLE,
  INDEX `idx_product_name` (`product_name` ASC) VISIBLE,
  INDEX `idx_product_created` (`created_at` ASC) VISIBLE,
  CONSTRAINT `fk_product_classify_level11`
    FOREIGN KEY (`classify_level1_classify1_ID`)
    REFERENCES `mydb`.`classify_level1` (`classify1_ID`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_product_brand1`
    FOREIGN KEY (`brand_brandID`)
    REFERENCES `mydb`.`brand` (`brandID`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`spec_type`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`spec_type` (
  `spec_type_id` INT NOT NULL AUTO_INCREMENT,
  `spec_name` VARCHAR(45) NOT NULL,
  `unit` VARCHAR(20) NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`spec_type_id`),
  UNIQUE INDEX `spec_name_UNIQUE` (`spec_name` ASC) VISIBLE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`spec`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`spec` (
  `specID` INT NOT NULL AUTO_INCREMENT,
  `product_productID` INT NOT NULL,
  `spec_type_id` INT NULL,
  `spec_name` VARCHAR(45) NULL,
  `spec_value` VARCHAR(45) NULL,
  `barcode` VARCHAR(50) NULL,
  `picture` LONGTEXT NULL,
  `total_stock` INT NOT NULL DEFAULT 0,
  `unit` VARCHAR(20) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`specID`),
  INDEX `fk_spec_detail_product1_idx` (`product_productID` ASC) VISIBLE,
  INDEX `fk_spec_spec_type_idx` (`spec_type_id` ASC) VISIBLE,
  INDEX `idx_spec_product_id` (`product_productID` ASC) VISIBLE,
  INDEX `idx_spec_barcode` (`barcode` ASC) VISIBLE,
  INDEX `idx_spec_stock` (`total_stock` ASC) VISIBLE,
  INDEX `idx_spec_created` (`created_at` ASC) VISIBLE,
  CONSTRAINT `fk_spec_detail_product1`
    FOREIGN KEY (`product_productID`)
    REFERENCES `mydb`.`product` (`productID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_spec_spec_type`
    FOREIGN KEY (`spec_type_id`)
    REFERENCES `mydb`.`spec_type` (`spec_type_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`dealer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`dealer` (
  `dealerID` INT NOT NULL AUTO_INCREMENT,
  `dealer_name` VARCHAR(100) NOT NULL,
  `dealer_tel` VARCHAR(20) NULL,
  `dealer_address` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`dealerID`),
  UNIQUE INDEX `dealer_name_UNIQUE` (`dealer_name` ASC) VISIBLE,
  INDEX `idx_dealer_name` (`dealer_name` ASC) VISIBLE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`stock_in`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`stock_in` (
  `stock_inID` INT NOT NULL AUTO_INCREMENT,
  `stock_in_date` DATETIME NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `dealer_dealerID` INT NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_inID`),
  INDEX `fk_stock_in_dealer1_idx` (`dealer_dealerID` ASC) VISIBLE,
  INDEX `idx_stock_in_date` (`stock_in_date` ASC) VISIBLE,
  CONSTRAINT `fk_stock_in_dealer1`
    FOREIGN KEY (`dealer_dealerID`)
    REFERENCES `mydb`.`dealer` (`dealerID`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`stock_in_detail`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`stock_in_detail` (
  `stock_in_detail` INT NOT NULL AUTO_INCREMENT,
  `stock_inID` INT NOT NULL,
  `spec_specID` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price_in` DECIMAL(10,2) NOT NULL,
  `product_date` DATE NOT NULL,
  PRIMARY KEY (`stock_in_detail`),
  INDEX `fk_stock_in_detail_stock_in1_idx` (`stock_inID` ASC) VISIBLE,
  INDEX `fk_stock_in_detail_spec1_idx` (`spec_specID` ASC) VISIBLE,
  INDEX `idx_stock_in_detail_date` (`product_date` ASC) VISIBLE,
  CONSTRAINT `fk_stock_in_detail_stock_in1`
    FOREIGN KEY (`stock_inID`)
    REFERENCES `mydb`.`stock_in` (`stock_inID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_stock_in_detail_spec1`
    FOREIGN KEY (`spec_specID`)
    REFERENCES `mydb`.`spec` (`specID`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`brand_has_dealer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`brand_has_dealer` (
  `brand_brandID` INT NOT NULL,
  `dealer_dealerID` INT NOT NULL,
  PRIMARY KEY (`brand_brandID`, `dealer_dealerID`),
  INDEX `fk_brand_has_dealer_dealer1_idx` (`dealer_dealerID` ASC) VISIBLE,
  INDEX `fk_brand_has_dealer_brand1_idx` (`brand_brandID` ASC) VISIBLE,
  CONSTRAINT `fk_brand_has_dealer_brand1`
    FOREIGN KEY (`brand_brandID`)
    REFERENCES `mydb`.`brand` (`brandID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_brand_has_dealer_dealer1`
    FOREIGN KEY (`dealer_dealerID`)
    REFERENCES `mydb`.`dealer` (`dealerID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`order` (
  `orderID` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `price` DECIMAL(10,2) NULL,
  `discount` DECIMAL(10,2) NULL,
  `sale_time` DATETIME NULL,
  `pay_way` VARCHAR(45) NULL,
  `status` ENUM('Pending', 'Paid', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`orderID`),
  INDEX `fk_order_customers1_idx` (`customer_id` ASC) VISIBLE,
  INDEX `idx_order_date` (`sale_time` ASC) VISIBLE,
  INDEX `idx_order_status` (`status` ASC) VISIBLE,
  CONSTRAINT `fk_order_customers1`
    FOREIGN KEY (`customer_id`)
    REFERENCES `mydb`.`customers` (`customer_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`order_deatil`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`order_deatil` (
  `order_deatilID` INT NOT NULL AUTO_INCREMENT,
  `order_orderID` INT NOT NULL,
  `spec_specID` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`order_deatilID`, `order_orderID`),
  INDEX `fk_order_deatil_order1_idx` (`order_orderID` ASC) VISIBLE,
  INDEX `fk_order_deatil_spec1_idx` (`spec_specID` ASC) VISIBLE,
  CONSTRAINT `fk_order_deatil_order1`
    FOREIGN KEY (`order_orderID`)
    REFERENCES `mydb`.`order` (`orderID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_order_deatil_spec1`
    FOREIGN KEY (`spec_specID`)
    REFERENCES `mydb`.`spec` (`specID`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`services` (
  `service_id` INT NOT NULL AUTO_INCREMENT,
  `service_name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `duration` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  INDEX `idx_service_active` (`is_active` ASC) VISIBLE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `mydb`.`appointments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`appointments` (
  `appointment_id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `pet_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `appointment_date` DATE NOT NULL,
  `appointment_time` TIME NOT NULL,
  `status` ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  INDEX `fk_appointments_customer_idx` (`customer_id` ASC) VISIBLE,
  INDEX `fk_appointments_pet_idx` (`pet_id` ASC) VISIBLE,
  INDEX `fk_appointments_service_idx` (`service_id` ASC) VISIBLE,
  INDEX `idx_appointment_date` (`appointment_date` ASC) VISIBLE,
  INDEX `idx_appointment_status` (`status` ASC) VISIBLE,
  CONSTRAINT `fk_appointments_customer`
    FOREIGN KEY (`customer_id`)
    REFERENCES `mydb`.`customers` (`customer_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_appointments_pet`
    FOREIGN KEY (`pet_id`)
    REFERENCES `mydb`.`pets` (`pet_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_appointments_service`
    FOREIGN KEY (`service_id`)
    REFERENCES `mydb`.`services` (`service_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- =====================================================
-- Insert Default Data
-- =====================================================

-- Insert default spec types
INSERT INTO `spec_type` (`spec_type_id`, `spec_name`, `unit`, `description`, `is_active`) VALUES 
(1, 'Default', '', 'Default spec type', TRUE),
(2, 'Color', '', 'Color specification', TRUE),
(3, 'Size', 'cm', 'Size specification', TRUE),
(4, 'Weight', 'g', 'Weight specification', TRUE),
(5, 'Volume', 'ml', 'Volume specification', TRUE),
(6, 'General', '', 'General specification', TRUE);

-- Insert sample brand data
INSERT INTO `brand` (`brandID`, `brandname`, `description`) VALUES 
(1, 'Royal Canin', 'French pet food brand'),
(2, 'Hills', 'American pet nutrition brand'),
(3, 'Purina', 'Purina pet food brand'),
(4, 'Myfoodie', 'Chinese pet food brand'),
(5, 'Bridge', 'Chinese premium pet food'),
(6, 'Sample Brand', 'Test brand');

-- Insert sample category data (3-level structure)
INSERT INTO `classify_level1` (`classify1_ID`, `name`, `parentID`) VALUES 
-- Level 1
(1, 'Pet Supplies', NULL),
(2, 'Pet Food', NULL),
(3, 'Pet Medical', NULL),
(4, 'Pet Grooming', NULL),

-- Level 2 (Food)
(10, 'Dog Food', 2),
(11, 'Cat Food', 2),
(12, 'General Food', 2),

-- Level 2 (Supplies)
(20, 'Dog Supplies', 1),
(21, 'Cat Supplies', 1),
(22, 'General Supplies', 1),

-- Level 3 (Dog Food)
(100, 'Dog Main Food', 10),
(101, 'Dog Canned', 10),
(102, 'Dog Treats', 10),

-- Level 3 (Cat Food)
(110, 'Cat Main Food', 11),
(111, 'Cat Canned', 11),
(112, 'Cat Treats', 11),

-- Level 3 (Dog Supplies)
(200, 'Dog Toys', 20),
(201, 'Dog Bed', 20),
(202, 'Dog Leash', 20),

-- Level 3 (Cat Supplies)
(210, 'Cat Toys', 21),
(211, 'Cat Tree', 21),
(212, 'Cat Litter', 21);

-- Insert sample dealer data
INSERT INTO `dealer` (`dealerID`, `dealer_name`, `dealer_tel`, `dealer_address`) VALUES 
(1, 'Beijing Pet Supplies', '13800138000', 'Beijing Chaoyang District'),
(2, 'Shanghai Pet Food', '13900139000', 'Shanghai Pudong District'),
(3, 'Guangzhou Royal Dealer', '13700137000', 'Guangzhou Tianhe District'),
(4, 'Shenzhen Pet Supplies', '13600136000', 'Shenzhen Nanshan District');

-- Insert sample service data
INSERT INTO `services` (`service_id`, `service_name`, `description`, `duration`, `price`, `is_active`) VALUES 
(1, 'Basic Bath', 'Basic pet bathing service', 60, 50.00, TRUE),
(2, 'Grooming', 'Pet grooming and trimming', 90, 80.00, TRUE),
(3, 'Health Check', 'Basic health check', 30, 30.00, TRUE),
(4, 'Vaccination', 'Pet vaccination service', 20, 100.00, TRUE),
(5, 'SPA Care', 'Deep SPA care service', 120, 150.00, TRUE);

-- =====================================================
-- Insert Sample Products (for testing)
-- =====================================================

-- Sample Product 1: Royal Cat Food
INSERT INTO `product` (`productID`, `product_name`, `classify_level1_classify1_ID`, `product_baozhiqi`, `local`, `brand_brandID`, `product_details`, `cover_image`) VALUES
(1, 'Royal Cat Food Adult', 110, 18, 'France', 1, 'Nutrition formula for adult cats over 1 year old', NULL);

INSERT INTO `spec` (`specID`, `product_productID`, `spec_type_id`, `spec_name`, `spec_value`, `barcode`, `picture`, `total_stock`, `unit`) VALUES
(1, 1, 4, 'Weight', '2kg', '6901234567890', NULL, 0, 'kg'),
(2, 1, 4, 'Weight', '10kg', '6901234567891', NULL, 0, 'kg');

-- Sample Product 2: Dog Toy
INSERT INTO `product` (`productID`, `product_name`, `classify_level1_classify1_ID`, `product_baozhiqi`, `local`, `brand_brandID`, `product_details`) VALUES
(2, 'Rubber Ball', 200, NULL, 'China', 6, 'Durable rubber ball for large dogs');

INSERT INTO `spec` (`specID`, `product_productID`, `spec_type_id`, `spec_name`, `spec_value`, `barcode`, `picture`, `total_stock`, `unit`) VALUES
(3, 2, 3, 'Size', 'L', '', NULL, 0, 'cm');

-- =====================================================
-- Create View: Product Stock Summary
-- =====================================================

CREATE OR REPLACE VIEW `v_product_stock_summary` AS
SELECT 
    p.productID,
    p.product_name,
    b.brandname,
    c.name as classify_name,
    p.product_baozhiqi,
    p.local,
    COUNT(DISTINCT s.specID) as spec_count,
    COALESCE(SUM(s.total_stock), 0) as total_stock,
    p.created_at,
    p.updated_at
FROM product p
LEFT JOIN brand b ON p.brand_brandID = b.brandID
LEFT JOIN classify_level1 c ON p.classify_level1_classify1_ID = c.classify1_ID
LEFT JOIN spec s ON s.product_productID = p.productID
GROUP BY p.productID, p.product_name, b.brandname, c.name, p.product_baozhiqi, p.local, p.created_at, p.updated_at
ORDER BY p.productID;

-- =====================================================
-- Create Stored Procedure: Sync Stock
-- =====================================================

DELIMITER $$

CREATE PROCEDURE `sync_stock_from_records`()
BEGIN
    -- Recalculate total stock for all specs based on stock_in records
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_spec_id INT;
    DECLARE cur CURSOR FOR SELECT specID FROM spec;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Reset all stock to 0
    UPDATE spec SET total_stock = 0;
    
    -- Loop through all specs and calculate actual stock
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_spec_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Calculate total stock from stock_in_detail
        UPDATE spec s
        SET s.total_stock = (
            SELECT COALESCE(SUM(sid.quantity), 0)
            FROM stock_in_detail sid
            WHERE sid.spec_specID = s.specID
        )
        WHERE s.specID = v_spec_id;
    END LOOP;
    CLOSE cur;
    
    SELECT 'Stock sync completed' AS message, COUNT(*) AS updated_specs FROM spec WHERE total_stock > 0;
END$$

DELIMITER ;

-- =====================================================
-- Restore System Settings
-- =====================================================

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- =====================================================
-- Version Info
-- =====================================================

SELECT 'Database Version 5.0 created successfully!' AS Status;
SELECT 'Main updates:' AS Info;
SELECT '1. Picture fields expanded to LONGTEXT (support base64 large images)' AS Update1;
SELECT '2. Brand table with auto-increment and unique constraint' AS Update2;
SELECT '3. Stock field optimization and indexing' AS Update3;
SELECT '4. New product stock summary view' AS Update4;
SELECT '5. New stock sync stored procedure' AS Update5;
SELECT '6. Optimized foreign key constraints and cascade rules' AS Update6;
SELECT '7. Complete sample data with 3-level categories' AS Update7;
