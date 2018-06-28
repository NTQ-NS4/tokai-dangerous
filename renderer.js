// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { clipboard } = require('electron')
const {net} = require('electron').remote
var tinycolor = require("tinycolor2")

var screens;
var filteredScreens;
var trans;
var backgroundInterval;
var backgroundChangeTime = 10000;

sendRequest = options => {
    return new Promise((resolve, reject) => {
        var request = net.request(options, response => {
            response.on('data', chunk => {
                var data = JSON.parse(chunk.toString('utf8'));
                resolve(data);
            });
        }).on("error", (e) => {
            reject(e);
        });

        request.end();
    });
};

getSettingRequestOptions = () => {
    return {
        host: "api.jsonbin.io",
        port: 443,
        protocol: 'https:',
        path: "b/5b343721efaed72daeecc60f/latest",
        method: 'GET',
    }
}

initiateData = (data) => {
    screens = data.screens;
    filteredScreens = data.screens;
    trans = data.trans;
    $('#actionSelect').html(data.actions.map((action) =>{
        return '<option value="'+action.value+'">'+action.label+'</option>'
    }).join(''))
}

initiateMainScreen = () => {
    theme.changeBackground();
    backgroundInterval = setInterval(theme.setIntervalBackground, backgroundChangeTime);

    displayScreens(filteredScreens);
}

displayMainScreen = () => {
    $('#loading-splash').remove();
    $('#app').show();
}

// initiate
sendRequest(getSettingRequestOptions())
    .then(initiateData)
    .then(initiateMainScreen)
    .then(setTimeout(displayMainScreen, 1000));

filterScreensList = (dataToFilter, keyword) => {
    var keywords = keyword.trim().split(' ');

    return dataToFilter.filter(function(value) {
        return keywords.filter(function(keyword) {
            if (/^\d+$/.test(keyword)) {
                return value.full.toLowerCase().indexOf(keyword.toLowerCase()) === 0;
            }
            return value.full.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
        }).length === keywords.length;
    });
}

function filterThenDisplayScreenList(keyword) {
    filteredScreens = filterScreensList(screens, keyword);

    displayScreens(filteredScreens);
}

function displayScreens(data) {
    var html = '<p class="mb-3"><strong>' + data.length + ' found</strong></p>';
    data.forEach(function(value) {
        var color = '#fefefe';
        if (!mode) {
            var color = normalBackgrounds[Math.floor(Math.random()*normalBackgrounds.length)];
        }

        var border = tinycolor(color).darken().toString();

        html += '<p class="screenDiv" style="background:'+color+';border: 1px solid '+border+';heigth:32px; padding-left:7px;line-height:32px;padding-bottom: 2px;" data-copy="' + encodeURIComponent(JSON.stringify(value)) +'">' +
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

document.querySelector('#btnEd').addEventListener('keyup', function() { filterThenDisplayScreenList(this.value) })
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
        filterThenDisplayScreenList(document.querySelector('#btnEd').value);
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

const theme = function () {
  let $body = $('body');
  let themeCurrent = '';
  let hentai = [...Array(64).keys()].map(function (index) {
    return 'images/hentai/' + index + '.jpg'
  });

  const options = { hentai: hentai };
  let prevBg;
  let nextBg;
  let isRelax = false;

  function loadAll() {
    let html = '';
    for (let name in options) {
      for (let i = 0; i < options[name].length; i++) {
        html += `<li class="bg-theme ${name}_${i}" style="display: none; background-image: url('${options[name][i]}')"></li>`;
      }
    }
    $body.find('.backgrounds').append(html)
  }
  function setupThem(name) {
    if (typeof name === 'undefined' || name === '') {
      name = 'normal';
    }
    prevBg = 'prev';
    nextBg = 'next';
    themeCurrent = name;
    $body.attr('data-theme', name);
    $body.removeClass('relax');
    $body.find('.backgrounds li').css({ display: 'none' });
    $body.find('.relax-option').hide();
    work();
    if (name === 'normal') {
      $body.find('.next-bg').hide();
      $body.find('.relax-option').hide();
    } else {
      $body.find('.next-bg').show();
      $body.find('.relax-option[value="work"]').hide();
      $body.find('.relax-option[value="relax"]').show();
    }
  }

  function changeBackground() {
    if (Array.isArray(options[themeCurrent]) && options[themeCurrent].length > 1) {
      prevBg = nextBg;

      nextBg = Math.floor(Math.random() * options[themeCurrent].length);
      while (nextBg === prevBg) {
        nextBg = Math.floor(Math.random() * options[themeCurrent].length);
      }

      let show = { width: '100%', height: '100%', opacity: 1 };
      let hide = { width: '0%', height: '0%', opacity: 0 };
      let time = 500;

      $(`.bg-theme.${themeCurrent}_${prevBg}`).css({ zIndex: 5 }).animate(hide, time, function () {
        $(this).hide();
      });
      $(`.bg-theme.${themeCurrent}_${nextBg}`).css({ zIndex: 4, opacity: 0 }).show().animate(show, time, function () {

      });
      $('img.relax').attr('src', options[themeCurrent][nextBg]);
    }
  }
  function work() {
    isRelax = false;
    $body.find('.backgrounds li').css({ display: 'none' });
    $body.find('.backgrounds').show();
    $body.find('#app .main-content').slideDown();
    $body.find('img.relax').remove();
    $('.relax-option[value="relax"]').show();
    $('.relax-option[value="work"]').hide();
  }

  loadAll();

  return {
    init: function () {
      setupThem('');
    },
    changeBackground: changeBackground,
    work: work,
    relax: function () {
      if (nextBg === 'next') {
        changeBackground();
      }
      isRelax = true;
      $body.find('.backgrounds').hide();
      $body.find('#app .main-content').slideUp();
      $('.relax-option[value="work"]').show();
      $('.relax-option[value="relax"]').hide();
      $body.append(`<img class="img-fluid relax" style="opacity: 0.1" src="${options[themeCurrent][nextBg]}">`)
    },
    setup: function (name) {
      setupThem(name);
      changeBackground();
    },
    setIntervalBackground: function () {
      if (isRelax) {
        return;
      }
      changeBackground();
    }
  }
}();

theme.init();

$(document).ready(function () {

  $('#modeSelect').change(function () {
    clearInterval(backgroundInterval);
    backgroundInterval = setInterval(theme.setIntervalBackground, backgroundChangeTime);
    theme.setup($(this).val());
  });

  $('.next-bg').click(function () {
    var self = $(this);
    self.attr('disabled', 'disabled');
    setTimeout(function () {
      self.removeAttr('disabled');
    }, 1000);
    clearInterval(backgroundInterval);
    theme.changeBackground();
    backgroundInterval = setInterval(theme.setIntervalBackground, backgroundChangeTime);
  });

  $('.relax-option[value="relax"]').click(function () {
    theme.relax();
  });

  $('.relax-option[value="work"]').click(function () {
    theme.work();
  });
});