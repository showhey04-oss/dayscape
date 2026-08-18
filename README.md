# Dayscape

Dayscape は、iPhoneでの利用を前提にした家族向けカレンダーPWAです。

予定・場所・天気・出発情報を一つの流れにまとめ、非エンジニアの夫婦・子育て家庭が日常的に迷わず使えることを目標としています。

## 現在の状態

- バージョン: v1.2 pre-release
- 配布形態: 静的Webアプリ / PWA
- 保存方式: ブラウザ内のローカル保存
- クラウド同期: 未導入
- 公開状態: 未公開

## 主な機能

- 月・週・日表示
- 予定の登録・編集・削除
- 終日予定、複数日予定、1分単位の時刻設定
- 出発日時
- 一緒に行く人
- カテゴリと色分け
- Open-Meteoによる天気表示
- Google Placesによる場所検索
- 場所タップからGoogle Mapsを開く
- JSONバックアップ・復元
- ホーム画面追加、Service Worker、オフライン起動

## Google Maps Platform設定

`config.js` の `googleMapsApiKey` にブラウザ用APIキーを設定します。

```js
window.DAYSCAPE_CONFIG = {
  googleMapsApiKey: "YOUR_RESTRICTED_BROWSER_KEY"
};
```

APIキーには必ず次の制限を設定してください。

- Application restriction: Websites
- Website restriction: 実際に公開するGitHub Pages等のURL
- API restriction: Maps JavaScript API / Places API (New)

APIキー未設定時も、場所の自由入力とGoogle Maps検索リンクは利用できます。

## データとプライバシー

予定データはGitHubへ送信されません。アプリ本体のみをリポジトリで管理し、予定、同行者、場所、カテゴリ等は利用端末のブラウザ内に保存します。

Google Placesから選択した場所は、永続データとしてPlace IDを保存し、Google由来の名称・住所・座標は起動時に再取得します。Google Placesを利用できない場合は自由入力へフォールバックします。

## ファイル構成

- `index.html`: アプリ本体
- `config.js`: 実行時設定
- `manifest.webmanifest`: PWA設定
- `service-worker.js`: オフラインキャッシュ
- `icons/`: ホーム画面用アイコン
- `PROJECT_CONTEXT.md`: 正本仕様
- `DECISION-001-google-places-storage.md`: Google Places保存方針
- `QA_REPORT.md`: 検証結果
- `RELEASE_CHECKLIST.md`: 公開前チェック

## 開発方針

- iPhone-first
- シンプル、洗練、低ノイズ
- 自然で簡潔な日本語
- 機能数より、日常利用時の操作摩擦低減を優先
- v1.1の保存データ互換性を原則維持
