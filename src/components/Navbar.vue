<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import siteData from '../data/siteData.json';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();
const announcements = siteData.announcements;
const navItems = siteData.navigation;
const siteConfig = siteData.siteInfo;

const currentAnnouncement = ref(announcements[0]);
let intervalId = null;
let currentIndex = 0;
const isMenuOpen = ref(false);
const activeDropdown = ref(null);
const isLoggedIn = ref(false);
const isSearchOpen = ref(false);
const searchQuery = ref('');
const isSearchMounted = ref(false);
const showCartPopup = ref(false);
const cartItems = computed(() => store.state.cartItems);
const cartTotal = computed(() => store.getters.cartTotal);
const remainingForFreeShipping = computed(() => store.getters.remainingForFreeShipping);

const updateQuantity = (index, change) => {
  const newQuantity = cartItems.value[index].quantity + change;
  store.commit('updateQuantity', { index, newQuantity });
};

const removeFromCart = (index, event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  store.commit('removeFromCart', index);
};

const rotateAnnouncement = () => {
  currentIndex = (currentIndex + 1) % announcements.length;
  currentAnnouncement.value = announcements[currentIndex];
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
    activeDropdown.value = null;
  }
};

const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = '';
  activeDropdown.value = null;
};

const toggleDropdown = (itemId) => {
  if (activeDropdown.value === itemId) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = itemId;
  }
};

const goBack = () => {
  activeDropdown.value = null;
};

const navigateToAuth = (type = 'login') => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (isLoggedIn.value) {
    router.push('/profile');
  } else {
    router.push({ path: '/auth', query: { type } });
    closeMenu(); // Mobil menüyü kapat
  }
};

const navigateToFavorites = () => {
  router.push({ path: '/profile', query: { tab: 'favorites' } });
};

const checkLoginStatus = () => {
  const currentUser = localStorage.getItem('currentUser');
  isLoggedIn.value = !!currentUser;
};

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;
  if (isSearchOpen.value) {
    nextTick(() => {
      document.body.style.overflow = 'hidden';
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.focus();
      }
    });
  } else {
    document.body.style.overflow = '';
    searchQuery.value = '';
  }
};

const closeSearch = () => {
  isSearchOpen.value = false;
  nextTick(() => {
    document.body.style.overflow = '';
  });
  searchQuery.value = '';
};

const filteredProducts = computed(() => {
  if (!searchQuery.value) return [];
  
  const query = searchQuery.value.toLowerCase().trim();
  const allProducts = [...siteData.products, ...siteData.discountedProducts];
  
  return allProducts.filter(product => {
    const searchFields = [
      product.name.toLowerCase(),
      product.category?.toLowerCase() || '',
      ...(product.searchTags || []).map(tag => tag.toLowerCase())
    ];
    
    return searchFields.some(field => field.includes(query));
  }).slice(0, 5); // Limit to 5 results
});

const isLoading = ref(false);

const searchProducts = () => {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
};

const toggleCartPopup = () => {
  showCartPopup.value = !showCartPopup.value;
};

const closeCartPopup = (event) => {
  if (event && event.type === 'click' && event.target.closest('.close-button')) {
    showCartPopup.value = false;
    return;
  }

  const cartPopup = document.querySelector('.cart-popup');
  const cartIcon = document.querySelector('.icon-link[data-cart]');
  
  if (showCartPopup.value && cartPopup) {
    const isClickOutside = !cartPopup.contains(event.target) && 
                          (!cartIcon || !cartIcon.contains(event.target));
    
    if (isClickOutside) {
      showCartPopup.value = false;
    }
  }
};

const goToCheckout = () => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Ödeme yapmak için lütfen giriş yapın.');
    return;
  }
  showCartPopup.value = false;
  router.push('/payment');
};

