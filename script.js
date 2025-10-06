// Global variables
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentUser = null;
const exchangeRate = 12; // 1 USD = 12 GHS

// Function to show the selected page and hide others
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  // Show the selected page
  document.getElementById(pageId).classList.add("active");

  // Update active navigation link
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.remove("active");
  });
  document
    .querySelector(`nav a[onclick="showPage('${pageId}')"]`)
    .classList.add("active");

  // If cart page, update cart display
  if (pageId === "cart") {
    updateCartDisplay();
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

// Function to switch between login and signup tabs
function switchAuthTab(tab) {
  document
    .querySelectorAll(".auth-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".auth-form")
    .forEach((f) => f.classList.remove("active"));

  document
    .querySelector(`.auth-tab:nth-child(${tab === "login" ? 1 : 2})`)
    .classList.add("active");
  document.getElementById(`${tab}-form`).classList.add("active");
}

// Function to add product to cart
function addToCart(name, price, image) {
  // Check if product already in cart
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: name,
      price: price,
      image: image,
      quantity: 1,
    });
  }

  // Update cart count
  updateCartCount();

  // Save to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Show confirmation message
  alert(`${name} added to cart!`);
}

// Function to update cart count in header
function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById("cart-count").textContent = totalItems;
}

// Function to update cart display
function updateCartDisplay() {
  const cartItems = document.getElementById("cart-items");
  const mobileCart = document.getElementById("mobile-cart");
  const cartSubtotal = document.getElementById("cart-subtotal");
  const cartShipping = document.getElementById("cart-shipping");
  const cartTax = document.getElementById("cart-tax");
  const cartTotal = document.getElementById("cart-total");

  // Clear existing items
  cartItems.innerHTML = "";
  mobileCart.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<tr><td colspan="5" style="text-align: center; padding: 30px;">Your cart is empty</td></tr>';
    mobileCart.innerHTML =
      '<div style="text-align: center; padding: 30px;">Your cart is empty</div>';
    cartSubtotal.textContent = "₵0.00";
    cartShipping.textContent = "₵0.00";
    cartTax.textContent = "₵0.00";
    cartTotal.textContent = "₵0.00";
    return;
  }

  // Calculate totals
  let subtotal = 0;

  // Add items to cart tables
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    // Desktop table row
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center;">
                            <img src="${item.image}" alt="${
      item.name
    }" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
                            <div style="margin-left: 15px;">
                                <h3>${item.name}</h3>
                            </div>
                        </div>
                    </td>
                    <td>₵${item.price.toFixed(2)}</td>
                    <td>
                        <div class="quantity">
                            <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                            <input type="text" class="quantity-input" value="${
                              item.quantity
                            }" onchange="updateQuantityInput(${index}, this.value)">
                            <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                    </td>
                    <td>₵${itemTotal.toFixed(2)}</td>
                    <td><span class="remove-item" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></span></td>
                `;
    cartItems.appendChild(row);

    // Mobile cart item
    const mobileItem = document.createElement("div");
    mobileItem.className = "cart-item-mobile";
    mobileItem.innerHTML = `
                    <img src="${item.image}" alt="${
      item.name
    }" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <p>₵${item.price.toFixed(2)}</p>
                        <div class="quantity">
                            <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                            <input type="text" class="quantity-input" value="${
                              item.quantity
                            }" onchange="updateQuantityInput(${index}, this.value)">
                            <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                        <p>Total: ₵${itemTotal.toFixed(2)}</p>
                        <span class="remove-item" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i> Remove</span>
                    </div>
                `;
    mobileCart.appendChild(mobileItem);
  });

  // Calculate shipping (free over ₵1000, otherwise ₵50)
  const shipping = subtotal > 1000 ? 0 : 50;

  // Calculate tax (12.5% of subtotal)
  const tax = subtotal * 0.125;

  // Calculate total
  const total = subtotal + shipping + tax;

  // Update totals display
  cartSubtotal.textContent = `₵${subtotal.toFixed(2)}`;
  cartShipping.textContent = `₵${shipping.toFixed(2)}`;
  cartTax.textContent = `₵${tax.toFixed(2)}`;
  cartTotal.textContent = `₵${total.toFixed(2)}`;
}

// Function to update item quantity
function updateQuantity(index, change) {
  cart[index].quantity += change;

  // Remove item if quantity is 0 or less
  if (cart[index].quantity <= 0) {
    removeFromCart(index);
    return;
  }

  // Update cart display
  updateCartDisplay();
  updateCartCount();

  // Save to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Function to update quantity from input
function updateQuantityInput(index, value) {
  const quantity = parseInt(value) || 1;
  cart[index].quantity = quantity;

  // Update cart display
  updateCartDisplay();
  updateCartCount();

  // Save to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Function to remove item from cart
function removeFromCart(index) {
  if (confirm("Are you sure you want to remove this item from your cart?")) {
    cart.splice(index, 1);
    updateCartDisplay();
    updateCartCount();

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

// Function to filter products by category
function filterProducts(gender) {
  const checkboxes = document.querySelectorAll(
    `#${gender} input[type="checkbox"]:checked`
  );
  const selectedCategories = Array.from(checkboxes).map((cb) => cb.value);
  const products = document.querySelectorAll(`#${gender}-products .product`);

  products.forEach((product) => {
    const productCategory = product.getAttribute("data-category");

    if (
      selectedCategories.length === 0 ||
      selectedCategories.includes(productCategory)
    ) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}

// Function to select payment method
function selectPayment(method) {
  document
    .querySelectorAll(".payment-method")
    .forEach((pm) => pm.classList.remove("active"));
  document
    .querySelector(
      `.payment-method:nth-child(${
        method === "mobile-money" ? 1 : method === "card" ? 2 : 3
      })`
    )
    .classList.add("active");
}

// Function to handle user login
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  // Simple validation
  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  // Set current user
  currentUser = {
    email: email,
    name: email.split("@")[0], // Simple way to get a name from email
  };

  // Update UI for logged in state
  document.getElementById("auth-link").textContent = "Logout";
  document.getElementById("auth-link").setAttribute("onclick", "logout()");
  document.getElementById("user-icon").style.display = "block";
  document.getElementById("user-name").textContent = currentUser.name;

  // Show success message and redirect to user dashboard
  alert("Login successful!");
  showPage("user-dashboard");
}

