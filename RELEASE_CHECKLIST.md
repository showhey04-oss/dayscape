# Dayscape v1.2 公開・実機確認チェック

## 公開準備

- [x] GitHubリポジトリ作成
- [x] v1.2 pre-releaseソース投入
- [x] Demo Key取得
- [x] Demo Keyを永続保存しない検証導線
- [x] プライバシーポリシー
- [x] 利用規約
- [x] GitHub Pages workflow準備
- [x] 公開判断
- [x] 公開版から規約・プライバシーポリシーへの導線
- [x] 公開対象ソースにAPIキー・予定データがないことを確認
- [ ] リポジトリをPublicへ変更
- [ ] GitHub PagesのSourceをGitHub Actionsへ設定
- [ ] Pages workflow実行成功
- [ ] 公開URLのHTTPS応答確認

## iPhone実機確認

- [ ] Safariで月・週・日表示
- [ ] 日付タップから予定追加
- [ ] 予定の編集・削除
- [ ] 1分単位の日時保持
- [ ] 出発日時の初期値・追従・手動解除
- [ ] Demo Key入力
- [ ] Google Places候補表示
- [ ] 候補選択とPlace ID保存
- [ ] 再起動後の場所名再取得
- [ ] 場所タップからGoogle Mapsアプリ／Webを起動
- [ ] ホーム画面へ追加
- [ ] standalone起動
- [ ] オフラインでカレンダー起動・予定参照
- [ ] v1.1バックアップ復元と保存互換性

## 本番用Placesを常時有効化する場合

- [ ] Google Cloudで請求先設定
- [ ] Maps JavaScript API有効化
- [ ] Places API (New)有効化
- [ ] ブラウザAPIキー発行
- [ ] Pages URLにHTTP referrer制限
- [ ] API restriction設定
- [ ] 予算アラート・クォータ設定
- [ ] `config.js`へ制限済みAPIキー設定
