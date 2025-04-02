<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import siteData from '../data/siteData.json';

const route = useRoute();
const router = useRouter();

// Combine all products from different sources
const allProducts = computed(() => {
  return [
    ...siteData.products,
    ...siteData.discountedProducts,
    ...siteData.beltBags
  ];
});

const product = ref(null);
const selectedColor = ref('');
const selectedModel = ref('');
const currentImageIndex = ref(0);
const quantity = ref(1);
const isFavorite = ref(false);
const activeTab = ref('description');
const reviewRating = ref(0);
const reviewerName = ref('');
const reviewText = ref('');
const reviews = ref([
  {
    id: 1,
    name: 'Ahmet Y.',
    rating: 5,
    text: 'Ürün çok kaliteli ve beklentilerimin üzerinde. Kesinlikle tavsiye ederim.',
    date: '2 gün önce',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1372&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1374&auto=format&fit=crop'
    ]
  },
  {
    id: 2,
    name: 'Ayşe K.',
    rating: 4.5,
    text: 'Güzel ürün, kalitesi iyi. Sadece biraz geç geldi.',
    date: '1 hafta önce'
  },
  {
    id: 3,
    name: 'Mehmet S.',
    rating: 5,
    text: 'Harika bir ürün! Kalitesi ve tasarımı çok başarılı. Kargo hızlıydı.',
    date: '2 hafta önce',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1370&auto=format&fit=crop'
    ]
  },
  {
    id: 4,
    name: 'Zeynep A.',
    rating: 4,
    text: 'Ürün güzel ama fiyatı biraz yüksek. Yine de kalitesi için değer.',
    date: '3 hafta önce'
  }
]);

// Get product by ID from route params
const getProduct = () => {
  const productId = route.params.id;
  product.value = allProducts.value.find(p => p.id.toString() === productId);
  
  if (!product.value) {
    router.push('/'); // Redirect to home if product not found
    return;
  }
  
  // Set initial selected color if product has colors
  if (product.value.colors && product.value.colors.length > 0) {
    selectedColor.value = product.value.colors[0];
  }
  
  // Set initial selected model if product has models
  if (product.value.models && product.value.models.length > 0) {
    selectedModel.value = product.value.models[0];
  }
};

const images = computed(() => {
  if (!product.value) return [];
  
  // Collect all available images
  const allImages = [
    product.value.image,
    product.value.hoverImage,
    ...(product.value.images || []) // Include additional images if they exist
  ];
  
  // Filter out any undefined or null values and remove duplicates
  return [...new Set(allImages.filter(Boolean))];
});

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.value.length;
};

const prevImage = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + images.value.length) % images.value.length;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const increaseQuantity = () => {
  quantity.value++;
};

const addToCart = () => {
  const cartItem = {
    id: product.value.id,
    name: product.value.name,
    price: parseFloat(product.value.price.toString().replace(/[^\d.-]/g, '')),
    image: product.value.image,
    color: selectedColor.value,
    quantity: quantity.value,
    totalPrice: parseFloat(product.value.price.toString().replace(/[^\d.-]/g, '')) * quantity.value
  };

  // Get existing cart items from localStorage
  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  
  // Check if item already exists in cart with same color
  const existingItemIndex = cartItems.findIndex(item => 
    item.id === cartItem.id && 
    item.color === cartItem.color
  );

  if (existingItemIndex !== -1) {
    // Update quantity if item exists
    cartItems[existingItemIndex].quantity += cartItem.quantity;
    cartItems[existingItemIndex].totalPrice = parseFloat((cartItems[existingItemIndex].price * cartItems[existingItemIndex].quantity).toFixed(2));
  } else {
    // Add new item if it doesn't exist
    cartItems.push(cartItem);
  }

  // Save updated cart to localStorage
  localStorage.setItem('cartItems', JSON.stringify(cartItems));

  // Trigger cart update event
  window.dispatchEvent(new Event('cartUpdated'));

  // Show cart popup
  const event = new CustomEvent('showCartPopup');
  window.dispatchEvent(event);
};

