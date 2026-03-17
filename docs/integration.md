1. 概要 (Overview)
Universal-Soul-Logic は、オンチェーンの不変性とオフチェーンの柔軟性を高度に融合させた、NFTキャラクターのための統合フレームワークです。
本ドキュメントでは、NFT（スマートコントラクト）と本エンジンをどのように連携させ、シーズン運用やキャラクターの永続性を実現するかを定義します。
2. 三層のアーキテクチャ (Three-Layer Architecture)
キャラクターの構成要素を以下の3層に分離して管理することで、ガス代の節約と柔軟なアップデートを両立させます。
| レイヤー | 格納場所 | 内容 | 性質 |
|---|---|---|---|
| Soul (DNA) | オンチェーン (NFT) | seed, originHex, birthTime, legacyPoints | 不変・永続 |
| Law (Logic) | オフチェーン (JSON) | 出現率, AP補正数式, 昇格パス, シーズンルール | 可変 (ガバナンス) |
| Body (Assets) | オフチェーン (CDN) | 画像(2D), 3Dモデル, モーション, UIアイコン | 可変 (改善/追加) |
3. NFT（オンチェーン）データ構造
NFTのスマートコントラクトには、個体のアイデンティティを決定づける「不変の種（Seed）」と「出自（Origin）」を記録します。
struct CharacterDNA {
    uint256 seed;          // 0~2^256-1 の乱数。能力値や初期職業の抽選に使用。
    string originHex;      // 出身地のヘックスID（例: "1_1"）。izu.jsonの座標に対応。
    uint256 birthTime;     // ミント時のタイムスタンプ。加齢計算の基点。
    uint256 legacyPoints;  // 前代から引き継いだ実績値。AP補正や初期ランクに影響。
}

4. 動的メタデータの生成フロー
マーケットプレイス（OpenSea等）やゲームクライアントでキャラクターを表示する際の計算フローです。
 * データ取得: NFTから DNA を、サーバーまたはフロントエンドで取得します。
 * 時間経過の計算: currentTime - birthTime から現在の年齢を算出します。
 * ロジック適用: SoulEngine.spawn() を実行し、その瞬間の logic.json に基づきステータスを生成。
 * アセット結合: 生成された visual_ref をキーに visual-mapping.json から画像URLを取得。
5. シーズン制：凍結と継承 (Persistence & Legacy)
本システムは、キャラクターを単なる「消費物」ではなく「歴史的資産」として扱うためのサイクルを提供します。
5.1 シーズン終了時の「凍結」
シーズンが終了した際、アクティブなキャラクターは「凍結（スナップショット）」されます。
 * Historical Card: 凍結されたNFTは、そのシーズンの最終ステータスを永久に保持する「武将カード」となります。
 * Metadata Snapshot: tokenURI を動的APIから、IPFS等に保存された静的なJSONへ切り替えます。
5.2 次シーズンへの「継承（Rebirth）」
プレイヤーは凍結された前代のNFTをベースに、次シーズンのキャラクターをミントできます。
 * DNAの継承: seed と originHex を引き継ぐことで、家系的な個性を維持。
 * 転生ボーナス: 前代の legacyPoints が、新シーズンでの初期AP効率や特殊技能の解放条件として機能します。
6. 多世界解釈（Multi-World Interpretation）
同じDNA（NFT）を保持したまま、異なる logic.json を適用することで、NFTの用途を瞬時に切り替えることが可能です。
 * 戦国RPGモード: sengoku-logic.json を適用 → 「伊豆出身の武士」として機能。
 * 現代戦略モード: modern-logic.json を適用 → 「静岡出身の政治家」として再定義。
7. 実装例 (Code Example)
import SoulEngine from '../lib/soul-engine.js';

// NFTの不変データ (DNA)
const nftDNA = {
    seed: 12345,
    originHex: "1_1",
    legacyPoints: 50
};

// シーズンロジックの適用
const currentCharacter = SoulEngine.spawn(
    geoData["1_1"], 
    currentSeasonLogic, 
    nftDNA.legacyPoints
);

console.log(`職業: ${currentCharacter.identity.occupation}`);
console.log(`AP効率: ${currentCharacter.capabilities.ap_modifiers.military}`);


