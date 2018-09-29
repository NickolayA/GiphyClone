// class SearchField
function SearchField() {}

SearchField.prototype.createSearchFieldView = function() {
  var formTag = document.createElement("form");
  formTag.setAttribute("id", "searchField");
  var inputTag = document.createElement("input");
  inputTag.setAttribute("type", "text");
  formTag.appendChild(inputTag);
  this.searchField = formTag;
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

SearchField.prototype.addNeededEvents = function(
  getHints,
  getResults,
  maxNumHintsRows,
  maxNumResultsPerRequest
) {
  /**
   * Adds needed events to the searchFieldView
   * @param {function} getHints returns hints by entered letters
   * @param {function} getResults returns results by value of input(makes request for giphs)
   * @param {integer} maxNumResultsPerRequest Number of results per request
   */
  var result = "";
  var that = this; // change to arrow function

  this.searchField.firstChild.addEventListener("focus", function() {
    var dropDownMenu = document.getElementById("dropDownMenu");
    if (dropDownMenu) {
      dropDownMenu.style.display = "block";
    }
  });

  this.searchField.firstChild.addEventListener("blur", function() {
    var dropDownMenu = document.getElementById("dropDownMenu");
    if (dropDownMenu) {
      dropDownMenu.style.display = "none";
    }
  });

  this.searchField.addEventListener("keydown", function(e) {
    if (
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      (e.keyCode >= 65 && e.keyCode <= 90) ||
      e.keyCode == 32
    ) {
      result += e.key;
      if (getHints) {
        var hintsPromise = getHints(result.trim());

        hintsPromise.then(hints => {
          console.log(hints);
          if (hints) {
            var dropDownMenu = new DropDownMenu(hints["result"]["objects"], 3);
            dropDownMenu.createDropDownView();
            that.getSearchField().appendChild(dropDownMenu.getDropDownMenu());
            that.addChildElement(dropDownMenu.getDropDownMenu());
          }
        });
      }
    } else if (e.keyCode === 13 && result !== "") {
      // 13 == enter
      e.preventDefault();
      if (getResults) {
        getResults(result.trim(), maxNumResultsPerRequest);
      }
    } else if (e.keyCode === 8) {
      // 8 == backspace
      if (that.isTextSelected(e.target)) {
        result = "";
      } else {
        result = result.slice(0, -1);
        if (result) {
          if (getHints) {
            var hintsPromise = getHints(result.trim());

            hintsPromise.then(hints => {
              if (hints) {
                var dropDownMenu = new DropDownMenu(
                  hints["result"]["objects"],
                  3
                );
                dropDownMenu.createDropDownView();
                console.log(dropDownMenu.getDropDownMenu());
                that
                  .getSearchField()
                  .appendChild(dropDownMenu.getDropDownMenu());
                that.addChildElement(dropDownMenu.getDropDownMenu());
              }
            });
          }
        }
      }
    } else {
      e.preventDefault();
    }
  });
};

SearchField.prototype.getSearchField = function() {
  return this.searchField;
};

SearchField.prototype.addChildElement = function(childElement) {
  this.searchField.removeChild(document.getElementById("dropDownMenu"));
  this.searchField.appendChild(childElement);
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
  ul.setAttribute("id", "dropDownMenu");

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

function getHints() {
  /**
   *
   *
   */
  return function(request) {
    var laying = "https://cors.io/?";
    var hints = encodeURI(
      laying + `https://giphy.com/ajax/tags/search/?q=${request}`
    );
    return fetch(hints).then(response => response.json());
  };
}

function getResults(apiKey) {
  /**
   * Returns results by request
   * @param {string} apiKey Api key of the service
   *
   *
   * @returns {function} Function to make request
   */
  var batchNumber = 0;

  return function(request, resultsPerRequest) {
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
searchField.createSearchFieldView();
document.body.appendChild(searchField.getSearchField());
searchField.addNeededEvents(getHints(), getResults(apiKey, 20));

var dropDownRow = new DropDownRow("hello");
dropDownRow.createDropDownRowView();
console.log(dropDownRow.getDropDownRow());

console.log();
// end class SearchField
