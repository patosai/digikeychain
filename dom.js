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

  function addRowToTable(table) {
    // insert thead row
    var th = document.createElement('th');
    th.innerHTML = 'DigiKC';
    var thead = table.getElementsByTagName('thead')[0];
    var theadRows = thead.getElementsByTagName('tr');
    theadRows.item(0).insertBefore(th, theadRows.item(0).firstChild);
    for (var i = 1; i < theadRows.length; ++i) {
      var th = document.createElement('th');
      theadRows.item(i).insertBefore(th, theadRows.item(i).firstChild);
    }

    // insert tbody row

    var tbody = table.getElementsByTagName('tbody')[0];
    var tbodyRows = tbody.getElementsByTagName('tr');
    for (var i = 0; i < tbodyRows.length; ++i) {
      var td = document.createElement('td');
      var checkbox = document.createElement('img');
      checkbox.className = className('add');
      checkbox.src = chrome.extension.getURL('img/check.svg');
      checkbox.onclick = addItemClickHandler;
      td.appendChild(checkbox);

      var tbodyRow = tbodyRows.item(i);
      tbodyRow.insertBefore(td, tbodyRow.firstChild);
    }
  }

  function addItemClickHandler() {
    var partNumberTd = this.parentNode;
    while (true) {
      if (!partNumberTd) {
        error('Could not find part number');
        return;
      }
      if (partNumberTd.className) {
        if (partNumberTd.className.indexOf('dkPartNumber') !== -1) {
          var metaProductId = partNumberTd.getElementsByTagName('meta')[0];
          if (metaProductId) {
            var partNumber = metaProductId.content;
            addItemToLiked(partNumber);
            return;
          }
        }
      }
      partNumberTd = partNumberTd.nextSibling;
    }
  }

  function addItemToLiked(partNumber) {
    chrome.storage.sync.get('liked', function(items) {
      if (chrome.runtime.lastError) {
        error(chrome.runtime.lastError);
        return;
      }

      if (!Array.isArray(items)) {
        items = [];
      }
      items.push(partNumber);
      items.sort();

      chrome.storage.sync.set({'liked': items}, function() {
        if (chrome.runtime.lastError) {
          error(chrome.runtime.lastError);
        }
      });
    });
  }

  function removeItemFromLiked(partNumber) {

  }
})();
