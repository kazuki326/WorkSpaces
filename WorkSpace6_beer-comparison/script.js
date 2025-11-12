/**
 * チェックボックス変更時の処理
 */
function inputChange(e) {
  const item = e.name;
  const url = e.value;
  const img = e.src;
  const compareList = document.getElementById("compareList");

  // チェックされた場合
  if (e.checked) {
    // limitedCheck を実行し、追加可能かを確認
    if (!limitedCheck()) {
      e.checked = false; // チェックを強制的に解除
      return; // 処理を終了
    }

    // セッションストレージにデータを保存
    const data = {
      url: url,
      img: img,
    };
    sessionStorage.setItem(item, JSON.stringify(data));

    // コンテナを表示
    document.getElementById("compareContainer").style.display = "block";

    // DOM 生成：下部の「比較する商品一覧」に追加
    const child_div = document.createElement("div");
    child_div.className = "compared_item";
    child_div.id = item;

    const productImg = document.createElement("img");
    productImg.src = data.img;
    productImg.alt = item;
    child_div.appendChild(productImg);

    const productName = document.createElement("a");
    productName.href = data.url;
    productName.textContent = item;
    productName.target = "_blank";
    child_div.appendChild(productName);

    compareList.appendChild(child_div);

  } else {
    // チェックを外した場合
    sessionStorage.removeItem(item);
    const removing_child = document.getElementById(item);
    if (removing_child) {
      removing_child.remove();
    }
    removeCompareContainer();
  }
}

/**
 * コンテナを非表示にする判定
 */
function removeCompareContainer() {
  const compareList = document.getElementById("compareList");
  if (!compareList.hasChildNodes()) {
    document.getElementById("compareContainer").style.display = "none";
  }
}

/**
 * 同時比較上限チェック (最大 4 つ)
 */
function limitedCheck() {
  const el = document.getElementsByClassName("checks");
  let count = 0;
  // チェックされた数をカウント
  for (let i = 0; i < el.length; i++) {
    if (el[i].checked) {
      count++;
    }
  }
  // 5つ以上チェックされた場合
  if (count > 4) {
    alert("5つ以上の同時比較はできません。1つチェックを外してください");
    return false; // 追加不可
  }
  return true; // 追加可能
}

/**
 * 商品データを bier.jp API から取得する
 */
async function fetchProductData(productId) {
  // CORSプロキシを経由させる
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const apiUrl = `https://bier.jp/index.cgi?t=itemdetail&id=${productId}&output=json`;
  try {
    const response = await fetch(proxyUrl + apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    if (!text) {
        console.warn(`Response for ${productId} is empty.`);
        return null;
    }
    // 不正なJSON形式を修正
    const correctedText = text.replace(/,}/g, '}').replace(/,]/g, ']');
    const data = JSON.parse(correctedText);
    return data.data;
  } catch (error) {
    console.error(`Error fetching product data for ${productId}:`, error);
    return null;
  }
}

/**
 * 商品ページのHTMLから容量を取得する
 */
async function fetchProductCapacity(url) {
  // CORSプロキシを経由させる
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  try {
    const response = await fetch(proxyUrl + url);
    if (!response.ok) {
      throw new Error("ネットワークエラー：" + response.status);
    }
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    let capacity = "情報なし";
    const specRows = doc.querySelectorAll('tr');
    specRows.forEach(row => {
      const cells = row.querySelectorAll('td.spec_column');
      if (cells.length >= 2 && cells[0].textContent.trim() === "容量") {
        capacity = cells[1].textContent.replace(":", "").trim();
      }
    });
    if (capacity === "0ml"){
        return "セット商品";
    }
    return capacity;
  } catch (error) {
    console.error("容量の取得に失敗しました:", error);
    return "取得失敗";
  }
}


/**
 * 説明文を整形する
 */
function cleanDescription(raw) {
  if (!raw) return "";
  // ① raw内の最初の2つの<br>タグまでの部分を抽出する
  const brRegex = /<br\s*\/?>/gi;
  let truncatedText = raw;
  
  let brCount = 0;
  let lastIndex = -1;
  
  const matches = [...raw.matchAll(brRegex)];
  if (matches.length >= 2) {
      lastIndex = matches[1].index;
      truncatedText = raw.substring(0, lastIndex);
  }

  // ② 取得したテキスト内の<br>タグを改行文字 "\n" に変換
  let text = truncatedText.replace(brRegex, "\n");
  
  // ③ その他のHTMLタグを除去する
  text = text.replace(/<\/?[^>]+(>|$)/g, "");

  // ④ 連続する改行は1回の改行に制限
  text = text.replace(/\n+/g, "\n");
  
  return text.trim();
}


