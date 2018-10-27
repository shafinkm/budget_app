//UI MODULE FOR ALL DOM RELATED EVENTS
var DomModule = (function () {
  var DOMStrings = {
    add_type: ".add__type",
    add_description: ".add__description",
    add_value: ".add__value",
    add_btn: ".add__btn",
    budget: ".budget",
    percentage: '.budget__expenses--percentage',
    budget_income_value: '.budget__income--value',
    budget_expense_value: '.budget__expenses--value',
    budget_value: '.budget__value',
    container: '.container',
    item_percentage: '.item__percentage',
    current_month: '.budget__title--month'
  };

  //FUNCTION INSIDE HERE WOULD BE PUBILC
  return {
    // Get values from the input field.
    getInputValues: function () {
      var typ = document.querySelector(DOMStrings.add_type).value;
      var desc = document.querySelector(DOMStrings.add_description).value;
      var val = document.querySelector(DOMStrings.add_value).value;

      if (!typ || !desc || !val) {
        return false;
      } else {
        return {
          type: typ,
          description: desc,
          value: parseFloat(val)
        };
      }
    },
    getDOMStrings: function () {
      return DOMStrings;
    },

    // Add data to the DOM depending on income or expense.
    setItems: function (objItem, type) {
      var itemHTML, newitemHTML;
      if (type === "income") {
        itemHTML =
          '<div class="item clearfix" id="income-%ID%"><div class="item__description">%DESCRIPTION%</div><div class="right clearfix"><div class="item__value"> %VALUE%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "expenses") {
        itemHTML =
          '<div class="item clearfix" id="expenses-%ID%"><div class="item__description">%DESCRIPTION%</div><div class="right clearfix"><div class="item__value"> %VALUE%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newitemHTML = itemHTML.replace("%ID%", objItem.id);
      newitemHTML = newitemHTML.replace("%DESCRIPTION%", objItem.description);
      newitemHTML = newitemHTML.replace("%VALUE%", this.formatNumber(objItem.value, type));

      document.querySelector("." + type + "__list").insertAdjacentHTML("beforeend", newitemHTML);
    },

    //Clear input fields after adding item to the list
    clearFields: function () {
      var inputs, arrInputs;

      inputs = document.querySelectorAll(DOMStrings.add_description + ", " + DOMStrings.add_value);
      arrInputs = Array.prototype.slice.call(inputs);

      arrInputs.forEach((element, index) => {
        element.value = "";
      });

      arrInputs[0].focus();

    },

    //get id for the element that was clicked
    getRemoveItem: function (item) {
      var arrValue;
      arrValue = item.split("-");
      return {
        type: arrValue[0],
        id: parseInt(arrValue[1])
      }
    },

    //remove item from the list
    removeItem: function (objData) {
      document.getElementById(objData.type + "-" + objData.id).remove();
    },

    //Update top dom to show total budget, income and expense.
    setBudget: function (objBudget) {

      var type = (objBudget.budget > 0) ? "income" : "expenses";

      document.querySelector(DOMStrings.budget_value).textContent = this.formatNumber(objBudget.budget, type);
      document.querySelector(DOMStrings.budget_income_value).textContent = this.formatNumber(objBudget.totalInc, "income");
      document.querySelector(DOMStrings.budget_expense_value).textContent = this.formatNumber(objBudget.totalExp, "expenses");

      document.querySelector(DOMStrings.percentage).textContent = (objBudget.percentage !== -1) ? objBudget.percentage + "%" : "---";
    },

    setItemPercentages: function (percentages) {

      var expList = document.querySelectorAll(DOMStrings.item_percentage);

      expList.forEach(function (curr, index) {
        curr.textContent = (percentages[index] !== -1) ? percentages[index] + "%" : "---";
      });
    },

    formatNumber: function (number, type) {
      var index;
      number = Math.abs(number);
      number = number.toFixed(2);

      //Adding , to the number eg. 2,000 OR 15,000
      index = number.indexOf('.')
      number = number.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, (m, i) => index < 0 || i < index ? `${m},` : m);

      //Adding + OR - to the number
      if (type === 'income' && parseInt(number) !== 0) {
        number = "+" + number;
      } else if (type === 'expenses' && parseInt(number) !== 0) {
        number = "-" + number;
      }

      return number;
    },

    //Displaying current month and year
    displayDate: function () {
      var now, month, year;
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMStrings.current_month).textContent = monthNames[month] + ", " + year;

    },

    changeInput: function () {
      document.querySelector(DOMStrings.add_type).classList.toggle('red-focus');
      document.querySelector(DOMStrings.add_description).classList.toggle('red-focus');
      document.querySelector(DOMStrings.add_value).classList.toggle('red-focus');
      document.querySelector(DOMStrings.add_btn).classList.toggle('red');
    }

  };
})();

