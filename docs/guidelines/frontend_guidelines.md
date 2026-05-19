# 前端开发规范与编码标准 (Frontend Guidelines)

**版本**: 1.0
**作者**: AI Technical Manager
**最后更新**: 2026-05-10

## 1. 目录结构规范
```text
src/
├── components/     # 通用 UI 组件 (如 BaseCard, AssetInput)
├── pages/          # 业务页面 (Dashboard, Editor, Settings)
├── store/          # Pinia Stores (useAssetStore, useConfigStore)
├── services/       # 业务逻辑服务 (storage.js, calc.js)
├── utils/          # 纯工具函数 (crypto.js, format.js)
└── styles/         # 全局样式与变量 (variables.scss)
```

## 2. 命名规约
- **组件**: 大驼峰命名，例如 `AssetCard.vue`。
- **变量/函数**: 小驼峰命名，例如 `updateBalance()`。
- **常量**: 全大写加下划线，例如 `DEFAULT_CURRENCY = 'CNY'`。

## 3. 编码要求
- **Vue 3**: 统一使用 `<script setup>` 语法。
- **逻辑抽离**: 页面 `.vue` 文件仅负责 UI 渲染和事件分发，复杂的计算逻辑必须封装在 `services/` 或 `store/` 中。
- **响应式**: 统一使用 `rpx` 单位，确保跨端视觉一致。

## 4. 性能优化
- 账户列表使用 `v-for` 时必须绑定唯一 `key` (UUID)。
- 余额更新等高频操作需注意 Pinia 订阅的性能影响。
