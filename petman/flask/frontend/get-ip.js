/**
 * 自动获取本机 IP 并生成 .env.local 文件
 * 
 * 使用方法：
 * node get-ip.js
 */

import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部和非 IPv4 地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

function main() {
  const ip = getLocalIP();
  const apiUrl = `http://${ip}:5000`;
  const envPath = path.join(__dirname, '.env.local');
  
  const envContent = `# 自动生成的配置文件
# 生成时间: ${new Date().toLocaleString('zh-CN')}
# 本机 IP: ${ip}

VITE_API_BASE_URL=${apiUrl}
`;

  try {
    fs.writeFileSync(envPath, envContent, 'utf-8');
    
    console.log('\n✅ 配置文件已生成！\n');
    console.log('📝 文件位置:', envPath);
    console.log('🌐 API 地址:', apiUrl);
    console.log('📱 手机访问:', `http://${ip}:5173`);
    console.log('\n⚠️  请重启开发服务器以应用配置：');
    console.log('   Ctrl+C 停止服务器');
    console.log('   npm run dev 重新启动\n');
    
    // 提示下一步
    console.log('📋 下一步：');
    console.log('   1. 确保后端已启动: cd ..\\backend && python app.py');
    console.log('   2. 重启前端: npm run dev');
    console.log(`   3. 手机访问: http://${ip}:5173\n`);
    
  } catch (error) {
    console.error('❌ 生成配置文件失败:', error.message);
    process.exit(1);
  }
}

main();

