// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { clipboard } = require('electron')
var tinycolor = require("tinycolor2")

var screens = [
    {
        id: '37201',
        full: '37201 従業員選択 (Select employee)',
        japanese: '37201従業員選択',
        english: '37201 従業員選択 (Select employee)',
    },
    {
        id: '36801',
        full: '36801 商事商品選択 (Select trader and goods)',
        japanese: '36801商事商品選択',
        english: '36801 商事商品選択 (Select trader and goods)',
    },
    {
        id: '36901',
        full: '36901 事業所選択 (Select Division)',
        japanese: '36901事業所選択',
        english: '36901 事業所選択 (Select Division)',
    },
    {
        id: '37001',
        full: '37001 保管場所選択 (select Storage)',
        japanese: '37001保管場所選択',
        english: '37001 保管場所選択 (select Storage)',
    },
    {
        id: '36701',
        full: '36701 グレード選択 (Select grade)',
        japanese: '36701グレード選択',
        english: '36701 グレード選択 (Select grade)',
    },
    {
        id: '37501',
        full: '37501 依頼作業No選択 (Select Request work No)',
        japanese: '37501依頼作業No選択',
        english: '37501 依頼作業No選択 (Select Request work No)',
    },
    {
        id: '37101',
        full: '37101 顧客選択 (Select customer)',
        japanese: '37101顧客選択',
        english: '37101 顧客選択 (Select customer)',
    },
    {
        id: '37301',
        full: '37301 営業注番選択 (Select sale order no)',
        japanese: '37301営業注番選択',
        english: '37301 営業注番選択 (Select sale order no)',
    },
    {
        id: '38301',
        full: '38301 業種選択 (Select industry)',
        japanese: '38301業種選択',
        english: '38301 業種選択 (Select industry)',
    },
    {
        id: '14201',
        full: '14201 自決登録(販売条件) Self registration (Sale condition)',
        japanese: '14201自決登録(販売条件)',
        english: '14201 自決登録(販売条件) Self registration (Sale condition)',
    },
    {
        id: '38101',
        full: '38101 中本見積No選択 (Select used machine)',
        japanese: '38101中本見積No選択',
        english: '38101 中本見積No選択 (Select used machine)',
    },
    {
        id: '37401',
        full: '37401 在庫No選択 (Select inventory No)',
        japanese: '37401在庫No選択',
        english: '37401 在庫No選択 (Select inventory No)',
    },
    {
        id: '14901',
        full: '14901 自決登録（間接輸出）Self registration (Indirect export)',
        japanese: '14901自決登録（間接輸出）',
        english: '14901 自決登録（間接輸出）Self registration (Indirect export)',
    },
    {
        id: '14601',
        full: '14601 自決登録(競合) Self registration (Competition)',
        japanese: '14601自決登録(競合)',
        english: '14601 自決登録(競合) Self registration (Competition)',
    },
    {
        id: '13101',
        full: '13101 自決登録（集金）Self registration (Bill collect)',
        japanese: '13101自決登録（集金）',
        english: '13101 自決登録（集金）Self registration (Bill collect)',
    },
    {
        id: '13301',
        full: '13301 自決登録（コメント）Self registration (comment)',
        japanese: '13301自決登録（コメント）',
        english: '13301 自決登録（コメント）Self registration (comment)',
    },
    {
        id: '15901',
        full: '15901 送り先選択 (select address)',
        japanese: '15901送り先選択',
        english: '15901 送り先選択 (select address)',
    },
    {
        id: '14501',
        full: '14501 自決登録(配送情報) Self registration (Delivery info)',
        japanese: '14501自決登録(配送情報)',
        english: '14501 自決登録(配送情報) Self registration (Delivery info)',
    },
    {
        id: '14301',
        full: '14301 自決登録(付帯費用) (Self registration (Additional expenses)',
        japanese: '14301自決登録(付帯費用)',
        english: '14301 自決登録(付帯費用) (Self registration (Additional expenses)',
    },
    {
        id: '13701',
        full: '13701 自決登録(下取) (Self registration (Trade in))',
        japanese: '13701自決登録(下取)',
        english: '13701 自決登録(下取) (Self registration (Trade in))',
    },
];

var filteredScreens = screens;

