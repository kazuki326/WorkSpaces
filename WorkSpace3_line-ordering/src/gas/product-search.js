/**
 * ボットの返信テキストから商品名を抽出し、対応する商品カードのJSON配列を生成する。
 * @param {string} input - ボットが生成した返信テキスト
 * @param {string} beerInfo - 事前に読み込まれたビール情報マスター
 * @return {Array} - Flex MessageのJSONオブジェクトの配列
 */
function searchByProductName(input, beerInfo) {
    let cards = [];
    let names = [];

    if (!beerInfo || beerInfo === "No information") {
        return cards;
    }

    // テキストから「」で囲まれた部分をすべて抽出
    const regex = /「(.*?)」/g;
    let result;
    while ((result = regex.exec(input)) !== null) {
        // ビール情報マスターにその名前が含まれているか確認
        if (beerInfo.indexOf(result[1]) !== -1) {
            const keyword = escapeRegExp(result[1]);
            // マスターデータから正式名称を抽出
            const nameRegex = new RegExp('Name:""([^"]*' + keyword + '[^"]*)""', 'g');
            const beerNameMatch = nameRegex.exec(beerInfo);
            if (beerNameMatch && !names.includes(beerNameMatch[1])) {
                names.push(beerNameMatch[1]);
            }
        }
    }

    if (names.length === 0) {
        return cards;
    }

    // スプレッドシートから商品詳細情報を取得
    try {
        // この部分は実際の環境に合わせてIDやシート名を修正する必要がある
        const ss = SpreadsheetApp.openById("1h8n6Af78Cw6VckHp_6ytHvV9sTsrjRLsYJPNBnTwjGc");
        const sheet = ss.getSheetByName("rank");
        const [headers, ...records] = sheet.getDataRange().getValues();
        
        const beerMaster = records.map(record => 
            Object.fromEntries(record.map((value, i) => [headers[i], value]))
        );

        // 抽出した名前リストに一致する商品をマスターからフィルタリング
        const matchedBeers = beerMaster.filter(b => names.includes(b.name));

        for (const info of matchedBeers) {
            const productUrl = 'https://bier.jp/itemdetail/' + info.itemID;
            const productJSON = {
                "name": info.name,
                "imageUrl": 'https://bier.jp/images/beeroriginal/' + info.imgPath, // imgPathはスプレッドシートのカラム名に依存
                "description": trimString(info.description, 60), // 説明文を60文字に制限
                "price": info.price, // 価格もスプレッドシートから取得
                "itemID": info.itemID
            };
            cards.push(ConvertToProductCard(productJSON));
        }

    } catch (e) {
        // Logger.log(e); // エラーログ
    }

    return cards;
}

/**
 * 文字列を指定された長さに切り詰め、末尾に「...」を追加する
 * @param {string} inputString - 対象の文字列
 * @param {number} [chars=300] - 最大文字数
 * @return {string} - 加工後の文字列
 */
function trimString(inputString, chars = 300) {
    if (inputString.length > chars) {
        return inputString.substring(0, chars) + "………";
    } else {
        return inputString;
    }
}

/**
 * 正規表現で使用される特殊文字をエスケープする
 * @param {string} string - エスケープする文字列
 * @return {string} - エスケープ後の文字列
 */
function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\\]/g, '\\$&');
}
