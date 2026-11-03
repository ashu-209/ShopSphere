import { useState, useMemo, useEffect } from 'react';
import './App.css'


const fallbackProducts = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 2499, oldPrice: 3499, emoji: '🎧', color: '#e8eaff', rating: 4.8 },
  { id: 2, name: 'Classic Everyday Watch', category: 'Fashion', price: 1899, oldPrice: 2599, emoji: '⌚', color: '#f8e9d8', rating: 4.6 },
  { id: 3, name: 'Minimal Desk Lamp', category: 'Home', price: 1299, oldPrice: 1799, emoji: '💡', color: '#e1f1e8', rating: 4.7 },
  { id: 4, name: 'Everyday Sneakers', category: 'Fashion', price: 2199, oldPrice: 2999, emoji: '👟', color: '#f7e3e5', rating: 4.5 },
  { id: 5, name: 'Smart Watch Pro', category: 'Electronics', price: 3299, oldPrice: 4299, emoji: '⌚', color: '#e1eaf8', rating: 4.8 },
  { id: 6, name: 'Travel Backpack', category: 'Accessories', price: 1599, oldPrice: 2199, emoji: '🎒', color: '#f4ead7', rating: 4.6 },
  { id: 7, name: 'Premium Coffee Mug', category: 'Home', price: 499, oldPrice: 799, emoji: '☕', color: '#f2e5dc', rating: 4.4 },
  { id: 8, name: 'Everyday Sunglasses', category: 'Accessories', price: 999, oldPrice: 1499, emoji: '🕶️', color: '#e8e5f4', rating: 4.5 },
];

const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Accessories'];
const money = (amount) => '₹' + amount.toLocaleString('en-IN');


