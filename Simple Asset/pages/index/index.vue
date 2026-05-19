<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="nav-title">极简资产</text>
      <view class="nav-right" @click="goToSettings">
        <text class="icon-settings">⚙️</text>
      </view>
    </view>

    <!-- 总资产卡片 -->
    <view class="total-card">
      <view class="total-header">
        <text class="label">总资产 ({{ assetStore.baseCurrency }})</text>
        <view class="privacy-toggle" @click="configStore.togglePrivacyMode()">
          <text>{{ configStore.isPrivacyMode ? '🙈' : '👁️' }}</text>
        </view>
      </view>
      <view class="total-amount">
        <text class="symbol">¥</text>
        <text class="value">{{ configStore.isPrivacyMode ? '****' : assetStore.formattedTotal }}</text>
      </view>
    </view>

    <!-- 图表展示区 -->
    <view class="chart-section">
      <view class="tab-header">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'dist' }" 
          @click="activeTab = 'dist'"
        >资产构成</view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'trend' }" 
          @click="activeTab = 'trend'"
        >增长趋势</view>
      </view>
      
      <view class="chart-content">
        <DistChart v-if="activeTab === 'dist'" :data="assetStore.assetDistribution" />
        <TrendChart v-else :data="assetStore.history.slice(-7)" />
      </view>
    </view>

    <!-- 账户列表 -->
    <view class="account-section">
      <view class="section-header">
        <text class="title">我的账户</text>
        <view class="add-btn" @click="goToAddAccount">
          <text>+</text>
        </view>
      </view>

      <view v-if="assetStore.accounts.length === 0" class="empty-state">
        <text>还没有账户，点击右上角添加一个吧</text>
      </view>

      <view 
        v-for="account in assetStore.accounts" 
        :key="account.id" 
        class="account-card"
        @click="editAccount(account)"
      >
        <view class="account-info">
          <view class="account-icon">{{ account.icon || '💰' }}</view>
          <view class="account-detail">
            <view class="account-name-wrap">
              <text class="account-name">{{ account.name }}</text>
              <text v-if="account.excludeFromTotal" class="tag-exclude">不计入</text>
            </view>
            <text class="account-category">{{ account.category }}</text>
          </view>
        </view>
        <view class="account-balance">
          <text class="balance-value">
            {{ configStore.isPrivacyMode ? '****' : formatBalance(account.balance) }}
          </text>
          <text class="balance-currency">{{ account.currency }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAssetStore } from '../../store/assets';
import { useConfigStore } from '../../store/config';
import { calcService } from '../../services/calc';
import DistChart from '../../components/DistChart.vue';
import TrendChart from '../../components/TrendChart.vue';

const assetStore = useAssetStore();
const configStore = useConfigStore();

const statusBarHeight = ref(0);
const activeTab = ref('dist');

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

const formatBalance = (balance) => {
  return calcService.formatAmount(balance);
};

const goToAddAccount = () => {
  uni.navigateTo({
    url: '/pages/account/edit'
  });
};

const editAccount = (account) => {
  uni.navigateTo({
    url: `/pages/account/edit?id=${account.id}`
  });
};

const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/settings/index'
  });
};
</script>

<style lang="scss" scoped>
.container {
  padding-bottom: 40rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .nav-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
  
  .icon-settings {
    font-size: 40rpx;
  }
}

.total-card {
  margin: 40rpx;
  padding: 40rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 24rpx;
  color: #fff;
  box-shadow: 0 10rpx 30rpx rgba(79, 172, 254, 0.3);

  .total-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    
    .label {
      font-size: 28rpx;
      opacity: 0.9;
    }
  }

  .total-amount {
    display: flex;
    align-items: baseline;
    
    .symbol {
      font-size: 40rpx;
      margin-right: 10rpx;
    }
    
    .value {
      font-size: 64rpx;
      font-weight: bold;
    }
  }
}

.chart-section {
  margin: 0 40rpx 40rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 30rpx;

  .tab-header {
    display: flex;
    margin-bottom: 30rpx;
    border-bottom: 1rpx solid #eee;
    
    .tab-item {
      flex: 1;
      text-align: center;
      padding: 20rpx 0;
      font-size: 28rpx;
      color: #666;
      position: relative;
      
      &.active {
        color: #4facfe;
        font-weight: bold;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -2rpx;
          left: 25%;
          width: 50%;
          height: 4rpx;
          background-color: #4facfe;
          border-radius: 2rpx;
        }
      }
    }
  }
  
  .chart-content {
    height: 300rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #ccc;
      font-size: 24rpx;
      
      .sub-text {
        margin-top: 10rpx;
        font-size: 20rpx;
      }
    }
  }
}

.account-section {
  padding: 0 40rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .add-btn {
      width: 60rpx;
      height: 60rpx;
      background-color: #4facfe;
      color: #fff;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 40rpx;
    }
  }
}

.empty-state {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.account-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);

  .account-info {
    display: flex;
    align-items: center;
    
    .account-icon {
      font-size: 48rpx;
      margin-right: 20rpx;
    }
    
    .account-detail {
        display: flex;
        flex-direction: column;
        
        .account-name-wrap {
          display: flex;
          align-items: center;
          gap: 10rpx;
          
          .account-name {
            font-size: 30rpx;
            color: #333;
            font-weight: 500;
          }
          
          .tag-exclude {
            font-size: 18rpx;
            background-color: #f0f0f0;
            color: #999;
            padding: 2rpx 10rpx;
            border-radius: 4rpx;
          }
        }
        
        .account-category {
        font-size: 24rpx;
        color: #999;
        margin-top: 4rpx;
      }
    }
  }

  .account-balance {
    text-align: right;
    
    .balance-value {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .balance-currency {
      font-size: 20rpx;
      color: #999;
      margin-left: 10rpx;
    }
  }
}
</style>
