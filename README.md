Universal Soul Logic (USL) Framework
「魂（Identity）」と「世界（Context）」を分離し、NFTに真の人生を吹き込む。
Universal Soul Logic は、NFTキャラクターに対して、地理的条件や社会的属性に基づいた動的なステータス生成と**行動経済（Action Point）**のロジックを付与するための汎用フレームワークです。

💡 なぜこれが必要なのか？
既存のNFTゲームの多くは、能力値や外見がひとつのゲームに固定されています。USLフレームワークは、キャラクターの「履歴（魂）」と、それをどう解釈するかという「ルール（ロジック）」を分離します。
これにより、ひとつのNFTが：
 * 戦国時代オンラインでは「伊豆の足軽」として振る舞い、
 * 魔法学校シミュレーターでは「2年生の魔術師」として解釈される、
   という**多世界解釈（Multiverse Interpretation）**を実現します。

🚀 コア・コンセプト
 * Decoupling (疎結合): 土地データ（hex-shogun-map等）やアセットデータと独立してロジックを管理。
 * Dynamic AP Control: 年齢、ジェンダー、職業、土地属性を掛け合わせ、個体ごとの「行動コスト」をミリ単位で制御。
 * Generational Inheritance: 一世代の終焉をデータとして記録し、次代の初期ステータスに引き継ぐ「魂の連鎖」をサポート。
 * Gender & Identity Fluidity: 固定概念に縛られない多様なジェンダー定義と、それに応じた独自のAPボーナス設定。

🛠 構成ファイル
 * profiles/sengoku-logic.json: 13歳からの元服、昇進、関白への道を定義した戦国特化ロジック。
 * schemas/life-logic.schema.json: あらゆる世界観に対応可能な属性定義スキーマ。
 * lib/soul-engine.js: 地理データとロジックを合成する軽量演算エンジン。

## NFT Integration Flow

このフレームワークは、オンチェーンの不変データとオフチェーンの動的ロジックを統合します。

1. **On-chain Data (The Soul)**: 
   NFT holds `seed`, `birth_place`, and `legacy_points`.
2. **Logic Layer (The Law)**: 
   `sengoku-logic.json` interprets the on-chain data into gameplay stats (AP, Occupation).
3. **Visual Layer (The Body)**: 
   `visual-mapping.json` assigns the correct avatar based on the interpreted stats.

これにより、ゲームバランスの調整（APの変更）や外見のアップデートを、ガス代をかけずに行うことが可能です。
