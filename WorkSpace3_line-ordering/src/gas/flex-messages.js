/**
 * 商品情報オブジェクトを受け取り、LINE Flex MessageのJSONオブジェクトを生成する
 * @param {object} info - 商品情報 {name, imageUrl, description, price, itemID}
 * @return {object} - Flex MessageのJSONオブジェクト
 */
function ConvertToProductCard(info) {

    const productUrl = 'https://bier.jp/itemdetail/' + info.itemID;
    
    // bier.jpのカート追加APIのURLを構築
    // APIの仕様に合わせてitemの情報をJSONにしてURLエンコードする
    const cartItemData = {
        id: info.itemID,
        name: info.name,
        // ... その他bier.jpのカートが必要とする情報
    };
    const addToCartUrl = 'https://bier.jp/api/add-to-cart?item=' + encodeURIComponent(JSON.stringify(cartItemData));

    let flexMessage = {
        "type": "bubble",
        "hero": {
            "type": "image",
            "url": info.imageUrl,
            "size": "full",
            "aspectRatio": "20:13",
            "aspectMode": "cover"
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": info.name,
                    "weight": "bold",
                    "size": "xl",
                    "wrap": true
                },
                {
                    "type": "box",
                    "layout": "vertical",
                    "margin": "lg",
                    "spacing": "sm",
                    "contents": [
                        {
                            "type": "box",
                            "layout": "baseline",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "価格",
                                    "color": "#aaaaaa",
                                    "size": "sm",
                                    "flex": 1
                                },
                                {
                                    "type": "text",
                                    "text": info.price,
                                    "wrap": true,
                                    "color": "#666666",
                                    "size": "sm",
                                    "flex": 4
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "baseline",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "説明",
                                    "color": "#aaaaaa",
                                    "size": "sm",
                                    "flex": 1
                                },
                                {
                                    "type": "text",
                                    "text": info.description,
                                    "wrap": true,
                                    "color": "#666666",
                                    "size": "sm",
                                    "flex": 4
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "contents": [
                {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                        "type": "uri",
                        "label": "商品かごに追加",
                        "uri": addToCartUrl
                    }
                },
                {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                        "type": "uri",
                        "label": "詳細はこちら",
                        "uri": productUrl
                    }
                }
            ],
            "flex": 0
        }
    };

    return {
        "type": "flex",
        "altText": info.name, // プッシュ通知や未対応端末で表示されるテキスト
        "contents": flexMessage
    };
}