var trans = {
    'from_to': '— %s-%s%',
    'implement': '%s開発',
    'fixbug': '%sの不具合修正',
    'fixbug_in_bug_list_1': '%sの不具合修正（不具合票No.%s）', // both
    'fixbug_in_bug_list_2': '%s画面の不具合修正', // Screen ID only
    'fixbug_in_bug_list_3': '不具合票No.%s修正', // Bug ID only
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
    var html = '<p class="mb-3"><strong>' + data.length + ' found</strong></p>';
    data.forEach(function(value) {
        var color = '#fefefe';
        if (!mode) {
            var color = normalBackgrounds[Math.floor(Math.random()*normalBackgrounds.length)];
        }

        var border = tinycolor(color).darken().toString();

        html += '<p class="screenDiv" style="background:'+color+';border: 1px solid '+border+';heigth:32px;line-height:32px;padding-bottom: 2px;" data-copy="' + encodeURIComponent(JSON.stringify(value)) +'">' +
        'JSTSAS' + value.full +
        '<span style="float:right"><button class="copyJapaneseBtn btn btn-default btn-sm">COPY JAPANESE</button>' +
        ' <button class="copyBtn btn btn-default btn-sm">COPY FULL</button></span></p>';
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
    var bugIdList = document.querySelector('#bugIdSelect').value;
    var percentFrom = document.querySelector('#percentFromSelect option:checked').value;
    var percentTo = document.querySelector('#percentToSelect option:checked').value;

    if (action == 'fixbug_in_bug_list') {
        if (screen && !bugIdList) {
            var content = getMessage('fixbug_in_bug_list_2', screen);
        } else if (!screen && bugIdList) {
            var content = getMessage('fixbug_in_bug_list_3', bugIdList);
        } else {
            var content = getMessage('fixbug_in_bug_list_1', screen, bugIdList);
        }
    } else if (action == 'fixbug_in_customer_requests') {
        var content = getMessage(action, bugIdList);
    } else {
        var content = getMessage(action, screen);
    }

    var content = content + ' ' + getMessage('from_to', percentFrom, percentTo);
    content = content.replace(/,/g, '、');

    clipboard.writeText(content);

    new Notification('Đã copy', { body: content })
}

function getMessage() {
    var args = [].slice.call(arguments);
    var messageTemplate = trans[args[0]];
    args.shift();

    args.forEach(function(label) {
        messageTemplate = messageTemplate.replace('%s', label);
    });

    return messageTemplate;
}

function onChangeAction() {
    var value = this.value;
    if (value == 'fixbug_in_bug_list' || value == 'fixbug_in_customer_requests') {
        document.querySelector('#bugIdSelect').style.display = 'block';
    } else {
        document.querySelector('#bugIdSelect').style.display = 'none';
    }
}

document.querySelector('#btnEd').addEventListener('keyup', getData)
document.querySelector('#copyTimesheetBtn').addEventListener('click', copyTimesheet)
document.querySelector('#actionSelect').addEventListener('change', onChangeAction)
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('copyBtn')) {
        var data = JSON.parse(decodeURIComponent(e.target.parentNode.parentNode.dataset.copy));
        clipboard.writeText('JSTSAS' + data.full);

        new Notification('Đã copy', { body: data.full });
    }

    if (e.target.classList.contains('copyJapaneseBtn')) {
        var data = JSON.parse(decodeURIComponent(e.target.parentNode.parentNode.dataset.copy));
        clipboard.writeText('JSTSAS' + data.japanese);

        new Notification('Đã copy', { body: data.japanese });
    }

    if (e.target.classList.contains('screenDiv')) {
        var data = JSON.parse(decodeURIComponent(e.target.dataset.copy));
        document.querySelector('#btnEd').value = data.id;
        getData.call(document.querySelector('#btnEd'));
    }
});

var mode = "";

var normalBackgrounds = [
    '#FFCDD2',
    '#F8BBD0',
    '#E1BEE7',
    '#C5CAE9',
    '#BBDEFB',
    '#B2EBF2',
    '#B2DFDB',
    '#A5D6A7',
    '#C5E1A5',
    '#FFF9C4',
    '#FFECB3',
    '#FFE0B2',
    '#FFCCBC',
    '#D7CCC8',
    '#E0E0E0',
    '#CFD8DC',
    '#CFD8DC',
    '#81C784',
    '#69F0AE',
    '#FFD180',
    '#FFAB40'
];

var arr = hentaiBackgrounds =[...Array(68).keys()];
// FIXME: Add image late
delete arr['0'];
delete arr['22'];
delete arr['23'];
delete arr['36'];
delete arr['35'];
delete arr['64'];

var hentaiBackgrounds = arr.map(function(index) {
  let img = 'images/hentai/' + index.toString().padStart(4, '0') + '.jpg';

  let imgElm = document.createElement('img');
  imgElm.src = img;
  imgElm.style.width = '1px';
  imgElm.style.height = '1px';
  imgElm.style.visibility = 'hidden';
  document.body.appendChild(imgElm);

  return img;
});

const btnShowHideBg = document.getElementById('show-background');

function changeBackground() {
    let items;
    switch (mode) {
        case 'hentai':
            items = hentaiBackgrounds;
            btnShowHideBg.style.visibility = 'visible';
            break;
        default:
            btnShowHideBg.style.visibility = 'none';
            items = normalBackgrounds;
    }

    let image = items[Math.floor(Math.random()*items.length)];
    if (image.startsWith('#')) {
        document.getElementsByTagName('body')[0].style.backgroundImage = ``;
    } else {
        document.getElementsByTagName('body')[0].style.backgroundImage = `url(${image})`;
    }
}

document.querySelector('#modeSelect').addEventListener('change', function() {
    mode = this.value;
    changeBackground();
    display(filteredScreens);

})

// FIXME: Implement late
btnShowHideBg.addEventListener('click', function () {
  let body = document.getElementsByTagName('body'[0]);
  let bg = body.style.backgroundImage;
  bg = bg.replace('url(','').replace(')','').replace(/\"/gi, "");
  document.getElementById('img-background').src = bg;

});

changeBackground();
setInterval(changeBackground, 6000);

display(filteredScreens);