//DATA MANUPULATION MODULE
var DataModule = (function () {

  //Function constructor for Income
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  //Function constructor for Expense
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  var data = {
    allItems: {
      income: [],
      expenses: []
    },
    allTotal: {
      totalInc: 0,
      totalExp: 0
    },
    budget: 0,
    percentage: -1
  };

  //Prototyping Expense function constructor to add a calculate Percentage method  
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var getTotal = function (arr) {
    var totalCount = 0;
    for (var i = 0; i < arr.length; i++) {
      totalCount += parseFloat(arr[i].value);
    }
    return totalCount;
  }


  return {
    //Enter the items entered into our data structure
    setItemData: function (objData) {
      var newData, ID;

      //Setting a unique id for each item
      if (data.allItems[objData.type].length > 0) {
        ID =
          data.allItems[objData.type][data.allItems[objData.type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Pushing items into our data structure
      if (objData.type === "income") {
        newData = new Income(ID, objData.description, objData.value);
      } else if (objData.type === "expenses") {
        newData = new Expense(ID, objData.description, objData.value);
      }

      data.allItems[objData.type].push(newData);
      return newData;
    },

    //Calculate the total budget depending on the income and expense.
    calcBudget: function () {
      //if (data.allItems.income.length > 0 || data.allItems.expenses.length > 0) {
      data.allTotal.totalInc = Math.round(getTotal(data.allItems.income) * 100) / 100;
      data.allTotal.totalExp = Math.round(getTotal(data.allItems.expenses) * 100) / 100;
      data.budget = Math.round((data.allTotal.totalInc - data.allTotal.totalExp) * 100) / 100;

      if (data.allTotal.totalInc > 0) {
        data.percentage = Math.round((data.allTotal.totalExp / data.allTotal.totalInc) * 100);
      } else {
        data.percentage = -1;
      }

      //}
    },

    //Return the updated budget
    getBudget: function () {
      return {
        "totalInc": data.allTotal.totalInc,
        "totalExp": data.allTotal.totalExp,
        "budget": data.budget,
        "percentage": data.percentage
      }
    },


    calcPercentages: function () {
      data.allItems.expenses.forEach(curr => {
        curr.calcPercentage(data.allTotal.totalInc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.expenses.map(curr => {
        return curr.getPercentage();
      });
      return allPerc;
    },

    removeItem: function (objData) {
      var arrItems = [],
        index;

      data.allItems[objData.type].map(curr => {
        arrItems.push(parseInt(curr.id));
      });
      index = arrItems.indexOf(objData.id);
      data.allItems[objData.type].splice(index, 1);
    },

    testData: function () {
      return data;
    }
  };
})();

//CONTROLLER MODULE
var ControllerModule = (function (DomCtrl, DataCtrl) {
  //INITIALIZE FUNCTION CALLED WHEN APPLICATION STARTS
  var initializeEventListeners = function () {
    var DOM = DomCtrl.getDOMStrings();
    //Handle click on the button and key press(ENTER).
    document.querySelector(DOM.add_btn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (e) {
      if (e.keyCode === 13) {
        //call function to get the input values
        ctrlAddItem();
      }
    });

    //Handle click on the cancel button in the item list
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    //Handle change of input type
    document.querySelector(DOM.add_type).addEventListener('change', DomCtrl.changeInput);
  };


  //call function to get input value data
  var ctrlAddItem = function () {
    //1. Getting data from the input fields
    var inputValues = DomCtrl.getInputValues();

    //Input field validation to check if proper values were entered
    if (inputValues && inputValues.value !== 0) {

      //2. Clear input fields
      DomCtrl.clearFields();

      //3. Setting the input values to the data structure
      var newListItem = DataCtrl.setItemData(inputValues);

      //4. update dom with new data with the new items
      DomCtrl.setItems(newListItem, inputValues.type);

      //5. calling the next controller
      ctrlBudgetCalc();

      //6. Calculate Percentage
      updatePercentage();

    }
  }

  var ctrlDeleteItem = function (event) {
    var item;
    item = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (item) {
      //1. get id of the clicked cancel button
      var ObjItem = DomCtrl.getRemoveItem(item);

      //2. Update the budget data structure with the id
      DataCtrl.removeItem(ObjItem);

      //3. Remove the item from the DOM
      DomCtrl.removeItem(ObjItem);

      //4. Re-Calculate the budget
      ctrlBudgetCalc();

      //5. Calculate Percentage
      updatePercentage();

    }
  }

  var ctrlBudgetCalc = function () {

    //1. calculate the budget and update the data structure.
    DataCtrl.calcBudget();

    //2. Get the budget
    var budget = DataCtrl.getBudget();

    //3. Display the budget in the DOM
    DomCtrl.setBudget(budget);

  }

  var updatePercentage = function () {
    //1. Calculate percentages
    DataCtrl.calcPercentages();
    //2. Get percentages
    var percentages = DataCtrl.getPercentages();

    //3. Display percentages
    DomCtrl.setItemPercentages(percentages);
  }

  return {
    init: function () {
      DomCtrl.displayDate();
      initializeEventListeners();
      DomCtrl.setBudget({
        "totalInc": 0,
        "totalExp": 0,
        "budget": 0,
        "percentage": -1
      });
    }
  };
})(DomModule, DataModule);

ControllerModule.init();