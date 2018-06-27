// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var screens = [
    '37201 従業員選択 (Select employee)',
    '36801 商事商品選択 (Select trader and goods)',
    '36901 事業所選択 (Select Division)',
    '37001 保管場所選択 (select Storage)',
    '36701 グレード選択 (Select grade)',
    '37501 依頼作業No選択 (Select Request work No)',
    '37101 顧客選択 (Select customer)',
    '37301 営業注番選択 (Select sale order no)',
    '38301 業種選択 (Select industry)',
    '14201 自決登録(販売条件) Self registration (Sale condition)',
    '38101 中本見積No選択 (Select used machine)',
    '37401 在庫No選択 (Select inventory No)',
    '14901 自決登録（間接輸出）Self registration (Indirect export)',
    '14601 自決登録(競合) Self registration (Competition)',
    '13101 自決登録（集金）Self registration (Bill collect)',
    '13301 自決登録（コメント）Self registration (comment)',
    '15901 送り先選択 (select address)',
    '14501 自決登録(配送情報) Self registration (Delivery info)',
    '14301 自決登録(付帯費用) (Self registration (Additional expenses)',
    '13701 自決登録(下取) (Self registration (Trade in))',
]

function getData() {
    var keywords = this.value.trim().split(' ');
    var data = screens.filter(function(value) {
        return keywords.filter(function(keyword) {
            if (parseInt(keyword).toString().length === keyword.length) {
                return value.toLowerCase().indexOf(keyword.toLowerCase()) === 0;
            }
            return value.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
        }).length === keywords.length;
    });

    display(data);
}

function display(data) {
    var html = '<p><strong>' + data.length + ' found</strong></p>';
    data.forEach(function(value) {
        html += '<p>JSTSAS' + value + '</p>';
    });

    document.querySelector('#list').innerHTML = html;
}

document.querySelector('#btnEd').addEventListener('keyup', getData)
display(screens);