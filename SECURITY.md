# Security notes

## Google Maps Platform API key

`config.js` に設定するブラウザ用APIキーは、Webアプリの配信時にクライアントへ公開されます。APIキーを秘密情報として隠す設計ではなく、Google Cloud側の制限で不正利用を防ぎます。

公開前に必ず以下を設定してください。

- Application restrictions: Websites
- 許可するHTTP referrer: Dayscapeの公開URLだけ
- API restrictions: Maps JavaScript APIとPlaces API (New)の必要範囲だけ
- 予算アラート
- 必要に応じたクォータ上限

制限していないAPIキー、サーバー用キー、他プロジェクトと共用するキーはコミットしないでください。

## User data

予定データはブラウザのローカルストレージに保存されます。現行版にアカウント、クラウド同期、サーバーへの予定送信機能はありません。

バックアップJSONには予定名、日時、同行者、出発日時、カテゴリ、自由入力した場所、Google Place IDなどが含まれます。バックアップファイルは個人情報として扱ってください。