// Function to handle user signup
function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const phone = document.getElementById("signup-phone").value;

  // Simple validation
  if (!name || !email || !password || !phone) {
    alert("Please fill in all fields");
    return;
  }

  // Set current user
  currentUser = {
    name: name,
    email: email,
    phone: phone,
  };

  // Update UI for logged in state
  document.getElementById("auth-link").textContent = "Logout";
  document.getElementById("auth-link").setAttribute("onclick", "logout()");
  document.getElementById("user-icon").style.display = "block";
  document.getElementById("user-name").textContent = currentUser.name;

  // Show success message and redirect to user dashboard
  alert("Account created successfully!");
  showPage("user-dashboard");
}

// Function to handle user logout
function logout() {
  currentUser = null;

  // Update UI for logged out state
  document.getElementById("auth-link").textContent = "Login";
  document
    .getElementById("auth-link")
    .setAttribute("onclick", "showPage('login')");
  document.getElementById("user-icon").style.display = "none";

  // Show message and redirect to home
  alert("You have been logged out");
  showPage("home");
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Update cart count on page load
  updateCartCount();

  // Add event listeners to login/signup forms
  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document
    .getElementById("signup-form")
    .addEventListener("submit", handleSignup);

  // Add event listener to payment form
  document
    .getElementById("payment-form-details")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Payment processed successfully! Thank you for your order.");
      cart = [];
      updateCartCount();
      localStorage.setItem("cart", JSON.stringify(cart));
      showPage("home");
    });

  // Check for saved dark mode preference
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("theme-icon").className = "fas fa-sun";
  }

  // Add event listener to theme toggle
  document
    .getElementById("theme-toggle")
    .addEventListener("click", toggleDarkMode);

  // Add event listener to contact form
  document
    .getElementById("contact-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Your message has been sent successfully!");
      this.reset();
    });

  // Add event listener to newsletter form
  document
    .querySelector(".newsletter-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Thank you for subscribing to our newsletter!");
      this.reset();
    });
});

// API Base URL
const API_BASE = 'http://localhost/fine-outlet/api';

