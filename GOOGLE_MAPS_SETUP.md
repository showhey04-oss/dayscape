# Google Maps Platform setup — Dayscape

Dayscapeは、Google Placesを「Demo Keyによる検証」と「制限済み本番キーによる通常利用」に分ける。

## Stage A — Demo validation

Maps Demo Keyはテスト／プロトタイピング専用。Dayscapeでは`demo-key.html`から入力し、`sessionStorage`だけで使用する。

確認済み:

- Google Places候補表示
- 候補選択
- Google Maps起動
- PWA / iPhone実機動作

Demo Keyは`localStorage`、予定JSON、GitHubリポジトリへ保存しない。

## Stage B — Production key

### 推奨方針

Demo Keyそのものを本番用として使い続けず、Google Cloudで請求を有効化したプロジェクトに**Dayscape専用の新しいブラウザAPIキー**を作成する。

Google Maps Platformのブラウザ用キーは配信後にクライアントから確認可能であるため、秘密値として隠すことよりも、HTTP referrer制限とAPI制限を正しく設定することが重要。

Dayscapeのソースコードには本番キーをコミットしない。GitHub Actions Secret `GOOGLE_MAPS_API_KEY`からPagesのデプロイ成果物`config.js`へだけ注入する。

### Google Cloud設定

1. Google CloudでGoogle Maps Platform用プロジェクトを選択または作成する
2. 請求先アカウントをリンクする
3. 次のAPIを有効化する
   - Maps JavaScript API
   - Places API (New)
4. APIキーを新規作成する
   - 推奨名: `Dayscape Web Production`
5. Application restrictionsを **Websites / HTTP referrers** に設定する
6. 許可referrerを次の2件にする
   - `https://showhey04-oss.github.io`
   - `https://showhey04-oss.github.io/*`
7. API restrictionsを **Restrict key** に設定し、次の2件だけ許可する
   - Maps JavaScript API
   - Places API (New)
8. 保存後、制限が反映されるまで数分待つ

### なぜPagesのパスだけに制限しないか

`https://showhey04-oss.github.io/dayscape/*`だけに限定すると、ブラウザのReferrer Policyによってクロスオリジン通信時にパスが落ち、正規利用まで拒否される場合がある。Google Cloudの公式ガイダンスに合わせ、GitHub Pagesのorigin単位で許可する。

より強い分離が必要になった場合は、Dayscape専用のカスタムドメインを導入して、そのoriginだけを許可する。

## GitHub設定

本番キーを取得・制限した後、GitHubリポジトリ `showhey04-oss/dayscape` で以下を設定する。

1. `Settings`
2. `Secrets and variables`
3. `Actions`
4. `New repository secret`
5. Name: `GOOGLE_MAPS_API_KEY`
6. Secret: 制限済みの本番ブラウザAPIキー

キーそのものはチャット、Issue、README、`config.js`、コミット履歴へ貼らない。

GitHub Pages workflowはSecretが空なら従来どおりDemo/自由入力モードで配信し、Secretが存在する場合だけデプロイ成果物へ本番キーを注入する。

## Cost controls

本番運用開始時に以下を設定する。

- Cloud Billingの月額予算と予算アラート
- Google Maps Platformの使用量アラート
- 必要に応じてAPIクォータ上限

予算アラートは通知であり、支出を自動停止しない。想定外課金を物理的に抑えたい場合はクォータ上限も設定する。

家庭内利用では通常の利用量は非常に小さいため、初期は低めのクォータから開始し、実使用量を確認して必要時だけ引き上げる。

## Production verification

GitHub Secret設定後、Pagesを再デプロイして次を確認する。

- 通常URLから直接Google Places候補が表示される
- Demo Key入力が不要
- 設定画面から「Google Placesを検証」リンクが消える
- 場所選択後はPlace IDだけが永続保存される
- 再起動後にPlace IDから名称・住所を再取得できる
- 場所タップでGoogle Mapsを開ける
- Google Maps / provider attributionが表示される
- 公開ソース`config.js`はキー空欄のまま
- GitHub Pagesの配信成果物`config.js`だけに本番キーが存在する

## Security rule

- Dayscape専用キーを使用する
- Website restrictionを必須にする
- API restrictionを必須にする
- 本番キーをGit履歴へコミットしない
- キーをローテーションする場合は、Google Cloud制限を確認してからGitHub Secretを差し替える
- 予定データは引き続き端末内だけに保存する
