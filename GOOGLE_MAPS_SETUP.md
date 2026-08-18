# Google Maps Platform setup — Dayscape

Dayscape v1.2では、Google Placesの実API確認と本番公開を2段階に分ける。

## Stage A — pre-release validation

まず **Maps Demo Key** を使用する。

- 請求先登録なしで取得できる
- テスト／プロトタイピング専用
- Places API (New) / Place Classを含む対応機能を試せる
- 日次上限に達した場合は翌日まで停止し、課金は発生しない
- 本番公開には使用しない

### 手順

1. Google Maps Platform公式の「Get a Maps Demo Key」からDemo Keyを取得する
2. ローカル検証用の`config.js`で `googleMapsApiKey` にキーを設定する
3. `python3 -m http.server 8080`等のHTTP配信でDayscapeを開く
4. 以下を確認する
   - 場所入力でGoogle候補が出る
   - 候補から施設を選択できる
   - 保存後もPlace IDから場所名を再解決できる
   - 場所タップでGoogle Mapsを開ける
   - Google Maps/provider attributionが表示される
5. Demo Keyを公開リポジトリへコミットしない

## Stage B — production key

GitHub Pages等で公開する直前に、標準のブラウザAPIキーへ切り替える。

### 必須設定

1. Google Cloudプロジェクトと請求先アカウントを設定
2. Maps JavaScript APIを有効化
3. Places API (New)を有効化
4. ブラウザ用APIキーを作成
5. Application restrictionsを **Websites** に設定
6. Dayscapeの公開URLだけをHTTP referrerとして許可
7. API restrictionsを有効にする
   - Maps JavaScript API
   - Places API (New)
8. 予算アラートと必要なクォータ上限を設定
9. `config.js`へ制限済みキーを設定
10. 実機iPhoneで最終確認

## Security rule

ブラウザ用APIキーはクライアントから見えること自体を秘密漏えいとはみなさず、Google Cloud側のWebsite/API restrictionで利用範囲を制限する。ただし、**制限前の標準APIキーはリポジトリへコミットしない**。

## Dayscape code status

現在の`config.js`はキー空欄であり、Google Placesが利用できない場合は自由入力へフォールバックする。予定・天気・バックアップ等のコア機能はGoogleキーなしでも動作する。