const handleFavoriteClick = () => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    // Kullanıcı giriş yapmamışsa sadece uyarı göster
    alert('Favorilere eklemek için lütfen giriş yapın.');
    return;
  }

  // Kullanıcı giriş yapmışsa favorilere ekle/çıkar
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const isProductFavorite = favorites.some(fav => fav.id === product.value.id);

  if (isProductFavorite) {
    // Favorilerden çıkar
    const updatedFavorites = favorites.filter(fav => fav.id !== product.value.id);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    isFavorite.value = false;
  } else {
    // Favorilere ekle
    favorites.push({
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      brand: product.value.category,
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    isFavorite.value = true;
  }
};

const setActiveTab = (tab) => {
  if (activeTab.value === tab) {
    activeTab.value = ''; // Close if clicking the same tab
  } else {
    activeTab.value = tab;
  }
};

const setRating = (rating) => {
  reviewRating.value = rating;
};

const submitReview = () => {
  if (!reviewerName.value || !reviewText.value || reviewRating.value === 0) {
    alert('Lütfen tüm alanları doldurun ve bir puan verin.');
    return;
  }

  const newReview = {
    id: reviews.value.length + 1,
    name: reviewerName.value,
    rating: reviewRating.value,
    text: reviewText.value,
    date: 'Az önce'
  };

  reviews.value.unshift(newReview);
  
  // Reset form
  reviewerName.value = '';
  reviewText.value = '';
  reviewRating.value = 0;
  
  alert('Yorumunuz başarıyla gönderildi!');
};

onMounted(() => {
  getProduct();
  window.scrollTo(0, 0);
  
  // Check if product is in favorites
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  isFavorite.value = favorites.some(item => item.id === product.value.id);
});
</script>

<template>
  <Navbar />
  
  <div v-if="product" class="product-wrapper">
    <div class="product-container">
      <!-- Breadcrumb -->
      <div class="breadcrumb-nav">
        <a href="/">Anasayfa</a>
        <span>/</span>
        <a :href="'/kategori'">{{ product.category }}</a>
        <span>/</span>
        <span>{{ product.name }}</span>
      </div>
      
      <div class="productdetail-content">
        <!-- Product Images - Left Side -->
        <div class="product-gallery">
          <div class="gallery-main-image">
            <img :src="images[currentImageIndex]" :alt="product.name">
          </div>
          <div class="gallery-thumbnails">
            <div v-for="(image, index) in images" 
                :key="index"
                class="thumbnail-item"
                :class="{ 'thumbnail-active': images[currentImageIndex] === image }"
                @click="currentImageIndex = index">
              <img :src="image" :alt="product.name">
            </div>
          </div>
        </div>
        
        <!-- Product Info - Right Side -->
        <div class="product-info">
          <div class="product-header">
            <div class="title-wrapper">
              <h1 class="product-title">{{ product.name }}</h1>
              <button 
                class="favorite-button" 
                :class="{ 'is-favorite': isFavorite }"
                @click="handleFavoriteClick"
              >
                <i class="bi" :class="isFavorite ? 'bi-heart-fill' : 'bi-heart'"></i>
              </button>
            </div>
            <div class="price-container">
              <span class="current-price">₺{{ product.price }}</span>
              <span v-if="product.originalPrice" class="original-price">₺{{ product.originalPrice }}</span>
            </div>
          </div>
          
          <div class="product-description">
            <p>{{ product.description }}</p>
          </div>
          
          <div class="product-options">
            <!-- Model Selection -->
            <div v-if="product.models && product.models.length > 0" class="option-group">
              <h3 class="option-title">Model</h3>
              <div class="option-buttons">
                <button v-for="model in product.models" 
                        :key="model"
                        class="option-btn"
                        :class="{ 'option-btn-active': selectedModel === model }"
                        @click="selectedModel = model">
                  {{ model }}
                </button>
              </div>
            </div>
            
            <!-- Color Selection -->
            <div v-if="product.colors && product.colors.length > 0" class="option-group">
              <h3 class="option-title">Renk</h3>
              <div class="option-buttons">
                <button v-for="color in product.colors" 
                        :key="color"
                        class="option-btn"
                        :class="{ 'option-btn-active': selectedColor === color }"
                        @click="selectedColor = color">
                  {{ color }}
                </button>
              </div>
            </div>
            
            <!-- Quantity Selection -->
            <div class="option-group">
              <h3 class="option-title">Adet</h3>
              <div class="quantity-selector">
                <button class="quantity-btn" @click="decreaseQuantity">-</button>
                <input type="number" v-model="quantity" min="1" class="quantity-input">
                <button class="quantity-btn" @click="increaseQuantity">+</button>
              </div>
            </div>

            <!-- Shipping and Installment Info -->
            <div class="info-badges">
              <div class="info-badge-item">
                <i class="bi bi-credit-card"></i>
                <span>{{ siteData.installmentInfo.text }}</span>
              </div>
              <div class="info-badge-item">
                <i class="bi bi-truck"></i>
                <span>{{ siteData.shippingInfo.text }}</span>
              </div>
            </div>
          </div>
          
          <div class="product-actions">
            <button class="add-to-cart-btn" @click="addToCart">
              Sepete Ekle
            </button>
          </div>
        </div>
      </div>

      <!-- Product Description Section -->
      <div v-if="product.longDescription" class="product-description-section">
        <div class="tabs-container">
          <div class="tabs-header">
            <button 
              class="tab-button" 
              :class="{ 'active': activeTab === 'description' }"
              @click="setActiveTab('description')"
            >
              <i class="bi bi-file-text"></i>
              Ürün Açıklaması
              <i class="bi" :class="activeTab === 'description' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </button>
            
            <button 
              v-if="product.longDescription.features"
              class="tab-button" 
              :class="{ 'active': activeTab === 'features' }"
              @click="setActiveTab('features')"
            >
              <i class="bi bi-check2-circle"></i>
              Özellikler
              <i class="bi" :class="activeTab === 'features' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </button>
            
            <button 
              v-if="product.longDescription.materials"
              class="tab-button" 
              :class="{ 'active': activeTab === 'materials' }"
              @click="setActiveTab('materials')"
            >
              <i class="bi bi-box-seam"></i>
              Materyal Bilgileri
              <i class="bi" :class="activeTab === 'materials' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </button>
            
            <button 
              v-if="product.longDescription.careInstructions"
              class="tab-button" 
              :class="{ 'active': activeTab === 'care' }"
              @click="setActiveTab('care')"
            >
              <i class="bi bi-water"></i>
              Yıkama Talimatları
              <i class="bi" :class="activeTab === 'care' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </button>
          </div>

          <div class="tab-content" :class="{ 'active': activeTab === 'description' }">
            <p>{{ product.longDescription.details }}</p>
          </div>

          <div v-if="product.longDescription.features" class="tab-content" :class="{ 'active': activeTab === 'features' }">
            <div class="features-grid">
              <div v-for="feature in product.longDescription.features" :key="feature" class="feature-item">
                <i class="bi bi-check2-circle"></i>
                <span>{{ feature }}</span>
              </div>
            </div>
          </div>

          <div v-if="product.longDescription.materials" class="tab-content" :class="{ 'active': activeTab === 'materials' }">
            <ul class="content-list">
              <li v-for="material in product.longDescription.materials" :key="material">
                {{ material }}
              </li>
            </ul>
          </div>

          <div v-if="product.longDescription.careInstructions" class="tab-content" :class="{ 'active': activeTab === 'care' }">
            <ul class="content-list">
              <li v-for="instruction in product.longDescription.careInstructions" :key="instruction">
                {{ instruction }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Add this after the product description section -->
      <div class="reviews-section">
        <div class="reviews-container">
          <div class="reviews-header">
            <h2>Ürün Yorumları</h2>
            <div class="reviews-summary">
              <div class="rating">
                <i class="bi bi-star-fill"></i>
                <span>4.8</span>
              </div>
              <span class="total-reviews">(128 yorum)</span>
            </div>
          </div>

          <!-- Review Form -->
          <div class="review-form">
            <h3>Yorum Yap</h3>
            <div class="rating-input">
              <span>Puanınız:</span>
              <div class="productdetail-stars">
                <i v-for="n in 5" 
                   :key="n" 
                   class="bi" 
                   :class="n <= reviewRating ? 'bi-star-fill' : 'bi-star'"
                   :style="{ color: n <= reviewRating ? '#ffc107' : '#ddd' }"
                   @click="setRating(n)">
                </i>
              </div>
            </div>
            <div class="form-group">
              <input type="text" v-model="reviewerName" placeholder="Adınız" class="form-input">
            </div>
            <div class="form-group">
              <textarea v-model="reviewText" placeholder="Yorumunuz..." class="form-textarea"></textarea>
            </div>
            <button class="submit-review-btn" @click="submitReview">Yorumu Gönder</button>
          </div>

          <!-- Reviews List -->
          <div class="reviews-list">
            <div class="review-item" v-for="review in reviews" :key="review.id">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="reviewer-avatar">
                    <i class="bi bi-person-circle"></i>
                  </div>
                  <div class="reviewer-details">
                    <h4>{{ review.name }}</h4>
                    <div class="review-rating">
                      <template v-for="n in 5" :key="n">
                        <i v-if="n <= review.rating" class="bi bi-star-fill"></i>
                        <i v-else class="bi bi-star"></i>
                      </template>
                    </div>
                  </div>
                </div>
                <span class="review-date">{{ review.date }}</span>
              </div>
              <p class="review-text">{{ review.text }}</p>
              <div class="review-images">
                <img v-for="image in review.images" :key="image" :src="image" alt="Review">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <Footer />
</template>

<style>
.product-wrapper {
  margin-top: 107px;
  padding: 2rem 0;
  background-color: #fff;
}

.product-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.productdetail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 2rem;
}

.breadcrumb-nav {
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: #666;
}

.breadcrumb-nav a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-nav a:hover {
  color: #000;
}

.breadcrumb-nav span {
  margin: 0 0.5rem;
}

/* Product Images */
.product-gallery {
  position: sticky;
  top: 120px;
}

.gallery-main-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  margin-bottom: 1rem;
}

