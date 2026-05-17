import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Menu, X, ArrowRight, ArrowLeft, Minus, Plus, ChevronRight, Star } from 'lucide-react';
import { products, collections } from './data/products';
import './App.css';

const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product, color, size) => {
    const key = `${product.id}-${color}-${size}`;
    setCart(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { key, product, color, size, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (key, delta) => {
    setCart(prev => prev.map(i => i.key === key ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, cartOpen, setCartOpen, addToCart, updateQty, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() { return useContext(CartContext); }

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Ticker() {
  const items = [
    'Michigan to Miami', 'This Ain\'t My First Rodeo', 'Eastwood Co. Supply',
    'Raised Rowdy, Raised Right', 'Free Shipping Over $125', 'Born To Stand Out',
    'Premium Heavyweight Cotton', 'Wild With A Cause',
  ];

  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...Array(3)].map((_, rep) =>
          items.map((item, i) => (
            <span className="ticker-text" key={`${rep}-${i}`}>
              {item}
              <Star size={8} className="ticker-star" />
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function Marquee({ children }) {
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="marquee-item">{children}</div>
        ))}
      </div>
    </div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setCartOpen, cartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <Link to="/" className="header-logo">
            <span className="header-logo-text">EASTWOOD</span>
            <span className="header-logo-sub">co. supply</span>
          </Link>
          <nav className="header-nav">
            <Link to="/shop">Shop</Link>
            <Link to="/collections">Collections</Link>
            <Link to="/about">About</Link>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button className="header-cart" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button className="mobile-toggle" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}>
          <X size={28} />
        </button>
        <span className="mobile-nav-logo">EASTWOOD</span>
        <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link to="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
        <Link to="/collections" onClick={() => setMobileOpen(false)}>Collections</Link>
        <Link to="/about" onClick={() => setMobileOpen(false)}>About</Link>
      </div>
    </>
  );
}

function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty, cartTotal } = useCart();

  return (
    <>
      <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <span className="cart-title">Cart ({cart.length})</span>
          <button onClick={() => setCartOpen(false)}><X size={20} /></button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={32} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.key} className="cart-item">
                  <img className="cart-item-img" src={item.product.images[0]} alt={item.product.name} />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.product.name}</div>
                    <div className="cart-item-variant">{item.color} / {item.size}</div>
                    <div className="cart-item-price">${item.product.price}</div>
                    <div className="cart-qty">
                      <button onClick={() => updateQty(item.key, -1)}><Minus size={12} /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, 1)}><Plus size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span>${cartTotal}</span>
              </div>
              <button className="checkout-btn">Checkout <ArrowRight size={14} /></button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <span className="footer-logo">EASTWOOD</span>
          <p className="footer-tagline">co. supply</p>
          <p className="footer-desc">Michigan to Miami.</p>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/shop">All Products</Link>
          <Link to="/shop">Hoodies</Link>
          <Link to="/shop">Tees</Link>
          <Link to="/shop">Tops & Tanks</Link>
          <Link to="/shop">Bottoms</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/collections">Collections</Link>
        </div>
        <div className="footer-col">
          <h4>Follow</h4>
          <a href="https://tiktok.com/@eastwood0100" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="#">Instagram</a>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Eastwood Co. Supply. All rights reserved.</span>
        <span className="footer-accent">Michigan to Miami</span>
      </div>
    </footer>
  );
}

function ProductCard({ product, index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-card-img-wrap">
        <img
          className="product-card-img"
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
        />
      </div>
      {product.badge && <div className="product-card-badge">{product.badge}</div>}
      <div className="product-card-name">{product.name}</div>
      <div className="product-card-price">
        {product.comparePrice && (
          <span style={{ textDecoration: 'line-through', color: 'var(--gray)', marginRight: 8 }}>${product.comparePrice}</span>
        )}
        ${product.price}
      </div>
    </motion.div>
  );
}

