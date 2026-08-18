# Dayscape v1.2 公開前チェック

- [x] Private GitHubリポジトリ作成
- [x] v1.2 pre-releaseソースの初期投入
- [x] Maps Demo Key取得
- [x] Demo KeyをGitHubへ保存しないセッション入力導線を実装

## Pre-release validation

- [ ] `demo-key.html`からDemo Keyを入力
- [ ] Google Places候補が表示される
- [ ] 候補から施設を選択できる
- [ ] Place IDだけが永続保存される
- [ ] 再読込後にPlace IDから名称・住所を再解決できる
- [ ] 週表示・日表示で場所を確認
- [ ] 場所タップからGoogle Mapsアプリ／Webを起動
- [ ] Places通信失敗時に自由入力へフォールバック

## Production setup

- [ ] Google Cloudで請求先設定
- [ ] Maps JavaScript API有効化
- [ ] Places API (New)有効化
- [ ] ブラウザAPIキー発行
- [ ] GitHub Pages URLにHTTP referrer制限
- [ ] API restriction設定
- [ ] config.jsへ制限済みAPIキー設定
- [ ] `demo-key.html`をリリース成果物から除外
- [ ] Humanによる公開判断
- [ ] GitHub Pages公開

## iPhone release QA

- [ ] iPhone Safariで予定追加・編集・削除
- [ ] Google Places候補選択
- [ ] 場所タップからGoogle Mapsアプリ／Webを起動
- [ ] ホーム画面へ追加
- [ ] standalone起動
- [ ] オフラインでカレンダー起動・予定参照
- [ ] v1.1バックアップを復元して互換性確認
