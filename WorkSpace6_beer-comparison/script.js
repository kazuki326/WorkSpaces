/**
 * トースト通知を表示
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {string} title - タイトル
 * @param {string} message - メッセージ
 */
function showToast(type, title, message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${icons[type]}</span>
    <div class="toast__content">
      <div class="toast__title">${title}</div>
      ${message ? `<div class="toast__message">${message}</div>` : ''}
    </div>
    <button class="toast__close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  // 5秒後に自動削除
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

/**
 * 商品カードクリック時の処理
 */
function toggleProduct(card) {
  const checkbox = card.querySelector('input[type="checkbox"]');
  const name = card.dataset.name;
  const url = card.dataset.url;
  const img = card.dataset.img;

  // 選択状態をトグル
  if (card.classList.contains('selected')) {
    // 選択解除
    removeFromCompareList(name);
  } else {
    // 選択
    if (!limitedCheck()) {
      return;
    }
    card.classList.add('selected');
    checkbox.checked = true;

    const data = { url: url, img: img };
    sessionStorage.setItem(name, JSON.stringify(data));

    // コンテナを表示
    showCompareContainer();

    // DOM 生成：下部の「比較する商品一覧」に追加
    addToCompareList(name, url, img);
  }

  updateSelectionCount();
  updateCompareCount();
}

/**
 * 比較リストに商品を追加
 */
function addToCompareList(name, url, img) {
  const compareList = document.getElementById("compareList");
  const child_div = document.createElement("div");
  child_div.className = "compared_item";
  child_div.id = name;

  // 削除ボタン
  const removeBtn = document.createElement("button");
  removeBtn.className = "compared_item__remove";
  removeBtn.innerHTML = "×";
  removeBtn.title = "削除";
  removeBtn.onclick = (e) => {
    e.stopPropagation();
    removeFromCompareList(name);
  };
  child_div.appendChild(removeBtn);

  // 商品画像
  const productImg = document.createElement("img");
  productImg.src = img;
  productImg.alt = name;
  child_div.appendChild(productImg);

  // 商品名
  const productName = document.createElement("a");
  productName.href = url;
  productName.textContent = name;
  productName.target = "_blank";
  child_div.appendChild(productName);

  compareList.appendChild(child_div);
}

/**
 * 比較リストから商品を削除
 */
function removeFromCompareList(name) {
  // カードの選択状態を解除
  const card = document.querySelector(`.product-card[data-name="${name}"]`);
  if (card) {
    card.classList.remove('selected');
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = false;
    }
  }

  // セッションストレージから削除
  sessionStorage.removeItem(name);

  // 比較リストから削除
  const removing_child = document.getElementById(name);
  if (removing_child) {
    removing_child.remove();
  }

  removeCompareContainer();
  updateSelectionCount();
  updateCompareCount();
}

/**
 * 比較コンテナを表示（アニメーション付き）
 */
function showCompareContainer() {
  const container = document.getElementById("compareContainer");
  container.style.display = "block";
  // アニメーションのためにrequestAnimationFrameを使用
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.classList.add("visible");
    });
  });
}

/**
 * 比較コンテナを非表示（アニメーション付き）
 */
function hideCompareContainer() {
  const container = document.getElementById("compareContainer");
  container.classList.remove("visible");
  setTimeout(() => {
    container.style.display = "none";
  }, 300);
}

/**
 * 比較コンテナの最小化/展開を切り替え
 */
function toggleCompareContainer() {
  const container = document.getElementById("compareContainer");
  container.classList.toggle("minimized");
}

/**
 * 比較カウントを更新
 */
function updateCompareCount() {
  const count = document.querySelectorAll('.compared_item').length;
  const countEl = document.getElementById('compareCount');
  if (countEl) {
    countEl.textContent = count;
  }
}

/**
 * 選択数を更新
 */
function updateSelectionCount() {
  const count = document.querySelectorAll('.product-card.selected').length;
  const countEl = document.getElementById('selectionCount');
  if (countEl) {
    countEl.textContent = count;
  }
}

/**
 * チェックボックス変更時の処理（旧互換）
 */
function inputChange(e) {
  const card = e.closest('.product-card');
  if (card) {
    toggleProduct(card);
    return;
  }

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
  updateSelectionCount();
}

/**
 * コンテナを非表示にする判定
 */