onMounted(() => {
  intervalId = setInterval(rotateAnnouncement, 4000);
  checkLoginStatus();
  window.addEventListener('storage', checkLoginStatus);
  
  // Create a div for search popup if it doesn't exist
  if (!document.getElementById('search-popup-container')) {
    const searchContainer = document.createElement('div');
    searchContainer.id = 'search-popup-container';
    document.body.appendChild(searchContainer);
  }
  
  isSearchMounted.value = true;
  document.addEventListener('click', closeCartPopup);
  
  // Load cart items from localStorage
  const savedCartItems = localStorage.getItem('cartItems');
  if (savedCartItems) {
    store.commit('initializeCart', JSON.parse(savedCartItems));
  }

  // Watch for changes in localStorage and custom cart update event
  const handleCartUpdate = () => {
    const savedCartItems = localStorage.getItem('cartItems');
    if (savedCartItems) {
      store.commit('initializeCart', JSON.parse(savedCartItems));
    }
  };

  window.addEventListener('storage', handleCartUpdate);
  window.addEventListener('cartUpdated', handleCartUpdate);

  store.commit('initializeCart');
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  document.body.style.overflow = '';
  window.removeEventListener('storage', checkLoginStatus);
  
  // Clean up search container
  const searchContainer = document.getElementById('search-popup-container');
  if (searchContainer) {
    searchContainer.remove();
  }
  document.removeEventListener('click', closeCartPopup);
});
</script>

