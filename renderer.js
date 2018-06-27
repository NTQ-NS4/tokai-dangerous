// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { clipboard } = require('electron')

var screens = [
    {
        full: '37201 従業員選択 (Select employee)',
        japanese: '37201従業員選択',
        english: '37201 従業員選択 (Select employee)',
    },
    {
        full: '36801 商事商品選択 (Select trader and goods)',
        japanese: '36801商事商品選択',
        english: '36801 商事商品選択 (Select trader and goods)',
    },
    {
        full: '36901 事業所選択 (Select Division)',
        japanese: '36901事業所選択',
        english: '36901 事業所選択 (Select Division)',
    },
    {
        full: '37001 保管場所選択 (select Storage)',
        japanese: '37001保管場所選択',
        english: '37001 保管場所選択 (select Storage)',
    },
    {
        full: '36701 グレード選択 (Select grade)',
        japanese: '36701グレード選択',
        english: '36701 グレード選択 (Select grade)',
    },
    {
        full: '37501 依頼作業No選択 (Select Request work No)',
        japanese: '37501依頼作業No選択',
        english: '37501 依頼作業No選択 (Select Request work No)',
    },
    {
        full: '37101 顧客選択 (Select customer)',
        japanese: '37101顧客選択',
        english: '37101 顧客選択 (Select customer)',
    },
    {
        full: '37301 営業注番選択 (Select sale order no)',
        japanese: '37301営業注番選択',
        english: '37301 営業注番選択 (Select sale order no)',
    },
    {
        full: '38301 業種選択 (Select industry)',
        japanese: '38301業種選択',
        english: '38301 業種選択 (Select industry)',
    },
    {
        full: '14201 自決登録(販売条件) Self registration (Sale condition)',
        japanese: '14201自決登録(販売条件)',
        english: '14201 自決登録(販売条件) Self registration (Sale condition)',
    },
    {
        full: '38101 中本見積No選択 (Select used machine)',
        japanese: '38101中本見積No選択',
        english: '38101 中本見積No選択 (Select used machine)',
    },
    {
        full: '37401 在庫No選択 (Select inventory No)',
        japanese: '37401在庫No選択',
        english: '37401 在庫No選択 (Select inventory No)',
    },
    {
        full: '14901 自決登録（間接輸出）Self registration (Indirect export)',
        japanese: '14901自決登録（間接輸出）',
        english: '14901 自決登録（間接輸出）Self registration (Indirect export)',
    },
    {
        full: '14601 自決登録(競合) Self registration (Competition)',
        japanese: '14601自決登録(競合)',
        english: '14601 自決登録(競合) Self registration (Competition)',
    },
    {
        full: '13101 自決登録（集金）Self registration (Bill collect)',
        japanese: '13101自決登録（集金）',
        english: '13101 自決登録（集金）Self registration (Bill collect)',
    },
    {
        full: '13301 自決登録（コメント）Self registration (comment)',
        japanese: '13301自決登録（コメント）',
        english: '13301 自決登録（コメント）Self registration (comment)',
    },
    {
        full: '15901 送り先選択 (select address)',
        japanese: '15901送り先選択',
        english: '15901 送り先選択 (select address)',
    },
    {
        full: '14501 自決登録(配送情報) Self registration (Delivery info)',
        japanese: '14501自決登録(配送情報)',
        english: '14501 自決登録(配送情報) Self registration (Delivery info)',
    },
    {
        full: '14301 自決登録(付帯費用) (Self registration (Additional expenses)',
        japanese: '14301自決登録(付帯費用)',
        english: '14301 自決登録(付帯費用) (Self registration (Additional expenses)',
    },
    {
        full: '13701 自決登録(下取) (Self registration (Trade in))',
        japanese: '13701自決登録(下取)',
        english: '13701 自決登録(下取) (Self registration (Trade in))',
    },
];

var filteredScreens = [];

var trans = {
    'from_to': '— %s-%s%',
    'implement': '%s開発',
    'fixbug': '%sの不具合修正',
    'fixbug_in_bug_list': '不具合票No.%s不具合修正',
    'fixbug_in_customer_requests': 'JUST販売 指摘内容管理表_No.%s不具合修正',
    'test': '%sテスト',
    'change_spec': '%s仕様変更対応',
    'translate': '%s翻訳',
    'update_spec': '%s仕様書更新',
};

function getData() {
    var keywords = this.value.trim().split(' ');
    filteredScreens = screens.filter(function(value) {
        return keywords.filter(function(keyword) {
            if (/^\d+$/.test(keyword)) {
                return value.full.toLowerCase().indexOf(keyword.toLowerCase()) === 0;
            }
            return value.full.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
        }).length === keywords.length;
    });

    display(filteredScreens);
}

function display(data) {
    var html = '<p><strong>' + data.length + ' found</strong></p>';
    data.forEach(function(value) {
        html += '<div style="background:#fefefe;line-height:1;margin:12px 0;padding: 2px 3px 4px 3px;" data-copy="' + encodeURIComponent(JSON.stringify(value)) +'">' +
        'JSTSAS' + value.full +
        '<div style="float:right"><button class="copyJapaneseBtn" style="border: none;background: #ccc;">COPY JAPANESE</button>' +
        ' <button class="copyBtn" style="border: none;background: #ccc;">COPY FULL</button></div></div>';
    });

    document.querySelector('#list').innerHTML = html;
}

function copyTimesheet() {
    if (filteredScreens.length === 1) {
        var screen = 'JSTSAS' + filteredScreens[0].japanese;
    } else {
        var screen = document.querySelector('#btnEd').value;
    }

    var action = document.querySelector('#actionSelect option:checked').value;
    var percentFrom = document.querySelector('#percentFromSelect option:checked').value;
    var percentTo = document.querySelector('#percentToSelect option:checked').value;

    var content = getMessage(trans[action], screen) + ' ' + getMessage(trans.from_to, percentFrom, percentTo);

    clipboard.writeText(content.replace(/,/g, '、'));

    new Notification('Đã copy')
}

function getMessage() {
    var args = [].slice.call(arguments);
    var messageTemplate = args[0];
    args.shift();

    args.forEach(function(label) {
        messageTemplate = messageTemplate.replace('%s', label);
    });

    return messageTemplate;
}

document.querySelector('#btnEd').addEventListener('keyup', getData)
document.querySelector('#copyTimesheetBtn').addEventListener('click', copyTimesheet)
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('copyBtn')) {
        var data = JSON.parse(decodeURIComponent(e.target.parentNode.parentNode.dataset.copy));
        clipboard.writeText('JSTSAS' + data.full);

        new Notification('Đã copy');
    }

    if (e.target.classList.contains('copyJapaneseBtn')) {
        var data = JSON.parse(decodeURIComponent(e.target.parentNode.parentNode.dataset.copy));
        clipboard.writeText('JSTSAS' + data.japanese);

        new Notification('Đã copy');
    }
});
display(screens);