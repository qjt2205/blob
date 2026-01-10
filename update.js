// update.js - 更新现有项目
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

// 配置 - 修改这里！
const PROJECT_NAME = 'blob' // ← 改成你的项目名称

console.log('🔄 开始更新项目...\n')

try {
  // 1. 构建项目
  console.log('🏗️  正在构建...')
  execSync('npm run build', { stdio: 'inherit' })
  
  // 2. 部署更新
  console.log(`🚀 正在部署到: ${PROJECT_NAME}...`)
  execSync(`npx wrangler pages deploy dist --project-name=${PROJECT_NAME}`, {
    stdio: 'inherit'
  })
  
  console.log('\n✅ 更新完成！')
  console.log(`🌐 访问: https://${PROJECT_NAME}.pages.dev`)
  
} catch (error) {
  console.error('\n❌ 更新失败:', error.message)
  console.log('\n💡 可能的原因:')
  console.log('1. 项目名称错误 - 请检查 Cloudflare Dashboard')
  console.log('2. 没有权限 - 确保已登录 wrangler login')
  console.log('3. 项目不存在 - 可能需要先创建')
  
  // 提示创建
  console.log('\n🔧 如果要创建新项目，运行:')
  console.log(`npx wrangler pages project create ${PROJECT_NAME}`)
  
  process.exit(1)
}