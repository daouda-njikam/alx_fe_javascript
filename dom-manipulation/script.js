const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // mock API

// Chargement et sauvegarde locale
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) return JSON.parse(storedQuotes);
  return [
    { text: "Success is not final, failure is not fatal.", category: "Motivation" },
    { text: "The best way to predict the future is to create it.", category: "Inspiration" },
    { text: "Knowledge is power.", category: "Education" }
  ];
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

let quotes = loadQuotes();

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

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

// Export / Import JSON (inchangés)
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

// Fonction pour récupérer les données du serveur (mock)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
    return serverQuotes;
  } catch (error) {
    console.error("Erreur serveur:", error);
    return [];
  }
}

// Fonction pour simuler l'envoi des données au serveur
async function postQuotesToServer() {
  try {
    // Simulation : on envoie un POST et on ignore la réponse réelle
    await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotes)
    });
  } catch (error) {
    console.error("Erreur envoi serveur:", error);
  }
}

// Fonction principale de synchro et gestion des conflits
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  let mergedQuotes = [...serverQuotes];
  quotes.forEach(localQuote => {
    if (!serverQuotes.some(sq => sq.text === localQuote.text)) {
      mergedQuotes.push(localQuote);
    }
  });

  if (JSON.stringify(mergedQuotes) !== JSON.stringify(quotes)) {
    quotes = mergedQuotes;
    saveQuotes();
    await postQuotesToServer();
    showRandomQuote();
    showNotification("Quotes synchronized with server and conflicts resolved.");
  }
}

// Notification simple
function showNotification(message) {
  let notif = document.getElementById("notification");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notification";
    notif.style.position = "fixed";
    notif.style.bottom = "10px";
    notif.style.right = "10px";
    notif.style.backgroundColor = "#333";
    notif.style.color = "white";
    notif.style.padding = "10px";
    notif.style.borderRadius = "5px";
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  setTimeout(() => {
    notif.textContent = "";
  }, 5000);
}

// Initialisation
createAddQuoteForm();
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportQuotes").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
showLastQuote();

setInterval(syncQuotes, 60000); // toutes les 60s
