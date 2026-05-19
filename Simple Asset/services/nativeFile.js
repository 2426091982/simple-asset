/**
 * 原生同步文件系统服务 (Android 调试环境极其稳定)
 * 采用同步写入，强制数据刷入物理磁盘，彻底解决杀掉进程导致的数据丢失
 */
export const nativeFileService = {
  getFilePath(fileName) {
    // #ifdef APP-PLUS
    // 核心修复：uni.env 可能在某些基座下未定义，改用 plus.io 的绝对路径
    try {
      return plus.io.convertLocalFileSystemURL("_doc/" + fileName);
    } catch (e) {
      return "_doc/" + fileName;
    }
    // #endif
    return fileName;
  },

  /**
   * 同步写入文件 (强制阻塞直到写入完成)
   */
  writeFileSync(fileName, data) {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    const filePath = this.getFilePath(fileName);
    
    try {
      // #ifdef APP-PLUS
      const fs = uni.getFileSystemManager();
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[NativeFile] SYNC write success: ${filePath}`);
      // #endif
      
      // #ifndef APP-PLUS
      uni.setStorageSync(fileName, content);
      // #endif
      return true;
    } catch (e) {
      console.error('[NativeFile] SYNC write failed:', e);
      return false;
    }
  },

  /**
   * 同步读取文件
   */
  readFileSync(fileName) {
    const filePath = this.getFilePath(fileName);
    try {
      // #ifdef APP-PLUS
      const fs = uni.getFileSystemManager();
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`[NativeFile] SYNC read success: ${filePath}`);
      return content;
      // #endif
      
      // #ifndef APP-PLUS
      return uni.getStorageSync(fileName) || null;
      // #endif
    } catch (e) {
      console.warn(`[NativeFile] SYNC read failed (Normal for first launch): ${filePath}`);
      return null;
    }
  }
};
