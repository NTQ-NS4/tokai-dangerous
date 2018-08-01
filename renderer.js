// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { clipboard } = require('electron')
const {net} = require('electron').remote
var tinycolor = require("tinycolor2");
const md5 = require('md5');
const _ = require('lodash');
const config = require('./config');

var screens;
var filteredScreens;
var trans;
var backgroundInterval;

sendRequest = options => {
  return new Promise((resolve, reject) => {
        var request = net.request(options).on("error", (e) => {
            reject(e);
        }).on('response', response => {
          var data = JSON.parse(response.data.reduce((data, current) => data.toString('utf8') + (current === null ? '' : current.toString('utf8'))));
          resolve(data);
        });

        request.end();
    });
};

getSettingRequestOptions = () => {
    return {
        host: config.api.host,
        port: config.api.port,
        protocol: config.api.protocol,
        path: config.api.path.setting,
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
    backgroundInterval = setInterval(theme.setIntervalBackground, config.backgroundChangeTime);

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
          color = config.normalBackgrounds[Math.floor(Math.random() * config.normalBackgrounds.length)];
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
        var screen = document.querySelector('#keywordInput').value;
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

document.querySelector('#keywordInput').addEventListener('keyup', function() { filterThenDisplayScreenList(this.value) })
document.querySelector('#copyTimesheetBtn').addEventListener('click', copyTimesheet)
document.querySelector('#actionSelect').addEventListener('change', onChangeAction)
document.querySelector('#clearKeywordInput').addEventListener('click', () => {
    if (!$('#keywordInput').val()) {
        return;
    }

    $('#keywordInput').val('');
    filterThenDisplayScreenList('');
})
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
        document.querySelector('#keywordInput').value = data.id;
        filterThenDisplayScreenList(document.querySelector('#keywordInput').value);
    }
});

var mode = "";