function ProductCarousel({ products: items }) {
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.carousel-slide');
    if (!card) return;
    const w = card.offsetWidth + 16;
    const next = Math.max(0, Math.min(current + dir, items.length - 1));
    track.scrollTo({ left: w * next, behavior: 'smooth' });
    setCurrent(next);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.carousel-slide');
    if (!card) return;
    const w = card.offsetWidth + 16;
    const idx = Math.round(track.scrollLeft / w);
    setCurrent(idx);
  };

  return (
    <div className="carousel">
      <div className="carousel-track" ref={trackRef} onScroll={onScroll}>
        {items.map((p, i) => (
          <div
            key={p.id}
            className={`carousel-slide ${i === current ? 'active' : ''}`}
            onClick={() => navigate(`/product/${p.id}`)}
          >
            <div className="carousel-slide-img">
              <img src={p.image} alt={p.name} />
              {p.badge && <div className="carousel-badge">{p.badge}</div>}
            </div>
            <div className="carousel-slide-info">
              <div className="carousel-slide-name">{p.name}</div>
              <div className="carousel-slide-price">${p.price}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="carousel-nav">
        <button className="carousel-btn" onClick={() => scroll(-1)} disabled={current === 0}>
          <ArrowLeft size={18} />
        </button>
        <div className="carousel-dots">
          {items.map((_, i) => (
            <div key={i} className={`carousel-dot ${i === current ? 'active' : ''}`} />
          ))}
        </div>
        <button className="carousel-btn" onClick={() => scroll(1)} disabled={current === items.length - 1}>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ═══ PAGES ═══ */

function StoryImage({ src, alt, text, sub }) {
  return (
    <div className="story-image">
      <img src={src} alt={alt} loading="lazy" />
      <div className="story-image-overlay">
        {text && <h2 className="story-image-text">{text}</h2>}
        {sub && <p className="story-image-sub">{sub}</p>}
      </div>
    </div>
  );
}

function StorySpread({ image, label, title, body, flip }) {
  return (
    <motion.div
      className={`story-spread ${flip ? 'flip' : ''}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="story-spread-img">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="story-spread-text">
        <span className="story-spread-label">{label}</span>
        <h3 className="story-spread-title">{title}</h3>
        <p className="story-spread-body">{body}</p>
        <Link to="/shop" className="story-spread-link">
          Shop Now <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

function ProductRow({ title, items }) {
  return (
    <section className="product-row">
      {title && (
        <div className="product-row-header">
          <h2 className="product-row-title">{title}</h2>
          <Link to="/shop" className="product-row-link">View All <ArrowRight size={12} /></Link>
        </div>
      )}
      <div className="product-row-grid" style={{ '--cols': Math.min(items.length, 4) }}>
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  const featured = products.filter(p => p.featured && p.badge);
  const hoodies = products.filter(p => p.category === 'hoodies');
  const tops = products.filter(p => p.category === 'tops');
  const crewnecks = products.filter(p => p.category === 'crewnecks');
  const tees = products.filter(p => p.category === 'tees');
  const rest = products.filter(p => p.category === 'bottoms' || p.category === 'sets');

  return (
    <>
      <div className="grain" />

      {/* HERO */}
      <section className="hero">
        <div className="hero-media">
          <img src="/lifestyle/gang-hoodie-miami-night.png" alt="" />
          <div className="hero-gradient" />
        </div>
        <motion.div
          className="hero-inner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="hero-text">
            <h1 className="hero-title">EASTWOOD</h1>
            <div className="hero-sub">co. supply</div>
            <div className="hero-tagline">Michigan to Miami</div>
          </div>
          <Link to="/shop" className="hero-cta">
            Shop Now <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>

      <Ticker />

      {/* BEST SELLERS */}
      <ProductRow title="Best Sellers" items={featured} />

      {/* STORY: RAISED ROWDY */}
      <StoryImage
        src="/lifestyle/cowboy-tank-rodeo2.png"
        alt="Rodeo"
        text="Raised Rowdy, Raised Right"
        sub="Western roots. Miami energy."
      />

      {/* HOODIES */}
      <ProductRow title="Hoodies" items={hoodies} />

      {/* STORY: MICHIGAN TO MIAMI */}
      <StorySpread
        image="/lifestyle/gang-hoodie.png"
        label="The Story"
        title="Michigan to Miami"
        body="Born in the barns and backroads of Michigan. Raised on rodeos, bonfires, and Friday night football. Now we're bringing that same grit to the palm trees and neon of South Beach."
      />

      {/* TOPS & TANKS */}
      <ProductRow title="Tops & Tanks" items={tops} />

      {/* STORY: COWBOY PILLOWS */}
      <StoryImage
        src="/lifestyle/cowboy-pillows-camp2.png"
        alt="Desert camp"
        text="Cowboy Pillows"
        sub="The one everybody's talking about."
      />

      {/* CREWNECKS */}
      <ProductRow title="Crewnecks" items={crewnecks} />

      {/* STORY: FOR THE GIRLS */}
      <StorySpread
        image="/lifestyle/wild-women-barn.png"
        label="For The Girls"
        title="Long Live Wild Women"
        body="Born to stand out. Wild with a cause. This collection is for the girls who ride hard, love harder, and never apologize for either."
        flip
      />

      {/* TEES + BOTTOMS */}
      <ProductRow title="Tees" items={tees} />
      <ProductRow title="Bottoms & Sets" items={rest} />

      {/* PHOTO MOSAIC */}
      <div className="mosaic">
        <div className="mosaic-item"><img src="/lifestyle/cowboy-pillows-camp3.png" alt="" loading="lazy" /></div>
        <div className="mosaic-item tall"><img src="/lifestyle/cowboy-tank-picnic.png" alt="" loading="lazy" /></div>
        <div className="mosaic-item"><img src="/lifestyle/eastwood-sweats-cream.png" alt="" loading="lazy" /></div>
        <div className="mosaic-item"><img src="/lifestyle/somebodys-problem-crew.png" alt="" loading="lazy" /></div>
        <div className="mosaic-item"><img src="/lifestyle/cowboy-tank-rodeo3.png" alt="" loading="lazy" /></div>
        <div className="mosaic-item tall"><img src="/lifestyle/howdy-partner-miami.png" alt="" loading="lazy" /></div>
      </div>

      {/* FOLLOW CTA */}
      <section className="follow-cta">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="follow-cta-label">Follow The Journey</span>
          <a href="https://tiktok.com/@eastwood0100" target="_blank" rel="noopener noreferrer" className="follow-cta-handle">
            @eastwood0100
          </a>
        </motion.div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="newsletter-title">Get First Dibs</h3>
          <p className="newsletter-sub">New drops and early access.</p>
          <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Your email" />
            <button type="submit">Subscribe</button>
          </form>
        </motion.div>
      </section>
    </>
  );
}

function ShopPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const filtered = collections.find(c => c.id === activeFilter)?.filter
    ? products.filter(collections.find(c => c.id === activeFilter).filter)
    : products;

  return (
    <>
      <div className="grain" />
      <div className="shop-header">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="shop-title">Shop All</h1>
          <div className="shop-filters">
            {collections.map(c => (
              <button
                key={c.id}
                className={`filter-btn ${activeFilter === c.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
      <div className="shop-grid">
        {filtered.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </>
  );
}

function ProductPage() {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();

  if (!product) return <div style={{ padding: '200px 40px', textAlign: 'center', color: 'var(--gray)' }}>Product not found</div>;

  const handleAdd = () => {
    if (!selectedSize) return;
    addToCart(product, product.colors[selectedColor].name, selectedSize);
  };

  return (
    <div className="pdp">
      <div className="grain" />
      <div className="pdp-layout">
        <div className="pdp-gallery">
          <img className="pdp-gallery-img" src={product.images[activeImage]} alt={product.name} />
          {product.images.length > 1 && (
            <div className="pdp-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`pdp-thumb ${i === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div
          className="pdp-info"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="pdp-breadcrumb">
            <Link to="/shop">Shop</Link> <ChevronRight size={10} style={{ margin: '0 6px' }} /> {product.category}
          </div>

          {product.badge && <div className="product-card-badge" style={{ marginBottom: 16 }}>{product.badge}</div>}

          <h1 className="pdp-name">{product.name}</h1>
          <div className="pdp-price">
            {product.comparePrice && (
              <span style={{ textDecoration: 'line-through', color: 'var(--gray)', marginRight: 12 }}>${product.comparePrice}</span>
            )}
            ${product.price}
          </div>
          <p className="pdp-desc">{product.description}</p>

          {product.colors.length > 1 && (
            <>
              <div className="pdp-label">Color — {product.colors[selectedColor].name}</div>
              <div className="color-options">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name}
                    className={`color-swatch ${selectedColor === i ? 'active' : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => setSelectedColor(i)}
                  />
                ))}
              </div>
            </>
          )}

          <div className="pdp-label">Size</div>
          <div className="size-options">
            {product.sizes.map(s => (
              <button
                key={s}
                className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                onClick={() => setSelectedSize(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <button className="add-btn" onClick={handleAdd} style={{ opacity: selectedSize ? 1 : 0.5 }}>
            {selectedSize ? 'Add to Cart' : 'Select a Size'} <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function CollectionsPage() {
  const boards = [
    { img: '/lifestyle/gang-hoodie.png', label: 'Hoodies', title: 'Eastwood Gang', rot: -3 },
    { img: '/lifestyle/cowboy-pillows-camp1.png', label: 'Fan Favorite', title: 'Cowboy Pillows', rot: 2.5 },
    { img: '/lifestyle/cowboy-tank-rodeo1.png', label: 'Tops', title: 'American Cowboy', rot: -1.5 },
    { img: '/lifestyle/tractor-tee.png', label: 'Tees', title: 'Built To Work', rot: 4 },
    { img: '/lifestyle/wild-women-horses.png', label: 'For The Girls', title: 'Wild Women', rot: -2 },
    { img: '/lifestyle/somebodys-problem-crew.png', label: 'Crewnecks', title: "Somebody's Problem", rot: 3 },
  ];

  return (
    <>
      <div className="grain" />
      <div className="shop-header">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="shop-title">Collections</h1>
          <p style={{ fontSize: 15, color: 'var(--gray)', marginTop: 12 }}>Curated drops.</p>
        </motion.div>
      </div>

      <div className="board">
        <div className="board-inner">
          {boards.map((b, i) => (
            <Link
              to="/shop"
              key={i}
              className="pin-card"
              style={{ '--rot': `${b.rot}deg`, '--delay': `${i * 0.4}s` }}
            >
              <div className="pin" />
              <div className="pin-shadow" />
              <div className="pin-photo">
                <img src={b.img} alt={b.title} loading="lazy" />
              </div>
              <div className="pin-label">
                <span className="pin-label-tag">{b.label}</span>
                <span className="pin-label-title">{b.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <section className="newsletter" style={{ marginTop: 40 }}>
        <div className="newsletter-label">Be First</div>
        <h3 className="newsletter-title">Get Notified</h3>
        <p className="newsletter-sub">Be the first to know when new collections drop.</p>
        <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="Your email" />
          <button type="submit">Notify Me</button>
        </form>
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <div className="grain" />
      <div className="shop-header" style={{ paddingBottom: 0 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="about-label">The Story</div>
          <h1 className="shop-title">Michigan to Miami</h1>
        </motion.div>
      </div>

      <section className="about-content">
        <div className="about-split">
          <div className="about-img">
            <img src="/lifestyle/cowboy-tank-rodeo2.png" alt="Eastwood lifestyle" loading="lazy" />
          </div>
          <motion.div
            className="about-info"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="about-logo-display">EASTWOOD</span>
            <p className="about-logo-sub">co. supply</p>
            <p style={{ fontSize: 15, color: 'var(--gray)', lineHeight: 1.8, marginTop: 24 }}>
              Western-inspired apparel from the barns of Michigan to the beaches of Miami. Raised rowdy, raised right.
            </p>
            <div style={{ marginTop: 24 }}>
              <a href="https://tiktok.com/@eastwood0100" target="_blank" rel="noopener noreferrer" className="spread-link">
                Follow @eastwood0100 <ArrowRight size={14} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="photo-grid">
        <div className="photo-grid-item">
          <img src="/lifestyle/cowboy-pillows-camp4.png" alt="Desert" loading="lazy" />
        </div>
        <div className="photo-grid-item">
          <img src="/lifestyle/somebodys-problem-crew.png" alt="Crew" loading="lazy" />
        </div>
        <div className="photo-grid-item">
          <img src="/lifestyle/eastwood-sweats-cream.png" alt="Sweats" loading="lazy" />
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <Header />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Footer />
      </CartProvider>
    </BrowserRouter>
  );
}
