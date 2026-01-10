<template>
  <div class="about-view">
    <div class="page-header">
      <h1 class="page-title">关于我</h1>
      <p class="page-description">一个热爱生活的普通人</p>
    </div>

    <div class="about-content">
      <div class="img"><img src="@/assets/img/bg.png" alt=""></div>      
      <div class="about-text">
        <p>在这个数字化的时代，我试图用文字记录生活的点滴，寻找日常中的诗意。</p>
        
        <p>我相信，生活本身就是一件艺术品，每个人都是自己生活的艺术家。无论是清晨的一杯咖啡，还是黄昏的一抹余晖，都值得被认真对待。</p>
        
        <blockquote>
          <p>「我们不是从生活中获得灵感和能量，我们本身就是生活的一部分。」</p>
        </blockquote>
        
        <p>这个博客是我与世界对话的方式，也是我整理思考的空间。希望我的文字能给你带来一些共鸣和启发。</p>
      </div>
    </div>

    <div class="interests">
      <h2>我的兴趣</h2>
      <div class="interest-tags">
        <span class="interest-tag">阅读</span>
        <span class="interest-tag">写作</span>
        <span class="interest-tag">动漫</span>
        <span class="interest-tag">咖啡</span>
        <span class="interest-tag">旅行</span>
        <span class="interest-tag">音乐</span>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.about-view {
  padding-top: var(--space-xxl);
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-xxl);
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: var(--space-sm);
  
  &::after {
    margin: var(--space-md) auto 0;
  }
}

.page-description {
  margin-top: .5rem;
  color: var(--color-text-light);
  font-size: 1.2rem;
}

.about-content {
  margin: 3rem 0;
  padding-bottom: 3rem;
  border-bottom: 1px solid var(--color-border);

  .img {
    width: 80rem;
    height: auto;
    margin: 0 auto 3rem;

    img {
      max-width: 100%;
      height: auto;
    }
  }
}


.about-text {
  max-width: 80rem;
  margin: 0 auto;
  p {
    margin-bottom: var(--space-lg);
    font-size: 16px;
    line-height: 1.8;
  }
}

blockquote {
  border-left: 3px solid var(--color-primary);
  padding-left: var(--space-lg);
  margin: 1rem 0;
  color: var(--color-text-light);
  
  p {
    margin: 0;
  }
}

.interests {
  text-align: center;
  
  h2 {
    margin-bottom: var(--space-xl);
  }
}

.interest-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.interest-tag {
  padding: .4rem 3rem;
  background: #eee;
  border-radius: 2px;
  color: var(--color-primary);
  font-family: var(--font-sans);
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--color-primary);
    color: white;
    transform: translateY(-2px);
  }
}
</style>