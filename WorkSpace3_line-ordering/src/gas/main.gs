/**
 * LINE Messaging APIからのWebhookを受け取り、応答を処理するメイン関数
 */
function doPost(e) {
    const props = PropertiesService.getScriptProperties();
    const replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
    const userMessage = JSON.parse(e.postData.contents).events[0].message.text;
    const userId = JSON.parse(e.postData.contents).events[0].source.userId;

    let errorMessage = '';

    try {
        // 推奨ビール情報を取得 (この部分は別途実装が必要)
        const beer = getRecommendedBeerInfo(); 

        // AIに渡すプロンプトを構築
        const prompt = buildPrompt(beer);

        // メッセージ履歴を取得
        const messages = getMessageLog(userId, prompt, userMessage);

        // OpenAI APIを呼び出し、ボットの返信を取得
        const gptReply = callOpenAI(props.getProperty('OPENAI_APIKEY'), messages);
        const botMessage = gptReply.message;
        errorMessage += gptReply.errorMessage;

        // 送信するメッセージの基本部分を作成
        let sendMessage = [{
            'type': 'text',
            'text': botMessage,
        }];

        // ボットの返信に商品名が含まれていれば、商品カードを検索して追加
        try {
            const productCards = searchByProductName(botMessage, beer);
            if (productCards.length > 0) {
                sendMessage = sendMessage.concat(productCards);
            }
        } catch (cardError) {
            // エラーログを記録 (testLogは別途定義が必要)
            // testLog(cardError);
            errorMessage += "商品カード出力エラー\n" + cardError;
        }

        // LINEに応答を送信
        sendLineReply(replyToken, sendMessage, props.getProperty('LINE_ACCESS_TOKEN'));

    } catch (e) {
        // 全体的なエラー処理
        // testLog(e);
        errorMessage += "全体処理エラー\n" + e;
        // エラーが発生した場合でも、何かテキストを返信することが推奨される
        sendLineReply(replyToken, [{'type': 'text', 'text': '申し訳ありません、エラーが発生しました。'}], props.getProperty('LINE_ACCESS_TOKEN'));
    }
    
    // 必要に応じてエラーメッセージをどこかに記録する処理
    if (errorMessage) {
        // e.g., SpreadsheetApp.openById('...').getSheetByName('ErrorLog').appendRow([new Date(), errorMessage]);
    }
}

/**
 * AIに渡すプロンプトを生成する
 * @param {string} beer - ビール情報
 * @return {string} プロンプト文字列
 */
function buildPrompt(beer) {
    const charaSetting = ""; // 必要に応じてキャラクター設定を追加
    const prompt = charaSetting + "
Remember the following information about recommended beer. Provide detailed information only if asked about the recommended beer.

" +
${beer} +
"\nProvide details only if asked about recommended beers. Don't recommend beers other than those listed above.When talking about a product, always answer with the product name enclosed in 「」.Answer in Japanese."
    return prompt;
}

/**
 * OpenAI APIを呼び出す (仮の関数)
 * @param {string} apiKey - APIキー
 * @param {Array} messages - メッセージ履歴
 * @return {object} - {message: "...", errorMessage: "..."}
 */
function callOpenAI(apiKey, messages) {
    // ここにUrlFetchAppを使ったOpenAI API呼び出しの実際のコードが入る
    // const response = UrlFetchApp.fetch(...);
    // const gptReply = JSON.parse(response.getContentText());
    return { message: "ダミーの返信です。「サンプルビール」についてですね！", errorMessage: "" };
}

/**
 * LINEに返信メッセージを送信する
 * @param {string} replyToken - リプライトークン
 * @param {Array} messages - 送信するメッセージオブジェクトの配列
 * @param {string} accessToken - LINEアクセストークン
 */
function sendLineReply(replyToken, messages, accessToken) {
    const url = 'https://api.line.me/v2/bot/message/reply';
    UrlFetchApp.fetch(url, {
        'headers': {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': 'Bearer ' + accessToken,
        },
        'method': 'post',
        'payload': JSON.stringify({
            'replyToken': replyToken,
            'messages': messages
        }),
        'muteHttpExceptions': true // エラー時に例外をスローさせない
    });
}

/**
 * その他のヘルパー関数 (getMessageLog, getRecommendedBeerInfoなど)
 * これらは実際の運用に合わせて実装する必要がある
 */
function getMessageLog(userId, prompt, userMessage) { return []; }
function getRecommendedBeerInfo() { return "Name:「サンプルビール」\nDescription:これはテスト用のビールです。"; }
