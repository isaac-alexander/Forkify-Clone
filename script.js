// get DOM elements
const form = document.querySelector('.search');
const input = document.querySelector('.search_field');
const resultsList = document.querySelector('.results_list');
const recipeContainer = document.querySelector('.recipe');

// assign API to variables 
const SEARCH_URL = 'https://forkify-api.herokuapp.com/api/search?q=';
const RECIPE_URL = 'https://forkify-api.herokuapp.com/api/get?rId=';

//  search form 
form.addEventListener('submit', async function (e) {
  e.preventDefault(); // Prevent form from reloading page
  const searchTerm = input.value.trim(); // Get search input
  if (!searchTerm) return;

  // Show loading message in results area
  resultsList.innerHTML = '<li class="message">Searching...</li>';
  recipeContainer.innerHTML = ''; // Clear recipe display

  try {
    const response = await fetch(`${SEARCH_URL}${searchTerm}`);
    const data = await response.json();

    // If no results found
    if (!data.recipes || data.recipes.length === 0) {
      resultsList.innerHTML = '<li class="message">No results found.</li>';
      return;
    }

    // Show search results
    displayResults(data.recipes);
  } catch (error) {
    console.error('Search error:', error);
    resultsList.innerHTML = '<li class="message">Failed to fetch recipes. Try again.</li>';
  }
});

// Function to display list of recipes
function displayResults(recipes) {
  resultsList.innerHTML = ''; // Clear previous results

  recipes.forEach(recipe => {
    const li = document.createElement('li');
    li.classList.add('preview'); // Styled search result item
    li.dataset.id = recipe.recipe_id;

    const img = document.createElement('img');
    img.className = 'preview__image';
    img.src = recipe.image_url;
    img.alt = recipe.title;

    const info = document.createElement('div');
    info.className = 'preview__info';

    const title = document.createElement('div');
    title.className = 'preview__title';
    title.textContent = recipe.title;

    const publisher = document.createElement('div');
    publisher.className = 'preview__publisher';
    publisher.textContent = recipe.publisher;

    info.appendChild(title);
    info.appendChild(publisher);
    li.appendChild(img);
    li.appendChild(info);
    resultsList.appendChild(li);
  });
}

// Handle clicking a recipe from the list
resultsList.addEventListener('click', async function (e) {
  const clicked = e.target.closest('.preview'); // Find the clicked recipe item
  if (!clicked) return;

  document.querySelectorAll('.preview').forEach(el => el.classList.remove('preview--active'));

  // Add active class to the clicked recipe
  clicked.classList.add('preview--active');

  const recipeId = clicked.dataset.id; // Get recipe ID
  if (!recipeId) return;

  recipeContainer.innerHTML = '<p class="message">Loading recipe...</p>'; // Show loading

  try {
    const response = await fetch(`${RECIPE_URL}${recipeId}`);
    const data = await response.json();
    const recipe = data.recipe;

    // Display full recipe
    displayRecipe(recipe);
  } catch (error) {
    console.error('Recipe fetch error:', error);
    recipeContainer.innerHTML = '<p class="message">Failed to load recipe.</p>';
  }
});

// Function to display the full recipe details
function displayRecipe(recipe) {
  recipeContainer.innerHTML = ''; // Clear previous recipe

  const recipeDetails = document.createElement('div');
  recipeDetails.classList.add('recipe__details');

  const img = document.createElement('img');
  img.src = recipe.image_url;
  img.alt = recipe.title;
  img.className = 'recipe__img';

  const title = document.createElement('div');
  title.className = 'recipe__title';
  title.textContent = recipe.title;

  const publisher = document.createElement('div');
  publisher.className = 'recipe__publisher';
  publisher.textContent = `By ${recipe.publisher}`;

  const ul = document.createElement('ul');
  ul.className = 'recipe__ingredients';

  // for loop to create ingredients list
  for (let i = 0; i < recipe.ingredients.length; i++) {
    const li = document.createElement('li');
    li.className = 'ingredient';
    li.textContent = recipe.ingredients[i];
    ul.appendChild(li);
  }

  // Append all recipe elements to container
  recipeDetails.appendChild(img);
  recipeDetails.appendChild(title);
  recipeDetails.appendChild(publisher);
  recipeDetails.appendChild(ul);
  recipeContainer.appendChild(recipeDetails);
}