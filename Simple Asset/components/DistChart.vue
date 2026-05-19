<template>
  <view class="chart-container">
    <view v-if="data.length === 0" class="no-data">暂无资产分配数据</view>
    <view v-else class="dist-list">
      <view v-for="(item, index) in data" :key="index" class="dist-item">
        <view class="item-header">
          <text class="item-name">{{ item.name }}</text>
          <!-- 优化点 1: 根据隐私模式显示金额 -->
          <text class="item-value">¥{{ configStore.isPrivacyMode ? '****' : format(item.value) }}</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: getPercent(item.value) + '%', backgroundColor: colors[index % colors.length] }"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { useConfigStore } from '../store/config';
import { calcService } from '../services/calc';

const configStore = useConfigStore();

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const colors = ['#4facfe', '#00f2fe', '#a18cd1', '#fbc2eb', '#84fab0', '#ffecd2'];

const total = computed(() => {
  return props.data.reduce((sum, item) => sum + item.value, 0);
});

const getPercent = (value) => {
  if (total.value === 0) return 0;
  return (value / total.value * 100).toFixed(1);
};

const format = (val) => calcService.formatAmount(val);
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
}

.no-data {
  text-align: center;
  color: #999;
  font-size: 24rpx;
}

.dist-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.dist-item {
  .item-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8rpx;
    font-size: 24rpx;
    
    .item-name {
      color: #666;
    }
    
    .item-value {
      font-weight: bold;
      color: #333;
    }
  }
  
  .progress-bar {
    height: 12rpx;
    background-color: #f0f0f0;
    border-radius: 6rpx;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      border-radius: 6rpx;
      transition: width 0.3s ease;
    }
  }
}
</style>
