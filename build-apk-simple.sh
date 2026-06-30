#!/bin/bash
# WorkShift APK 簡化版生成腳本
# 使用方法：bash build-apk-simple.sh

set -e

echo "🚀 WorkShift APK 生成開始..."
echo ""

# 檢查必要工具
echo "✓ 檢查環境..."
if ! command -v cordova &> /dev/null; then
    echo "❌ 未找到 Cordova，正在安裝..."
    npm install -g cordova
fi

if ! command -v java &> /dev/null; then
    echo "❌ 未找到 Java，請先安裝 Java JDK"
    exit 1
fi

# 建立臨時目錄
WORK_DIR="/tmp/workshift-build-$(date +%s)"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

echo "📁 工作目錄：$WORK_DIR"
echo ""

# 建立 Cordova 專案
echo "📦 建立 Cordova 專案..."
cordova create workshift-app com.workshift.app WorkShift
cd workshift-app

# 添加 Android 平台
echo "🤖 添加 Android 平台..."
cordova platform add android@13 2>/dev/null || cordova platform add android

# 建立簡單的 HTML 應用
echo "🌐 建立應用程式..."
cat > www/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>WorkShift</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: #0f0f0f; 
            color: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
        }
        .container { max-width: 500px; margin: 0 auto; }
        h1 { text-align: center; margin-bottom: 30px; color: #FF8C00; }
        .card {
            background: #1a1a1a;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
        }
        button {
            background: #FF8C00;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
            margin-bottom: 10px;
        }
        input {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            background: #2a2a2a;
            border: 1px solid #444;
            color: #fff;
            border-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⏱️ WorkShift</h1>
        <div class="card">
            <h2>記錄今日工時</h2>
            <input type="number" id="hours" placeholder="輸入工時（小時）" min="0" max="24">
            <button onclick="saveHours()">儲存</button>
        </div>
        <div class="card" id="stats">
            <h2>統計</h2>
            <p id="total">總工時：0 小時</p>
        </div>
    </div>
    <script>
        function saveHours() {
            const hours = document.getElementById('hours').value;
            if (hours) {
                let total = parseInt(localStorage.getItem('totalHours') || 0);
                total += parseInt(hours);
                localStorage.setItem('totalHours', total);
                document.getElementById('total').textContent = '總工時：' + total + ' 小時';
                document.getElementById('hours').value = '';
                alert('已儲存！');
            }
        }
        
        // 載入統計
        window.onload = function() {
            let total = parseInt(localStorage.getItem('totalHours') || 0);
            document.getElementById('total').textContent = '總工時：' + total + ' 小時';
        }
    </script>
</body>
</html>
EOF

# 構建 APK
echo "🔨 構建 APK（這可能需要 5-10 分鐘）..."
cordova build android --release 2>&1 | grep -E "BUILD|Error|error" || true

# 查找 APK 檔案
APK_PATH=$(find . -name "*.apk" -type f | head -1)

if [ -f "$APK_PATH" ]; then
    echo ""
    echo "✅ APK 構建成功！"
    echo "📍 APK 位置：$APK_PATH"
    echo ""
    echo "📱 安裝步驟："
    echo "1. 將 APK 檔案複製到 Android 手機"
    echo "2. 開啟檔案管理器"
    echo "3. 找到 APK 檔案並點擊"
    echo "4. 按「安裝」"
    echo ""
    echo "💾 複製 APK 檔案："
    echo "cp $APK_PATH ~/workshift.apk"
else
    echo "❌ APK 構建失敗"
    echo "請檢查是否已安裝："
    echo "- Java JDK"
    echo "- Android SDK"
    echo "- Gradle"
    exit 1
fi
