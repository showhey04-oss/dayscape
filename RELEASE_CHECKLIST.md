# Dayscape v1.2.1 公開・実機確認チェック

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
- [x] リポジトリをPublicへ変更
- [x] GitHub PagesのSourceをGitHub Actionsへ設定
- [x] Pages workflow実行成功
- [x] 公開URLのHTTPS応答確認
- [x] アプリ本体の配信確認
- [x] Service Workerの配信確認
- [x] PWA Manifestの配信・JSON妥当性確認
- [x] Demo Key入力画面の配信確認
- [x] プライバシーポリシー・利用規約の配信確認
- [x] 公開`config.js`にGoogle Maps APIキーがないことを確認
- [x] v1.2.1で予定入力シートの横スクロールを修正
- [x] v1.2.1で日付と時刻を分離し、時刻入力の視認性を改善

## iPhone実機確認

- [x] Safariで月・週・日表示
- [x] 日付タップから予定追加
- [x] 予定の編集・削除
- [x] 1分単位の日時保持
- [x] 出発日時の初期値・追従・手動解除
- [x] Demo Key入力
- [x] Google Places候補表示
- [ ] 候補選択とPlace ID保存
- [ ] 再起動後の場所名再取得
- [x] 場所タップからGoogle Mapsアプリ／Webを起動
- [x] ホーム画面へ追加
- [x] standalone起動
- [x] オフラインでカレンダー起動・予定参照
- [ ] v1.1バックアップ復元と保存互換性
- [ ] v1.2.1で予定入力シートが横方向に動かないことを再確認
- [ ] v1.2.1で開始・終了・出発の時刻が見落としにくいことを再確認

## 本番用Placesを常時有効化する場合

- [ ] Google Cloudで請求先設定
- [ ] Maps JavaScript API有効化
- [ ] Places API (New)有効化
- [ ] ブラウザAPIキー発行
- [ ] Pages URLにHTTP referrer制限
- [ ] API restriction設定
- [ ] 予算アラート・クォータ設定
- [ ] `config.js`へ制限済みAPIキー設定