/**
 * 「商品の比較をする」ボタン押下時の処理
 */
async function compareAll() {
  const checks = document.querySelectorAll(".checks");
  const selectedItems = [];
  
  // スピナー表示
  const compareBtn = document.getElementById("compareBtn");
  compareBtn.textContent = "データ取得中...";
  compareBtn.disabled = true;

  for (const checkbox of checks) {
    if (checkbox.checked) {
      const itemName = checkbox.name;
      const storedData = JSON.parse(sessionStorage.getItem(itemName));
      if (storedData) {
        const productId = storedData.url.substring(storedData.url.lastIndexOf('/') + 1);
        const [productData, capacity] = await Promise.all([
            fetchProductData(productId),
            fetchProductCapacity(storedData.url)
        ]);

        selectedItems.push({
          name: itemName,
          url: storedData.url,
          img: storedData.img,
          price: productData && productData.Price ? productData.Price : "取得失敗",
          description: productData && productData.Description ? productData.Description : "取得失敗",
          numInBox: productData && productData.NumInBox ? productData.NumInBox : 1,
          capacity: capacity,
        });
      }
    }
  }

  if (selectedItems.length < 2) {
    alert("比較する商品は2つ以上選択してください。");
    compareBtn.textContent = "商品の比較をする";
    compareBtn.disabled = false;
    return;
  }

  // 比較結果領域を表示
  const compareResultDiv = document.getElementById("compareResult");
  compareResultDiv.style.display = "block";
  
  const tbody = document.querySelector("#compareTableContainer table tbody");
  tbody.innerHTML = ""; // 初期化

  selectedItems.forEach((item) => {
    const row = document.createElement("tr");

    // 商品画像
    const imgCell = document.createElement("td");
    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.name;
    imgCell.appendChild(img);
    row.appendChild(imgCell);

    // 商品名
    const nameCell = document.createElement("td");
    const nameLink = document.createElement("a");
    nameLink.href = item.url;
    nameLink.textContent = item.name;
    nameLink.target = "_blank";
    nameCell.appendChild(nameLink);
    row.appendChild(nameCell);

    // 価格と1本あたりの価格
    const priceCell = document.createElement("td");
    if (item.price !== "取得失敗" && item.numInBox > 1) {
      const salePriceNumeric = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
      if (!isNaN(salePriceNumeric)) {
        const unitPrice = salePriceNumeric / item.numInBox;
        priceCell.innerHTML = `${item.price}<br><small>(1本あたり ¥${unitPrice.toFixed(0)})</small>`;
      } else {
        priceCell.textContent = item.price;
      }
    } else {
      priceCell.textContent = item.price;
    }
    row.appendChild(priceCell);

    // 容量
    const capacityCell = document.createElement("td");
    capacityCell.textContent = item.capacity;
    row.appendChild(capacityCell);

    // ビール情報
    const descCell = document.createElement("td");
    const cleanText = cleanDescription(item.description);
    descCell.innerHTML = cleanText.replace(/\n/g, '<br>');
    descCell.style.textAlign = 'left';
    row.appendChild(descCell);

    // URL
    const urlCell = document.createElement("td");
    const urlLink = document.createElement("a");
    urlLink.href = item.url;
    urlLink.textContent = "商品ページ";
    urlLink.target = "_blank";
    urlLink.rel = "noopener noreferrer";
    urlCell.appendChild(urlLink);
    row.appendChild(urlCell);

    tbody.appendChild(row);
  });
  
  // ボタンのテキストを元に戻す
  compareBtn.textContent = "商品の比較をする";
  compareBtn.disabled = false;
}

/**
 * 「クリア」ボタン押下時の処理
 */
function clearAll() {
  const checks = document.querySelectorAll(".checks");
  checks.forEach((checkbox) => {
    checkbox.checked = false;
  });
  sessionStorage.clear();
  document.getElementById("compareList").innerHTML = "";
  removeCompareContainer();
}

/**
 * ページ読み込み時にボタンへイベントを付与
 */
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("compareBtn").addEventListener("click", compareAll);
  document.getElementById("clearBtn").addEventListener("click", clearAll);
  document.getElementById("closeCompare").addEventListener("click", () => {
    document.getElementById("compareResult").style.display = "none";
  });

  // ページ読み込み時にセッションストレージを復元
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const checkbox = document.querySelector(`.checks[name="${key}"]`);
    if (checkbox) {
        checkbox.checked = true;
        inputChange(checkbox);
    }
  }
});
