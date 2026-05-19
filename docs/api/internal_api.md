# 内部服务接口文档 (Internal API Documentation) v2.0

**最后更新时间**: 2026-05-10 16:12

## 1. AssetStore (资产管理) - 增强项

### `addAccount(account)`
- **更新 [2026-05-10]**: 支持 `notes` 字段写入。
- **自动动作**: 执行后触发 `takeSnapshot()`。

### `updateAccount(id, data)`
- **更新 [2026-05-10]**: 支持 `notes` 字段更新。
- **自动动作**: 执行后触发 `takeSnapshot()`。

### `takeSnapshot()` [新接口]
- **描述**: 记录当前总资产快照（BR-05）。
- **逻辑**: 
    1. 获取当前日期 `YYYY-MM-DD`。
    2. 计算当前总资产。
    3. 若当日已存在记录，则覆盖；若无，则追加。
    4. 保持 `history` 数组长度最大为 180 条（约 6 个月）。

### `importData(jsonString)` [新接口]
- **描述**: 外部数据导入逻辑。
- **流程**: 
    1. `JSON.parse` 校验。
    2. 核心字段（accounts, baseCurrency）存在性校验。
    3. 成功后重置整个 Store 状态。

## 2. ConfigStore (配置管理) - 增强项

### `isPrivacyMode`
- **更新 [2026-05-10]**: 该字段已标记为 `persist: true`，实现掩码状态持久化（BR-06）。

## 3. CalcService (计算服务) - 增强项

### `getTrendData(history, days)` [新接口]
- **描述**: 为图表库转换数据格式。
- **参数**: `history` 数组, `days` (展示天数)。
- **返回**: 适配 uCharts 的 `categories` 和 `series` 对象。
