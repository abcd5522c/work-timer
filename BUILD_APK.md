# WorkShift APK 生成指南

## 簡單方式（推薦）

### 在 Windows / Mac / Linux 上執行

1. **下載腳本**
   - 從 GitHub 下載 `build-apk-simple.sh` 檔案

2. **安裝必要工具**
   ```bash
   # 安裝 Node.js（如果未安裝）
   # 訪問：https://nodejs.org/
   
   # 安裝 Java JDK
   # 訪問：https://www.oracle.com/java/technologies/downloads/
   
   # 安裝 Android SDK
   # 訪問：https://developer.android.com/studio
   ```

3. **執行腳本**
   ```bash
   bash build-apk-simple.sh
   ```

4. **等待構建完成**
   - 第一次執行可能需要 10-15 分鐘
   - 之後會更快

5. **找到 APK 檔案**
   - APK 會在 `/tmp/workshift-build-*/workshift-app/platforms/android/app/build/outputs/apk/release/` 目錄中

## 在手機上安裝

### Android 手機

1. 將 APK 檔案複製到手機
2. 開啟檔案管理器
3. 找到 APK 檔案並點擊
4. 按「安裝」
5. 完成！

### 如果無法安裝

- 可能需要在設定中啟用「未知來源」應用程式安裝
- 路徑：設定 → 安全 → 未知來源

## 故障排除

### 找不到 Java
```bash
# 檢查 Java 是否已安裝
java -version

# 如果未安裝，下載 JDK：
# https://www.oracle.com/java/technologies/downloads/
```

### 找不到 Android SDK
```bash
# 安裝 Android Studio
# https://developer.android.com/studio

# 或設定 ANDROID_HOME 環境變數
export ANDROID_HOME=~/Android/Sdk
```

### 構建失敗
- 確保所有工具都已正確安裝
- 檢查網路連接（需要下載 Gradle 和依賴）
- 清除快取：`rm -rf ~/.gradle`

## 線上方式（如果本地無法執行）

1. 訪問：https://www.pwabuilder.com/
2. 輸入：https://worktimer-4bphxfae.manus.space
3. 點擊「Package」→「Android」
4. 下載生成的 APK

---

有任何問題，請聯絡開發者。
