# 本地存储与计算服务规范 (Storage & Service Guidelines)

**版本**: 1.0
**作者**: AI Technical Manager
**最后更新**: 2026-05-10

## 1. 设计哲学
本项目无中心化服务器，`services/` 目录承担了传统架构中“后端”的角色。

## 2. 存储规范 (Storage)
- **原子性**: 每次写入操作必须保证数据结构的完整性。
- **加密策略**: 敏感字段（balance）在存储前需调用 `crypto.encrypt()`，读取后调用 `crypto.decrypt()`。
- **持久化**: 依赖 `pinia-plugin-persistedstate`，但需自定义 `storage` 配置以适配 Uni-app 环境。

## 3. 计算服务 (Calculation)
- **精度管理**: 货币计算必须使用 `Big.js` 或类似库，严禁直接使用浮点数运算以避免精度丢失。
- **汇率换算**: 
    - 换算公式: `BaseAmount = AccountAmount * ManualRate`。
    - 汇率由用户在设置中手动维护。

## 4. 异常处理
- 存储溢出、解密失败等错误必须有捕获逻辑，并通过全局 Toast 或 Modal 告知用户。