// API Functions
class FineOutletAPI {
    // User Authentication
    static async login(email, password) {
        const response = await fetch(`${API_BASE}/auth/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    }

    static async register(userData) {
        const response = await fetch(`${API_BASE}/auth/register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    }

    // Products
    static async getProducts(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE}/products.php?${queryParams}`);
        return response.json();
    }

    static async getProduct(id) {
        const response = await fetch(`${API_BASE}/products.php?id=${id}`);
        return response.json();
    }

    // Cart Operations
    static async getCart(userId) {
        const response = await fetch(`${API_BASE}/cart.php?user_id=${userId}`);
        return response.json();
    }

    static async addToCart(cartItem) {
        const response = await fetch(`${API_BASE}/cart.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartItem)
        });
        return response.json();
    }

    static async updateCart(itemId, quantity) {
        const response = await fetch(`${API_BASE}/cart.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_id: itemId, quantity })
        });
        return response.json();
    }

    static async removeFromCart(itemId) {
        const response = await fetch(`${API_BASE}/cart.php`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_id: itemId })
        });
        return response.json();
    }

    // Orders
    static async createOrder(orderData) {
        const response = await fetch(`${API_BASE}/orders.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return response.json();
    }

    static async getOrders(userId) {
        const response = await fetch(`${API_BASE}/orders.php?user_id=${userId}`);
        return response.json();
    }
}

// Update your existing functions to use the API
async function addToCart(productId, name, price, image, quantity = 1) {
    if (!currentUser) {
        // Fallback to localStorage if not logged in
        const existingItem = cart.find(item => item.product_id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                product_id: productId,
                name: name,
                price: price,
                image: image,
                quantity: quantity
            });
        }
        updateCartCount();
        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`${name} added to cart!`);
        return;
    }

    try {
        const result = await FineOutletAPI.addToCart({
            user_id: currentUser.id,
            product_id: productId,
            quantity: quantity
        });
        
        if (result.success) {
            alert(`${name} added to cart!`);
            await syncCartWithServer();
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding item to cart. Please try again.');
    }
}

async function syncCartWithServer() {
    if (!currentUser) return;
    
    try {
        const serverCart = await FineOutletAPI.getCart(currentUser.id);
        cart = serverCart;
        updateCartCount();
        updateCartDisplay();
    } catch (error) {
        console.error('Error syncing cart:', error);
    }
}

// Global variables
let cart = [];
let currentUser = null;
let authToken = localStorage.getItem('authToken');
const API_BASE = 'http://localhost/fine-outlet/api'; // Update with your path

// API Service
class FineOutletAPI {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE}/${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    static async login(email, password) {
        return this.request('auth/login.php', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(userData) {
        return this.request('auth/register.php', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Products
    static async getProducts(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`products.php?${params}`);
    }

    // Cart
    static async getCart() {
        return this.request('cart.php');
    }

    static async addToCart(productId, quantity = 1) {
        return this.request('cart.php', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity })
        });
    }

    static async updateCart(cartId, quantity) {
        return this.request('cart.php', {
            method: 'PUT',
            body: JSON.stringify({ cart_id: cartId, quantity })
        });
    }

    static async removeFromCart(cartId) {
        return this.request('cart.php', {
            method: 'DELETE',
            body: JSON.stringify({ cart_id: cartId })
        });
    }

    // Orders
    static async createOrder(orderData) {
        return this.request('orders.php', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    static async getOrders() {
        return this.request('orders.php');
    }
}

// Authentication functions
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const result = await FineOutletAPI.login(email, password);
        
        if (result.success) {
            authToken = result.token;
            currentUser = result.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            updateAuthUI();
            alert('Login successful!');
            showPage('home');
        }
    } catch (error) {
        alert(error.message || 'Login failed');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const phone = document.getElementById('signup-phone').value;

    try {
        const result = await FineOutletAPI.register({ name, email, password, phone });
        
        if (result.success) {
            authToken = result.token;
            currentUser = result.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            updateAuthUI();
            alert('Registration successful!');
            showPage('user-dashboard');
        }
    } catch (error) {
        alert(error.message || 'Registration failed');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    cart = [];
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    updateAuthUI();
    updateCartCount();
    alert('You have been logged out');
    showPage('home');
}

function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const userIcon = document.getElementById('user-icon');
    
    if (currentUser) {
        authLink.textContent = 'Logout';
        authLink.setAttribute('onclick', 'logout()');
        userIcon.style.display = 'block';
        
        if (document.getElementById('user-name')) {
            document.getElementById('user-name').textContent = currentUser.name;
        }
    } else {
        authLink.textContent = 'Login';
        authLink.setAttribute('onclick', "showPage('login')");
        userIcon.style.display = 'none';
    }
}

// Cart functions
async function addToCart(productId, name, price, image) {
    if (!currentUser) {
        alert('Please login to add items to cart');
        showPage('login');
        return;
    }

    try {
        await FineOutletAPI.addToCart(productId, 1);
        await syncCartWithServer();
        alert(`${name} added to cart!`);
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding item to cart');
    }
}

async function syncCartWithServer() {
    if (!currentUser) return;
    
    try {
        const result = await FineOutletAPI.getCart();
        cart = result.cart || [];
        updateCartCount();
        
        if (document.getElementById('cart').classList.contains('active')) {
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Error syncing cart:', error);
    }
}

async function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const mobileCart = document.getElementById('mobile-cart');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartShipping = document.getElementById('cart-shipping');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');

    // Clear existing items
    cartItems.innerHTML = '';
    mobileCart.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Your cart is empty</td></tr>';
        mobileCart.innerHTML = '<div style="text-align: center; padding: 30px;">Your cart is empty</div>';
        cartSubtotal.textContent = '₵0.00';
        cartShipping.textContent = '₵0.00';
        cartTax.textContent = '₵0.00';
        cartTotal.textContent = '₵0.00';
        return;
    }

