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

      var td = document.createElement('td');
      td.className = className('td');
      td.onclick = addItemClickHandler;

      var checkbox = document.createElement('img');
      checkbox.className = className('add');
      checkbox.src = chrome.extension.getURL('img/check.svg');
      td.appendChild(checkbox);

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

  function addItemClickHandler() {
    var parentTr = this.parentNode;
    var partNumber = getPartNumberFromTr(parentTr);
    if (partNumber) {
      addItemToLiked(partNumber);
    } else {
      error('Could not find part number');
    }
  }

  function getStorageArray(key, callback) {
    if (!key) {
      error('Key missing; cannot get storage array');
      return;
    }

    chrome.storage.sync.get(key, function(items) {
      if (chrome.runtime.lastError) {
        error(chrome.runtime.lastError);
        return null;
      }

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

    chrome.storage.sync.set({key: items}, function() {
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
})();
