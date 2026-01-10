// deploy.js - 一键部署脚本
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

console.log('🚀 开始部署到 Cloudflare Pages...\n')

try {
  // 1. 清理和安装
  console.log('📦 清理旧构建...')
  try {
    execSync('rm -rf dist', { stdio: 'inherit' })
  } catch (e) { /* 忽略错误 */ }
  
  // 2. 安装依赖
  console.log('📦 安装依赖...')
  execSync('npm install', { stdio: 'inherit' })
  
  // 3. 构建项目
  console.log('🏗️  正在构建项目...')
  execSync('npm run build', { stdio: 'inherit' })
  
  // 4. 读取项目配置
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'))
  const projectName = 'my-blog-system' // 自定义项目名
  
  console.log(`\n🚀 正在部署: ${projectName}...`)
  
  // 5. 部署到 Cloudflare Pages
  execSync(`npx wrangler pages deploy dist --project-name=${projectName}`, { 
    stdio: 'inherit' 
  })
  
  console.log('\n✅ 部署完成！')
  console.log(`🌐 访问地址: https://${projectName}.pages.dev`)
  
} catch (error) {
  console.error('\n❌ 部署失败:', error.message)
  process.exit(1)
}