/**
 * 纯 JSON 存储工具
 * 移除加密逻辑，直接读写原始数据以提高性能和兼容性
 */
export const crypto = {
  encrypt(data) {
    if (data === undefined || data === null) return '';
    return typeof data === 'string' ? data : JSON.stringify(data);
  },

  decrypt(ciphertext) {
    return ciphertext || '';
  }
};
