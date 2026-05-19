import Big from 'big.js';

export const calcService = {
  add(a, b) {
    return new Big(a || 0).plus(b || 0).toNumber();
  },

  multiply(a, b) {
    return new Big(a || 0).times(b || 1).toNumber();
  },

  calculateTotal(accounts, rates, baseCurrency) {
    let total = new Big(0);
    accounts.forEach(account => {
      const balance = account.balance || 0;
      const rate = rates[account.currency] || 1;
      total = total.plus(new Big(balance).times(rate));
    });
    return total.toNumber();
  },

  formatAmount(amount, decimal = 2) {
    return new Big(amount || 0).toFixed(decimal);
  },

  getTrendData(history, days = 6) {
    const data = history.slice(-days);
    return {
      categories: data.map(item => item.date.substring(5)),
      series: [
        {
          name: "总资产",
          data: data.map(item => item.total)
        }
      ]
    };
  }
};
