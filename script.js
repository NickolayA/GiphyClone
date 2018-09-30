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
      if (that.isTextSelected(e.target)) {
        result = e.key;
      } else {
        result += e.key;
      }
      if (getHints) {
        var hintsPromise = getHints(result.trim());

        hintsPromise.then(hints => {
          console.log(hints);
          if (hints) {
            var dropDownMenu = new DropDownMenu(hints["result"]["objects"], 3);
            dropDownMenu.createDropDownView();
            that.addChildElement(dropDownMenu.getDropDownMenu());
          }
        });
      }
      console.log(result);
    } else if (e.keyCode === 13 && result !== "") {
      // 13 == enter
      e.preventDefault();
      if (getResults) {
        var resultsPromise = getResults(result.trim(), maxNumResultsPerRequest);

        resultsPromise.then(results => {
          if (results) {
            var gridGroup = new GridGroup();
            gridGroup.createGridGroupView();
            for (var i = 0; i < results["data"].length; i++) {
              var gridCell = new GridCell(
                results["data"][i]["images"]["downsized"]["width"],
                results["data"][i]["images"]["downsized"]["height"]
              );
              gridCell.createGridCellView();
              gridCell.addImage(
                results["data"][i]["images"]["downsized"]["url"]
              );
              gridGroup.addCell(gridCell.getGridCell());
            }
            grid.addGridGroup(gridGroup.getGridGroup());
          }
        });
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

            hintsPromise
              .then(hints => {
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
              })
              .catch(e => console.log(e));
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
  if (document.getElementById("dropDownMenu")) {
    this.searchField.removeChild(document.getElementById("dropDownMenu"));
  }
  this.searchField.appendChild(childElement);
};
// end search field class

// class Grid
function Grid() {}

Grid.prototype.createGridView = function() {
  var div = document.createElement("div");
  div.setAttribute("id", "grid");
  this.grid = div;
};

Grid.prototype.getGrid = function() {
  return this.grid;
};

Grid.prototype.addGridGroup = function(gridGroup) {
  this.grid.appendChild(gridGroup);
};

Grid.prototype.addCell = function(cell) {
  this.grid.appendChild(cell);
};

Grid.prototype.clearGrid = function() {
  while (this.grid.firstChild) {
    this.grid.removeChild(this.grid.firstChild);
  }
};

// end class Grid

// class GridGroup
function GridGroup() {}

GridGroup.prototype.createGridGroupView = function() {
  var div = document.createElement("div");
  div.setAttribute("class", "gridGroup");
  this.gridGroup = div;
};

GridGroup.prototype.addCell = function(cell) {
  this.gridGroup.appendChild(cell);
};

GridGroup.prototype.getGridGroup = function() {
  return this.gridGroup;
};
// end GridGroup

// class GridCell
function GridCell(width, height) {
  this.width = width;
  this.height = height;
}

GridCell.prototype.createGridCellView = function() {
  var div = document.createElement("div");
  div.setAttribute("class", "gridCell");
  div.style.width = this.width;
  div.style.height = this.height;
  this.gridCell = div;
};

GridCell.prototype.getGridCell = function() {
  return this.gridCell;
};

GridCell.prototype.addImage = function(url) {
  var img = document.createElement("img");
  img.setAttribute("src", url);
  this.gridCell.appendChild(img);
};
// end class GridCell

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
  li.setAttribute("class", "dropDownRow");
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

  return function(request, resultsPerRequest, resetBatchNumber) {
    var laying = "https://cors.io/?";
    var results = encodeURI(
      `http://api.giphy.com/v1/gifs/search?q=${request}g&api_key=${apiKey}&limit=${resultsPerRequest}&offset=${resultsPerRequest *
        batchNumber}`
    );

    return fetch(results)
      .then(response => {
        batchNumber++;
        if (resetBatchNumber) batchNumber = 0;
        return response.json();
      })
      .catch(e => console.log(e));
  };
}

var apiKey = "XJbIRItZXyqpIrv53RgoAWQDHXFmlZBA";

var searchField = new SearchField();
searchField.createSearchFieldView();
document.getElementById("content").appendChild(searchField.getSearchField());
searchField.addNeededEvents(getHints(), getResults(apiKey), 4, 30);

var grid = new Grid();
grid.createGridView();
document.getElementById("content").appendChild(grid.getGrid());

window.onscroll = function(ev) {
  var letScroll = true;
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight &&
    letScroll
  ) {
    // you're at the bottom of the page
    const ke = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      keyCode: 13
    });
    document.getElementById("searchField").dispatchEvent(ke);
  }

  setTimeout(
    (function() {
      return function() {
        letScroll = !letScroll;
        console.log(letScroll, "letScroll");
      };
    })(),
    300
  );
};

// end class SearchField
