<template>
  <view class="container">
    <view class="form-group">
      <text class="label">账户名称</text>
      <input class="input" v-model="form.name" placeholder="如：招商银行" />
    </view>

    <view class="form-group">
      <text class="label">账户类别</text>
      <picker @change="onCategoryChange" :value="categoryIndex" :range="categories">
        <view class="picker-value">{{ form.category || '请选择类别' }}</view>
      </picker>
    </view>

    <view class="form-group">
      <text class="label">图标</text>
      <view class="icon-grid">
        <view 
          v-for="icon in icons" 
          :key="icon" 
          class="icon-item" 
          :class="{ active: form.icon === icon }"
          @click="form.icon = icon"
        >{{ icon }}</view>
      </view>
    </view>

    <view class="form-group">
      <text class="label">币种</text>
      <picker @change="onCurrencyChange" :value="currencyIndex" :range="currencies">
        <view class="picker-value">{{ form.currency }}</view>
      </picker>
    </view>

    <view class="form-group">
      <text class="label">当前余额</text>
      <view class="balance-input-wrap">
        <input class="input balance-input" type="digit" v-model="form.balance" />
        <view class="quick-btns">
          <view class="quick-btn" @click="addAmount(1000)">+1000</view>
          <view class="quick-btn" @click="addAmount(5000)">+5000</view>
        </view>
      </view>
    </view>

    <!-- 优化点 2: 计入总资产开关 -->
    <view class="form-group flex-between">
      <text class="label">计入总资产统计</text>
      <switch :checked="!form.excludeFromTotal" @change="onExcludeChange" color="#4facfe" />
    </view>

    <view class="form-group">
      <text class="label">备注</text>
      <textarea class="textarea" v-model="form.notes" placeholder="添加备注..." />
    </view>

    <view class="footer-btns">
      <button v-if="accountId" class="btn delete-btn" @click="handleDelete">删除</button>
      <button class="btn save-btn" @click="handleSave">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useAssetStore } from '../../store/assets';
import { calcService } from '../../services/calc';

const assetStore = useAssetStore();
const accountId = ref(null);

const categories = ['储蓄卡', '信用卡', '支付宝', '微信支付', '股票账户', '基金', '保险', '其他'];
const categoryIndex = ref(0);

const currencies = Object.keys(assetStore.rates);
const currencyIndex = ref(0);

const icons = ['💰', '💳', '🏦', '💹', '🏢', '🏠', '🚗', '🧧', '📱'];

const form = reactive({
  name: '',
  category: '储蓄卡',
  icon: '💰',
  currency: 'CNY',
  balance: 0,
  notes: '',
  excludeFromTotal: false
});

onLoad((options) => {
  if (options && options.id) {
    accountId.value = options.id;
    const account = assetStore.accounts.find(acc => acc.id === options.id);
    if (account) {
      // 优化点 3: 确保回显时也有默认值逻辑
      Object.assign(form, assetStore._patchAccount(account));
      categoryIndex.value = categories.indexOf(form.category);
      currencyIndex.value = currencies.indexOf(form.currency);
    }
  }
});

const onCategoryChange = (e) => {
  categoryIndex.value = e.detail.value;
  form.category = categories[categoryIndex.value];
};

const onCurrencyChange = (e) => {
  currencyIndex.value = e.detail.value;
  form.currency = currencies[currencyIndex.value];
};

const onExcludeChange = (e) => {
  form.excludeFromTotal = !e.detail.value;
};

const addAmount = (val) => {
  form.balance = calcService.add(form.balance, val);
};

const handleSave = () => {
  if (!form.name) {
    uni.showToast({ title: '请输入名称', icon: 'none' });
    return;
  }
  
  if (accountId.value) {
    assetStore.updateAccount(accountId.value, { ...form });
  } else {
    assetStore.addAccount({ ...form });
  }
  
  uni.navigateBack();
};

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个账户吗？',
    success: (res) => {
      if (res.confirm) {
        assetStore.deleteAccount(accountId.value);
        uni.navigateBack();
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx;
  background-color: #fff;
  min-height: 100vh;
}

.form-group {
  margin-bottom: 40rpx;
  
  .label {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .input, .picker-value, .textarea {
    background-color: #f8f9fa;
    padding: 24rpx;
    border-radius: 12rpx;
    font-size: 30rpx;
  }
  
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    
    .label {
      margin-bottom: 0;
    }
  }
  
  .textarea {
    width: 100%;
    height: 160rpx;
    box-sizing: border-box;
  }
  
  .icon-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .icon-item {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f8f9fa;
      border-radius: 12rpx;
      font-size: 40rpx;
      border: 2rpx solid transparent;
      
      &.active {
        border-color: #4facfe;
        background-color: #f0f7ff;
      }
    }
  }
  
  .balance-input-wrap {
    .balance-input {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
    }
    
    .quick-btns {
      display: flex;
      gap: 20rpx;
      margin-top: 20rpx;
      
      .quick-btn {
        padding: 10rpx 30rpx;
        background-color: #f0f7ff;
        color: #4facfe;
        border-radius: 30rpx;
        font-size: 24rpx;
      }
    }
  }
}

.footer-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 80rpx;
  
  .btn {
    flex: 1;
    height: 90rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 45rpx;
    font-size: 32rpx;
    
    &.save-btn {
      background-color: #4facfe;
      color: #fff;
    }
    
    &.delete-btn {
      background-color: #fff;
      color: #ff4d4f;
      border: 1rpx solid #ff4d4f;
    }
  }
}
</style>
