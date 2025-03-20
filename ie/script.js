// Function to display notes
function displayNotes() {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const notesContainer = document.getElementById("notes-container");
  notesContainer.innerHTML = '';
  notes.forEach((note, index) => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note-card");
    noteElement.innerHTML = `<h3>Note ${index + 1}</h3><p>${note}</p>`;
    notesContainer.appendChild(noteElement);
  });
}

// Function to display recipes
function displayRecipes() {
  const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
  const recipesContainer = document.getElementById("recipes-container");
  recipesContainer.innerHTML = '';
  recipes.forEach((recipe, index) => {
    const recipeElement = document.createElement("div");
    recipeElement.classList.add("recipe-card");
    recipeElement.innerHTML = `<h3>Recipe ${index + 1}</h3><p>${recipe}</p>`;
    recipesContainer.appendChild(recipeElement);
  });
}

// Add new note
function addNote() {
  const note = prompt("Enter your nutrition note:");
  if (note) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push(note);
    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
  }
}

// Add new recipe
function addRecipe() {
  const recipe = prompt("Enter your healthy recipe:");
  if (recipe) {
    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    recipes.push(recipe);
    localStorage.setItem("recipes", JSON.stringify(recipes));
    displayRecipes();
  }
}

// Initial load
displayNotes();
displayRecipes();
