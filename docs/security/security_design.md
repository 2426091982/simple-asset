# 安全性设计方案 (Security Design) v2.0

**最后更新时间**: 2026-05-10 16:15

## 1. 导入数据校验 (Data Import Validation) [新 - 2026-05-10]
为防止非法数据导入破坏本地数据库，必须实施以下多层校验：

### 1.1 结构校验 (Structural Check)
导入的 JSON 必须包含以下根节点：
- `accounts`: 数组类型。
- `baseCurrency`: 字符串类型，长度为 3。

### 1.2 字段完整性 (Field Integrity)
`accounts` 数组中的每个对象必须包含：
- `id`: UUID 格式。
- `balance`: 数值类型（不允许为 NaN 或 Infinity）。
- `updatedAt`: 有效的 ISO 时间字符串。

### 1.3 溢出攻击防护 (Overflow Protection)
- 限制 `accounts` 数组最大长度为 500。
- 限制 `history` 数组最大长度为 1000。
- 单条 `notes` 备注字段长度限制为 200 字符。

## 2. 状态持久化安全 [优化 - 2026-05-10]
- **隐私状态**: `isPrivacyMode` 虽然持久化，但仅存储状态值（true/false），不涉及任何解密后的资产明文。
- **PIN 码验证**: 保持原有逻辑，导入操作前必须再次校验 PIN 码（如果已开启）。
