interface FaqItem {
  category: string
  items: string[]
}

export function useFaq() {
  const faqQuestions: FaqItem[] = [
    {
      category: '快速开始',
      items: [
        '如何快速找到我需要的技术文档？',
        '网站支持哪些主题内容？',
        '文档是否支持全文搜索？',
        '如何使用 AI 问答功能？'
      ]
    },
    {
      category: '前端开发',
      items: [
        'Vue 3 自动导入功能如何使用？',
        'Nuxt 页面复制工具怎么用？',
        '如何解决 Nuxt 的 Node 版本兼容性问题？',
        'Vue 常见问题有哪些解决方案？'
      ]
    },
    {
      category: '基础知识',
      items: [
        '什么是 async/await，如何正确使用？',
        'Promise 和 async/await 的区别是什么？',
        '如何处理异步错误？',
        '有哪些常见的 JavaScript 编程技巧？'
      ]
    },
    {
      category: '后端开发',
      items: [
        'Java 全局缓存如何实现？',
        '后端 API 设计有哪些最佳实践？',
        '如何优化服务器性能？'
      ]
    },
    {
      category: '开发工具',
      items: [
        'Homebrew 包管理器如何使用？',
        'fnm（Fast Node Manager）是什么？',
        '推荐哪些版本控制工具？',
        '如何配置开发环境？'
      ]
    },
    {
      category: '部署运维',
      items: [
        '如何使用 Docker 部署应用？',
        'Linux 常用命令有哪些？',
        '钉钉平台集成如何配置？',
        '生产环境部署的注意事项？'
      ]
    }
  ]

  return {
    faqQuestions
  }
}
