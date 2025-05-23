// get DOM elements
const form = document.querySelector('.search');
const input = document.querySelector('.search_field');
const resultsList = document.querySelector('.results_list');
const recipeContainer = document.querySelector('.recipe');
const shoppingList = document.querySelector('.shopping_list');


// assign API to variables 
const SEARCH_URL = 'https://forkify-api.herokuapp.com/api/search?q=';
const RECIPE_URL = 'https://forkify-api.herokuapp.com/api/get?rId=';

//  search form 
form.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form from reloading page
    const searchTerm = input.value.trim(); // Get search input
    if (!searchTerm) return;

    // Show loading message in results area
    resultsList.innerHTML = '<li class="message"><i class="fa-solid fa-rotate-right"></i></li>';
    recipeContainer.innerHTML = ''; // Clear recipe display


    try {
        const response = await fetch(`${SEARCH_URL}${searchTerm}`);
        const data = await response.json();

        // If no results found
        if (!data.recipes || data.recipes.length === 0) {
            resultsList.innerHTML = '<li class="message-failed">No results found.</li>';
            return;
        }

        // Show search results
        displayResults(data.recipes);
    } catch (error) {
        console.error('Search error:', error);
        resultsList.innerHTML = '<li class="message-failed">Failed to fetch recipes. Try again.</li>';
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
    clicked.classList.add('preview--active');

    const recipeId = clicked.dataset.id; // Get recipe ID
    if (!recipeId) return;

    recipeContainer.innerHTML = '<p class="message"><i class="fa-solid fa-rotate-right"></i></p>'; // Show loading

    try {
        const response = await fetch(`${RECIPE_URL}${recipeId}`);
        const data = await response.json();
        const recipe = data.recipe;

        // Display full recipe
        displayRecipe(recipe);
    } catch (error) {
        console.error('Recipe fetch error:', error);
        recipeContainer.innerHTML = '<p class="message-failed">Failed to load recipe.</p>';
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

    const timeServings = document.createElement('div');
    timeServings.className = 'recipe__info';
    timeServings.innerHTML = `
    <div class="recipe__info-item">
      <i class="fa-solid fa-clock"></i>
      <span class="recipe__info-data">~ ${Math.floor(Math.random() * 31) + 10} minutes</span>
    </div>
    <div class="recipe__info-item">
      <i class="fa-solid fa-users"></i>
      <span class="recipe__info-data servings-count">4 servings</span>
      <div class="servings-buttons">
        <button class="btn-tiny btn-decrease"><i class="fa-solid fa-minus"></i></button>
        <button class="btn-tiny btn-increase"><i class="fa-solid fa-plus"></i></button>
      </div>
    </div>`;

    const ul = document.createElement('ul');
    ul.className = 'recipe__ingredients';

    for (let i = 0; i < recipe.ingredients.length; i++) {
        const li = document.createElement('li');
        li.className = 'ingredient';
        li.textContent = recipe.ingredients[i];
        ul.appendChild(li);
    }

    recipeDetails.appendChild(img);
    recipeDetails.appendChild(title);
    recipeDetails.appendChild(publisher);
    recipeDetails.appendChild(timeServings);
    recipeDetails.appendChild(ul);

    const likeBtn = document.createElement('button');
    likeBtn.className = 'btn btn-like';
    likeBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Like';
    likeBtn.addEventListener('click', () => {
        likeBtn.classList.toggle('liked');
        likeBtn.innerHTML = likeBtn.classList.contains('liked')
            ? '<i class="fa-solid fa-heart-circle-check"></i> Liked'
            : '<i class="fa-solid fa-heart"></i> Like';
    });

    recipeDetails.appendChild(likeBtn);
    recipeContainer.appendChild(recipeDetails);

    let currentServings = 4;
    recipeDetails.querySelector('.btn-decrease').addEventListener('click', () => {
        if (currentServings > 1) updateServings(-1);
    });
    recipeDetails.querySelector('.btn-increase').addEventListener('click', () => {
        updateServings(1);
    });

    const shoppingBtn = document.createElement('button')
    shoppingBtn.className = 'btn btn--small btn--add-to-shopping'
    shoppingBtn.innerHTML = '<p><i class="fa-solid fa-cart-plus"></i>Add to shopping list</p>';
    recipeDetails.appendChild(shoppingBtn);
    shoppingBtn.addEventListener('click', () => {
        console.log('shopping', recipe.ingredients);
        addIngredientsToShoppingList(recipe.ingredients);
    });

    function updateServings(change) {
        currentServings += change;
        recipeDetails.querySelector('.servings-count').textContent = `${currentServings} servings`;
        const ingredients = recipeDetails.querySelectorAll('.ingredient');
        ingredients.forEach((li, i) => {
            li.textContent = recipe.ingredients[i] + ` (x${currentServings})`;
        });
    }

    const recipeDirection = document.createElement('div');
    recipeDirection.className = 'recipe__directions';
    recipeDirection.innerHTML = `<h2 class="heading-2">How to Cook It</h2>
    <p class="recipe__directions-text">
      This recipe was carefully designed and tested by
      <span class="recipe__publisher">${recipe.publisher}</span>. Please check out directions at their website.
    </p>
    <a class="btn recipe__btn" href="${recipe.source_url}" target="_blank" rel="noopener noreferrer">
      <span>Directions</span>
      <i class="fa-solid fa-arrow-right"></i>
    </a>`;

    recipeContainer.appendChild(recipeDirection);

}

//Function to add ingredients
function addIngredientsToShoppingList(ingredients) {
    console.log('name', ingredients);

    shoppingList.innerHTML = ''; // clear old items

    ingredients.forEach(ing => {
        const li = document.createElement('li');
        li.className = 'shopping_item';
        li.innerHTML = `${ing}<button class="shopping_delete"><i class="fa-solid fa-xmark"></i></button>`;
        shoppingList.appendChild(li);
    });
}

// Remove item from shopping list
shoppingList.addEventListener('click', function (e) {
    if (e.target.closest('.shopping_delete')) {
        const item = e.target.closest('.shopping_item');
        item.remove();
    }
});

