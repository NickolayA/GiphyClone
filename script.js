// var apiKey = "XJbIRItZXyqpIrv53RgoAWQDHXFmlZBA";

// var numOfImagesPerRequest = 20;
// for (var i = 0; i < 1; i++) {
//   var test = `http://api.giphy.com/v1/gifs/search?q=ryan+gosling&api_key=${apiKey}&limit=${numOfImagesPerRequest}&offset=${numOfImagesPerRequest *
//     i}`;
//   var hints =
//     "https://cors.io/?" +
//     `https://giphy.com/api/v1/channels-search/search/channel_v2?q=hello`;
//   var hints2 =
//     "https://cors.io/?" + `https://giphy.com/ajax/tags/search/?q=hello`;

//   console.log(test);
//   console.log(hints);

//   fetch(test)
//     .then(r => console.log(r))
//     .catch(e => console.log(e));

//   fetch(hints)
//     .then(r => r.json())
//     .then(r => console.log(r))
//     .catch(e => console.log(e));
// }

// class SearchField
function SearchField() {
  this.createSearchFieldView();
}

SearchField.prototype.createSearchFieldView = function() {
  var formTag = document.createElement("form");
  formTag.setAttribute("id", "searchField");
  var inputTag = document.createElement("input");
  inputTag.setAttribute("type", "text");
  formTag.appendChild(inputTag);
  this.searchFieldView = formTag;
};

// check if text in form is full selected
SearchField.prototype.isTextSelected = function(input) {
  if (typeof input.selectionStart == "number") {
    return (
      input.selectionStart == 0 && input.selectionEnd == input.value.length
    );
  } else if (typeof document.selection != "undefined") {
    input.focus();
    return document.selection.createRange().text == input.value;
  }
};

SearchField.prototype.addNeededEvents = function(getHints, getResults) {
  /**
   * Adds needed events to the searchFieldView
   * @param {function} getHints returns hints by entered letters
   * @param {function} getResults returns results by value of input(makes request for giphs)
   *
   */
  var result = "";
  var that = this; // change to arrow function

  this.searchFieldView.addEventListener("keydown", function(e) {
    if (
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      (e.keyCode >= 65 && e.keyCode <= 90) ||
      e.keyCode == 32
    ) {
      result += e.key;
      if (getHints) {
        getHints(result.trim());
      }
    } else if (e.keyCode === 13 && result !== "") {
      // 13 == enter
      e.preventDefault();
      if (getResults) {
        getResults(result.trim());
      }
    } else if (e.keyCode === 8) {
      // 8 == backspace
      if (that.isTextSelected(e.target)) {
        result = "";
      } else {
        result = result.slice(0, -1);
        if (result) {
          getHints(result.trim());
        }
      }
    } else {
      e.preventDefault();
    }
  });
};

SearchField.prototype.getSearchFieldView = function() {
  return this.searchFieldView;
};
// end search field class

// class DropDown
function DropDownMenu(data, maxNumOfRows) {
  /**
   * @param {array} data
   * @param {integer} maxNumOfRows Maxiumum number of rows that will be dropdowned
   *
   */
  this.maxNumOfRows = maxNumOfRows;
  this.data = data;
  // this.dropDownRows = [];
}

DropDownMenu.prototype.createDropDownView = function() {
  var ul = document.createElement("ul");

  var numOfRows =
    this.maxNumOfRows > this.data.length ? this.data.length : this.maxNumOfRows;

  for (var i = 0; i < numOfRows; i++) {
    var dropDownRow = new DropDownRow(this.data[i].name);
    dropDownRow.createDropDownRowView();
    ul.appendChild(dropDownRow.getDropDownRow());
  }
  this.dropDownMenu = ul;
};

DropDownMenu.prototype.getDropDownMenu = function() {
  return this.dropDownMenu;
};

// end class DropDown

// class DropDownRow
function DropDownRow(data) {
  /**
   *
   * @param {string} data Data to show in DropDownRow
   */
  this.data = data;
}

DropDownRow.prototype.createDropDownRowView = function() {
  var li = document.createElement("li");
  li.innerText = this.data;
  li.setAttribute("class", "dropdownrow");
  this.dropDownRow = li;
};

DropDownRow.prototype.getDropDownRow = function() {
  return this.dropDownRow;
};
// end class DropDownRow

function getHints(maxNumOfRows) {
  /**
   *
   * @param {integer} maxNumOfRows Max number of row to show
   */
  return function(request) {
    var laying = "https://cors.io/?";
    var hints = encodeURI(
      laying + `https://giphy.com/ajax/tags/search/?q=${request}`
    );
    fetch(hints)
      .then(response => response.json())
      .then(response => {
        var dropDownMenu = new DropDownMenu(
          response["result"]["objects"],
          maxNumOfRows
        );
        dropDownMenu.createDropDownView();
        console.log(dropDownMenu.getDropDownMenu());
      });
  };
}

function getResults(apiKey, resultsPerRequest) {
  /**
   * Returns results by request
   * @param {string} apiKey Api key of the service
   * @param {integer} resultsPerRequest Number of results per request
   *
   * @returns {function} Function to make request
   */
  var batchNumber = 0;

  return function(request) {
    var results = encodeURI(
      `http://api.giphy.com/v1/gifs/search?q=${request}g&api_key=${apiKey}&limit=${resultsPerRequest}&offset=${resultsPerRequest *
        batchNumber}`
    );

    fetch(results)
      .then(response => response.json())
      .then(response => {
        batchNumber++;
        console.log(response, batchNumber);
      });
  };
}

var apiKey = "XJbIRItZXyqpIrv53RgoAWQDHXFmlZBA";

var searchField = new SearchField();
document.body.appendChild(searchField.getSearchFieldView());
searchField.addNeededEvents(getHints(3), getResults(apiKey, 30));

var dropDownRow = new DropDownRow("hello");
dropDownRow.createDropDownRowView();
console.log(dropDownRow.getDropDownRow());
// end class SearchField
