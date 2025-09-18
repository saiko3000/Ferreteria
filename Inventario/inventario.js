document.addEventListener('DOMContentLoaded', () => {
    // === Elementos del DOM ===
    const inventoryBody = document.getElementById('inventory-body');
    const productSearchInput = document.getElementById('product-search');
    const showFormBtn = document.getElementById('show-form-btn');
    const formContainer = document.getElementById('product-form-container');
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productStockInput = document.getElementById('product-stock');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // === Simulación de una base de datos de productos usando localStorage ===
    const storageKey = 'inventoryData';

    // Función para guardar los datos en localStorage
    const saveInventory = (data) => {
        localStorage.setItem(storageKey, JSON.stringify(data));
    };

    // Función para cargar los datos desde localStorage
    const loadInventory = () => {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            return JSON.parse(storedData);
        }
        // Si no hay datos, inicializar con datos de prueba
        return [
            { id: 1, name: "Laptop HP Pavilion", precio_venta: 850.50, stock: 50 },
            { id: 2, name: "Mouse Logitech M185", precio_venta: 15.99, stock: 120 },
            { id: 3, name: "Teclado Mecánico Redragon", precio_venta: 65.00, stock: 35 },
            { id: 4, name: "Monitor Samsung 24 pulgadas", precio_venta: 199.99, stock: 75 },
            { id: 5, name: "Disco Duro Externo 1TB", precio_venta: 49.99, stock: 90 }
        ];
    };

    let inventory = loadInventory();
    let nextId = inventory.length > 0 ? Math.max(...inventory.map(p => p.id)) + 1 : 1;

    // === Funciones de la Interfaz ===
    const renderTable = (products) => {
        inventoryBody.innerHTML = '';
        if (products.length === 0) {
            inventoryBody.innerHTML = '<tr><td colspan="5" class="no-results">No se encontraron productos.</td></tr>';
            return;
        }
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$${product.precio_venta.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-id="${product.id}">Editar</button>
                    <button class="delete-btn" data-id="${product.id}">Eliminar</button>
                </td>
            `;
            inventoryBody.appendChild(row);
        });
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();

        const id = productIdInput.value;
        const name = productNameInput.value;
        const price = parseFloat(productPriceInput.value);
        const stock = parseInt(productStockInput.value);

        if (id) {
            const productIndex = inventory.findIndex(p => p.id === parseInt(id));
            if (productIndex !== -1) {
                inventory[productIndex] = { id: parseInt(id), name, precio_venta: price, stock };
            }
        } else {
            const newProduct = {
                id: nextId++,
                name,
                precio_venta: price,
                stock
            };
            inventory.push(newProduct);
        }
        
        saveInventory(inventory); // Guardar los cambios en localStorage
        productForm.reset();
        hideForm();
        renderTable(inventory);
    };

    const handleTableClick = (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const id = parseInt(event.target.dataset.id);
            const productToEdit = inventory.find(p => p.id === id);
            
            if (productToEdit) {
                showForm();
                document.querySelector('#product-form-container h2').textContent = "Editar Producto";
                submitBtn.textContent = "Guardar Cambios";
                productIdInput.value = productToEdit.id;
                productNameInput.value = productToEdit.name;
                productPriceInput.value = productToEdit.precio_venta;
                productStockInput.value = productToEdit.stock;
            }
        }
        
        if (event.target.classList.contains('delete-btn')) {
            const id = parseInt(event.target.dataset.id);
            if (confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${id}?`)) {
                inventory = inventory.filter(p => p.id !== id);
                saveInventory(inventory); // Guardar los cambios
                renderTable(inventory);
            }
        }
    };

    const showForm = () => {
        formContainer.classList.add('active');
        showFormBtn.style.display = 'none';
    };

    const hideForm = () => {
        formContainer.classList.remove('active');
        showFormBtn.style.display = 'block';
        document.querySelector('#product-form-container h2').textContent = "Agregar Producto";
        submitBtn.textContent = "Guardar Producto";
        productForm.reset();
        productIdInput.value = '';
    };

    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredProducts = inventory.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredProducts);
    };

    // === Event Listeners ===
    showFormBtn.addEventListener('click', showForm);
    cancelBtn.addEventListener('click', hideForm);
    productForm.addEventListener('submit', handleFormSubmit);
    inventoryBody.addEventListener('click', handleTableClick);
    productSearchInput.addEventListener('input', handleSearch);

    // === Inicialización de la interfaz ===
    renderTable(inventory);
});