
# electron mock 201903

## get started

```
$ npm install
$ npm run start
```

## outline

`webpack` でソースコードをバンドルしたのち、モードに応じて `electron` を起動する。

`webpack` が処理する対象は、大きく client と server に大別できる。

通常、 `webpack` は `webpack.config.js` に設定を行い、コマンドラインや npm script で直接 `webpack` を起動する場合が多い。フロントエンドであれば、これに `webpack-dev-server` などを組み合わせてライブリロードを活用しながら開発するのが一般的だと思われる。

```
1. webpack（または webpack-dev-server）を実行
2. webpack が対象ソースをバンドル
3. webpack-dev-server によってブラウザがリロードされる
```

`electron` を用いる場合は、ブラウザではなく独立したウィンドウ上にフロントの実装が表示されることになるが、同時にサーバとなるメインプロセスも同時に起動することになるため、もしサーバ側の実装に変更があった場合は `electron` 自体を再起動しなければならない。

この問題に対処する方法としては `gulp` を用いるのが場合としては多いようだが、ここでは `index.js` 内で `webpack` を `require` して実行することで、変更を Node.js で検出しつつ処理を行っている。

`electron` のリロードや再起動は `electron-connect` で取り回ししている。

```
1. node index.js のコマンドを実行
2. コマンドライン引数 `-p` または `--production` でリリースモード
3. コマンドライン引数 `-d` または `--development` または省略で開発モード
4. コマンドライン引数に応じて index.js 内で webpack をモードを変えて起動
5. 開発モードの場合はそのまま electron を起動し watch する

※ npm run start は開発モードの実行
```

## how to

`webpack` の挙動を変えたい場合、通常 `webpack.config.js` で設定可能な項目については、開発モード用の `webpack.config.development.js` か `webpack.config.production.js` の中身を修正すればよい。

現状では `webpack` の v4 系で追加された `mode` を切り替えている他、ソースマップを出力するかどうかが異なる。

`webpack` 単体ではなく、バンドルから `electron` の起動までのプロセスを変更したい場合には `index.js` を修正する。

`electron` のライブリロードや再起動を自動的に行う必要があるため、 `electron-connect` に関連した記述が `index.js` と `src/main.js` の両方に記載されているので注意すること。

> * `index.js` → サーバプロセスを開始するための処理
> * `src/main.js` → `electron.BrowserWindow` のプロセスを開始するための処理

## tips

* `src/client/script.js` と `src/server/main.js` がエントリポイントになるファイル
* `app/client/script.js` と `app/server/main.js` がバンドル後の出力ファイル
* 上記の `app/` 以下にあるファイルは Git の管理対象になっていない（ `.gitignore` に記載）
* JavaScript のフレームワーク等を一切含まないシンプルな構成
* clone 直後などは `app/server` のディレクトリが無いはずなので注意