function App() {
  const [customer, setCustomer] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authMessage, setAuthMessage] = useState('');
  const [products, setProducts] = useState(fallbackProducts);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured');
  const [minRating, setMinRating] = useState('0');
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('shopsphere-cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('shopsphere-cart', JSON.stringify(cart));
  }, [cart]);

  const [wishlist, setWishlist] = useState([])
  const [notice, setNotice] = useState('')
  const [activePanel, setActivePanel] = useState('')
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState('');


  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {

      try {
        const response = await fetch(
          'http://localhost:5000/api/v1/demo/products',
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        console.log('API returned:', data.products.map(p => p.name));

        const formattedProducts = data.products.map((product, index) => ({
          id: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          oldPrice: product.originalPrice,
          emoji: product.image,
          color: fallbackProducts[index % fallbackProducts.length].color,
          rating: product.rating
        }));
        console.log('Updating products to:', formattedProducts.map(p => p.name));
        if (!cancelled) {
          setProducts([...formattedProducts]);
          console.log('setProducts called with:', formattedProducts[0].price);
        }
      } catch (error) {
        console.error('Product API error:', error);
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const checkCustomerSession = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/v1/customer-auth/me',
          { credentials: 'include' }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setCustomer(data.customer);
        }
      } catch (error) {
        console.error('Unable to check customer session:', error);
      }
    };

    checkCustomerSession();
  }, []);

  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthMessage('');

    const form = new FormData(event.currentTarget);
    const name = form.get('name');
    const email = form.get('email');
    const password = form.get('password');

    const endpoint = authMode === 'signup' ? 'signup' : 'login';

    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/customer-auth/${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(
            authMode === 'signup'
              ? { name, email, password }
              : { email, password }
          )
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAuthMessage(data.message || 'Authentication failed.');
        return;
      }

      if (authMode === 'signup') {
        setAuthMode('login');
        setAuthMessage('Account created! Please log in.');
        return;
      }

      setCustomer(data.customer);
      setShowAuth(false);
      setAuthMessage('');
      setNotice(`Welcome, ${data.customer.name}!`);
    } catch (error) {
      setAuthMessage('Unable to connect to the server. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/v1/customer-auth/logout',
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setNotice(data.message || 'Unable to log out. Please try again.');
        return;
      }

      setCustomer(null);
      setShowAccountMenu(false);
      setShowOrderHistory(false);
      setOrders([]);
      setNotice('You have been logged out successfully.');
    } catch (error) {
      setNotice('Unable to connect to the server. Please try again.');
    }
  };

  const visibleProducts = useMemo(() => {
    let result = products.filter((product) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        (product.category || '').toLowerCase().includes(searchText) ||
        (product.description || '').toLowerCase().includes(searchText);

      const matchesCategory =
        category === 'All' || product.category === category;

      const matchesRating =
        Number(product.rating || 0) >= Number(minRating);

      return matchesSearch && matchesCategory && matchesRating;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, search, category, sortBy, minRating]);



  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });

    setNotice(`${product.name} added to cart`);
    setTimeout(() => setNotice(''), 2200);
  };

  const changeCartQuantity = (productId, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };


  const toggleWishlist = (id) => {
    setWishlist((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id])
  }
  const fetchOrders = async () => {
    setLoadingOrders(true);
    setOrderError('');

    try {
      const response = await fetch(
        'http://localhost:5000/api/v1/demo/checkout',
        {
          cache: 'no-store',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error('Could not load orders.');
      }

      setOrders(data.orders || []);
    } catch (error) {
      setOrderError(
        error.message || 'Could not connect to the server.'
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="shop">
      <div className="announcement">✨ Special offers on your everyday favourites — shop now!</div>

      <header className="navbar">
        <a className="brand" href="#" aria-label="ShopSphere home">
          <span className="brand-icon">S</span>
          Shop<span>Sphere</span>
        </a>

        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />
          {search && <button onClick={() => setSearch('')} aria-label="Clear search">×</button>}
        </div>

        <div className="nav-actions">
          <button
            className="nav-link"
            onClick={() => {
              setShowOrderHistory(true);
              fetchOrders();
            }}
          >
            📦 <span>Orders</span>
          </button>
          <button className="nav-link" onClick={() => setActivePanel('wishlist')}>
            ♡ <span>Wishlist</span>
            <b>{wishlist.length}</b>
          </button>

          <button
            className="nav-link"
            onClick={() => {
              if (customer) {
                setShowAccountMenu((current) => !current);
              } else {
                setAuthMode('login');
                setAuthMessage('');
                setShowAuth(true);
              }
            }}
          >
            👤 <span>{customer ? customer.name : 'Login'}</span>
          </button>

          <button className="cart-button" onClick={() => setActivePanel('cart')}>
            🛍️ <span>Cart</span><b>{cart.reduce((total, product) => total + (product.quantity || 1), 0)}</b>
          </button>
        </div>
      </header>

      {showAuth && (
        <div className="auth-overlay">
          <div className="auth-modal">
            <button
              className="auth-close"
              onClick={() => setShowAuth(false)}
              aria-label="Close login form"
            >
              ×
            </button>

            <h2>{authMode === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
            <p>
              {authMode === 'login'
                ? 'Log in to view your personal orders.'
                : 'Sign up to get started with ShopSphere.'}
            </p>

            <form onSubmit={handleAuth}>
              {authMode === 'signup' && (
                <input
                  name="name"
                  type="text"
                  placeholder="Full name"
                  required
                />
              )}

              <input
                name="email"
                type="email"
                placeholder="Email address"
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password (minimum 8 characters)"
                minLength={8}
                required
              />

              {authMessage && <p className="auth-message">{authMessage}</p>}

              <button type="submit" className="auth-submit">
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === 'login'
                ? "Don't have an account?"
                : 'Already have an account?'}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setAuthMessage('');
                }}
              >
                {authMode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      )}

      {showAccountMenu && customer && (
        <div className="account-menu">
          <div className="account-menu-header">
            <div className="account-avatar">👤</div>
            <div>
              <strong>{customer.name}</strong>
              <p>{customer.email}</p>
            </div>
          </div>

          <button
            className="account-menu-item"
            onClick={() => {
              setShowAccountMenu(false);
              setShowOrderHistory(true);
              fetchOrders();
            }}
          >
            📦 My Orders
          </button>

          <button
            className="account-menu-item logout-item"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>
        </div>
      )}



      {notice && <div className="notice" role="status">{notice}</div>}
      {showOrderHistory && (
        <div
          className="panel-overlay"
          onClick={() => setShowOrderHistory(false)}
        >
          <section
            className="shop-panel order-history-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Order history"
          >
            <div className="panel-header">
              <div>
                <h2>📦 Order History</h2>
                <p>{orders.length} order(s) placed</p>
              </div>

              <button
                className="panel-close"
                onClick={() => setShowOrderHistory(false)}
                aria-label="Close order history"
              >
                ×
              </button>
            </div>

            {loadingOrders ? (
              <p className="loading-message">Loading your orders...</p>
            ) : orderError ? (
              <div className="panel-empty">
                <h3>Unable to load orders</h3>
                <p>{orderError}</p>
                <button
                  className="primary-button"
                  onClick={fetchOrders}
                >
                  Try again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="panel-empty">
                <span>🛍️</span>
                <h3>No orders yet</h3>
                <p>Your placed orders will appear here.</p>
                <button
                  className="primary-button"
                  onClick={() => setShowOrderHistory(false)}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <div className="order-history-list">
                {orders.map((order) => (
                  <article
                    className="order-card"
                    key={order.orderId}
                  >
                    <div className="order-card-header">
                      <div>
                        <span className="order-label">ORDER ID</span>
                        <strong>{order.orderId}</strong>
                      </div>

                      <span className="order-status">
                        {order.status || 'Placed'}
                      </span>
                    </div>

                    <p className="order-date">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString('en-IN')
                        : 'Date unavailable'}
                    </p>

                    <div className="order-customer">
                      <p><strong>Customer:</strong> {order.customerName}</p>
                      <p><strong>Delivery address:</strong> {order.customerAddress}</p>
                    </div>

                    <div className="order-products">
                      {(order.items || []).map((item, index) => (
                        <div
                          className="order-product-row"
                          key={`${item.productId || item.name}-${index}`}
                        >
                          <span>
                            {item.name || item.productName || item.productId}
                            {' × '}
                            {item.quantity}
                          </span>
                          <strong>
                            {money(
                              item.subtotal ??
                              ((item.unitPrice ?? item.price ?? 0) * item.quantity)
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="order-total">
                      <span>Order total</span>
                      <strong>{money(order.total || 0)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {activePanel && (
        <div className="panel-overlay" onClick={() => setActivePanel('')}>
          <section
            className="shop-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={activePanel === 'cart' ? 'Shopping cart' : 'Wishlist'}
          >
            <div className="panel-header">
              <div>
                <h2>{activePanel === 'cart' ? 'Your Cart' : 'Your Wishlist'}</h2>
                <p>
                  {activePanel === 'cart'
                    ? `${cart.reduce((total, product) => total + (product.quantity || 1), 0)} item(s) in your cart`
                    : `${wishlist.length} saved item(s)`}
                </p>
              </div>
              <button className="panel-close" onClick={() => setActivePanel('')} aria-label="Close panel">×</button>
            </div>

            {activePanel === 'cart' ? (
              cart.length === 0 ? (
                <div className="panel-empty">
                  <span>🛍️</span>
                  <h3>Your cart is empty</h3>
                  <p>Add something you love from the collection.</p>
                  <button className="primary-button" onClick={() => setActivePanel('')}>Continue shopping</button>
                </div>
              ) : (
                <>
                  <div className="panel-items">
                    {cart.map((product, index) => (
                      <div className="panel-item" key={`${product.id}-${index}`}>
                        <div className="panel-product-image" style={{ backgroundColor: product.color }}>
                          {product.emoji}
                        </div>
                        <div className="panel-item-info">

                          <b>{product.name}</b>

                          <div className="quantity-controls">
                            <button
                              type="button"
                              onClick={() => changeCartQuantity(product.id, -1)}
                              aria-label={`Decrease quantity of ${product.name}`}
                            >
                              −
                            </button>

                            <span>Quantity: {product.quantity || 1}</span>

                            <button
                              type="button"
                              onClick={() => changeCartQuantity(product.id, 1)}
                              aria-label={`Increase quantity of ${product.name}`}
                            >
                              +
                            </button>
                          </div>

                          <span>{money(product.price)} each</span>

                          <b>{money(product.price * (product.quantity || 1))}</b>

                          <button className="remove-button" onClick={() => setCart(current => current.filter((_, i) => i !== index))}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="panel-footer">
                    <div className="panel-total">
                      <span>Subtotal</span>
                      <b>{money(cart.reduce((total, product) => total + product.price * (product.quantity || 1), 0))}</b>
                    </div>
                    <p>Shipping and taxes are not included.</p>


                    <button
                      className="primary-button checkout-button"
                      onClick={() => {
                        if (cart.length === 0) {
                          setNotice('Your cart is empty.');
                          setTimeout(() => setNotice(''), 2200);
                          return;
                        }

                        setShowCheckout(true);
                      }}
                    >
                      Proceed to checkout →
                    </button>


                  </div>
                </>
              )
            ) : (
              wishlist.length === 0 ? (
                <div className="panel-empty">
                  <span>♡</span>
                  <h3>No saved items yet</h3>
                  <p>Tap the heart on a product to save it here.</p>
                  <button className="primary-button" onClick={() => setActivePanel('')}>Explore products</button>
                </div>
              ) : (
                <div className="panel-items">
                  {products.filter(product => wishlist.includes(product.id)).map(product => (
                    <div className="panel-item" key={product.id}>
                      <div className="panel-product-image" style={{ backgroundColor: product.color }}>
                        {product.emoji}
                      </div>
                      <div className="panel-item-info">
                        <b>{product.name}</b>
                        <span>{money(product.price)}</span>
                        <div className="panel-item-actions">
                          <button className="remove-button" onClick={() => setWishlist(current => current.filter(id => id !== product.id))}>Remove</button>
                          <button className="mini-add-button" onClick={() => { setCart(current => [...current, product]); setActivePanel('cart') }}>Add to cart</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </section>
        </div>
      )}


      <main>

        {showCheckout && (
          <section className="checkout-page">
            <button
              className="back-button"
              type="button"
              onClick={() => setShowCheckout(false)}
            >
              ← Back to shopping
            </button>

            <h1>Checkout</h1>
            <p>Complete your details to place your demo order.</p>

            <div className="checkout-layout">
              <form
                className="checkout-form"

                onSubmit={async (event) => {
                  event.preventDefault();

                  if (cart.length === 0) {
                    setNotice('Your cart is empty.');
                    return;
                  }

                  setPlacingOrder(true);


                  try {
                    const response = await fetch(
                      'http://localhost:5000/api/v1/demo/checkout',
                      {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          customerName,
                          customerAddress,
                          items: cart.map((product) => ({
                            productId: product.id,
                            quantity: product.quantity || 1,
                          })),
                        }),
                      }
                    );


                    const data = await response.json();

                    if (!response.ok || !data.success) {
                      throw new Error(data.message || 'Unable to place order.');
                    }

                    setNotice(
                      `Order placed successfully! Order ID: ${data.order.orderId}`
                    );

                    setCart([]);
                    setCustomerName('');
                    setCustomerAddress('');
                    setShowCheckout(false);

                    setTimeout(() => setNotice(''), 6000);
                  } catch (error) {
                    setNotice(error.message || 'Could not connect to the checkout server.');
                  } finally {
                    setPlacingOrder(false);
                  }
                }}

              >
                <h2>Delivery details</h2>

                <label htmlFor="customer-name">Full name</label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Enter your full name"
                  required
                />

                <label htmlFor="customer-address">Delivery address</label>
                <textarea
                  id="customer-address"
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                  placeholder="House number, street, city, PIN code"
                  rows={4}
                  required
                />

                <p className="demo-payment-note">
                  Demo checkout only. No payment will be collected.
                </p>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={placingOrder}
                >
                  {placingOrder ? 'Placing Order...' : 'Place Order →'}
                </button>
              </form>

              <div className="checkout-summary">
                <h2>Order summary</h2>

                {cart.map((product) => (
                  <div className="checkout-item" key={product.id}>
                    <span>
                      {product.name} × {product.quantity || 1}
                    </span>
                    <b>
                      {money(product.price * (product.quantity || 1))}
                    </b>
                  </div>
                ))}

                <div className="checkout-total">
                  <span>Total</span>
                  <b>
                    {money(
                      cart.reduce(
                        (total, product) =>
                          total + product.price * (product.quantity || 1),
                        0
                      )
                    )}
                  </b>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="hero-banner">
          <div className="hero-copy">
            <span className="eyebrow">YOUR EVERYDAY MARKETPLACE</span>
            <h1>Find your next<br />favourite <span>thing.</span></h1>
            <p>Thoughtfully picked essentials, little luxuries, and great finds — all in one place.</p>
            <button className="primary-button" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore collection <span>→</span>
            </button>
            <div className="hero-points">
              <span>✓ Great everyday finds</span>
              <span>✓ Easy shopping</span>
            </div>
          </div>
          <div className="hero-art" aria-label="Shopping bags illustration">
            <div className="hero-circle"></div>
            <span className="float-tag tag-one">✦ New finds</span>
            <div className="bag bag-back">S</div>
            <div className="bag bag-front"><span>Shop</span><b>Sphere.</b></div>
            <span className="float-tag tag-two">♡ Your style, your way</span>
            <span className="hero-sparkle">✳</span>
          </div>
        </section>

        <section className="benefits">
          <div><span>🚚</span><p><b>Easy shopping</b><small>Browse all your favourites</small></p></div>
          <div><span>💎</span><p><b>Curated finds</b><small>Something for everyone</small></p></div>
          <div><span>🔒</span><p><b>Shop with confidence</b><small>A simple shopping experience</small></p></div>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading">
            <div><span className="eyebrow">THE SHOPSPHERE EDIT</span><h2>Popular right now</h2><p>Little things that make a big difference.</p></div>
            <span className="result-count">{visibleProducts.length} products</span>
          </div>

          <div className="category-list">
            {categories.map((item) => (
              <button key={item} className={category === item ? 'category active' : 'category'} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="extra-filters">
            <div className="filter-group">
              <label htmlFor="sort-products">Sort by</label>
              <select
                id="sort-products"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="min-rating">Minimum rating</label>
              <select
                id="min-rating"
                value={minRating}
                onChange={(event) => setMinRating(event.target.value)}
              >
                <option value="0">All ratings</option>
                <option value="4">4+ stars</option>
                <option value="4.5">4.5+ stars</option>
              </select>
            </div>
          </div>


          {loadingProducts ? (
            <p className="loading-message">Loading products...</p>
          ) : visibleProducts.length ? (
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <article className="product-card" key={`${product.id}-${product.price}`}>
                  {console.log('CARD DATA:', product.name, product.price)}
                  <div className="product-image" style={{ backgroundColor: product.color }}>
                    <span className="discount">
                      {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                    </span>
                    <button className={wishlist.includes(product.id) ? 'heart selected' : 'heart'} onClick={() => toggleWishlist(product.id)} aria-label="Toggle wishlist">
                      {wishlist.includes(product.id) ? '♥' : '♡'}
                    </button>
                    <span className="product-emoji">{product.emoji}</span>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.name}</h3>
                    <div className="rating">★ <span>{product.rating}</span></div>
                    <div className="product-bottom">
                      <div>
                        <b>{money(product.price)}</b>
                        <del>{money(product.oldPrice)}</del>
                      </div>
                      <button
                        className="add-button"
                        onClick={() => addToCart(product)}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state"><span>🔎</span><h3>No products found</h3><p>Try another search or category.</p><button className="primary-button" onClick={() => { setSearch(''); setCategory('All') }}>Show all products</button></div>
          )}
        </section>

        <section className="newsletter">
          <div><span className="eyebrow">A LITTLE SOMETHING FOR YOU</span><h2>Good finds, straight to your inbox.</h2><p>Stay in the loop with new arrivals and special offers.</p></div>
          <form onSubmit={(event) => { event.preventDefault(); setNotice('Thanks for your interest! Newsletter signup is a demo.'); }}>
            <input type="email" placeholder="Enter your email address" required aria-label="Email address" />
            <button type="submit">Keep me updated →</button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#"><span className="brand-icon">S</span> Shop<span>Sphere</span></a>
        <p>Your everyday marketplace. Find something you love.</p>
        <span>© {new Date().getFullYear()} ShopSphere · Demo storefront</span>
      </footer>
    </div>
  )
}

export default App
