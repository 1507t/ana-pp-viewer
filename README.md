# ana-pp-viewer

## 概要
ANAの公式Webページ内にPP単価を表示させる拡張機能です。

- PP単価が8円未満の場合は赤、8円台の場合はピンク、9円台の場合はオレンジ、10円台以上の場合は黒字で表示します。
- 一番上の行に運賃種別・積算率・搭乗ポイントを表示します。
- 価格が表示されているセルにマウスオーバーすると獲得予定PPを表示します。

![screenshot of ana-pp-viewer](https://github.com/user-attachments/assets/26d8ec56-f6cf-401d-a0c7-d1ed61f563f4)

## インストール
### ダウンロード

1. [リリースページ](https://github.com/1507t/ana-pp-viewer/releases)にアクセスし、最新版の "Source code (zip)" をクリックしてzipファイルをダウンロードする。
1. ダウンロードしたzipファイルを展開する。

### 拡張機能の読み込み
1. [拡張機能の設定画面](chrome://extensions/)にアクセスし、右上のデベロッパーモードを有効にする。
1. 拡張機能の設定画面の左上の "パッケージ化されていない拡張機能を読み込む" をクリックし、先程ダウンロード・展開したフォルダを指定する。


## 注意事項・制限事項
- 正確なPP及びPP単価は必ずご自身でご確認ください。
- 国際線には対応していません。
- 以下の運賃には対応していません。
  - ANA Biz専用運賃
  - いっしょにマイル割（同行者）
  - 個人包括旅行運賃
  - 包括旅行割引運賃
  - 国際航空券　国内区間（運賃9～13）


## Refs
 - [ANA国内線利用運賃一覧表](https://www.ana.co.jp/amcservice/pps/dom_unchin_list.html)
 - [ANAフライトマイル・プレミアムポイントシミュレーション](https://cam.ana.co.jp/amcmember/SimulationJaSwitching)
 - [マイレージチャート](https://www.ana.co.jp/ja/jp/amc/flightmile/dom/chart/)
 