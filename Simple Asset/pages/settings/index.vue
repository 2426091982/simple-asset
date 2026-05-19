<template>
  <view class="container">
    <view class="section">
      <view class="section-title">通用设置</view>
      <view class="list-item">
        <text class="item-label">基础币种</text>
        <text class="item-value">{{ assetStore.baseCurrency }}</text>
      </view>
      <view class="list-item">
        <text class="item-label">隐藏资产</text>
        <switch :checked="configStore.isPrivacyMode" @change="configStore.togglePrivacyMode()" color="#4facfe" />
      </view>
    </view>

    <view class="section">
      <view class="section-title">数据管理</view>
      <view class="list-item" @click="handleExport">
        <text class="item-label">导出数据</text>
        <text class="item-desc">导出 JSON 格式备份</text>
      </view>
      <view class="list-item" @click="handleImport">
        <text class="item-label">导入数据</text>
        <text class="item-desc">从 JSON 文件恢复</text>
      </view>
    </view>

    <view class="version-info">
      <text>极简资产 v2.0.0</text>
      <text>隐私优先 · 本地存储</text>
    </view>
  </view>
</template>

<script setup>
import { useAssetStore } from '../../store/assets';
import { useConfigStore } from '../../store/config';
import { storageService } from '../../services/storage';

const assetStore = useAssetStore();
const configStore = useConfigStore();

const handleExport = () => {
  const data = {
    accounts: assetStore.accounts,
    history: assetStore.history,
    rates: assetStore.rates,
    baseCurrency: assetStore.baseCurrency
  };
  const jsonString = storageService.exportData(data);
  
  uni.setClipboardData({
    data: jsonString,
    success: () => {
      uni.showToast({ title: '已复制到剪贴板', icon: 'success' });
    }
  });
};

const handleImport = () => {
  uni.showModal({
    title: '导入确认',
    content: '将从剪贴板读取备份数据并覆盖当前所有数据，确定继续吗？',
    success: (res) => {
      if (res.confirm) {
        uni.getClipboardData({
          success: (clipboardRes) => {
            const content = clipboardRes.data;
            if (!content || !content.trim()) {
              uni.showToast({ title: '剪贴板内容为空', icon: 'none' });
              return;
            }
            
            const data = storageService.importData(content);
            if (data) {
              assetStore.importData(data);
              uni.showToast({ title: '导入成功', icon: 'success' });
            } else {
              uni.showToast({ title: '数据解析失败，请检查格式', icon: 'none' });
              console.error('Import failed with clipboard content:', content);
            }
          },
          fail: () => {
            uni.showToast({ title: '无法读取剪贴板', icon: 'none' });
          }
        });
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.section {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 0 30rpx;
  margin-bottom: 40rpx;
  
  .section-title {
    padding: 30rpx 0 10rpx;
    font-size: 24rpx;
    color: #999;
    text-transform: uppercase;
  }
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .item-label {
    font-size: 30rpx;
    color: #333;
  }
  
  .item-value {
    font-size: 28rpx;
    color: #666;
  }
  
  .item-desc {
    font-size: 24rpx;
    color: #999;
  }
}

.version-info {
  margin-top: 100rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  
  text {
    font-size: 24rpx;
    color: #ccc;
  }
}
</style>
