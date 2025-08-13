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
- npmのキャッシュをクリアしてください：`npm cache clean --force`

## Gitブランチ方針

### ブランチ戦略
- **`main`**: 常に最新の安定版を保持するメインブランチ
- **`feature/xxx`**: 機能開発用の作業ブランチ（例：`feature/chat`）

### 開発フロー
1. **作業ブランチの作成**

以下はターミナル操作の例。プラグイン Git Graph, Got History, GitLens などを利用してプラグイン操作でも可
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/新機能名
   ```

2. **開発・コミット**

以下はターミナル操作の例。プラグイン Git Graph, Got History, GitLens などを利用してプラグイン操作でも可

   ```bash
   git add .
   git commit -m "feat: 新機能の説明"
   git push origin feature/新機能名
   ```

3. **プルリクエストの作成**
   - `feature/xxx` → `main` 向けにプルリクエストを作成
   - 適切なタイトルと説明を記載
   - 必要に応じてレビュアーを指定

4. **マージ**
   - セルフマージを基本とする
   - 重要な変更や複雑な機能の場合は適宜レビューを実施
   - マージ後は作業ブランチを削除

### 注意事項
- `main`ブランチに直接コミットしない
- 作業ブランチは定期的に`main`から最新化する