# 极简资产 (Simple Asset)

**隐私优先的个人资产统计工具**，纯本地存储，数据不上传任何服务器。

基于 Uni-app 跨端框架构建，一套代码同时运行 Android、iOS、H5、微信小程序等多端。

## 特性

- **资产看板** — 打开即见总资产，分类分布一目了然
- **趋势追踪** — 每次更新自动记录快照，追踪近 6 个月资产增长趋势
- **隐私模式** — 一键隐藏所有金额（首页 / 图表 / 趋势三处联动），公共场合也不怕
- **跨端运行** — 基于 Uni-app，支持 Android / iOS / H5 / 小程序
- **数据闭环** — JSON 格式导入导出，数据完全由你掌控
- **不计入统计** — 支持标记账户是否计入总资产
- **向后兼容** — 导入旧版本备份自动补全缺失字段，不会崩溃

## 技术栈

| 类别 | 选型 | 说明 |
|---|---|---|
| 跨端框架 | Uni-app (Vue 3) | `<script setup>` Composition API，条件编译适配多端 |
| 状态管理 | Pinia | 双 Store 架构（资产 + 配置），手动持久化 |
| 精度计算 | Big.js | 浮点数精度问题，所有货币运算必须经过 Big.js |
| 样式方案 | SCSS | rpx 响应式单位，跨端视觉一致 |
| 构建工具 | HBuilderX | 内置 Webpack 编译，一键发布多端 |
| Android 持久化 | `uni.getFileSystemManager` | 同步文件写入，解决 Android 杀进程丢数据 |
| H5 / 其他端 | `uni.setStorageSync` | Key-Value 存储，H5 端走 localStorage |

### 依赖清单

```json
{
  "big.js": "^6.2.1",           // 高精度浮点运算
  "pinia": "^2.1.7",            // Vue 3 状态管理
  "pinia-plugin-persistedstate": "^3.2.1",
  "crypto-js": "^4.2.0"         // 加密工具（预留）
}
```

## 技术架构

```
┌─────────────────────────────────────────┐
│               View Layer                 │
│  pages/ (index, account, settings)      │
│  components/ (DistChart, TrendChart)    │
│         UI 渲染 · 事件分发              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│              Store Layer                 │
│  store/assets.js    store/config.js     │
│         状态管理 · 快照记录              │
└────────┬───────────────────┬────────────┘
         │                   │
┌────────▼───────┐  ┌───────▼────────────┐
│  Service Layer │  │   Utils Layer       │
│  calc.js       │  │   crypto.js         │
│  storage.js    │  │   nativeFile.js     │
│  业务逻辑封装  │  │   同步文件读写      │
└────────────────┘  └────────────────────┘
         │
┌────────▼────────────────────────────────┐
│           Persistence Layer              │
│  uni.setStorageSync (通用 K-V 存储)      │
│  getFileSystemManager (Android 同步文件) │
│          双重存储 · 互为备份             │
└──────────────────────────────────────────┘
```

### 数据流

```
用户操作 → 页面事件 → Store Action
                         │
                    ┌────▼────┐
                    │ 更新状态  │
                    └────┬────┘
                    ┌────▼────┐
                    │ 自动快照  │ ← takeSnapshot()
                    └────┬────┘
                    ┌────▼────┐
                    │ 持久化   │ ← saveToStorage()
                    └─────────┘
```

## 项目结构

```
savings-tracker/
├── README.md
├── PRD.md                        # 产品需求文档
├── docs/                         # 设计文档
│   ├── api/internal_api.md       # 内部接口文档
│   ├── feasibility_report.md     # 技术可行性分析
│   ├── security/security_design.md
│   └── guidelines/               # 开发规范
│       ├── frontend_guidelines.md
│       ├── storage_service_guidelines.md
│       └── android_compatibility_guide.md
└── Simple Asset/                 # Uni-app 项目主体
    ├── pages/
    │   ├── index/index.vue       # 首页看板（总资产 + 图表 + 账户列表）
    │   ├── account/edit.vue      # 账户编辑（新增 / 修改 / 删除）
    │   └── settings/index.vue    # 设置（隐私开关、导入导出）
    ├── components/
    │   ├── DistChart.vue         # 资产分布图（类别进度条）
    │   └── TrendChart.vue        # 增长趋势图（柱状图）
    ├── store/
    │   ├── assets.js             # 核心：账户 CRUD、历史快照、汇率
    │   └── config.js             # 配置：隐私模式、币种符号
    ├── services/
    │   ├── calc.js               # Big.js 精度计算服务
    │   ├── storage.js            # 导入导出 + 原生文件读写
    │   └── nativeFile.js         # 同步文件系统（Android 防丢）
    ├── utils/
    │   └── crypto.js             # 加密工具
    ├── App.vue                   # 启动时同步初始化 Store
    ├── main.js                   # Vue 3 + Pinia 挂载入口
    ├── manifest.json             # Uni-app 跨端配置
    └── pages.json                # 页面路由配置
```

## 跨端适配设计

通过 Uni-app 条件编译实现不同平台的差异化处理：

- **Android (APP-PLUS)** — 使用 `getFileSystemManager` 同步写入文件系统，防止杀进程导致数据丢失；页面传参统一走 `onLoad` 而非 `getCurrentPages`
- **H5** — 使用 `uni.setStorageSync` / `localStorage` 作为降级存储
- **小程序** — 使用对应平台的 Storage API

## 核心业务规则

| ID | 规则 |
|---|---|
| BR-01 | 总资产自动聚合，排除"不计入"账户 |
| BR-02 | 数据本地化，不上传云端 |
| BR-03 | 多币种通过手动汇率换算 |
| BR-05 | 每次保存自动记录日期 + 总资产快照 |
| BR-06 | 隐私模式状态持久化，下次启动保持 |
| BR-07 | 导入/批量更新时强制同步持久化 |
| BR-08 | 数据向下兼容，导入时自动补全缺失字段 |
| BR-09 | 隐私模式下全局金额掩码联动 |

## 快速开始

```bash
# 安装依赖
cd "Simple Asset"
npm install

# 用 HBuilderX 打开项目根目录
# 运行 → 运行到浏览器 → Chrome
```

## 版本

**v2.0** — 新增趋势追踪、隐私联动、数据导入导出、向后兼容、Android 持久化增强
