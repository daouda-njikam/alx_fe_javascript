const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // simule notre "serveur"

// Charger les citations locales (identique au code précédent)
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

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

let quotes = loadQuotes();

function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory && (savedCategory === 'all' || categories.includes(savedCategory))) {
    categoryFilter.value = savedCategory;
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selectedCategory);
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = '<p>No quotes found in this category.</p>';
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById('quoteDisplay').innerHTML = `<p><strong>${quote.category}</strong>: "${quote.text}"</p>`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
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
  populateCategories();
  filterQuotes();
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
        populateCategories();
        filterQuotes();
      } else {
        alert('Invalid JSON format: Expected an array');
      }
    } catch (e) {
      alert('Error parsing JSON file');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- NOUVEAU : Synchronisation avec serveur ---

// Simule la récupération des quotes "serveur" (on va récupérer des posts jsonplaceholder)
async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    const serverData = await response.json();

    // Transformer les posts serveur en format citation simple (exemple)
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server Sync"
    }));

    // Détection et résolution de conflits (serveur prioritaire)
    let conflictDetected = false;
    serverQuotes.forEach(sq => {
      const foundIndex = quotes.findIndex(q => q.text === sq.text);
      if (foundIndex === -1) {
        // Nouvelle citation serveur => ajout
        quotes.push(sq);
        conflictDetected = true;
      } else {
        // Citation existante locale, on remplace par serveur
        quotes[foundIndex] = sq;
        conflictDetected = true;
      }
    });

    if (conflictDetected) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification("Data synced with server. Conflicts resolved.");
    }

  } catch (error) {
    showNotification("Error syncing with server: " + error.message);
  }
}

function showNotification(message) {
  let notif = document.getElementById("notif");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notif";
    notif.style.position = "fixed";
    notif.style.bottom = "10px";
    notif.style.right = "10px";
    notif.style.padding = "10px";
    notif.style.backgroundColor = "#444";
    notif.style.color = "white";
    notif.style.borderRadius = "5px";
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  notif.style.opacity = "1";
  setTimeout(() => {
    notif.style.opacity = "0";
  }, 4000);
}

// Synchronisation périodique toutes les 60 secondes
setInterval(fetchServerQuotes, 60000);

// Initialisation
createAddQuoteForm();
populateCategories();
filterQuotes();

document.getElementById("newQuote").addEventListener("click", filterQuotes);
document.getElementById("exportQuotes").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

// Premier fetch au chargement
fetchServerQuotes();
