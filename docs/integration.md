# Universal Soul Logic - NFT Integration Guide

本ドキュメントでは、`Universal Soul Engine` を実際のキャラクターNFT（ERC-721等）と連携させ、動的なメタデータやゲームフロントエンドを構築するための仕様を定義します。

## 1. データの分離構造

本プロジェクトでは、データを以下の3つのレイヤーに分離して管理します。

| レイヤー | 格納場所 | 内容 | 不変性 |
| :--- | :--- | :--- | :--- |
| **Soul (DNA)** | オンチェーン (NFT) | Seed, 出身地ID, 誕生時刻, 継承ポイント | 不変 |
| **Law (Logic)** | オフチェーン (JSON) | 職業抽選確率, AP補正数式, 昇格条件 | 可変 (運営/DAO) |
| **Body (Assets)** | オフチェーン (JSON/CDN) | スプライト画像, 3Dモデル, モーション | 可変 (アップデート可) |

## 2. NFT（オンチェーン）の必須属性

NFTのスマートコントラクトには、最低限以下の `struct` または `mapping` を持たせることを推奨します。

```solidity
struct CharacterDNA {
    uint256 seed;          // 0~2^256-1 の乱数。個体差の根源。
        string originHex;      // 出身地のヘックスID（例: "1_1"）。
            uint256 birthTime;     // 誕生時のタイムスタンプ。加齢計算に使用。
                uint256 legacyPoints;  // 前代から引き継いだポイント。AP補正に影響。
                }
                