# Haiku Mug Generator

ユーザーが入力したテキストを日本語の俳句に変換し、縦書きでマグカップ画像に合成する簡易ツール。
Vercelはwataridori69@gmail.comアカウント

Deployment
zenmug-5fq8zyps4-singo3s-projects.vercel.app
Domains
zenmug.vercel.app
zenmug-singo3s-projects.vercel.app


作業再開時の環境有効化（毎回の作業時）
プロジェクトフォルダで以下を実行。
source env/bin/activate

---

## 🛠️ 開発環境と使用ライブラリ

- **Pythonバージョン**: 3.11（環境に合わせて調整）
- **仮想環境**: venv
- **使用ライブラリ**:
  - Pillow
  - OpenCV（必要に応じて追加）

---

## 🚀 セットアップ方法（初回のみ）

プロジェクトディレクトリ内で、以下を順番に実行します。

### 1. 仮想環境作成と有効化

**Mac/Linuxの場合**
```bash
python -m venv env
source env/bin/activate

2. 必要なライブラリのインストール方法
pip install -r requirements.txt


ライブラリを追加した場合の更新方法
新しくパッケージを追加したら、以下を実行し更新します。
pip freeze > requirements.txt
