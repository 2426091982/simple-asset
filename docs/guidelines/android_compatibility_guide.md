# Android 平台兼容性与数据完整性设计文档

**版本**: 1.0
**日期**: 2026-05-10

## 1. 核心问题定位

### 1.1 数据回显失效 (Data Echo Issue)
- **现象**: 导入后点击编辑，页面为空。
- **原因**: 
    - 使用 `getCurrentPages()` 在 Android App 端（App-plus）获取 `options` 参数不稳定。
    - 页面生命周期与 H5 存在差异，`onMounted` 时参数可能尚未完全绑定。
- **方案**: 统一采用 Uni-app 标准的 `onLoad` 生命周期钩子获取 URL 参数。

### 1.2 数据丢失 (Data Persistence Issue)
- **现象**: 导入数据后重启 App，数据重置。
- **原因**: 
    - `uni.setStorageSync` 和 `plus.storage` 在 Android App 端存在系统级缓存延迟，杀掉进程时可能还未刷入物理磁盘。
    - 在某些深度定制的 Android 系统上，Key-Value 存储在进程异常终止时极易丢失未提交的修改。
- **方案**: 
    - **原生文件系统级持久化**：采用 `plus.io` 直接操作 Android 原生文件系统，将加密后的 JSON 写入 App 私有文档目录（`PRIVATE_DOC`）。文件写入是操作系统级的，一旦完成即刻持久化。
    - **异步启动回填**：在 `App.vue` 中采用 `async/await` 确保应用在渲染首页前已从文件系统异步读取并恢复所有数据。
    - **双重存储冗余**：同时保留 `uni.setStorageSync` 和 `plus.io` 写入，互为备份，最大程度确保数据安全。

## 2. 技术实现规范

### 2.1 页面传参
```javascript
import { onLoad } from '@dcloudio/uni-app';

onLoad((options) => {
  if (options.id) {
    // 执行数据加载逻辑
  }
});
```

### 2.2 强制持久化 (Forced Persistence)
在 Store 中定义 `saveToStorage` 异步方法，内部调用 `storageService.saveToFileNative`。

### 2.3 异常容错
- 增加解密失败后的默认值回退逻辑。
- 增加 `JSON.parse` 的全局错误捕获。

## 3. 数据版本与字段兼容逻辑 [新]

### 3.1 账户对象补全 (Account Patching)
当导入 JSON 或从旧存储加载时，必须通过 `patchAccount` 函数进行清洗，确保新字段存在：
- `excludeFromTotal`: 默认 `false`。
- `notes`: 默认 `""`。
- `category`: 默认 `"其他"`。

### 3.2 资产隐藏联动
- 视图层组件（Chart/List）必须统一从 `useConfigStore` 读取 `isPrivacyMode`。
- 金额显示逻辑需封装在工具类中，支持 `(val) => isPrivacyMode ? '****' : val`。

