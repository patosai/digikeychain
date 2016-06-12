(function() {
  var productTable = document.getElementById('productTable');
  if (!productTable) {
    error('Could not find product table');
  } else {
    log('Adding DigiKC column');
    addRowToTable(productTable);
  }

  /*
   * Helper methods
   */

  function log(message) { console.log('DigiKeychain - ' + message); }
  function error(message) { console.error('DigiKeychain - ' + message); }

  function className(name) {
    var base = 'digikeychain';
    var classArray = null;
    if (Array.isArray(name)) {
      classArray = name;
    } else if (name) {
      classArray = [name];
    } else {
      classArray = [];
    }

    var classes = classArray.map(function(className) {
      return [base, className].join('-');
    });
    classes.unshift(base);
    return classes.join(' ');
  }

  function isFunction(fxn) {
    return typeof fxn === 'function';
  }

  function addHead(table) {
    // insert thead th
    var th = document.createElement('th');
    th.innerHTML = 'DigiKC';
    var thead = table.getElementsByTagName('thead')[0];
    var theadRows = thead.getElementsByTagName('tr');
    theadRows.item(0).insertBefore(th, theadRows.item(0).firstChild);
    for (var i = 1; i < theadRows.length; ++i) {
      var th = document.createElement('th');
      theadRows.item(i).insertBefore(th, theadRows.item(i).firstChild);
    }
  }

  function addBody(table, likedItems, dislikedItems) {
    // insert tbody td
    var tbody = table.getElementsByTagName('tbody')[0];
    var tbodyRows = tbody.getElementsByTagName('tr');
    for (var i = 0; i < tbodyRows.length; ++i) {
      var tbodyRow = tbodyRows.item(i);
      var productId = getPartNumberFromTr(tbodyRow);
      var td;

      if (likedItems.indexOf(productId) !== -1) {
        td = createLikedTd();
      } else if (dislikedItems.indexOf(productId) !== -1) {
        td = createDislikedTd();
      } else {
        td = createNeutralTd();
      }

      tbodyRow.insertBefore(td, tbodyRow.firstChild);
    }
  }

  function addRowToTable(table) {
    addHead(table);
    getLikedItems(function(likedItems) {
      getDislikedItems(function(dislikedItems) {
        addBody(table, likedItems, dislikedItems);
      });
    });
  }

  function getStorageArray(key, callback) {
    if (!key) {
      error('Key missing; cannot get storage array');
      return;
    }

    chrome.storage.sync.get(key, function(obj) {
      if (chrome.runtime.lastError) {
        error(chrome.runtime.lastError);
        return null;
      }

      var items = obj[key];

      if (!Array.isArray(items)) {
        items = [];
      }

      if (isFunction(callback)) {
        callback(items);
      }
    });
  }

  function saveStorageArray(key, items, callback) {
    if (!key) {
      error('Key missing; cannot save storage array');
      return;
    }

    if (!Array.isArray(items)) {
      error('Cannot save storage array; items is not array');
      return;
    }

    var obj = {};
    obj[key] = items;

    chrome.storage.sync.set(obj, function() {
      if (chrome.runtime.lastError) {
        error(chrome.runtime.lastError);
        return;
      }

      if (isFunction(callback)) {
        callback();
      }
    });
  }

  function getLikedItems(callback) {
    getStorageArray('liked', callback);
  }

  function getDislikedItems(callback) {
    getStorageArray('disliked', callback);
  }

  function saveLikedItems(items, callback) {
    saveStorageArray('liked', items, callback);
  }

  function saveDislikedItems(items, callback) {
    saveStorageArray('disliked', items, callback);
  }

  function addItemToLiked(partNumber) {
    getLikedItems(function(items) {
      var idx = items.indexOf(partNumber);
      if (idx !== -1) {
        error('Cannot add part to liked; item already liked');
      } else {
        items.push(partNumber);
        items.sort();
        saveLikedItems(items);
      }
    });
  }

  function addItemToDisliked(partNumber) {
    getDislikedItems(function(items) {
      var idx = items.indexOf(partNumber);
      if (idx !== -1) {
        error('Cannot add part to disliked; item already disliked');
      } else {
        items.push(partNumber);
        items.sort();
        saveDislikedItems(items);
      }
    });
  }

  function removeItemFromLiked(partNumber) {
    getLikedItems(function(items) {
      var idx = items.indexOf(partNumber);
      if (idx == -1) {
        error('Cannot remove part from liked; item not already liked');
      } else {
        items.splice(idx, 1);
      }

      saveLikedItems(items);
    });
  }

  function removeItemFromDisliked(partNumber) {
    getDislikedItems(function(items) {
      var idx = items.indexOf(partNumber);
      if (idx == -1) {
        error('Cannot remove part from disliked; item not already disliked');
      } else {
        items.splice(idx, 1);
      }

      saveDislikedItems(items);
    });
  }

  function getPartNumberFromTr(tr) {
    var tds = tr.getElementsByTagName('td');
    var partNumberTd = null;
    for (var i = 0; i < tds.length; ++i) {
      var td = tds.item(i);
      if (td.className && td.className.toLowerCase().indexOf('dkpartnumber') !== -1) {
        partNumberTd = td;
      }
    }

    if (!partNumberTd) {
      error('Could not find part number');
      return;
    }

    var metas = partNumberTd.getElementsByTagName('meta');
    for (var i = 0; i < metas.length; ++i) {
      var meta = metas.item(i);
      var itemprop = meta.getAttribute('itemprop');
      if (itemprop && itemprop.trim().toLowerCase().indexOf('productid') !== -1) {
        return meta.getAttribute('content');
      }
    }
    return null;
  }

  function createNeutralTd() {
    var td = document.createElement('td');
    td.className = className('neutral');

    var imgPlus = document.createElement('img');
    imgPlus.src = chrome.extension.getURL('svg/plus.svg');
    td.appendChild(imgPlus);
    imgPlus.onclick = function() {
      var td = this.parentNode;
      var tr = td.parentNode;
      var partNumber = getPartNumberFromTr(tr);
      addItemToLiked(partNumber);

      var newTd = createLikedTd();
      tr.insertBefore(newTd, td);
      tr.removeChild(td);
    };

    var imgMinus = document.createElement('img');
    imgMinus.src = chrome.extension.getURL('svg/minus.svg');
    td.appendChild(imgMinus);
    imgMinus.onclick = function() {
      var td = this.parentNode;
      var tr = td.parentNode;
      var partNumber = getPartNumberFromTr(tr);
      addItemToDisliked(partNumber);

      var newTd = createDislikedTd();
      tr.insertBefore(newTd, td);
      tr.removeChild(td);
    };

    return td;
  }

  function createLikedTd() {
    var td = document.createElement('td');
    td.className = className('liked');

    var img = document.createElement('img');
    img.src = chrome.extension.getURL('svg/check.svg');
    td.appendChild(img);

    td.onclick = function() {
      var tr = this.parentNode;
      var partNumber = getPartNumberFromTr(tr);
      removeItemFromLiked(partNumber);

      var newTd = createNeutralTd();
      tr.insertBefore(newTd, td);
      tr.removeChild(td);
    };

    return td;
  }

  function createDislikedTd() {
    var td = document.createElement('td');
    td.className = className('disliked');

    var img = document.createElement('img');
    img.src = chrome.extension.getURL('svg/x.svg');
    td.appendChild(img);

    td.onclick = function() {
      var tr = this.parentNode;
      var partNumber = getPartNumberFromTr(tr);
      removeItemFromDisliked(partNumber);

      var newTd = createNeutralTd();
      tr.insertBefore(newTd, td);
      tr.removeChild(td);
    };

    return td;
  }
})();
