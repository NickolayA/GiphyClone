// class SearchField
function SearchField() {
  this.letMakeRequest = true;
}

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
      that.letMakeRequest = false;
      if (getResults) {
        console.log(e);
        if (e.code !== "true") {
          console.log("clearGrid");
          grids.forEach(grid => grid.clearGrid());
        }

        var resultsPromise = getResults(
          result.trim(),
          maxNumResultsPerRequest,
          !e.code
        );

        console.log(resultsPromise);

        resultsPromise
          .then(results => {
            console.log(results);

            if (results) {
              results.forEach(function(result, index) {
                var gridGroup = new GridGroup();
                gridGroup.createGridGroupView();
                for (var i = 0; i < result["data"].length; i++) {
                  var gridCell = new GridCell(
                    result["data"][i]["images"]["downsized"]["width"],
                    result["data"][i]["images"]["downsized"]["height"]
                  );
                  gridCell.createGridCellView();
                  gridCell.addImage(
                    result["data"][i]["images"]["downsized"]["url"]
                  );
                  gridGroup.addCell(gridCell.getGridCell());
                }
                grids[index].addGridGroup(gridGroup.getGridGroup());
              });
            }

            that.letMakeRequest = true;
          })
          .catch(e => {
            console.log("result promise error");
            that.letMakeRequest = false;
          });
      }
    } else if (e.keyCode === 8) {
      // 8 == backspace

      if (that.isTextSelected(e.target)) {
        result = "";
        if (document.getElementById("dropDownMenu")) {
          that
            .getSearchField()
            .removeChild(document.getElementById("dropDownMenu"));
        }
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
        } else {
          if (document.getElementById("dropDownMenu")) {
            that
              .getSearchField()
              .removeChild(document.getElementById("dropDownMenu"));
          }
        }
      }
    } else {
      e.preventDefault();
    }
    console.log(result);
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

Grid.prototype.createGridView = function(gridPurpose) {
  var div = document.createElement("div");
  div.setAttribute("id", `grid${gridPurpose}`);
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

Grid.prototype.showGrid = function() {
  this.grid.style.display = "block";
};

Grid.prototype.hideGrid = function() {
  this.grid.style.display = "none";
};

// end class Grid

// class Tab
function Tab(label) {
  this.label = label;
}

Tab.prototype.createTabView = function() {
  var span = document.createElement("span");
  span.setAttribute("class", "tab");
  span.innerText = this.label;

  this.tab = span;
};

Tab.prototype.getTab = function() {
  return this.tab;
};

// end class Tab

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
// end class GridGroup

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
  var batchNumberGIFs = 0,
    batchNumberStickers = 0;

  return function(request, resultsPerRequest, resetBatchNumber) {
    var laying = "https://cors.io/?";

    var resultsGIFs = encodeURI(
      laying +
        `http://api.giphy.com/v1/gifs/search?q=${request}&api_key=${apiKey}&limit=${resultsPerRequest}&offset=${resultsPerRequest *
          batchNumberGIFs}`
    );

    var resultsStickers = encodeURI(
      laying +
        `http://api.giphy.com/v1/stickers/search?q=${request}&api_key=${apiKey}&limit=${resultsPerRequest}&offset=${resultsPerRequest *
          batchNumberStickers}`
    );

    console.log(resultsStickers, "url of request stickers");
    console.log(resultsGIFs, "url of request gifs");

    return Promise.all([
      fetch(resultsGIFs)
        .then(response => {
          batchNumberGIFs++;
          if (resetBatchNumber) batchNumberGIFs = 0;
          return response.json();
        })
        .catch(e => console.log(e)),
      fetch(resultsStickers)
        .then(response => {
          batchNumberStickers++;
          if (resetBatchNumber) batchNumberStickers = 0;
          return response.json();
        })
        .catch(e => console.log(e))
    ]);
  };
}

var apiKey = "XAz4Bn2YbnvfXDD7QfkP6yg5hhzYEIqv";

var searchField = new SearchField();
searchField.createSearchFieldView();
document.getElementById("content").appendChild(searchField.getSearchField());
searchField.addNeededEvents(getHints(), getResults(apiKey), 4, 30);

var gifsTab = new Tab("GIFs");
gifsTab.createTabView();
var stickersTab = new Tab("Stickers");
stickersTab.createTabView();
document.getElementById("content").appendChild(gifsTab.getTab());
document.getElementById("content").appendChild(stickersTab.getTab());

var gridGIFs = new Grid();
gridGIFs.createGridView("GIFs");
document.getElementById("content").appendChild(gridGIFs.getGrid());

var gridStickers = new Grid();
gridStickers.createGridView("Stickers");
document.getElementById("content").appendChild(gridStickers.getGrid());

var grids = [gridGIFs, gridStickers];

grids[0].showGrid();
grids[1].hideGrid();

var gifsTab = new Tab("GIFs");
gifsTab.createTabView();

var stickersTab = new Tab("Stickers");
stickersTab.createTabView();

var tabs = document.getElementsByClassName("tab");
tabs[0].addEventListener("click", function(e) {
  console.log(e, "gifsTab click");
  //e.stopPropagation();
  grids[0].showGrid();
  grids[1].hideGrid();
});

tabs[1].addEventListener("click", function(e) {
  console.log(e, "stickersTab click");
  //e.stopPropagation();
  grids[0].hideGrid();
  grids[1].showGrid();
});

window.onscroll = function(e) {
  console.log(searchField.letMakeRequest);
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight &&
    searchField.letMakeRequest
  ) {
    // you're at the bottom of the page
    const ke = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      keyCode: 13,
      code: true
    });
    document.getElementById("searchField").dispatchEvent(ke);
  }
};

// end class SearchField
