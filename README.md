# Dayscape v1.2

Dayscapeは、iPhoneでの利用を前提にした家族向けカレンダーPWAです。

**予定・場所・天気・出発**を一つの流れにまとめ、非エンジニアの夫婦・子育て家庭が日常的に迷わず使えることを目標としています。

## 現在の状態

- バージョン: `v1.2 public pilot`
- 配布形態: 静的Webアプリ / PWA
- 公開先: GitHub Pages
- 保存方式: ブラウザ内のローカル保存
- クラウド同期: 未導入
- Google Places: Demo Keyによる実API検証段階

公開予定URL:

`https://showhey04-oss.github.io/dayscape/`

## 主な機能

- 月・週・日表示
- 日付タップから予定を追加
- 予定の登録・編集・削除
- 終日予定、複数日予定、1分単位の時刻設定
- 出発日時
- 一緒に行く人
- カテゴリと色分け
- Open-Meteoによる天気表示
- Google Placesによる場所検索
- 場所タップからGoogle Mapsを開く
- JSONバックアップ・復元
- ホーム画面追加、standalone表示、Service Worker、オフライン起動

## Google Placesの保存方針

Google候補から選んだ場所は、Google Maps Platformのポリシーに合わせ、端末へ永続保存するGoogle由来データを **Place IDのみ** とします。

- Google候補から選択した場所
  - 永続保存: `source`, `placeId`
  - セッション中のみ: 表示名、住所、緯度・経度、帰属情報
- 自由入力した場所
  - 永続保存: `source`, 利用者が入力した名称

保存済みPlace IDは、起動後にGoogle Placesへ再問い合わせして表示名等を解決します。詳細は [`DECISION-001-google-places-storage.md`](./DECISION-001-google-places-storage.md) を参照してください。

## Demo Keyでの検証

Demo Keyはリポジトリへ保存しません。次の専用ページで入力し、そのブラウザタブの検証セッションだけで使用します。

`https://showhey04-oss.github.io/dayscape/demo-key.html`

入力したDemo KeyはURLから直ちに除去し、`sessionStorage`だけに保持します。予定データ、`localStorage`、バックアップJSONには保存しません。

## 本番用Google Maps Platform設定

本番公開でGoogle Placesを常時有効にする場合は、`config.js`の`googleMapsApiKey`に制限済みのブラウザ用APIキーを設定します。

```js
window.DAYSCAPE_CONFIG = {
  googleMapsApiKey: "YOUR_RESTRICTED_BROWSER_KEY"
};
```

必須設定:

1. Maps JavaScript APIを有効化
2. Places API (New)を有効化
3. Application restrictionsを`Websites`に設定
4. Dayscapeの公開URLだけをHTTP referrerとして許可
5. API restrictionsで利用APIを限定
6. 予算アラートと必要なクォータ上限を設定

詳細は [`GOOGLE_MAPS_SETUP.md`](./GOOGLE_MAPS_SETUP.md) を参照してください。

## データとプライバシー

予定データはGitHubへ送信されません。GitHubにはHTML、CSS、JavaScript等のアプリ本体だけを置き、予定、同行者、場所、カテゴリ等は利用端末のブラウザ内に保存します。

- [プライバシーポリシー](./privacy.html)
- [利用規約](./terms.html)
- [セキュリティ上の注意](./SECURITY.md)

## ローカル確認

Service WorkerとブラウザAPIを確認するため、`file://`ではなくHTTPで配信します。

```bash
python3 -m http.server 8080
```

その後、`http://localhost:8080/`を開きます。

## 主要ファイル

- `index.html`: アプリ本体
- `config.js`: 実行時設定
- `manifest.webmanifest`: PWA設定
- `service-worker.js`: オフラインキャッシュ
- `demo-key.html`: Demo Key検証入口
- `privacy.html`: プライバシーポリシー
- `terms.html`: 利用規約
- `.github/workflows/pages.yml`: GitHub Pages配信
- `PROJECT_CONTEXT.md`: 正本仕様
- `QA_REPORT.md`: 検証結果
- `RELEASE_CHECKLIST.md`: 公開・実機確認チェック

## ライセンス

現時点ではオープンソースライセンスを設定していません。公開リポジトリでの閲覧は可能ですが、別途明示がない限り、複製・改変・再配布を許諾するものではありません。
