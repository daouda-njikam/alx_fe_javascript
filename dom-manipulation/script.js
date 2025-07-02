// Charge les citations depuis localStorage ou initialise avec des exemples
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    return JSON.parse(storedQuotes);
  }
  return [
    { text: "Success is not final, failure is not fatal.", category: "Motivation" },
    { text: "The best way to predict the future is to create it.", category: "Inspiration" },
    { text: "Knowledge is power.", category: "Education" }
  ];
}

// Sauvegarde les citations dans localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Tableau des citations en mémoire
let quotes = loadQuotes();

// Affiche une citation aléatoire et mémorise dans sessionStorage
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Affiche la dernière citation vue en session, sinon une aléatoire
function showLastQuote() {
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;
  } else {
    showRandomQuote();
  }
}

// Ajoute une nouvelle citation depuis les inputs, sauvegarde, et affiche
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
  saveQuotes();
  showRandomQuote();

  textInput.value = "";
  categoryInput.value = "";
}

// Crée le formulaire d'ajout dynamique
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

// Exporter les citations en fichier JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Importer les citations depuis un fichier JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
        showRandomQuote();
      } else {
        alert('Invalid JSON format: Expected an array');
      }
    } catch (e) {
      alert('Error parsing JSON file');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Création du formulaire et ajout des événements
createAddQuoteForm();
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Création des boutons Import et Export dans le DOM
const controlsDiv = document.createElement("div");

// Bouton Export
const exportBtn = document.createElement("button");
exportBtn.id = "exportQuotes";
exportBtn.textContent = "Export Quotes as JSON";
exportBtn.onclick = exportToJsonFile;
controlsDiv.appendChild(exportBtn);

// Input Import
const importInput = document.createElement("input");
importInput.type = "file";
importInput.id = "importFile";
importInput.accept = ".json";
importInput.addEventListener('change', importFromJsonFile);
controlsDiv.appendChild(importInput);

document.body.appendChild(controlsDiv);

// Affiche la dernière citation au chargement
showLastQuote();
