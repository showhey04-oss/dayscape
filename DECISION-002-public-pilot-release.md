# DECISION-002 — Public pilot release

- Date: 2026-08-18
- Status: Accepted
- Decision owner: Human

## Context

Dayscape v1.2のPWA、場所入力、Google Mapsリンク、Demo Key検証導線が整い、Privateリポジトリでの初期実装とQAが完了した。

公開には、リポジトリ可視性、利用規約、プライバシーポリシー、GitHub Pages配信、実機検証が関係するためHuman確認の対象とした。

## Decision

`showhey04-oss/dayscape`をPublicリポジトリとして公開し、GitHub Pagesで`v1.2 public pilot`を配信する。

公開時点のGoogle Placesは次の扱いとする。

- `config.js`にはAPIキーを保存しない
- Demo Keyは`demo-key.html`から利用者が入力する
- Demo Keyは当該タブの`sessionStorage`だけで使用する
- URL fragmentは受領後に除去する
- 予定データ、`localStorage`、バックアップJSON、GitHubにはDemo Keyを保存しない
- Google Placesが無効でも、場所の自由入力を利用可能とする

## Consequences

- ソースコードと設計資料は一般公開される
- 予定データは引き続き利用端末内にのみ保存される
- PublicリポジトリにすることでGitHub FreeでもPagesを利用できる
- 公開後にiPhone実機でPWAとGoogle Placesを確認する
- Google Placesを一般利用者向けに常時有効化する段階で、制限済みの本番用ブラウザAPIキーへ切り替える

## Guardrails

- Demo Key、無制限の標準APIキー、個人の予定データをコミットしない
- Pages公開前後に`config.js`が空欄であることを確認する
- 公開版からプライバシーポリシーと利用規約へ到達可能にする
- 公開後の仕様変更も既存データ互換性を原則維持する
