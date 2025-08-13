# 受架電支援AI PoC アプリケーション

## 概要
このプロジェクトは、受架電支援AIの概念実証（PoC）アプリケーションです。通話前・通話中・通話後の各段階をサポートするWebアプリケーションです。

## 技術スタック
- **フレームワーク**: Next.js 14.2.31
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **アイコン**: React Icons

## 前提条件
- Node.js 24.2.0以降

## ローカル開発環境のセットアップ

### 1. リポジトリのクローン
```bash
git clone [リポジトリURL]
cd cfalpha202508
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

### 4. ブラウザでアクセス
開発サーバーが起動したら、以下のURLでアクセスできます：
- http://localhost:3000

## 利用可能なスクリプト

- **`npm run dev`**: 開発サーバーを起動（ホットリロード対応）
- **`npm run build`**: 本番用ビルドを作成
- **`npm run start`**: 本番サーバーを起動

## トラブルシューティング

### `next: command not found`エラーが発生する場合
依存関係が正しくインストールされていない可能性があります。以下の手順を試してください：

```bash
# 既存の依存関係を削除
rm -rf node_modules
rm package-lock.json

# 依存関係を再インストール
npm install
```

### その他の問題
- Node.jsのバージョンを確認してください
- npmのキャッシュをクリアしてください：`npm cache clean --force`s