/**
 * PWA 图标生成脚本
 * 
 * 使用方法：
 * 1. 安装依赖: npm install sharp
 * 2. 准备源图标文件 (至少 512x512): source-icon.png
 * 3. 运行: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 配置
const SOURCE_IMAGE = path.join(__dirname, '../frontend/public/vite.svg');
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// 创建输出目录
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✓ 创建目录: ${OUTPUT_DIR}`);
}

// 检查源文件
if (!fs.existsSync(SOURCE_IMAGE)) {
  console.error(`✗ 源图标文件不存在: ${SOURCE_IMAGE}`);
  console.error('请准备一个至少 512x512 的图标文件，命名为 source-icon.png');
  process.exit(1);
}

// 生成图标
console.log(`\n开始生成图标...\n从源文件: ${SOURCE_IMAGE}\n`);

async function generateIcons() {
  try {
    // 如果源文件是 SVG，先转换为 PNG
    let sourceBuffer;
    if (SOURCE_IMAGE.endsWith('.svg')) {
      console.log('检测到 SVG 文件，先转换为 PNG...');
      sourceBuffer = await sharp(SOURCE_IMAGE)
        .resize(512, 512)
        .png()
        .toBuffer();
    } else {
      sourceBuffer = SOURCE_IMAGE;
    }

    // 生成各种尺寸
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      
      await sharp(sourceBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ 生成: icon-${size}x${size}.png`);
    }

    console.log('\n✓ 所有图标生成完成！');
    console.log(`\n输出目录: ${OUTPUT_DIR}`);
    
    // 生成图标列表
    console.log('\n生成的图标:');
    SIZES.forEach(size => {
      console.log(`  - icon-${size}x${size}.png (${size}×${size})`);
    });

  } catch (error) {
    console.error('\n✗ 生成图标失败:', error.message);
    process.exit(1);
  }
}

// 运行
generateIcons();



