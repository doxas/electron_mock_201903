
# electron mock 201903

## get started

```
$ # install
$ npm install
$
$ # run development mode
$ npm run start
$
$ # test and coverage preview
$ npm run test
```

## outline

`webpack` でソースコードをバンドルしたのち `development` モードなら `electron` を起動するところまで自動で行う。（`production` モードの場合はバンドル作業のみ）

`webpack` が処理する対象は、大きく client と server に大別できる。

通常、 `webpack` は `webpack.config.js` に設定を行い、コマンドラインや npm script で直接 `webpack` を実行する場合が多い。フロントエンドであれば、これに `webpack-dev-server` などを組み合わせてライブリロードを活用しながら開発するのが一般的。

この場合の手順がおよそ以下のような流れになる。

```
1. webpack（または webpack-dev-server）を実行
2. webpack が対象ソースをバンドル
3. webpack-dev-server によってブラウザで localhost 等で実装を参照
4. ソースに変更があった場合、webpack-dev-server によって自動的にブラウザがリロードされる
```

`electron` を用いる場合は、ブラウザではなく独立したウィンドウ上にフロントの実装が表示されることになるが、サーバとなるメインプロセスも同時に起動することになるため、もしサーバ側の実装に変更があった場合は、フロントのビューだけでなく、 `electron` 自体を再起動しなければならない。

この問題に対処する方法としては `gulp` を用いるのが（検索した限りは）場合として多いようだが、ここでは `index.js` 内で `webpack` を `require` して実行することで、変更を Node.js で検出しつつ処理を行っている。

要約すると、コマンドとして直接 `webpack` コマンドを用いるのではなく、わざわざ `index.js` を利用して `webpack` を `require` した独自処理を行っているのは *Electron のメインプロセスも webpack のバンドル処理に含めたい* からである。（これはたとえばメインプロセスも TypeScript で書きたい、といった場合の要件と同じ）

`electron` のリロードや再起動は `electron-connect` で取り回ししている。

```
1. node index.js のコマンドを実行
2. コマンドライン引数 `-p` または `--production` でリリースモード
3. コマンドライン引数 `-d` または `--development` または省略で開発モード
4. コマンドライン引数に応じて index.js 内で webpack をモードを変えて起動
5. 開発モードの場合はそのまま electron を起動し watch する

※ npm run start は開発モード実行のエイリアス
```

これらの設定により、もしフロントのビューに関連したソースに変更があった場合には、Electron のビューだけが自動的にリロードされ、メインプロセスに関連したソースに変更があった場合については、Electron 自体が自動的に再起動されるようになっている。

## how to

`webpack` の挙動を変えたい場合、通常 `webpack.config.js` で設定可能な項目については、開発モード用の `webpack.config.development.js` か `webpack.config.production.js` の中身を修正すればよい。

現状では `webpack` の v4 系で追加された `mode` を切り替えている他、ソースマップを出力するかどうかが両者のモードによって異なる。

`webpack` 単体ではなく、バンドルから `electron` の起動までのプロセスを変更したい場合には `index.js` を修正する。

`electron` のライブリロードや再起動を自動的に行う必要があるため、 `electron-connect` に関連した記述が `index.js` と `src/main.js` の両方に記載されているので注意すること。

> * `index.js` → サーバプロセスを開始するための処理
> * `src/main.js` → `electron.BrowserWindow` のプロセスを開始するための処理

## tips

* `src/client/script.js` と `src/server/main.js` がエントリポイントになるファイル
* `app/client/script.js` と `app/server/main.js` がバンドル後の出力ファイル
* 原則として出力後のファイルはクライアントとサーバそれぞれ単体ファイルになるのが理想
* 上記の `app/` 以下にあるファイルは Git の管理対象になっていない（ `.gitignore` に記載）
* JavaScript のフレームワーク等を一切含まないシンプルな構成
* clone 直後などは `app/server` のディレクトリが無いはずなので注意
* 現状は複数起動を許可しない実装になっている
* 本リポジトリには現時点では packager は含まれていない

## test

ユニットテスト用に jest を採用。使い方等の詳細については本家を参照。

[Jest · 🃏 Delightful JavaScript Testing](https://jestjs.io/)

ここでは「ひとつのクラス（ `export default class XXXX` ）に対してひとつのテスト（ `__tests__/client or server/XXXX.test.js` ）を設ける」形にしている。

おおまかな方針として、できる限り「広い範囲をカバーする巨大なユーティリティクラス」を作らないように務める。これは影響範囲が大きくなりすぎないようにするためである。

ただし、たとえば「文字列かどうか判定する」といったような、非常にプリミティブな機能に関しては、むしろ client と server でそれぞれに分離して持つというのもメンテナンス性を下げる要因となり得るため、これらは `common.js` としてまとめる。

そこで以下のように構成する。

```
root
 |
 +- src
 |   |
 |   +- common.js（client と server に共通するもの）
 |   |
 |   +- client
 |   |   |
 |   |   +- script.js (./lib/XXXX.js を読み込むメインスクリプト)
 |   |   |
 |   |   +- lib
 |   |       |
 |   |       +- XXXX.js
 |   |
 |   +- server
 |       |
 |       +- main.js (./lib/XXXX.js を読み込むメインスクリプト)
 |       |
 |       +- lib
 |           |
 |           +- XXXX.js
 |
 +- __tests__
     |
     +- common.test.js
     |
     +- client
     |   |
     |   +- XXXX.test.js
     |
     +- server
         |
         +- XXXX.test.js
```

まとめると、次のようになる。

* `src/client or server/lib` 以下に単体のクラスを `export default` するモジュールを置く
* そのモジュールに対応したテストを `__tests__/client or server/` 以下に置く
* client と server に共通の機能は `src/common.js` に記述
* それに対するテストは `__tests__/common.test.js` に記述
* ユニットテストが行いやすいようにシンプルなクラス設計を心がける