.gallery-main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-thumbnails {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.thumbnail-active {
  border-color: #333;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Info */
.product-info {
  border-radius: 8px;
  background-color: #fff;
}

.product-header {
  margin-bottom: 1.5rem;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.product-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.2;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-price {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.original-price {
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
}

.product-description {
  margin-bottom: 2rem;
  color: #666;
  line-height: 1.6;
}

.product-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-title {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.option-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-btn-active {
  background-color: #333;
  color: #fff;
  border-color: #333;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 150px;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.quantity-input {
  width: 60px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 1rem;
}

.product-actions {
  display: flex;
  gap: 1rem;
}

.add-to-cart-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #333;
  color: #fff;
}

.add-to-cart-btn:hover {
  background-color: #444;
}

.info-badges {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1.5rem;
  margin: 1rem 0;
  padding: 1rem 0;
}

.info-badge-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #333;
  flex: 1;
}

.info-badge-item i {
  font-size: 1.5rem;
  color: #333;
  flex-shrink: 0;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-badge-item span {
  flex: 1;
  line-height: 1.2;
  font-weight: 500;
  text-transform: uppercase;
}

.favorite-button {
  background: none;
  border: none;
  padding: 0.5rem;
  margin-top: 0.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #333;
  transition: all 0.3s ease;
  height: 40px;
  width: 40px;
}

.favorite-button:hover {
  transform: scale(1.1);
}

.favorite-button.is-favorite {
  color: #ff4b4b;
}

.favorite-button i {
  transition: all 0.3s ease;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .productdetail-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .product-gallery {
    position: static;
  }
}

@media (max-width: 768px) {
  .product-wrapper {
    padding: 1rem 0;
  }
  
  .product-container {
    padding: 0 1rem;
  }
  
  .product-title {
    font-size: 1.5rem;
  }
  
  .current-price {
    font-size: 1.3rem;
  }
  
  .original-price {
    font-size: 1rem;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .info-badges {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .product-wrapper {
    margin-top: 107px;
  }
  
  .product-actions {
    flex-direction: column;
  }
}

/* Product Description Section */
.product-description-section {
  margin-top: 4rem;
  padding: 2rem 0;
  background-color: #fff;
  border-top: 1px solid #eee;
}

.tabs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.tabs-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid #eee;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button i:first-child {
  font-size: 1.2rem;
}

.tab-button::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #333;
  transition: width 0.3s ease;
}

.tab-button:hover::after {
  width: 100%;
}

.tab-button.active {
  color: #333;
}

.tab-button.active::after {
  width: 100%;
}

.tab-button i:last-child {
  display: none; /* Remove chevron icons */
}

.tab-content {
  height: 0;
  opacity: 0;
  visibility: hidden;
  background: #fff;
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.tab-content.active {
  height: auto;
  opacity: 1;
  visibility: visible;
  padding: 2rem;
  margin-bottom: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.feature-item i {
  font-size: 1.2rem;
  color: #28a745;
}

.feature-item span {
  font-size: 0.95rem;
  color: #444;
  font-weight: 500;
}

.content-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.content-list li {
  position: relative;
  padding: 1rem;
  padding-left: 2rem;
  background: #fff;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #666;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.content-list li::before {
  content: "•";
  position: absolute;
  left: 1rem;
  color: #333;
  font-weight: bold;
}

@media (max-width: 992px) {
  .tabs-header {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .product-description-section {
    margin-top: 2rem;
    padding: 1.5rem 0;
  }
  
  .tabs-container {
    padding: 0 1rem;
  }
  
  .tabs-header {
    grid-template-columns: 1fr;
  }
  
  .tab-button {
    width: 100%;
    justify-content: flex-start;
  }
  
  .content-list {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-content.active {
    padding: 1.5rem;
  }
}

/* Reviews Section */
.reviews-section {
  margin-top: 4rem;
  padding: 2rem 0;
  background-color: #fff;
  border-top: 1px solid #eee;
}

.reviews-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.reviews-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.reviews-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating i {
  color: #ffc107;
  font-size: 1.2rem;
}

.rating span {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.total-reviews {
  color: #666;
  font-size: 1rem;
}

/* Review Form */
.review-form {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 3rem;
}

.review-form h3 {
  font-size: 1.4rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1.5rem;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.rating-input span {
  color: #666;
  font-weight: 500;
}

.productdetail-stars {
  display: flex;
  gap: 0.5rem;
}

.productdetail-stars i {
  font-size: 1.5rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.3s ease;
}

.productdetail-stars i:hover,
.productdetail-stars i.active {
  color: #ffc107;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.1);
}

.submit-review-btn {
  background: #333;
  color: #fff;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-review-btn:hover {
  background: #444;
}

/* Reviews List */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-item {
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reviewer-avatar i {
  font-size: 2rem;
  color: #666;
}

.reviewer-details h4 {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.review-rating {
  display: flex;
  gap: 0.25rem;
}

.review-rating i {
  font-size: 0.9rem;
  color: #ffc107;
}

.review-date {
  color: #999;
  font-size: 0.9rem;
}

.review-text {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.review-images {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.review-images img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.review-images img:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .reviews-section {
    margin-top: 2rem;
    padding: 1.5rem 0;
  }
  
  .reviews-container {
    padding: 0 1rem;
  }
  
  .reviews-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .review-form {
    padding: 1.5rem;
  }
  
  .rating-input {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .review-images img {
    width: 100px;
    height: 100px;
  }
}
</style>