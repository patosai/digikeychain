(function() {
  var productTable = document.getElementById('productTable');
  if (!productTable) {
    error('Could not find product table');
    return;
  }

  addRowToTable(productTable);

  /*
   * Helper methods
   */

  var CONSOLE_PREFIX = 'DigiKeychain - ';
  function log(message) { console.log(CONSOLE_PREFIX + message); }
  function error(message) { console.error(CONSOLE_PREFIX + message); }

  function addRowToTable(table) {
    // insert thead row
    var th = document.createElement('tr');
    th.innerHTML = "DigiKC";
    var thead = table.getElementsByTagName('thead')[0];
    var theadRow = thead.getElementsByTagName('tr')[0];
    theadRow.insertBefore(th, theadRow.firstChild);

    // insert tbody row
    var td = document.createElement("td");
    td.innerHTML = "oi";
    var tbody = table.getElementsByTagName('tbody')[0];
    var tbodyRows = tbody.getElementsByTagName('tr');
    for (var i = 0; i < tbodyRows.length; ++i) {
      var tbodyRow = tbodyRows.item(i);
      var tdCopy = td.cloneNode(true);
      tbodyRow.insertBefore(tdCopy, tbodyRow.firstChild);
    }
  }
})();
