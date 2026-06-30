# 每日工時計時器 — 設計構思

## 三種風格方向

### 方向 A：工業極簡（Industrial Minimal）
深色背景搭配精準的等寬字型，像一台專業的機械碼錶。強調數字的視覺衝擊力。
**Probability:** 0.07

### 方向 B：清晨辦公室（Morning Office）
米白底色、溫暖的棕褐色調，像一本精緻的皮革筆記本。讓工作感覺有質感而不壓迫。
**Probability:** 0.04

### 方向 C：霓虹終端（Neon Terminal）
深海軍藍底色，螢光綠/青色強調，像一個高科技的控制台。現代感強烈，充滿能量。
**Probability:** 0.09

---

## 選定方向：A — 工業極簡（Industrial Minimal）

### Design Movement
工業主義 × 瑞士排版（Swiss Typography）× 精密儀器美學

### Core Principles
1. **數字至上**：計時數字是主角，所有設計服務於數字的清晰可讀性
2. **功能即美學**：每個元素都有明確用途，無裝飾性元素
3. **精準感**：細線、精確間距、對齊感，像精密工具
4. **克制的對比**：深色底色配高對比白/亮色，視覺層次清晰

### Color Philosophy
- 背景：深炭灰 `#0F0F0F` — 消除干擾，讓計時器成為焦點
- 主色：亮白 `#F5F5F5` — 計時數字，最高優先級
- 強調色：琥珀橙 `#FF8C00` — 計時中狀態，充滿能量感
- 次要強調：冷青色 `#00D4FF` — 互動元素、圖表
- 靜止色：中灰 `#4A4A4A` — 非活躍元素

### Layout Paradigm
非對稱左側邊欄佈局：左側固定導覽 + 右側主內容區。
主計時器採用超大字型佔據視覺中心，下方為工作項目列表。
統計頁面採用數據儀表板佈局，卡片式排列。

### Signature Elements
1. **超大等寬計時數字**：`font-size: clamp(4rem, 10vw, 8rem)`，使用 JetBrains Mono
2. **細線分隔符**：1px 線條，不用色塊分隔
3. **脈衝動畫**：計時中的數字旁有微弱的橙色脈衝光暈

### Interaction Philosophy
- 按鈕按下時有輕微的 scale(0.96) 回饋
- 計時器啟動時有平滑的顏色過渡（灰→橙）
- 頁面切換使用 slide 動畫

### Animation
- 計時數字：無動畫（純數字跳動即是動畫）
- 計時狀態切換：200ms ease-out 顏色過渡
- 脈衝光暈：2s 無限循環，opacity 0.3→0.8→0.3
- 卡片進場：stagger 50ms，translateY(8px)→0 + opacity 0→1

### Typography System
- 顯示字型（計時器）：JetBrains Mono — 等寬、精準、機械感
- 介面字型（UI）：IBM Plex Sans — 清晰、現代、工業感
- 層級：計時數字 8rem / 標題 1.5rem / 正文 0.875rem

### Brand Essence
**WorkTimer** — 為專注工作者打造的精準工時追蹤工具，簡單、可靠、無干擾。
個性形容詞：**精準**、**沉著**、**高效**

### Brand Voice
直接、無廢話。
- 標題範例：「今天工作了多久？」
- CTA 範例：「開始計時」（不是「立即開始您的高效工作之旅」）

### Signature Brand Color
琥珀橙 `#FF8C00` — 計時中的能量感
