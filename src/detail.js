const {ipcRenderer} = require('electron');

// 画面表示時
window.addEventListener('load', (event) => {
  ipcRenderer.send('getDetailData');
})

// 詳細データの表示
ipcRenderer.on('showDetail', (event, data) => {
  let tag = "<table class='view'><thead><tr><th>利用日</th><th>利用金額</th></tr></thead><tbody>";
  data[0].result.forEach(value => {
    tag += `<tr><td>${value.date}</td><td class="amount">${parseInt(value.amount).toLocaleString()}円</td></tr>`;
  });
  tag += "</tbody></table>";
  document.getElementById('store').innerHTML = `${data[0].store}`;
  document.getElementById('total').innerHTML = `合計:${data[0].total.toLocaleString()}円`;
  document.getElementById('view').innerHTML = tag;
})