const theme = function () {
  let $body = $('body');
  let themeCurrent = {};
  let hentaiData = {};
  [...Array(64).keys()].forEach(function (index) {
    hentaiData['hetai_' + index] = 'images/hentai/' + index + '.jpg';
  });

  const options = { hentai: { key: 'hentai', name: 'Hentai', data: hentaiData } };
  let prevBg;
  let nextBg;
  let isRelax = false;
  let isChangeTheme = false;

  function loadAll() {
    let html = '';
    _.forEach(options, function (theme) {
      if (!$(`#modeSelect option[value="${theme.key}"]`).length) {
        $(`#modeSelect`).append(`<option value="${theme.key}">${theme.name}</option>`);
      } else {
        $(`#modeSelect option[value="${theme.key}"]`).text(theme.name);
      }

      _.forEach(theme.data, function (image, key) {
        if (!$(`.bg-theme.${key}`).length) {
          html += `<li class="bg-theme ${key}" style="display: none; background-image: url('${image}')"></li>`;
        }
      });
    });

    $body.find('.backgrounds').append(html);
  }
  function setupThem(name) {
    if (typeof name === 'undefined' || name === '') {
      name = 'normal';
      themeCurrent = {
        key: 'normal',
        name: 'Normal',
        data: {}
      };
    } else{
      themeCurrent = options[name];
    }
    prevBg = 'prev';
    nextBg = 'next';
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
    if (!_.isEmpty(themeCurrent['data']) && _.isObject(themeCurrent['data'])) {
      prevBg = nextBg;

      nextBg = randomPropertyKey(themeCurrent['data']);
      let count = 0;
      while (nextBg === prevBg && count < 15) {
        nextBg = randomPropertyKey(themeCurrent['data']);
        count++;
      }

      let time = 1000;

      let animate = [
        {
          hide: { width: '0%', height: '0%', opacity: 0 },
          show: { width: '100%', height: '100%', opacity: 1 }
        },
        {
          hide: { top: '100%', left: '100%', opacity: 0 },
          show: { top: '0%', left: '0%', opacity: 1 }
        },
      ];

      let randomType = animate[Math.floor(Math.random() * animate.length)];

      $(`.bg-theme.${prevBg}`).css({ zIndex: 5 }).animate(randomType.hide, time, function () {
        var bg = $(this).css('backgroundImage');
        $(this).attr('style', 'display: none; background-image: ' + bg);
      });
      $(`.bg-theme.${nextBg}`).css({ zIndex: 4, opacity: 0 }).show().animate(randomType.show, time, function () {

      });
      let image = $('img.relax');
      image.fadeOut('fast', function () {
        image.attr('src', themeCurrent['data'][nextBg]);
        image.fadeIn('fast');
      });
    }
  }
  function work() {
    isRelax = false;
    $body.find('.backgrounds').show();
    $body.find('#app .main-content').slideDown();
    $body.find('img.relax').remove();
    $('.relax-option[value="relax"]').show();
    $('.relax-option[value="work"]').hide();
  }

  function getOptions() {
    return new Promise((resolve, reject) => {
      var request = net.request({
        host: config.api.host,
        port: config.api.port,
        protocol: config.api.protocol,
        path: config.api.path.theme,
        method: 'GET',
      }, response => {
        response.on('data', chunk => {
          var data = JSON.parse(chunk.toString('utf8'));
          resolve(data);
        });
      }).on("error", (e) => {
        reject(e);
      });

      request.end();
    });
  }

  function loadOptions() {
    getOptions().then(function (response) {
      response.forEach(function (item) {
        if (_.isObject(item) && _.isArray(item.data)) {
          options[item.key] = _.isObject(options[item.key]) ? options[item.key] : { data: {} };
          options[item.key].name = item.name;
          options[item.key].key = item.key;
          let data = {};

          _.forEach(item.data, function (url, index) {
            data[item.key + '_' + index + '_' + md5(item.key + index + url)] = url;
          });

          options[item.key].data = Object.assign(options[item.key].data, data);
        }

      });

      loadAll();

      if (!isChangeTheme && typeof options['random'] !== 'undefined') {
        setupThem('random');
        $('#modeSelect').val('random');
      }
    })
  }

  $('body').on('click', 'img.relax', function () {
    $(this).css({ opacity: 0 });
    $('body').addClass('modal-open');
    let src = $(this).attr('src');
    $('<div>').css({
      background: 'RGBA(0, 0, 0, .7) url('+src+') no-repeat center',
      backgroundSize: 'contain',
      width:'100%', height:'100%',
      position:'fixed',
      zIndex:'10000',
      top:'0', left:'0',
      cursor: 'zoom-out'
    }).click(function(){
      $(this).remove();
      $('img.relax').css({ opacity: 1 });
      $('body').removeClass('modal-open');
    }).appendTo('body');
  });

  loadOptions();
  setInterval(loadOptions, config.getThemeOptionTime);

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
      $body.append(`<img class="img-fluid relax" src="${themeCurrent['data'][nextBg]}">`)
    },
    setup: function (name) {
      isChangeTheme = true;
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

  $('#modeSelect').change(function (e) {
    let val = $(this).val();
    if (val === 'hentai') {
      e.preventDefault();
    }

    clearInterval(backgroundInterval);
    backgroundInterval = setInterval(theme.setIntervalBackground, config.backgroundChangeTime);
    theme.setup(val);
  });

  $('.next-bg').click(function () {
    var self = $(this);
    self.attr('disabled', 'disabled');
    setTimeout(function () {
      self.removeAttr('disabled');
    }, 500);
    clearInterval(backgroundInterval);
    theme.changeBackground();
    backgroundInterval = setInterval(theme.setIntervalBackground, config.backgroundChangeTime);
  });

  $('.relax-option[value="relax"]').click(function () {
    theme.relax();
  });

  $('.relax-option[value="work"]').click(function () {
    theme.work();
  });
});

function randomPropertyKey(obj) {
  let keys = Object.keys(obj);

  return keys[ keys.length * Math.random() << 0];
}