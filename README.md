# Haiku Mug Generator

Next.js (React + TypeScript + Tailwind CSS) を使った簡易ツール。日本文化が好きな海外ユーザーが好きな英語の文章（行数不問）を入力すると、日本語の 5-7-5 俳句と英訳を生成し、マグカップ画像に縦書きで合成する EC サイトを目指しています。現状のコードは `src/app/page.tsx` のフォームに英語テキストを入力すると `/api/haiku` を通じて俳句と英訳を生成するサンプルです。

## 🎯 目指す最終プロダクト / UX
- 英語を扱う日本文化ファンが、自由な英語テキストを入力して送信すると、日本語の5-7-5俳句とその英訳が生成される。
- 生成された俳句を縦書きでマグカップ画像に合成し、画面に俳句と英訳が表示される。
- 気に入れば購入ボタンから住所を入力して注文でき、PrintfulとShopifyを通じて俳句入りマグカップが自動配送される。

---

## 🛠️ セットアップ
1. Node.js (LTS) をインストール。
2. 依存関係のインストール。
   ```bash
   npm install
   ```
3. 開発サーバー起動。
   ```bash
   npm run dev
   ```
   ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

---

## 🤖 OpenAI での俳句自動生成（実装済み）
1. フロントエンドの `src/app/page.tsx` から `/api/haiku` (`src/app/api/haiku/route.ts`) へ英語テキストを `POST` する。
2. `/api/haiku` で OpenAI API を呼び出し、5-7-5 の俳句と英訳を JSON で返す。
3. `.env.local` に OpenAI の API キーとプロジェクト ID を設定する。
   ```bash
   # プロジェクトルートで
   echo "OPENAI_API_KEY=sk-..." > .env.local
   echo "OPENAI_PROJECT=proj_..." >> .env.local
   ```

### 手順例
1. 上記の `.env.local` を作成して API キーを設定。
2. 開発サーバーを起動。
   ```bash
   npm run dev
   ```
3. ブラウザで [http://localhost:3000](http://localhost:3000) を開き、`src/app/page.tsx` のフォームに英語テキストを入力して「生成」をクリックすると、`/api/haiku` を経由して俳句と英訳が生成されキャンバスに描画されます。

---

## 🖨️ Printful 連携（追加予定）
1. `src/app/api/printful/route.ts` を作成し、生成したマグカップ画像を `POST` で受け取る。
2. Printful の Product Create エンドポイント等を呼び出し、商品を生成。
3. 必要な環境変数を `.env.local` に設定。
   ```bash
   PRINTFUL_API_KEY=...
   PRINTFUL_TEMPLATE_ID=...
   ```

---

## 🛍️ Shopify 連携（任意）
- **Printful → Shopify 自動連携**: Printful 管理画面で Shopify ストアを接続すると、Printful で作成した商品が自動で Shopify に同期されます。
- **直接 Shopify API を操作する場合**: `src/app/api/shopify/` などにルートを作り、REST/GraphQL API を呼び出します。
  ```bash
  SHOPIFY_STORE_URL=...
  SHOPIFY_ACCESS_TOKEN=...
  ```

---

## 🔧 開発フロー指針（Codex 利用時）
1. `src/app/page.tsx` に入力フォームと送信処理を実装し、`/api/haiku` へ英語テキストを送る。
2. `src/app/api/haiku/route.ts` で OpenAI API を使い 5-7-5 の日本語俳句と英訳を生成して返す。
3. 返却された俳句をキャンバスに縦書き描画し、生成した画像データを `/api/printful` に送信。
4. `src/app/api/printful/route.ts` から Printful Product API を呼び出し、マグカップ商品を作成。
5. Shopify との連携が必要なら Printful の Shopify 接続を使うか、`src/app/api/shopify/route.ts` を実装して REST/GraphQL API を呼ぶ。
6. 住所入力フォームと注文ボタンを追加し、注文情報を Printful（および必要に応じて Shopify）に送信して配送を確定する。
7. 上記で使用する API キーや各種 ID は `.env.local` に保存し、Git にはコミットしない。

---

## 🧪 ビルド / テスト
- 開発中はブラウザで動作を確認しながら、俳句生成→キャンバス描画→Printful/Shopify 連携の一連の流れを検証します。
- 本番ビルド:
  ```bash
  npm run build
  npm run start
  ```

---

## 🚀 デプロイ (GitHub & Vercel)
- このリポジトリは GitHub へのプッシュをトリガーとして Vercel で自動ビルド・デプロイされます。
- Vercel のデプロイ結果を通して挙動を継続的に確認できます。

---

この README の手順に従うことで、Codex などの支援を受けながら、英語入力から日本語俳句を自動生成し、マグカップ画像に合成して Printful・Shopify と連携する EC サイトを構築できます。
