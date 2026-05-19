import { defineStore } from 'pinia';
import { calcService } from '../services/calc';

const STORAGE_KEY = 'SAVINGS_TRACKER_DATA';

/**
 * 资产 Store - 纯 JSON 稳定版
 * 移除加密逻辑，采用严格状态锁保护数据
 */
export const useAssetStore = defineStore('assets', {
  state: () => ({
    accounts: [], 
    history: [],  
    rates: {
      'CNY': 1,
      'USD': 7.2,
      'HKD': 0.92
    },
    baseCurrency: 'CNY',
    _isLoaded: false 
  }),
  
  getters: {
    totalAssets: (state) => {
      // 优化点 2: 统计时排除标记为不计入统计的账户
      const includedAccounts = state.accounts.filter(acc => !acc.excludeFromTotal);
      return calcService.calculateTotal(includedAccounts, state.rates, state.baseCurrency);
    },
    formattedTotal: (state) => {
      const includedAccounts = state.accounts.filter(acc => !acc.excludeFromTotal);
      const total = calcService.calculateTotal(includedAccounts, state.rates, state.baseCurrency);
      return calcService.formatAmount(total);
    },
    assetDistribution: (state) => {
      const dist = {};
      state.accounts.forEach(acc => {
        // 优化点 2: 分布图也应根据是否计入统计进行过滤或标记
        if (acc.excludeFromTotal) return; 
        
        const cat = acc.category || '未分类';
        const value = calcService.multiply(acc.balance, state.rates[acc.currency]);
        dist[cat] = (dist[cat] || 0) + value;
      });
      return Object.keys(dist).map(name => ({ name, value: dist[name] }));
    }
  },
  
  actions: {
    /**
     * 优化点 3: 数据补全逻辑
     */
    _patchAccount(account) {
      return {
        id: account.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: account.name || '未命名账户',
        icon: account.icon || '💰',
        category: account.category || '其他',
        balance: account.balance || 0,
        currency: account.currency || 'CNY',
        notes: account.notes || '',
        excludeFromTotal: !!account.excludeFromTotal, // 默认 false
        updatedAt: account.updatedAt || new Date().toISOString()
      };
    },

    /**
     * 初始化 - 纯 JSON 读取
     */
    initStore() {
      if (this._isLoaded) return;
      
      try {
        const val = uni.getStorageSync(STORAGE_KEY);
        if (val) {
          const data = typeof val === 'string' ? JSON.parse(val) : val;
          // 优化点 3: 适配旧数据字段
          if (data.accounts) {
            this.accounts = data.accounts.map(acc => this._patchAccount(acc));
          }
          if (data.history) this.history = data.history;
          if (data.rates) this.rates = { ...this.rates, ...data.rates };
          if (data.baseCurrency) this.baseCurrency = data.baseCurrency;
          console.log('[AssetStore] Data loaded and patched');
        }
      } catch (e) {
        console.error('[AssetStore] Init error:', e);
      } finally {
        this._isLoaded = true;
      }
    },

    /**
     * 保存 - 纯 JSON 写入
     */
    saveToStorage() {
      if (!this._isLoaded) return;

      try {
        const stateToSave = {
          accounts: this.accounts,
          history: this.history,
          rates: this.rates,
          baseCurrency: this.baseCurrency
        };
        uni.setStorageSync(STORAGE_KEY, JSON.stringify(stateToSave));
        console.log('[AssetStore] Data saved');
      } catch (e) {
        console.error('[AssetStore] Save error:', e);
      }
    },

    addAccount(account) {
      const newAccount = this._patchAccount({
        ...account,
        id: Date.now().toString(),
        updatedAt: new Date().toISOString()
      });
      this.accounts.push(newAccount);
      this.takeSnapshot();
      this.saveToStorage();
    },
    
    updateAccount(id, data) {
      const index = this.accounts.findIndex(acc => acc.id === id);
      if (index !== -1) {
        this.accounts[index] = this._patchAccount({
          ...this.accounts[index],
          ...data,
          updatedAt: new Date().toISOString()
        });
        this.takeSnapshot();
        this.saveToStorage();
      }
    },
    
    deleteAccount(id) {
      this.accounts = this.accounts.filter(acc => acc.id !== id);
      this.takeSnapshot();
      this.saveToStorage();
    },
    
    takeSnapshot() {
      const today = new Date().toISOString().split('T')[0];
      const total = this.totalAssets;
      const existingIndex = this.history.findIndex(h => h.date === today);
      if (existingIndex !== -1) {
        this.history[existingIndex].total = total;
      } else {
        this.history.push({ date: today, total });
      }
      if (this.history.length > 180) this.history.shift();
    },
    
    importData(data) {
      if (data && data.accounts) {
        // 优化点 3: 导入时补全字段
        this.accounts = data.accounts.map(acc => this._patchAccount(acc));
        this.history = data.history || [];
        this.rates = { ...this.rates, ...data.rates };
        this.baseCurrency = data.baseCurrency || this.baseCurrency;
        this.saveToStorage();
      }
    }
  }
});
