"use strict";

// 詳細検索（モーダル表示）
function openModal() {
  let modalOverlay = document.getElementById("modalOverlay");
  let modal = document.getElementById("modal");
  let body = document.body;
  modalOverlay.style.display = "flex";
  modal.style.display = "block";
  body.style.overflow = "hidden";
}

//モーダルを閉じる処理
function closeModal() {
  let modalOverlay = document.getElementById("modalOverlay");
  let modal = document.getElementById("modal");
  let body = document.body;

  modalOverlay.style.display = "none";
  modal.style.display = "none";
  body.style.overflow = null;
}

//モーダル内の検索項目のクリック時の色の切り替え
function selectItems(selected_item) {
  selected_item.classList.toggle("adding_background_color");

  if (!selected_item.classList.contains("adding_background_color")) {
    selected_item.style.color="rgba(20, 30, 30, .7)";
    selected_item.style.borderColor="rgba(20, 30, 30, .2)";
  } else {
    selected_item.style.color="black";
    selected_item.style.borderColor="black";
  }
}

var alcoholListsRight = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20); // Extended range
var alcoholListsLeft = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20); // Extended range
var numForLeft = 0;
var numForRight = 0;

document.getElementById("alcoholContentRight").innerHTML = alcoholListsRight[0];
document.getElementById("alcoholContentLeft").innerHTML = alcoholListsLeft[0];

// Initially hide up arrows if value is 0
document.getElementById("angleUpLeft").style.display = "none";
document.getElementById("angleUpRight").style.display = "none";


function changeContentDown(ele) {
  if (ele.id == "angleDownLeft" && numForLeft < alcoholListsLeft.length - 1) {
    numForLeft = numForLeft + 1;
    let alcoholContentLeft = document.getElementById("alcoholContentLeft");
    alcoholContentLeft.innerHTML = alcoholListsLeft[numForLeft];
    if (numForLeft > 0) { // Show up arrow if value is greater than 0
        document.getElementById("angleUpLeft").style.display="block";
    }
} else if (ele.id == "angleDownRight" && numForRight < alcoholListsRight.length - 1){
    numForRight = numForRight + 1;
    let alcoholContentRight = document.getElementById("alcoholContentRight");
    alcoholContentRight.innerHTML = alcoholListsRight[numForRight];
    if (numForRight > 0) { // Show up arrow if value is greater than 0
        document.getElementById("angleUpRight").style.display="block";
    }
  }
}

function changeContentUp(ele){
    if(ele.id == "angleUpLeft"){
        numForLeft = numForLeft -1;
        document.getElementById("alcoholContentLeft").innerHTML = alcoholListsLeft[numForLeft];
        if(numForLeft <= 0){ // Hide up arrow if value is 0
            document.getElementById("angleUpLeft").style.display="none";
        }
    }else if(ele.id == "angleUpRight"){
        numForRight = numForRight - 1;
        document.getElementById("alcoholContentRight").innerHTML = alcoholListsRight[numForRight];
        if(numForRight <= 0){ // Hide up arrow if value is 0
            document.getElementById("angleUpRight").style.display="none";
        }
    }
}
