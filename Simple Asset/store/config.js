import { defineStore } from 'pinia';

const STORAGE_KEY = 'SAVINGS_TRACKER_CONFIG';

export const useConfigStore = defineStore('config', {
  state: () => ({
    isPrivacyMode: false, 
    currencySymbols: {
      'CNY': '¥',
      'USD': '$',
      'HKD': 'HK$'
    },
    _isLoaded: false
  }),
  
  actions: {
    initStore() {
      if (this._isLoaded) return;
      try {
        const val = uni.getStorageSync(STORAGE_KEY);
        if (val) {
          const data = typeof val === 'string' ? JSON.parse(val) : val;
          if (data.isPrivacyMode !== undefined) this.isPrivacyMode = data.isPrivacyMode;
          if (data.currencySymbols) this.currencySymbols = data.currencySymbols;
          console.log('[ConfigStore] Data loaded');
        }
      } catch (e) {
        console.error('[ConfigStore] Init error:', e);
      } finally {
        this._isLoaded = true;
      }
    },

    saveToStorage() {
      if (!this._isLoaded) return;
      try {
        const stateToSave = {
          isPrivacyMode: this.isPrivacyMode,
          currencySymbols: this.currencySymbols
        };
        uni.setStorageSync(STORAGE_KEY, JSON.stringify(stateToSave));
        console.log('[ConfigStore] Data saved');
      } catch (e) {
        console.error('[ConfigStore] Save error:', e);
      }
    },

    togglePrivacyMode() {
      this.isPrivacyMode = !this.isPrivacyMode;
      this.saveToStorage();
    }
  }
});