    let subtotal = 0;

    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        // Desktop table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center;">
                    <img src="${item.image_url}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
                    <div style="margin-left: 15px;">
                        <h3>${item.name}</h3>
                    </div>
                </div>
            </td>
            <td>₵${parseFloat(item.price).toFixed(2)}</td>
            <td>
                <div class="quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="text" class="quantity-input" value="${item.quantity}" onchange="updateQuantityInput(${item.id}, this.value)">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </td>
            <td>₵${itemTotal.toFixed(2)}</td>
            <td><span class="remove-item" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></span></td>
        `;
        cartItems.appendChild(row);

        // Mobile cart item
        const mobileItem = document.createElement('div');
        mobileItem.className = 'cart-item-mobile';
        mobileItem.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>₵${parseFloat(item.price).toFixed(2)}</p>
                <div class="quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="text" class="quantity-input" value="${item.quantity}" onchange="updateQuantityInput(${item.id}, this.value)">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <p>Total: ₵${itemTotal.toFixed(2)}</p>
                <span class="remove-item" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i> Remove</span>
            </div>
        `;
        mobileCart.appendChild(mobileItem);
    });

    // Calculate totals
    const shipping = subtotal > 1000 ? 0 : 50;
    const tax = subtotal * 0.125;
    const total = subtotal + shipping + tax;

    cartSubtotal.textContent = `₵${subtotal.toFixed(2)}`;
    cartShipping.textContent = `₵${shipping.toFixed(2)}`;
    cartTax.textContent = `₵${tax.toFixed(2)}`;
    cartTotal.textContent = `₵${total.toFixed(2)}`;
}

async function updateQuantity(cartId, newQuantity) {
    if (newQuantity <= 0) {
        await removeFromCart(cartId);
        return;
    }

    try {
        await FineOutletAPI.updateCart(cartId, newQuantity);
        await syncCartWithServer();
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

async function updateQuantityInput(cartId, value) {
    const quantity = parseInt(value) || 1;
    await updateQuantity(cartId, quantity);
}

async function removeFromCart(cartId) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        try {
            await FineOutletAPI.removeFromCart(cartId);
            await syncCartWithServer();
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing authentication
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
        updateAuthUI();
        syncCartWithServer();
    }
    
    // Add event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    
    // Payment form
    document.getElementById('payment-form-details').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            alert('Please login to complete your order');
            showPage('login');
            return;
        }
        
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        try {
            // Calculate order totals
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal > 1000 ? 0 : 50;
            const tax = subtotal * 0.125;
            const total = subtotal + shipping + tax;
            
            const orderData = {
                user_id: currentUser.id,
                total_amount: total,
                subtotal: subtotal,
                tax_amount: tax,
                shipping_amount: shipping,
                shipping_address: "User address", // You'll need to collect this
                payment_method: 'card',
                items: cart.map(item => ({
                    product_id: item.product_id,
                    product_name: item.name,
                    product_price: item.price,
                    quantity: item.quantity,
                    total_price: item.price * item.quantity
                }))
            };
            
            const result = await FineOutletAPI.createOrder(orderData);
            
            if (result.success) {
                alert('Order placed successfully! Thank you for your purchase.');
                // Clear cart
                for (const item of cart) {
                    await FineOutletAPI.removeFromCart(item.id);
                }
                await syncCartWithServer();
                showPage('home');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Error processing order. Please try again.');
        }
    });

    
    // Contact form
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Your message has been sent successfully!');
        this.reset();
    });
    
    // Newsletter form
    document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for subscribing to our newsletter!');
        this.reset();
    });
});

// Keep your existing showPage, switchAuthTab, filterProducts, selectPayment functions
// They should remain the same as in your original code
