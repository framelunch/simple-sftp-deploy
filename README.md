# simple-sftp-deploy

## これはなんですか?

Node.jsからsftpでファイルをアップロードするコマンドがほしいなと思って作りました。

## 動作環境

たぶんですが・・・

- macOS >= 10.12
- Node >= 6.9

## How to use

### インストール

```bash
npm i -D framelunch/simple-sftp-deploy
# or...
yarn add -D framelunch/simple-sftp-deploy
```

### npmスクリプト追加

```json
// package.json

"scripts": {
    "deploy": "DEPLOY_HOST=127.0.0.1 DEPLOY_PORT=22 DEPLOY_USER=dummyuser DEPLOY_PASS=dummypass DEPLOY_DIR_FROM_ROOT=package.json DEPLOY_TARGET=/tmp bin/cmd.js",
},
```

### または

```json
// package.json

"scripts": {
  "deploy": "simple-sftp-deploy"
},
```

```bash
# .env

DEPLOY_HOST=127.0.0.1
DEPLOY_PORT=22
DEPLOY_USER=dummyuser
DEPLOY_PASS=dummypass
DEPLOY_DIR_FROM_ROOT=build
DEPLOY_TARGET=/tmp
```

### 実行

```bash
npm run deploy
## or...
yarn deploy
```

## オプション

すべて環境変数から値をとります。多分セキュリティ的にはグズグズですが外部公開するようなものでもないので・・・。

- `DEPLOY_HOST`: 接続先ホスト
- `DEPLOY_PORT`: 接続先PortNo(デフォルト: 22)
- `DEPLOY_USER`: 接続ユーザ
- `DEPLOY_PASS`: 接続Pass
- `DEPLOY_DIR_FROM_ROOT`: ルートディレクトリから見た、アップロードしたいパス
- `DEPLOY_TARGET`: 接続先のどのディレクトリにアップするか

鍵認証もやればできるんですがめんどくさくて実装してません。
