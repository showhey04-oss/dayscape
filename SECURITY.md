# Security notes

## Google Maps Platform browser API key

Dayscapeの本番Google Maps Platformキーは、GitHubの公開ソースへ直接コミットしない。

本番キーはGitHub Actions Secret `GOOGLE_MAPS_API_KEY`として保持し、GitHub Pagesのデプロイ成果物`config.js`へだけ注入する。

ただし、ブラウザ用APIキーはWebアプリ配信後にクライアントから確認可能であり、GitHub Secretに置くこと自体が最終的なアクセス制御ではない。Google Cloud側の制限を必須とする。

### Required restrictions

Application restrictions:

- Websites / HTTP referrers
- `https://showhey04-oss.github.io`
- `https://showhey04-oss.github.io/*`

API restrictions:

- Maps JavaScript API
- Places API (New)

追加のGoogle Maps Platform APIを利用する場合は、必要性を確認してからAPI restrictionへ明示的に追加する。

### Cost controls

- Cloud Billing予算アラート
- Maps Platform使用量アラート
- 必要に応じたクォータ上限

予算アラートは通知のみで、支出を自動停止しない。ハードな利用上限が必要な場合はAPIクォータを設定する。

### Key handling

次を禁止する。

- 制限していない本番APIキーの利用
- 本番キーの`config.js`ソースへのコミット
- Issue / README / チャットへのキー貼付
- 他アプリ・他プロジェクトとのキー共用
- サーバー用キーをブラウザで利用

キーをローテーションする場合はGoogle Cloud側のWebsite/API restrictionを先に確認し、その後GitHub Secretを差し替える。

## Google Places data

Google選択地点はPlace IDだけを永続保存する。Googleから取得した表示名、住所、座標、provider attributionはセッション中に解決し、予定データとして恒久保存しない。

## User data

予定データはブラウザのローカルストレージに保存される。現行版にアカウント、クラウド同期、サーバーへの予定送信機能はない。

バックアップJSONには予定名、日時、同行者、出発日時、カテゴリ、自由入力した場所、Google Place IDなどが含まれる。バックアップファイルは個人情報として扱う。
