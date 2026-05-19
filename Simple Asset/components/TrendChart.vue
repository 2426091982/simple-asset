<template>
  <view class="chart-container">
    <view v-if="data.length === 0" class="no-data">暂无趋势数据</view>
    <view v-else class="trend-list">
      <view v-for="(item, index) in data" :key="index" class="trend-item">
        <text class="trend-date">{{ item.date.substring(5) }}</text>
        <view class="trend-bar-wrap">
          <view class="trend-bar" :style="{ height: getPercent(item.total) + '%' }"></view>
        </view>
        <!-- 优化点 1: 根据隐私模式显示金额 -->
        <text class="trend-value">{{ configStore.isPrivacyMode ? '****' : format(item.total) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { useConfigStore } from '../store/config';

const configStore = useConfigStore();

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const max = computed(() => {
  const values = props.data.map(item => item.total);
  return values.length > 0 ? Math.max(...values) : 0;
});

const getPercent = (value) => {
  if (max.value === 0) return 0;
  return Math.max(10, (value / max.value * 100)); // 最小高度 10%
};

const format = (val) => {
  if (val >= 10000) return (val / 10000).toFixed(1) + 'w';
  return Math.round(val);
};
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 300rpx;
}

.no-data {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  line-height: 300rpx;
}

.trend-list {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 40rpx;
}

.trend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  
  .trend-date {
    font-size: 20rpx;
    color: #999;
    margin-bottom: 10rpx;
  }
  
  .trend-bar-wrap {
    flex: 1;
    width: 20rpx;
    background-color: #f0f0f0;
    border-radius: 10rpx;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    
    .trend-bar {
      width: 100%;
      background: linear-gradient(to top, #4facfe, #00f2fe);
      border-radius: 10rpx;
      transition: height 0.5s ease;
    }
  }
  
  .trend-value {
    font-size: 18rpx;
    color: #666;
    margin-top: 10rpx;
  }
}
</style>