<template>
  <div class="navbar-wrapper">
    <!-- Top announcement bar -->
    <div class="announcement-bar">
      <div class="announcement-container">
        <p>{{ currentAnnouncement }}</p>
      </div>
    </div>
    
    <!-- Main navbar -->
    <nav class="navbar">
      <div class="container">
        <!-- Mobile menu toggle button - only visible on mobile -->
        <div class="mobile-menu-toggle" @click="toggleMenu" :class="{ 'hidden': isMenuOpen }">
          <i class="bi bi-list"></i>
        </div>
        
        <div class="navbar-brand">
          <a href="/">
            <img :src="siteConfig.logo.src" :alt="siteConfig.logo.alt" class="logo">
          </a>
        </div>
        
        <!-- Desktop menu - hidden on mobile -->
        <div class="navbar-menu desktop-menu">
          <ul class="nav-links">
            <li v-for="item in navItems.categories" 
                :key="item.id" 
                class="nav-item"
                :class="{ 'dropdown': item.hasDropdown }">
              <a :href="item.link" 
                 class="nav-link"
                 :class="{ 'indirim': item.isHighlighted }">
                {{ item.name }}
                <span v-if="item.hasDropdown" class="dropdown-arrow">
                  <i class="bi bi-chevron-down"></i>
                </span>
              </a>
              
              <!-- Dropdown menu -->
              <div v-if="item.hasDropdown" class="dropdown-menu">
                <div class="dropdown-content">
                  <a v-for="dropdownItem in item.dropdownItems" 
                     :key="dropdownItem.id" 
                     :href="dropdownItem.link" 
                     class="dropdown-item">
                    {{ dropdownItem.name }}
                  </a>
                </div>
              </div>
            </li>
          </ul>
        </div>
        
        <div class="navbar-icons">
          <a href="#" class="icon-link" @click.prevent="toggleSearch"><i class="bi bi-search"></i></a>
          <a href="#" class="icon-link" @click.prevent="navigateToAuth('login')">
            <i class="bi bi-person"></i>
          </a>
          <a v-if="isLoggedIn" href="#" class="icon-link" @click.prevent="navigateToFavorites">
            <i class="bi bi-heart"></i>
          </a>
          <a href="#" class="icon-link" data-cart @click.prevent="toggleCartPopup">
            <i class="bi bi-bag"></i>
            <span class="cart-count">{{ cartItems.length }}</span>
          </a>
        </div>
      </div>
    </nav>
    
    <!-- Mobile menu overlay -->
    <div class="mobile-menu-overlay" :class="{ 'active': isMenuOpen }" @click="closeMenu"></div>
    
    <!-- Mobile menu sidebar -->
    <div class="mobile-menu-sidebar" :class="{ 'active': isMenuOpen }">
      <div class="mobile-menu-header">
        <button class="close-menu-btn" @click="closeMenu">
          <i class="bi bi-x"></i>
        </button>
        <div class="mobile-auth">
          <template v-if="isLoggedIn">
            <a href="#" @click.prevent="navigateToAuth()" class="auth-link">PROFİLİM</a>
          </template>
          <template v-else>
            <a href="#" @click.prevent="navigateToAuth('login')" class="auth-link">ÜYE GİRİŞİ</a>
            <span class="separator">|</span>
            <a href="#" @click.prevent="navigateToAuth('register')" class="auth-link">KAYIT OL</a>
          </template>
        </div>
      </div>
      
      <div class="mobile-menu-content">
        <!-- Main mobile menu -->
        <ul v-if="!activeDropdown" class="mobile-nav-links">
          <li v-for="item in navItems.categories" 
              :key="item.id" 
              class="mobile-nav-item">
            <div class="mobile-nav-link-wrapper" @click="item.hasDropdown ? toggleDropdown(item.id) : null">
              <a :href="item.hasDropdown ? '#' : item.link" 
                 class="mobile-nav-link"
                 :class="{ 'indirim': item.isHighlighted }"
                 @click.prevent="item.hasDropdown ? null : null">
                {{ item.name }}
              </a>
              <span v-if="item.hasDropdown" class="mobile-dropdown-toggle">
                <i class="bi bi-chevron-right"></i>
              </span>
            </div>
          </li>
        </ul>
        
        <!-- Dropdown content for mobile -->
        <div v-else class="mobile-dropdown-view">
          <div class="mobile-dropdown-header" @click="goBack">
            <i class="bi bi-chevron-left"></i>
            <span>{{ navItems.categories.find(item => item.id === activeDropdown)?.name }}</span>
          </div>
          <ul class="mobile-dropdown-items">
            <li v-for="dropdownItem in navItems.categories.find(item => item.id === activeDropdown)?.dropdownItems" 
                :key="dropdownItem.id" 
                class="mobile-dropdown-item">
              <a :href="dropdownItem.link" class="mobile-dropdown-link">
                {{ dropdownItem.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Search Popup -->
    <Teleport to="#search-popup-container" v-if="isSearchMounted">
      <div class="search-popup" :class="{ 'active': isSearchOpen }">
        <div class="search-popup-overlay" @click="closeSearch"></div>
        <div class="search-popup-content">
          <div class="search-header">
            <div class="search-logo">
              <img :src="siteConfig.logo.src" :alt="siteConfig.logo.alt">
            </div>
            <div class="search-input-wrapper">
              <i class="bi bi-search"></i>
              <input 
                type="text" 
                class="search-input" 
                v-model="searchQuery" 
                placeholder="Ne aramıştınız?"
                @keyup.esc="closeSearch"
                @input="searchProducts"
              >
            </div>
            <button class="search-close-btn" @click="closeSearch">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="search-results">
            <div v-if="isLoading" class="search-loading">
              <div class="loading-spinner"></div>
              <p>Aranıyor...</p>
            </div>
            <div v-else-if="searchQuery && filteredProducts.length === 0" class="search-no-results">
              <p>"{{ searchQuery }}" için sonuç bulunamadı.</p>
            </div>
            <div v-else-if="filteredProducts.length > 0" class="search-products-grid">
              <a v-for="product in filteredProducts" 
                 :key="product.id" 
                 :href="product.link || '#'"
                 class="search-product-card">
                <div class="search-product-image">
                  <img :src="product.image" :alt="product.name">
                </div>
                <div class="search-product-info">
                  <div class="search-product-brand">{{ product.brand }}</div>
                  <h3 class="search-product-name">{{ product.name }}</h3>
                  <div class="search-product-price">
                    <span class="current-price">₺{{ product.price }}</span>
                    <span v-if="product.originalPrice" class="original-price">₺{{ product.originalPrice }}</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Cart Popup -->
    <div v-if="showCartPopup" class="cart-popup">
      <div class="cart-popup-header">
        <h3>Sepetim ( {{ cartItems.length }} )</h3>
        <button class="close-button" @click="showCartPopup = false">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <div v-if="cartItems.length > 0" class="cart-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: Math.min((cartTotal / 1000) * 100, 100) + '%' }"></div>
        </div>
        <p class="free-shipping-text" v-if="remainingForFreeShipping > 0">
          Ücretsiz kargo için sepetine ₺{{ remainingForFreeShipping }} daha ürün ekle.
        </p>
      </div>

      <div v-if="cartItems.length === 0" class="empty-cart">
        <i class="bi bi-cart"></i>
        <p>Sepetiniz boş.</p>
      </div>

      <div v-else class="cart-items">
        <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
          <div class="cart-item-image">
            <img :src="item.image" :alt="item.name">
          </div>
          <div class="cart-item-details">
            <h4>{{ item.name }}</h4>
            <p class="item-color" v-if="item.color">{{ item.color }}</p>
            <div class="item-quantity">
              <span>Adet</span>
              <div class="quantity-controls">
                <button @click="updateQuantity(index, -1)">−</button>
                <span>{{ item.quantity }}</span>
                <button @click="updateQuantity(index, 1)">+</button>
              </div>
            </div>
            <div class="product-list-product-price">
              <span v-if="item.discountPercentage" class="product-list-original-price">₺{{ (parseFloat(item.originalPrice) * item.quantity).toFixed(2) }}</span>
              <span class="product-list-current-price">₺{{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <button class="remove-item" @click="(event) => removeFromCart(index, event)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <div v-if="cartItems.length > 0" class="cart-footer">
        <div class="cart-total">
          <span>Toplam</span>
          <span>₺{{ cartTotal }}</span>
        </div>
        <div class="cart-footer-buttons">
          <button class="payment-button" @click="goToCheckout">
            <i class="bi bi-credit-card"></i>
            ÖDEME ADIMINA GİT
          </button>
          <router-link to="/checkout" class="checkout-btn" @click="showCartPopup = false">
            SEPETE GİT
            <i class="bi bi-chevron-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Navbar Wrapper */
.navbar-wrapper {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* Announcement Bar */
.announcement-bar {
  background-color: #000;
  color: #fff;
  text-align: center;
  padding: 8px 0;
  font-weight: bold;
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.announcement-container {
  max-width: 100%;
  padding: 0 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.announcement-bar p {
  margin: 0;
  padding: 0;
  font-size: 14px;
}

/* Navbar Styles */
.navbar {
  background-color: #fff;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  width: 100%;
  justify-content: space-between;
  height: 71px;
}

.container {
  display: flex;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 15px;
  justify-content: space-between;
}

.navbar-brand {
  flex: 0 0 auto;
  margin-right: auto;
  padding-right: 40px;
  display: flex;
  justify-content: center;
}

.logo {
  height: 40px;
}

/* Mobile menu toggle button */
.mobile-menu-toggle {
  display: none;
  font-size: 24px;
  cursor: pointer;
  position: relative;
  z-index: 99;
}

.mobile-menu-toggle.hidden {
  display: none !important;
}

/* Desktop Menu */
.navbar-menu {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  margin: 0 40px;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 20px;
}

.nav-item {
  position: relative;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 700;
  padding: 5px 0;
  transition: color 0.3s;
  position: relative;
  display: inline-block;
  cursor: pointer;
  font-size: 16px;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #333;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.nav-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.dropdown-arrow {
  font-size: 12px;
  margin-left: 4px;
  display: inline-block;
  vertical-align: middle;
  transition: transform 0.3s ease;
}

.nav-item.dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.indirim {
  color: #ff4d4d !important;
}

.indirim::after {
  background-color: #ff4d4d;
}

/* Dropdown Menu Styles */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  min-width: 180px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 1001;
  border: 1px solid #eee;
  display: none;
}

.nav-item.dropdown {
  position: relative;
}

.nav-item.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  display: block;
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.dropdown-item {
  color: #333;
  padding: 8px 16px;
  text-decoration: none;
  display: block;
  font-size: 14px;
  transition: background-color 0.3s, color 0.3s;
}

.dropdown-item:hover {
  background-color: #f8f8f8;
  color: #ff4d4d;
}

/* Remove the invisible area as it's causing issues */
.nav-item.dropdown::after {
  display: none;
}

.navbar-icons {
  flex: 0 0 auto;
  display: flex;
  gap: 25px;
  margin-left: auto;
  padding-left: 40px;
}

.icon-link {
  color: #333;
  font-size: 20px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.icon-link:hover {
  color: #ff4d4d;
}

.cart-icon {
  position: relative;
}



/* Mobile Menu Styles */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
}

.mobile-menu-overlay.active {
  opacity: 1;
  visibility: visible;
}

.mobile-menu-sidebar {
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  max-width: 320px;
  height: 100%;
  background-color: white;
  z-index: 1002;
  transition: left 0.3s ease;
  overflow: hidden;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.mobile-menu-sidebar.active {
  left: 0;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.close-menu-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
}

.mobile-auth {
  display: flex;
  align-items: center;
}

.auth-link {
  color: #333;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
}

.separator {
  margin: 0 10px;
  color: #333;
}

.mobile-menu-content {
  padding: 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.mobile-nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.mobile-nav-item {
  border-bottom: 1px solid #eee;
  position: relative;
  width: 100%;
}

.mobile-nav-link-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  width: 100%;
}

.mobile-nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  flex: 1;
}

.mobile-dropdown-toggle {
  color: #333;
  margin-left: 10px;
}

/* Mobile dropdown view */
.mobile-dropdown-view {
  width: 100%;
  height: 100%;
}

.mobile-dropdown-header {
  display: flex;
  align-items: center;
  padding: 15px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.mobile-dropdown-header i {
  margin-right: 10px;
}

.mobile-dropdown-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-dropdown-item {
  border-bottom: 1px solid #eee;
}

.mobile-dropdown-link {
  display: block;
  padding: 15px;
  color: #333;
  text-decoration: none;
}

/* Responsive styles for announcement text */
@media (max-width: 1200px) {
  .announcement-bar p {
    font-size: 13px;
  }
}

@media (max-width: 991px) {
  .announcement-bar p {
    font-size: 12px;
  }
  
  .navbar-brand {
    margin: 0 auto;
    padding: 0;
    margin-right: revert;
  }
  
  .mobile-menu-toggle {
    display: block;
    order: -1;
  }
  
  .desktop-menu {
    display: none;
  }
  
  .navbar-icons {
    padding-left: 0;
  }
}

@media (max-width: 768px) {
  .announcement-bar p {
    font-size: 11px;
  }
}

@media (max-width: 576px) {
  .announcement-bar p {
    font-size: 10px;
  }
}

/* Desktop styles */
@media (min-width: 992px) {
  .mobile-menu-sidebar,
  .mobile-menu-overlay {
    display: none;
  }
}

/* Search Popup Styles */
.search-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
  z-index: 9999;
}

.search-popup.active {
  opacity: 1;
  visibility: visible;
}

.search-popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.search-popup-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 65%;
  background-color: white;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.search-popup.active .search-popup-content {
  transform: translateY(0);
}

.search-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  border-bottom: 1px solid #eee;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 3;
}

.search-logo {
  flex: 0 0 auto;
}

.search-logo img {
  height: 40px;
  width: auto;
}

.search-input-wrapper {
  flex: 1;
  max-width: 600px;
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #f5f5f5;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin: 0 auto;
}

.search-input-wrapper i {
  color: #666;
  font-size: 1.2rem;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 1rem;
  color: #333;
  outline: none;
  width: 100%;
}

.search-input::placeholder {
  color: #999;
}

.search-close-btn {
  flex: 0 0 auto;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.search-close-btn:hover {
  color: #000;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: #fff;
}

.search-loading {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #333;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.search-product-card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}

.search-product-card:hover {
  transform: translateY(-5px);
}

.search-product-image {
  aspect-ratio: 1;
  overflow: hidden;
  margin-bottom: 1rem;
  background-color: #f5f5f5;
}

.search-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.search-product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-product-brand {
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
}

.search-product-name {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.search-product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-price {
  font-weight: 600;
  color: #333;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
}

/* Scrollbar Styles */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.search-results::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Responsive styles */
@media (max-width: 991px) {
  
}

@media (max-width: 768px) {
  .search-popup-content {
    height: 100%;
  }

  .search-header {
    padding: 1rem;
  }

  .search-logo {
    display: none;
  }

  .search-input-wrapper {
    padding: 0.5rem 1rem;
  }

  .search-results {
    padding: 1rem;
  }

  .search-products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .search-product-name {
    font-size: 0.9rem;
  }

  .search-product-brand {
    font-size: 0.8rem;
  }

  .current-price {
    font-size: 0.9rem;
  }

  .original-price {
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .search-products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Cart Popup Styles */
.cart-popup {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.cart-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #fff;
}

.cart-popup-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #1a1a1a;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-progress {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.progress-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #333;
  transition: width 0.3s ease;
}

.free-shipping-text {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  position: relative;
}

.cart-item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-details {
  flex: 1;
}

.cart-item-details h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 500;
}

.item-color {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
}

.item-quantity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.item-quantity span {
  color: #666;
  font-size: 0.9rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-controls button {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.item-price {
  margin-top: 0.5rem;
  font-weight: 500;
}

.remove-item {
  position: absolute;
  top: 1rem;
  right: 0;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
}

.cart-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  background: #fff;
  position: sticky;
  bottom: 0;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.cart-total span:first-child {
  color: #666;
}

.cart-total span:last-child {
  font-size: 1.1rem;
  font-weight: 600;
}

.cart-footer-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.payment-button i {
  font-size: 1.1rem;
}

.checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: #f5f5f5;
  color: #000;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.checkout-btn i {
  font-size: 0.8rem;
}

/* Keep existing empty cart styles */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 70px);
  padding: 20px;
  text-align: center;
  background: #fff;
}

.empty-cart i {
  font-size: 80px;
  color: #ddd;
}

.empty-cart p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1rem;
}

.nav-icon {
  position: relative;
}

.cart-count {
  position: relative;
  top: -8px;
  right: 8px;
  background-color: #ff4d4d;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.product-list-product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.product-list-original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
}

.product-list-current-price {
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .cart-popup {
    width: 100%;
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    right: 0;
    top: 0;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }

  .cart-popup-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  .cart-popup-title {
    font-size: 1.2rem;
  }

  .cart-popup-close {
    font-size: 1.5rem;
  }

  .cart-popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .cart-item {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .cart-item-image {
    width: 80px;
    height: 80px;
  }

  .cart-item-info {
    flex: 1;
  }

  .cart-item-name {
    font-size: 0.9rem;
  }

  .cart-item-price {
    font-size: 0.9rem;
  }

  .cart-item-quantity {
    font-size: 0.9rem;
  }

  .cart-popup-footer {
    padding: 1rem;
    border-top: 1px solid #eee;
  }

  .cart-total {
    font-size: 1.1rem;
  }

  .cart-popup-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .cart-popup-button {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .cart-popup-button i {
    font-size: 1.1rem;
  }

  .cart-popup-button:first-child {
    background-color: #f8f8f8;
    color: #333;
  }

  .cart-popup-button:last-child {
    background-color: #333;
    color: #fff;
  }

  .cart-popup-button:first-child:hover {
    background-color: #eee;
  }

  .cart-popup-button:last-child:hover {
    background-color: #444;
  }

  .cart-popup-overlay {
    background-color: rgba(0, 0, 0, 0.5);
  }
}

@media (max-width: 480px) {
  .cart-item {
    padding: 0.5rem;
  }

  .cart-item-image {
    width: 70px;
    height: 70px;
  }

  .cart-item-name {
    font-size: 0.85rem;
  }

  .cart-item-price {
    font-size: 0.85rem;
  }

  .cart-item-quantity {
    font-size: 0.85rem;
  }

  .cart-popup-button {
    padding: 0.6rem;
    font-size: 0.85rem;
  }

  .cart-popup-button i {
    font-size: 1rem;
  }
}
</style>