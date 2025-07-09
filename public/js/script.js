 // Base URL for the API. Adjust if your backend is on a different port or host.
        const API_BASE_URL = 'http://localhost:3000/api';

        // DOM Elements
        const loginSection = document.getElementById('login-section');
        const registerSection = document.getElementById('register-section');
        const dessertsListSection = document.getElementById('desserts-list-section');
        const dessertDetailSection = document.getElementById('dessert-detail-section');
        const dessertFormSection = document.getElementById('dessert-form-section');

        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const dessertForm = document.getElementById('dessert-form');

        const dessertsContainer = document.getElementById('desserts-container');
        const dessertDetailContent = document.getElementById('dessert-detail-content');
        const dessertFormTitle = document.getElementById('dessert-form-title');

        const navLoginBtn = document.getElementById('nav-login');
        const navRegisterBtn = document.getElementById('nav-register');
        const navDessertsBtn = document.getElementById('nav-desserts');
        const navCreateDessertBtn = document.getElementById('nav-create-dessert');
        const navLogoutBtn = document.getElementById('nav-logout');
        const userInfoSpan = document.getElementById('user-info');

        const editDessertBtn = document.getElementById('edit-dessert-btn');
        const deleteDessertBtn = document.getElementById('delete-dessert-btn');
        const backToListBtn = document.getElementById('back-to-list-btn');
        const cancelDessertFormBtn = document.getElementById('cancel-dessert-form');

        const messageBox = document.getElementById('message-box');

        // State variables
        let userToken = localStorage.getItem('token') || null;
        let userName = localStorage.getItem('userName') || null;

        // --- Utility Functions ---

        /**
         * Displays a message to the user.
         * @param {string} message - The message to display.
         * @param {boolean} isError - True if it's an error message, false for success.
         */
        function showMessage(message, isError = false) {
            messageBox.textContent = message;
            messageBox.classList.remove('error');
            if (isError) {
                messageBox.classList.add('error');
            }
            messageBox.classList.add('show');
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 3000); // Message disappears after 3 seconds
        }

        /**
         * Hides all main sections.
         */
        function hideAllSections() {
            loginSection.classList.add('hidden');
            registerSection.classList.add('hidden');
            dessertsListSection.classList.add('hidden');
            dessertDetailSection.classList.add('hidden');
            dessertFormSection.classList.add('hidden');
        }

        /**
         * Shows a specific section and hides others.
         * @param {HTMLElement} section - The section to show.
         */
        function showSection(section) {
            hideAllSections();
            section.classList.remove('hidden');
        }

        /**
         * Updates the visibility of navigation buttons based on authentication status.
         */
        function updateNavButtons() {
            if (userToken) {
                navLoginBtn.classList.add('hidden');
                navRegisterBtn.classList.add('hidden');
                navCreateDessertBtn.classList.remove('hidden');
                navLogoutBtn.classList.remove('hidden');
                userInfoSpan.classList.remove('hidden');
                userInfoSpan.textContent = `¡Hola, ${userName}!`;
            } else {
                navLoginBtn.classList.remove('hidden');
                navRegisterBtn.classList.remove('hidden');
                navCreateDessertBtn.classList.add('hidden');
                navLogoutBtn.classList.add('hidden');
                userInfoSpan.classList.add('hidden');
                userInfoSpan.textContent = '';
            }
        }

        // --- Authentication Functions ---

        /**
         * Handles user registration.
         * @param {Event} event - The form submission event.
         */
        async function handleRegister(event) {
            event.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            try {
                const response = await fetch(`${API_BASE_URL}/usuarias/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: name, correo: email, contraseña: password })
                });
                const data = await response.json();

                if (response.ok) {
                    showMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
                    document.getElementById('register-form').reset();
                    showSection(loginSection); // Redirect to login after successful registration
                } else {
                    showMessage(data.error || 'Error al registrarse.', true);
                }
            } catch (error) {
                console.error('Error de red al registrarse:', error);
                showMessage('Error de conexión al registrarse.', true);
            }
        }

        /**
         * Handles user login.
         * @param {Event} event - The form submission event.
         */
        async function handleLogin(event) {
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_BASE_URL}/usuarias/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo: email, contraseña: password })
                });
                const data = await response.json();

                if (response.ok) {
                    userToken = data.token;
                    userName = data.nombre; // Get the user's name from the response
                    localStorage.setItem('token', userToken);
                    localStorage.setItem('userName', userName);
                    showMessage(`¡Bienvenido, ${userName}!`);
                    updateNavButtons();
                    fetchDesserts(); // Load desserts after successful login
                } else {
                    showMessage(data.error || 'Error al iniciar sesión.', true);
                }
            } catch (error) {
                console.error('Error de red al iniciar sesión:', error);
                showMessage('Error de conexión al iniciar sesión.', true);
            }
        }

        /**
         * Handles user logout.
         */
        function handleLogout() {
            userToken = null;
            userName = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            showMessage('Sesión cerrada correctamente.');
            updateNavButtons();
            showSection(loginSection); // Go back to login screen
        }

        /**
         * Checks if the user is authenticated by verifying the token.
         */
        async function checkAuth() {
            if (userToken) {
                try {
                    const response = await fetch(`${API_BASE_URL}/usuarias/verificar-token`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${userToken}` }
                    });
                    const data = await response.json();
                    if (response.ok && data.valido) {
                        userName = data.usuario.nombre; // Update userName from verified token
                        localStorage.setItem('userName', userName); // Ensure it's stored
                        updateNavButtons();
                        fetchDesserts(); // Fetch desserts if authenticated
                    } else {
                        handleLogout(); // Token invalid or expired
                    }
                } catch (error) {
                    console.error('Error al verificar token:', error);
                    handleLogout(); // Network error or other issue
                }
            } else {
                updateNavButtons();
                showSection(loginSection); // Show login if no token
            }
        }

        // --- Dessert Management Functions ---

        /**
         * Fetches all desserts and displays them.
         */
        async function fetchDesserts() {
            showSection(dessertsListSection);
            dessertsContainer.innerHTML = '<p class="text-center text-pink-500">Cargando postres...</p>';
            try {
                const response = await fetch(`${API_BASE_URL}/postres`);
                const desserts = await response.json();

                if (response.ok) {
                    renderDesserts(desserts);
                } else {
                    showMessage(desserts.error || 'Error al cargar los postres.', true);
                    dessertsContainer.innerHTML = '<p class="text-center text-red-500">No se pudieron cargar los postres.</p>';
                }
            } catch (error) {
                console.error('Error de red al obtener postres:', error);
                showMessage('Error de conexión al obtener postres.', true);
                dessertsContainer.innerHTML = '<p class="text-center text-red-500">Error de conexión.</p>';
            }
        }

        /**
         * Renders the list of desserts in the container.
         * @param {Array} desserts - An array of dessert objects.
         */
        function renderDesserts(desserts) {
            dessertsContainer.innerHTML = ''; // Clear previous content
            if (desserts.length === 0) {
                dessertsContainer.innerHTML = '<p class="text-center text-pink-500">No hay postres disponibles aún. ¡Sé el primero en añadir uno!</p>';
                return;
            }

            desserts.forEach(dessert => {
                const dessertCard = document.createElement('div');
                dessertCard.className = 'card cursor-pointer flex flex-col items-center text-center';
                
                // Mejor manejo de imágenes
                let imageUrl = 'https://placehold.co/300x200/ffc0cb/ffffff?text=Postre';
                if (dessert.imagen && dessert.imagen.trim() !== '') {
                    imageUrl = dessert.imagen;
                }
                
                dessertCard.innerHTML = `
                    <img src="${imageUrl}" alt="${dessert.nombre}" class="rounded-lg mb-4 w-full h-48 object-cover">
                    <h3 class="text-2xl font-bold text-pink-700 mb-2">${dessert.nombre}</h3>
                    <p class="text-xl text-pink-500 font-semibold mb-2">$${(parseFloat(dessert.precio) || 0).toFixed(2)}</p>
                    <p class="text-gray-600 text-sm">${dessert.descripcion ? dessert.descripcion.substring(0, 70) + '...' : 'Sin descripción'}</p>
                    <p class="text-sm text-gray-500 mt-2">Stock: ${dessert.stock}</p>
                `;
                dessertCard.addEventListener('click', () => fetchDessertById(dessert.id));
                dessertsContainer.appendChild(dessertCard);
            });
        }

        /**
         * Fetches and displays details for a single dessert.
         * @param {number} id - The ID of the dessert.
         */
        async function fetchDessertById(id) {
            showSection(dessertDetailSection);
            dessertDetailContent.innerHTML = '<p class="text-center text-pink-500">Cargando detalles del postre...</p>';
            try {
                const response = await fetch(`${API_BASE_URL}/postres/${id}`);
                const dessert = await response.json();

                if (response.ok) {
                    renderDessertDetail(dessert);
                    // Show edit/delete buttons only if authenticated
                    if (userToken) {
                        editDessertBtn.classList.remove('hidden');
                        deleteDessertBtn.classList.remove('hidden');
                        editDessertBtn.dataset.id = dessert.id;
                        deleteDessertBtn.dataset.id = dessert.id;
                    } else {
                        editDessertBtn.classList.add('hidden');
                        deleteDessertBtn.classList.add('hidden');
                    }
                } else {
                    showMessage(dessert.error || 'Error al cargar el postre.', true);
                    dessertDetailContent.innerHTML = '<p class="text-center text-red-500">No se pudo cargar el postre.</p>';
                }
            } catch (error) {
                console.error('Error de red al obtener postre por ID:', error);
                showMessage('Error de conexión al obtener postre.', true);
                dessertDetailContent.innerHTML = '<p class="text-center text-red-500">Error de conexión.</p>';
            }
        }

        /**
         * Renders the details of a single dessert.
         * @param {Object} dessert - The dessert object to display.
         */
        function renderDessertDetail(dessert) {
            // Mejor manejo de imágenes para la vista detallada
            let imageUrl = 'https://placehold.co/600x400/ffc0cb/ffffff?text=Postre+Detalle';
            if (dessert.imagen && dessert.imagen.trim() !== '') {
                imageUrl = dessert.imagen;
            }
            
            dessertDetailContent.innerHTML = `
                <img src="${imageUrl}" alt="${dessert.nombre}" class="rounded-lg mb-6 w-full h-64 object-cover">
                <h3 class="text-3xl font-bold text-pink-700 mb-2">${dessert.nombre}</h3>
                <p class="text-2xl text-pink-500 font-semibold mb-4">$${(parseFloat(dessert.precio) || 0).toFixed(2)}</p>
                <p class="text-gray-700 text-lg mb-4">${dessert.descripcion || 'Sin descripción detallada.'}</p>
                <p class="text-lg text-gray-600">Stock disponible: <span class="font-bold">${dessert.stock}</span></p>
            `;
        }

        /**
         * Prepares the form for creating a new dessert.
         */
        function showCreateDessertForm() {
            if (!userToken) {
                showMessage('Necesitas iniciar sesión para crear postres.', true);
                showSection(loginSection);
                return;
            }
            showSection(dessertFormSection);
            dessertFormTitle.textContent = 'Crear Nuevo Postre';
            document.getElementById('dessert-id').value = ''; // Clear ID for creation
            document.getElementById('dessert-name').value = '';
            document.getElementById('dessert-price').value = '';
            document.getElementById('dessert-description').value = '';
            document.getElementById('dessert-stock').value = '';
            document.getElementById('dessert-image').value = '';
        }

        /**
         * Prepares the form for updating an existing dessert.
         * @param {number} id - The ID of the dessert to edit.
         */
        async function showEditDessertForm(id) {
            if (!userToken) {
                showMessage('Necesitas iniciar sesión para editar postres.', true);
                showSection(loginSection);
                return;
            }
            showSection(dessertFormSection);
            dessertFormTitle.textContent = 'Editar Postre';
            try {
                const response = await fetch(`${API_BASE_URL}/postres/${id}`);
                const dessert = await response.json();

                if (response.ok) {
                    document.getElementById('dessert-id').value = dessert.id;
                    document.getElementById('dessert-name').value = dessert.nombre;
                    document.getElementById('dessert-price').value = dessert.precio;
                    document.getElementById('dessert-description').value = dessert.descripcion || '';
                    document.getElementById('dessert-stock').value = dessert.stock;
                    document.getElementById('dessert-image').value = dessert.imagen || '';
                } else {
                    showMessage(dessert.error || 'Error al cargar el postre para editar.', true);
                    showSection(dessertsListSection); // Go back to list if error
                }
            } catch (error) {
                console.error('Error de red al cargar postre para editar:', error);
                showMessage('Error de conexión al cargar postre para editar.', true);
                showSection(dessertsListSection);
            }
        }

        /**
         * Handles the submission of the dessert form (create or update).
         * @param {Event} event - The form submission event.
         */
        async function handleDessertFormSubmit(event) {
            event.preventDefault();
            if (!userToken) {
                showMessage('Necesitas iniciar sesión para realizar esta acción.', true);
                return;
            }

            const id = document.getElementById('dessert-id').value;
            const name = document.getElementById('dessert-name').value;
            const price = parseFloat(document.getElementById('dessert-price').value);
            const description = document.getElementById('dessert-description').value;
            const stock = parseInt(document.getElementById('dessert-stock').value);
            const image = document.getElementById('dessert-image').value;

            const dessertData = {
                nombre: name,
                precio: price,
                descripcion: description,
                stock: stock,
                imagen: image
            };

            try {
                let response;
                if (id) { // Update existing dessert
                    response = await fetch(`${API_BASE_URL}/postres/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userToken}`
                        },
                        body: JSON.stringify(dessertData)
                    });
                } else { // Create new dessert
                    response = await fetch(`${API_BASE_URL}/postres`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userToken}`
                        },
                        body: JSON.stringify(dessertData)
                    });
                }

                const data = await response.json();

                if (response.ok) {
                    showMessage(`Postre ${id ? 'actualizado' : 'creado'} con éxito.`);
                    document.getElementById('dessert-form').reset();
                    fetchDesserts(); // Refresh the list
                } else {
                    showMessage(data.error || `Error al ${id ? 'actualizar' : 'crear'} el postre.`, true);
                }
            } catch (error) {
                console.error('Error de red al guardar postre:', error);
                showMessage('Error de conexión al guardar postre.', true);
            }
        }

        /**
         * Handles the deletion of a dessert.
         * @param {number} id - The ID of the dessert to delete.
         */
        async function handleDeleteDessert(id) {
            if (!userToken) {
                showMessage('Necesitas iniciar sesión para eliminar postres.', true);
                return;
            }

            // Custom confirmation dialog
            const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este postre?');
            if (!confirmDelete) {
                return;
            }

            console.log('Intentando eliminar postre con ID:', id);
            try {
                const response = await fetch(`${API_BASE_URL}/postres/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });
                console.log('Estado de la respuesta de eliminación:', response.status);
                const data = await response.json();
                console.log('Datos de la respuesta de eliminación:', data);

                if (response.ok) {
                    showMessage('Postre eliminado con éxito.');
                    fetchDesserts(); // Refresh the list
                } else {
                    showMessage(data.error || 'Error al eliminar el postre.', true);
                }
            } catch (error) {
                console.error('Error de red al eliminar postre:', error);
                showMessage('Error de conexión al eliminar postre.', true);
            }
        }

        // --- Event Listeners ---
        document.addEventListener('DOMContentLoaded', checkAuth);

        navLoginBtn.addEventListener('click', () => showSection(loginSection));
        navRegisterBtn.addEventListener('click', () => showSection(registerSection));
        navDessertsBtn.addEventListener('click', fetchDesserts);
        navCreateDessertBtn.addEventListener('click', showCreateDessertForm);
        navLogoutBtn.addEventListener('click', handleLogout);

        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        dessertForm.addEventListener('submit', handleDessertFormSubmit);

        editDessertBtn.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            if (id) {
                showEditDessertForm(id);
            }
        });
        deleteDessertBtn.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            if (id) {
                handleDeleteDessert(id);
            }
        });
        backToListBtn.addEventListener('click', fetchDesserts);
        cancelDessertFormBtn.addEventListener('click', fetchDesserts); // Go back to list on cancel