export const storageService = {
  exportData(data) {
    return JSON.stringify(data);
  },

  importData(jsonString) {
    if (!jsonString || typeof jsonString !== 'string') return null;
    
    const trimmed = jsonString.trim();
    try {
      const data = JSON.parse(trimmed);
      if (data && Array.isArray(data.accounts)) {
        return data;
      }
      return null;
    } catch (e) {
      console.error('Import failed - JSON parse error:', e);
      return null;
    }
  },

  /**
   * Android 原生文件系统持久化 (针对 plus.io)
   */
  async saveToFileNative(fileName, content) {
    // #ifdef APP-PLUS
    return new Promise((resolve, reject) => {
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
        // 方案：先尝试删除旧文件，再创建新文件，确保完全覆盖
        fs.root.getFile(fileName, { create: true }, (fileEntry) => {
          fileEntry.remove(() => {
            fs.root.getFile(fileName, { create: true }, (newFileEntry) => {
              newFileEntry.createWriter((writer) => {
                writer.onwrite = () => {
                  console.log('File written and flushed:', fileName);
                  resolve(true);
                };
                writer.onerror = (e) => reject(e);
                writer.write(content);
              }, (e) => reject(e));
            }, (e) => reject(e));
          }, (e) => {
            // 如果删除失败（比如文件不存在），直接创建并写入
            fileEntry.createWriter((writer) => {
              writer.onwrite = () => resolve(true);
              writer.onerror = (e) => reject(e);
              writer.write(content);
            }, (e) => reject(e));
          });
        }, (e) => reject(e));
      }, (e) => reject(e));
    });
    // #endif
    // #ifndef APP-PLUS
    uni.setStorageSync(fileName, content);
    return Promise.resolve(true);
    // #endif
  },

  /**
   * Android 原生文件系统读取
   */
  async readFromFileNative(fileName) {
    // #ifdef APP-PLUS
    return new Promise((resolve) => {
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
        fs.root.getFile(fileName, { create: false }, (fileEntry) => {
          fileEntry.file((file) => {
            const reader = new plus.io.FileReader();
            reader.onloadend = (e) => {
              resolve(e.target.result);
            };
            reader.onerror = (e) => {
              console.error('File read error:', e);
              resolve(null);
            };
            reader.readAsText(file);
          }, (e) => {
            console.error('Get file object error:', e);
            resolve(null);
          });
        }, (e) => {
          // 文件不存在是正常的初次启动情况
          resolve(null);
        });
      }, (e) => {
        console.error('Request FS error:', e);
        resolve(null);
      });
    });
    // #endif
    // #ifndef APP-PLUS
    return Promise.resolve(uni.getStorageSync(fileName));
    // #endif
  }
};
