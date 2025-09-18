document.addEventListener('DOMContentLoaded', () => {
    const productSearchInput = document.getElementById('product-search');
    const addProductBtn = document.getElementById('add-product-btn');
    const cartBody = document.getElementById('cart-body');
    const subtotalDisplay = document.getElementById('subtotal-display');
    const totalDisplay = document.getElementById('total-display');
    const paymentAmountInput = document.getElementById('payment-amount');
    const changeDisplay = document.getElementById('change-display');
    const completeSaleBtn = document.getElementById('complete-sale-btn');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const dailySaleNumberElement = document.getElementById('daily-sale-number');

    const storageKey = 'inventoryData';
    const loadProducts = () => {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            return JSON.parse(storedData);
        }
        const initialProducts = [
            { id: 1, name: "Laptop HP Pavilion", precio_venta: 850.50, stock: 50 },
            { id: 2, name: "Mouse Logitech M185", precio_venta: 15.99, stock: 120 },
            { id: 3, name: "Teclado Mecánico Redragon", precio_venta: 65.00, stock: 35 },
            { id: 4, name: "Monitor Samsung 24 pulgadas", precio_venta: 199.99, stock: 75 },
            { id: 5, name: "Disco Duro Externo 1TB", precio_venta: 49.99, stock: 90 }
        ];
        saveProducts(initialProducts);
        return initialProducts;
    };
    const saveProducts = (data) => {
        localStorage.setItem(storageKey, JSON.stringify(data));
    };

    let cart = [];
    let dailySaleCounter = 0;

    const renderCart = () => {
        cartBody.innerHTML = '';
        let subtotal = 0;
        cart.forEach(item => {
            const row = document.createElement('tr');
            const itemSubtotal = item.precio_venta * item.quantity;
            subtotal += itemSubtotal;
            row.innerHTML = `
                <td>${item.name}</td>
                <td><input type="number" class="quantity-input" data-id="${item.id}" value="${item.quantity}" min="1"></td>
                <td>$${item.precio_venta.toFixed(2)}</td>
                <td>$${itemSubtotal.toFixed(2)}</td>
                <td><button class="remove-btn" data-id="${item.id}">X</button></td>
            `;
            cartBody.appendChild(row);
        });
        updateTotals(subtotal);
    };

    const updateTotals = (subtotal) => {
        const total = subtotal;
        subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
        totalDisplay.textContent = `$${total.toFixed(2)}`;
        calculateChange();
    };

    const calculateChange = () => {
        const total = parseFloat(totalDisplay.textContent.replace('$', ''));
        const payment = parseFloat(paymentAmountInput.value) || 0;
        const change = payment - total;
        changeDisplay.textContent = `$${change.toFixed(2)}`;
    };
    
    const showSuggestions = (matches) => {
        suggestionsContainer.innerHTML = '';
        if (matches.length > 0) {
            matches.forEach(product => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = product.name;
                suggestionsContainer.appendChild(suggestionItem);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    };

    productSearchInput.addEventListener('input', (e) => {
        const products = loadProducts();
        const searchTerm = e.target.value.trim().toLowerCase();
        if (searchTerm.length > 0) {
            const matches = products.filter(p => p.name.toLowerCase().includes(searchTerm) && p.stock > 0);
            showSuggestions(matches);
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });

    suggestionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
            productSearchInput.value = e.target.textContent;
            suggestionsContainer.style.display = 'none';
            productSearchInput.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            suggestionsContainer.style.display = 'none';
        }
    });

    addProductBtn.addEventListener('click', () => {
        const products = loadProducts();
        const productName = productSearchInput.value.trim().toLowerCase();
        const productToAdd = products.find(p => p.name.toLowerCase() === productName);

        if (productToAdd) {
            if (productToAdd.stock > 0) {
                const existingItem = cart.find(item => item.id === productToAdd.id);
                if (existingItem) {
                    if (existingItem.quantity < productToAdd.stock) {
                        existingItem.quantity += 1;
                    } else {
                        alert(`No hay suficiente stock de ${productToAdd.name}. Stock actual: ${productToAdd.stock}`);
                    }
                } else {
                    cart.push({ ...productToAdd, quantity: 1 });
                }
                renderCart();
                productSearchInput.value = '';
                suggestionsContainer.style.display = 'none';
            } else {
                alert(`Producto sin stock: ${productToAdd.name}`);
            }
        } else {
            alert("Producto no encontrado. Por favor, selecciona uno de la lista de sugerencias o ingresa el nombre completo.");
        }
    });

    cartBody.addEventListener('input', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const products = loadProducts();
            const id = parseInt(e.target.dataset.id);
            const newQuantity = parseInt(e.target.value);
            const item = cart.find(i => i.id === id);
            const productInStock = products.find(p => p.id === id);
            if (item && newQuantity >= 1) {
                if (newQuantity <= productInStock.stock) {
                    item.quantity = newQuantity;
                    renderCart();
                } else {
                    alert(`No hay suficiente stock para ${item.name}. Stock actual: ${productInStock.stock}`);
                    e.target.value = item.quantity;
                }
            }
        }
    });
    
    cartBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const id = parseInt(e.target.dataset.id);
            cart = cart.filter(item => item.id !== id);
            renderCart();
        }
    });

    paymentAmountInput.addEventListener('input', calculateChange);

    completeSaleBtn.addEventListener('click', () => {
        const products = loadProducts();
        const total = parseFloat(totalDisplay.textContent.replace('$', ''));
        const payment = parseFloat(paymentAmountInput.value) || 0;

        if (cart.length === 0) {
            alert("El carrito está vacío. Por favor, agrega productos.");
            return;
        }

        if (payment < total) {
            alert("El monto recibido es insuficiente. Por favor, verifique el pago.");
            return;
        }

        const saleData = {
            items: cart,
            total: total,
            payment: payment,
            change: payment - total,
            date: new Date().toISOString()
        };

        cart.forEach(cartItem => {
            const productIndex = products.findIndex(p => p.id === cartItem.id);
            if (productIndex !== -1) {
                products[productIndex].stock -= cartItem.quantity;
            }
        });
        saveProducts(products);

        console.log("Datos de la venta:", saleData);
        alert(`¡Venta completada! Su cambio es de $${(payment - total).toFixed(2)}.`);

        dailySaleCounter++;
        dailySaleNumberElement.textContent = dailySaleCounter;

        cart = [];
        renderCart();
        paymentAmountInput.value = '';
        productSearchInput.value = '';
    });

    dailySaleNumberElement.textContent = dailySaleCounter;
});