function removeCompareContainer() {
  const compareList = document.getElementById("compareList");
  if (!compareList.hasChildNodes()) {
    hideCompareContainer();
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
    showToast('warning', '選択上限に達しました', '比較できる商品は最大4つまでです。');
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
 * ローディングオーバーレイを表示
 */
function showLoading(total) {
  const overlay = document.getElementById("loadingOverlay");
  const progress = document.getElementById("loadingProgress");
  if (overlay) {
    overlay.style.display = "flex";
    if (progress) {
      progress.textContent = `0 / ${total} 件`;
    }
  }
}

/**
 * ローディング進捗を更新
 */
function updateLoadingProgress(current, total) {
  const progress = document.getElementById("loadingProgress");
  if (progress) {
    progress.textContent = `${current} / ${total} 件`;
  }
}

/**
 * ローディングオーバーレイを非表示
 */
function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

/**
 * 「商品の比較をする」ボタン押下時の処理
 */
async function compareAll() {
  const checks = document.querySelectorAll(".checks:checked");
  const selectedItems = [];

  if (checks.length < 2) {
    showToast('warning', '商品が不足しています', '比較するには2つ以上の商品を選択してください。');
    return;
  }

  // ローディング表示
  const compareBtn = document.getElementById("compareBtn");
  compareBtn.innerHTML = '<span class="spinner"></span>データ取得中...';
  compareBtn.disabled = true;
  showLoading(checks.length);

  let completed = 0;
  let errorCount = 0;

  for (const checkbox of checks) {
    const itemName = checkbox.name;
    const storedData = JSON.parse(sessionStorage.getItem(itemName));
    if (storedData) {
      try {
        const productId = storedData.url.substring(storedData.url.lastIndexOf('/') + 1);
        const [productData, capacity] = await Promise.all([
            fetchProductData(productId),
            fetchProductCapacity(storedData.url)
        ]);

        const hasError = !productData || !productData.Price;
        if (hasError) errorCount++;

        selectedItems.push({
          name: itemName,
          url: storedData.url,
          img: storedData.img,
          price: productData && productData.Price ? productData.Price : "取得失敗",
          description: productData && productData.Description ? productData.Description : "取得失敗",
          numInBox: productData && productData.NumInBox ? productData.NumInBox : 1,
          capacity: capacity,
          hasError: hasError,
        });
      } catch (error) {
        console.error(`商品 ${itemName} の取得に失敗:`, error);
        errorCount++;
        selectedItems.push({
          name: itemName,
          url: storedData.url,
          img: storedData.img,
          price: "取得失敗",
          description: "取得失敗",
          numInBox: 1,
          capacity: "取得失敗",
          hasError: true,
        });
      }
      completed++;
      updateLoadingProgress(completed, checks.length);
    }
  }

  hideLoading();

  // エラーがあった場合にトースト表示
  if (errorCount > 0) {
    showToast('warning', '一部の情報を取得できませんでした', `${errorCount}件の商品で詳細情報の取得に失敗しました。`);
  } else {
    showToast('success', '比較データを取得しました', `${selectedItems.length}件の商品情報を取得しました。`);
  }

  // 比較結果領域を表示
  const compareResultDiv = document.getElementById("compareResult");
  compareResultDiv.style.display = "block";

  // テーブル（PC用）の生成
  const tbody = document.getElementById("compareTableBody");
  tbody.innerHTML = "";

  // カード（モバイル用）の生成
  const cardsContainer = document.getElementById("compareCards");
  cardsContainer.innerHTML = "";

  selectedItems.forEach((item) => {
    // PC用テーブル行
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
    let priceHtml = item.price;
    if (item.price !== "取得失敗" && item.numInBox > 1) {
      const salePriceNumeric = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
      if (!isNaN(salePriceNumeric)) {
        const unitPrice = salePriceNumeric / item.numInBox;
        priceHtml = `${item.price}<br><small>(1本あたり ¥${unitPrice.toFixed(0)})</small>`;
      }
    }
    priceCell.innerHTML = priceHtml;
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

    // モバイル用カード
    const card = document.createElement("div");
    card.className = "compare-card";
    card.innerHTML = `
      <div class="compare-card__header">
        <img class="compare-card__image" src="${item.img}" alt="${item.name}">
        <div>
          <div class="compare-card__title">${item.name}</div>
          <a class="compare-card__link" href="${item.url}" target="_blank" rel="noopener noreferrer">商品ページを見る →</a>
        </div>
      </div>
      <div class="compare-card__details">
        <div class="compare-card__row">
          <span class="compare-card__label">価格</span>
          <span class="compare-card__value compare-card__value--price">${priceHtml}</span>
        </div>
        <div class="compare-card__row">
          <span class="compare-card__label">容量</span>
          <span class="compare-card__value">${item.capacity}</span>
        </div>
      </div>
      <div class="compare-card__description">${cleanText.replace(/\n/g, '<br>')}</div>
    `;
    cardsContainer.appendChild(card);
  });

  // ボタンのテキストを元に戻す
  compareBtn.textContent = "商品の比較をする";
  compareBtn.disabled = false;
}

/**
 * 「クリア」ボタン押下時の処理
 */
function clearAll() {
  // チェックボックスをすべて解除
  const checks = document.querySelectorAll(".checks");
  checks.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // カードの選択状態を解除
  const cards = document.querySelectorAll(".product-card.selected");
  cards.forEach((card) => {
    card.classList.remove("selected");
  });

  sessionStorage.clear();
  document.getElementById("compareList").innerHTML = "";
  hideCompareContainer();
  updateSelectionCount();
  updateCompareCount();

  showToast('info', 'クリアしました', '比較リストをすべてクリアしました。');
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

  // ヘッダーバーのクリックで最小化/展開
  document.getElementById("compareHeaderBar").addEventListener("click", toggleCompareContainer);
  document.getElementById("compareToggleBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCompareContainer();
  });

  // ページ読み込み時にセッションストレージを復元
  let hasItems = false;
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    // カード形式の場合
    const card = document.querySelector(`.product-card[data-name="${key}"]`);
    if (card) {
      card.classList.add("selected");
      const checkbox = card.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = true;
      }

      // 比較リストに追加
      const storedData = JSON.parse(sessionStorage.getItem(key));
      if (storedData) {
        addToCompareList(key, storedData.url, storedData.img);
        hasItems = true;
      }
    } else {
      // 旧形式のチェックボックス
      const checkbox = document.querySelector(`.checks[name="${key}"]`);
      if (checkbox) {
        checkbox.checked = true;
        inputChange(checkbox);
        hasItems = true;
      }
    }
  }

  // セッションに保存されたアイテムがある場合、コンテナを表示
  if (hasItems) {
    showCompareContainer();
  }

  updateSelectionCount();
  updateCompareCount();
});
