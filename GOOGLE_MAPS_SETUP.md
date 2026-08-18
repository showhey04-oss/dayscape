# Google Maps Platform setup — Dayscape

Dayscape v1.2では、Google Placesの実API確認と本番公開を2段階に分ける。

## Stage A — pre-release validation

まず **Maps Demo Key** を使用する。

- 請求先登録なしで取得できる
- テスト／プロトタイピング専用
- Places API (New) / Place Classを含む対応機能を試せる
- 日次上限に達した場合は翌日まで停止し、課金は発生しない
- 本番公開には使用しない

### Dayscapeでの安全な入力方法

Demo Keyは`config.js`へ書かず、`demo-key.html`から入力する。

1. DayscapeをHTTP/HTTPSで配信する
2. `demo-key.html`を開く
3. Maps Demo Keyを入力して「Dayscapeを開く」を押す
4. キーはURL fragment経由で`index.html`へ渡される
5. Dayscapeはキーを`sessionStorage`へ保存した後、URLからfragmentを削除する
6. `localStorage`、予定JSON、GitHubリポジトリにはDemo Keyを保存しない

ブラウザのタブ／セッションを閉じると検証用キーは失われる。再検証時は`demo-key.html`から再入力する。

### 実API検証項目

- 場所入力でGoogle候補が表示される
- 日本国内の施設名・住所を検索できる
- 候補から特定施設を選択できる
- 選択後に名称・住所が表示される
- 保存データにはGoogle Place IDだけが残る
- 再読込後にPlace IDから名称・住所を再解決できる
- 週表示・日表示で場所が表示される
- 場所タップでGoogle Mapsを開ける
- Google Maps/provider attributionが必要な箇所に表示される
- Places取得失敗時でも予定登録は自由入力へフォールバックできる

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
10. `demo-key.html`をリリース成果物から除外する
11. 実機iPhoneで最終確認

## Security rule

ブラウザ用APIキーはクライアントから見えること自体を秘密漏えいとはみなさず、Google Cloud側のWebsite/API restrictionで利用範囲を制限する。ただし、**制限前の標準APIキーはリポジトリへコミットしない**。

Demo Keyについても、DayscapeではGitHubへコミットせずブラウザのセッション内だけで使用する。

## Dayscape code status

通常の`config.js`はキー空欄である。Google Placesが利用できない場合は自由入力へフォールバックし、予定・天気・バックアップ等のコア機能はGoogleキーなしでも動作する。
