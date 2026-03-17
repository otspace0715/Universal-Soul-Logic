Universal Soul Logic (USL)
The Three-Layer Architecture for Persistent NFT Characters.
Universal Soul Logic は、オンチェーンの不変性とオフチェーンの柔軟性を融合させた、次世代NFTキャラクターのためのエンジンです。キャラクターの「魂（DNA）」をチェーンに刻み、その「解釈（Logic）」を外部化することで、シーズンごとのメタデータ更新、多世界間でのキャラクター利用、そして家系の継承システムを実現します。

🌌 コンセプト：三層構造 (The Trinity Model)
本プロジェクトでは、キャラクターを以下の3つのレイヤーで定義します。
 * Soul (DNA) - オンチェーンの不変性 NFTに記録された Seed と Origin。これはキャラクターの「魂」であり、決して変わりません。
 * Law (Logic) - オフチェーンの解釈 logic.json によって定義されるゲームルール。時代やシーズンに合わせて、同じ「魂」を「武士」にも「魔術師」にも解釈できます。
 * Body (Assets) - ビジュアルの受肉 visual-mapping.json を介して紐付けられる画像や3Dモデル。グラフィックのアップデートや、デバイスに合わせた最適化が可能です。

🛠 主な機能 (Core Features)
 * 📍 地理的生成 (Geo-based Spawning) 伊豆マップ（izu.json）の地形や標高に基づき、キャラクターの初期ステータスや職業確率が動的に変化します。
 * ⏳ 成長と加齢のシミュレーション ミント時からの経過時間に応じて、能力値（AP効率）や見た目が自動的に変化するロジックを搭載。
 * ❄️ シーズン凍結 & 継承システム シーズン終了時にキャラを「武士カード」として凍結。その実績（Legacy Points）を次代のキャラへ継承する「転生」の仕組みをサポート。
 * 🌐 多世界解釈 (Cross-World Logic) 同じNFTを保持したまま、参照する logic.json を切り替えるだけで、異なるゲームタイトルのキャラクターとして即座に利用可能。

📂 リポジトリ構造 (Structure)
/Universal-Soul-Logic
├── /lib               # Soul Engine 本体 (JS)
├── /data              # 地理データ (izu.json) と 生成ロジック (sengoku-logic.json)
├── /assets            # アセットマッピング定義 (visual-mapping.json)
├── /docs              # 統合ガイド (integration.md)
└── /demo              # ブラウザで動くシミュレーター (index.html)

🚀 クイックスタート (Getting Started)
1. デモを動かす
GitHub Pages で現在のロジックとアセットの連動を確認できます。
Demo Link
(※伊豆のマップをクリックして、魂をミントしてください)
2. プロジェクトへの統合
既存のNFTプロジェクトに導入する方法については、詳細な Integration Guide を参照してください。

📜 ライセンス (License)
This project is licensed under the MIT License.

🤝 コントリビュート
「多世界解釈」を広げるための新しい logic.json（ファンタジー、サイバーパンク等）や、新しい地理データのプルリクエストを歓迎します。
