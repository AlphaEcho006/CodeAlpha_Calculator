// ---------- 1. GRAB THE ELEMENTS ----------
// document.querySelector finds an element on the page so JavaScript can use it.
const previousOperandElement = document.querySelector("#previous-operand");
const currentOperandElement = document.querySelector("#current-operand");

// querySelectorAll finds ALL matching elements and gives us a list.
const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operator]");
const equalsButton = document.querySelector("[data-action='equals']");
const clearButton = document.querySelector("[data-action='clear']");
const deleteButton = document.querySelector("[data-action='delete']");

// ---------- 2. THE CALCULATOR'S MEMORY ----------
// These variables remember what is happening. Numbers are stored as text
// (strings) while typing, so we can add digits like "1" then "2" -> "12".
let currentOperand = "";   // the number being typed right now
let previousOperand = "";  // the first number, saved when an operator is pressed
let operator = null;       // the chosen operator: + − × ÷ (or null if none)
let justCalculated = false; // true right after pressing "=" (see appendNumber)

// ---------- 3. UPDATE THE SCREEN ----------
// We call this every time something changes, so the display is always live.
function updateDisplay() {
  // If nothing is typed yet, show 0
  currentOperandElement.textContent = currentOperand === "" ? "0" : currentOperand;

  // Show the saved number with its operator, like "12 +"
  if (operator !== null) {
    previousOperandElement.textContent = `${previousOperand} ${operator}`;
  } else {
    previousOperandElement.textContent = "";
  }
}

// ---------- 4. TYPING NUMBERS ----------
function appendNumber(number) {
  // After an error or a finished calculation, typing starts fresh
  if (currentOperand === "Error" || justCalculated) {
    currentOperand = "";
    justCalculated = false;
  }

  // Only allow one decimal point per number
  if (number === "." && currentOperand.includes(".")) return;

  // If we just have "0" and type a digit, replace the 0 (avoid "05")
  if (currentOperand === "0" && number !== ".") {
    currentOperand = number;
  } else if (currentOperand === "" && number === ".") {
    currentOperand = "0."; // typing "." first becomes "0."
  } else {
    currentOperand += number; // add the digit to the end
  }

  updateDisplay();
}

// ---------- 5. CHOOSING AN OPERATOR ----------
function chooseOperator(selectedOperator) {
  if (currentOperand === "Error") return;

  // Nothing typed and nothing saved: ignore the press
  if (currentOperand === "" && previousOperand === "") return;

  // If the user changes their mind (presses + then ×), just swap the operator
  if (currentOperand === "" && previousOperand !== "") {
    operator = selectedOperator;
    updateDisplay();
    return;
  }

  // If we already have a pending calculation (like 5 + 3 then pressing ×),
  // finish it first. This lets users chain: 5 + 3 × 2
  if (previousOperand !== "") {
    calculate();
    if (currentOperand === "Error") return;
  }

  // Move the typed number up to "previous" and wait for the next number
  operator = selectedOperator;
  previousOperand = currentOperand;
  currentOperand = "";
  justCalculated = false;
  updateDisplay();
}

// ---------- 6. DOING THE MATH ----------
function calculate() {
  // parseFloat turns text like "12.5" into a real number we can calculate with
  const previous = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);

  // If either number is missing, there is nothing to calculate
  if (isNaN(previous) || isNaN(current) || operator === null) return;

  let result;

  // switch checks the operator and runs the matching math
  switch (operator) {
    case "+":
      result = previous + current;
      break;
    case "−":
      result = previous - current;
      break;
    case "×":
      result = previous * current;
      break;
    case "÷":
      if (current === 0) {
        // Dividing by zero is impossible, so show an error instead
        currentOperand = "Error";
        previousOperand = "";
        operator = null;
        updateDisplay();
        return;
      }
      result = previous / current;
      break;
  }

  // Computers sometimes give 0.1 + 0.2 = 0.30000000000000004.
  // Rounding to 10 decimal places cleans that up.
  result = Math.round(result * 1e10) / 1e10;

  currentOperand = result.toString();
  previousOperand = "";
  operator = null;
  justCalculated = true;
  updateDisplay();
}

// ---------- 7. CLEAR AND DELETE ----------
function clearAll() {
  currentOperand = "";
  previousOperand = "";
  operator = null;
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  if (currentOperand === "Error") {
    clearAll();
    return;
  }
  // slice(0, -1) keeps everything except the last character
  currentOperand = currentOperand.slice(0, -1);
  updateDisplay();
}

// ---------- 8. CONNECT BUTTONS TO FUNCTIONS ----------
// forEach loops through every button. addEventListener("click", ...) means
// "when this button is clicked, run this function".
numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    appendNumber(button.dataset.number); // reads the data-number value
  });
});

operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    chooseOperator(button.dataset.operator); // reads the data-operator value
  });
});

equalsButton.addEventListener("click", calculate);
clearButton.addEventListener("click", clearAll);
deleteButton.addEventListener("click", deleteLast);

// ---------- 9. KEYBOARD SUPPORT (bonus task) ----------
// This listens for key presses anywhere on the page.
document.addEventListener("keydown", (event) => {
  const key = event.key;

  // Digits 0-9 and the decimal point
  if ((key >= "0" && key <= "9") || key === ".") {
    appendNumber(key);
  }

  // Keyboard symbols are translated into our calculator's symbols
  if (key === "+") chooseOperator("+");
  if (key === "-") chooseOperator("−");
  if (key === "*") chooseOperator("×");
  if (key === "/") {
    event.preventDefault(); // stops Firefox from opening its quick-find bar
    chooseOperator("÷");
  }

  // Enter or = calculates
  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  }

  if (key === "Backspace") deleteLast();
  if (key === "Escape") clearAll();
});

// Show the starting "0" when the page first loads
updateDisplay();