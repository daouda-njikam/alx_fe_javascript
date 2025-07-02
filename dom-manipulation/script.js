const quotes = [
  { text: "Success is not final, failure is not fatal.", category: "Motivation" },
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Knowledge is power.", category: "Education" }
];

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Both fields are required.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  showRandomQuote();

  textInput.value = "";
  categoryInput.value = "";
}

function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formDiv.appendChild(inputText);
  formDiv.appendChild(inputCategory);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

createAddQuoteForm();

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
