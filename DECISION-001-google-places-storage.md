# DECISION-001 — Google Places の保存モデル

Status: Accepted for v1.2 pre-release implementation
Date: 2026-08-18

## Decision

Google Places から取得した場所について、Dayscape が端末へ永続保存する Google 由来データは **Place ID のみ**とする。

- Google候補から選択した場所
  - 永続保存: `source`, `placeId`
  - セッション中のみ保持: 表示名、住所、緯度・経度、データ提供者の帰属情報
- 自由入力した場所
  - 永続保存: `source`, ユーザーが入力した `name`

表示名・住所が必要な場合は、アプリ起動後に保存済みPlace IDからGoogle Placesへ再問い合わせし、実行中メモリへ解決する。

## Reason

Google Maps Platformの現行ポリシーでは、Place IDはキャッシュ制限の例外として保存可能。一方、ユーザー操作で返されたPlace Nameをセッション外で再利用するために捕捉・永続化することは認められていない。

したがって、旧PROJECT_CONTEXTの「表示名・住所・Place ID・緯度経度を保存する」という案は、そのままでは採用しない。

## UX impact

通常利用時の体験は維持する。

1. 施設名・住所を入力
2. Googleの候補から選択
3. 選択中は名称・住所を表示
4. 保存後、週／日表示ではPlace IDを再解決して場所名を表示
5. 場所名タップでGoogle Mapsを開く
6. API未設定・通信不能時は自由入力へフォールバック

Google選択済みの予定をオフラインで開いた場合、名称を再解決できない間は「場所を開く」と表示し、Place ID付きGoogle Maps URLは維持する。

## Attribution

Google Placesから取得した名称・住所をGoogle Mapなしで表示する箇所には、同じ表示コンテナ内に `Google Maps` 帰属表示を付ける。APIから第三者データ提供者の帰属が返された場合も併記する。

## Compatibility

- localStorage key: `dayscape.calendar.v1` を維持
- v1.1にはevent.placeが存在しないため既存予定への破壊的変更なし
- 自由入力の場所はJSONバックアップ／復元対象
- Google Placesの場所はPlace IDのみJSONバックアップ／復元対象

## References

- Google Maps JavaScript API — Policies and attributions
- Places API — Policies and attributions
- Places API — Place IDs
