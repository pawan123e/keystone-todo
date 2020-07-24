function graphql(query, variables = {}) {
  return fetch('/admin/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      variables,
      query,
    }),
  }).then(function(result) {
    return result.json();
  });
}

const GET_TODOS = `
    query GetTodos {
      allTodos {
        name
        id
      }
    }
  `;

const ADD_TODO = `
    mutation AddTodo($name: String!) {
      createTodo(data: { name: $name }) {
        name
        id
      }
    }
  `;

const REMOVE_TODO = `
    mutation RemoveTodo($id: ID!) {
      deleteTodo(id: $id) {
        name
        id
      }
    }
  `;

function addTodo(event) {
  event.preventDefault();
  const form = event.target;
  // Find the 'add-item' input element
  const element = form.elements['add-item'];
  if (element) {
    graphql(ADD_TODO, { name: element.value }).then(fetchData);
  }
  // Clear the form
  form.reset();
  window.scrollTo(0,document.body.scrollHeight);
}

const addItem = (e) => {
  const form = document.querySelector('.js-add-todo-form');
  const todoForm = document.querySelector('.form-input');
  if(todoForm.value) {
    graphql(ADD_TODO, { name: todoForm.value }).then(fetchData);
  }
  form.reset();
  window.scrollTo(0,document.body.scrollHeight + 50);
}

function removeTodo(todo) {
  graphql(REMOVE_TODO, { id: todo.id }).then(fetchData);
}

function createToDoItem(todo) {
  // Create the remove button
  const removeItemButton = document.createElement('button');
  removeItemButton.classList.add('remove-item', 'js-remove-todo-button');
  // removeItemButton.innerHTML = DELETE_ICON;
  removeItemButton.innerHTML = "<i class='fas fa-trash-alt'></i>";
  // Attach an event to remove the todo
  removeItemButton.addEventListener('click', function() {
    removeTodo(todo);
  });

  // Create the list item
  const listItem = document.createElement('li');
  listItem.classList.add('list-item');
  // Add text to the listItem
  listItem.innerHTML = todo.name;
  // append the remove item button
  listItem.appendChild(removeItemButton);

  return listItem;
}

function createList(data) {
  // Create the list
  const list = document.createElement('ul');
  list.classList.add('list');
  data.allTodos.forEach(function(todo) {
    list.appendChild(createToDoItem(todo));
  });
  return list;
}

const emptyList = () => {
  const divItem = document.createElement('div');
  divItem.classList.add('emptyList');
  const p1 = document.createElement('p1');
  p1.innerHTML = 'List is empty';
  p1.classList.add('upperText');
  const p2 = document.createElement('p2');
  p2.innerHTML = 'Add tasks to the list';
  p2.classList.add('lowerText');
  divItem.appendChild(p1);
  divItem.appendChild(p2);
  return divItem;
}

function fetchData() {
  graphql(GET_TODOS)
    .then(function(result) {
      // Clear any existing elements from the list
      document.querySelector('.results').innerHTML = '';

      // Recreate the list and append it to the .results div
      if(result.data.allTodos.length > 0) {
        const list = createList(result.data); 
        document.querySelector('.results').appendChild(list);
      } else {
        const list = emptyList(); 
        document.querySelector('.results').appendChild(list);
      }
      
      console.log('value of list', result.data.allTodos.length)
     
    })
    .catch(function(error) {
      console.log(error);
      document.querySelector('.results').innerHTML = '<p>Error</p>';
    });
}


document.getElementById('todo-app').parentNode.innerHTML = `

<div class="app">
<h2 class="app-heading">To-Do App</h2>
 <div class="form-wrapper">

<div class="results">
  <p class='load'>Loading...</p>
</div>
<form class="js-add-todo-form">
<input required name="add-item" placeholder="Enter new task..." class="form-input add-item" />
<div class="circle" >
<i class="fas fa-plus plus" ></i>
</div>
</form>
</div>
</div> 
`;

// Add event listener to the form
document.querySelector('.js-add-todo-form').addEventListener('submit', addTodo);
document.querySelector('.circle').addEventListener('click', addItem);
// Fetch the initial data
fetchData();
