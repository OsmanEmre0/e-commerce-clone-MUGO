<template>
  <Navbar />
  <div class="checkout-page">
    <div class="checkout-container">
      <div class="checkout-header">
        <h1>Sepetim</h1>
        <div class="cart-summary">
          <span>{{ cartItems.length }} Ürün</span>
        </div>
      </div>

      <div class="cart-progress" v-if="cartItems.length > 0">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: Math.min((cartTotal / 1000) * 100, 100) + '%' }"></div>
        </div>
        <p class="free-shipping-text" v-if="remainingForFreeShipping > 0">
          Ücretsiz kargo için sepetine ₺{{ remainingForFreeShipping }} daha ürün ekle.
        </p>
      </div>

      <div class="checkout-content">
        <div class="cart-items">
          <div v-if="cartItems.length === 0" class="empty-cart">
            <div class="empty-cart-content">
              <div class="cart-icon-container">
                <i class="bi bi-cart"></i>
              </div>
              <h2>Sepetiniz boş</h2>
              <p>Sepetinizde ürün bulunmamaktadır.</p>
              <router-link to="/" class="continue-shopping-btn">
                <i class="bi bi-arrow-left"></i>
                ALIŞVERİŞE DEVAM ET
              </router-link>
            </div>
          </div>
          <div v-else>
            <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
              <div class="cart-item-image">
                <img :src="item.image" :alt="item.name">
              </div>
              <div class="cart-item-details">
                <div class="item-info">
                  <h3>{{ item.name }}</h3>
                  <p class="item-color" v-if="item.color">{{ item.color }}</p>
                </div>
                <div class="item-actions">
                  <div class="quantity-controls">
                    <span>Adet</span>
                    <div class="quantity-buttons">
                      <button @click="updateQuantity(index, -1)">−</button>
                      <span>{{ item.quantity }}</span>
                      <button @click="updateQuantity(index, 1)">+</button>
                    </div>
                  </div>
                  <div class="price-section">
                    <div class="product-list-product-price">
                      <span v-if="item.discountPercentage" class="product-list-original-price">₺{{ (parseFloat(item.originalPrice) * item.quantity).toFixed(2) }}</span>
                      <span class="product-list-current-price">₺{{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</span>
                    </div>
                  </div>
                  <button class="remove-item" @click="removeFromCart(index)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="checkout-sidebar" v-if="cartItems.length > 0">
          <div class="order-summary">
            <h2>Sipariş Özeti</h2>
            <div class="summary-item">
              <span>Ara Toplam</span>
              <span>₺{{ cartTotal }}</span>
            </div>
            <div class="summary-item">
              <span>Kargo</span>
              <span v-if="cartTotal >= 1000">Ücretsiz</span>
              <span v-else>₺29.90</span>
            </div>
            <div class="total">
              <span>Toplam</span>
              <span>₺{{ finalTotal }}</span>
            </div>
            <button class="checkout-button" @click="goToPayment">
              <i class="bi bi-credit-card"></i>
              ÖDEME ADIMINA GİT
            </button>
            <div class="security-info">
              <div class="security-item">
                <i class="bi bi-shield-lock"></i>
                <span>256 Bit SSL ile güvenle alışveriş</span>
              </div>
              <div class="security-item">
                <i class="bi bi-truck"></i>
                <span>1.000 TL üzeri ücretsiz kargo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex'
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';

const store = useStore()
const router = useRouter();
const cartItems = computed(() => store.state.cartItems)
const cartTotal = computed(() => store.getters.cartTotal)
const remainingForFreeShipping = computed(() => store.getters.remainingForFreeShipping)
const finalTotal = computed(() => store.getters.finalTotal)

const updateQuantity = (index, change) => {
  const newQuantity = cartItems.value[index].quantity + change
  store.commit('updateQuantity', { index, newQuantity })
}

const removeFromCart = (index) => {
  store.commit('removeFromCart', index)
}

const goToPayment = () => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Ödeme yapmak için lütfen giriş yapın.');
    return;
  }
  // Redirect to payment page
  router.push('/payment');
};

onMounted(() => {
  store.commit('initializeCart')
})
</script>

<style scoped>
.checkout-page {
  padding-top: 107px;
  min-height: 100vh;
  background: #f8f8f8;
}

.checkout-container {
  margin: 0 auto;
  padding: 2rem;
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.checkout-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.cart-summary {
  color: #666;
}

.cart-progress {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
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

.checkout-content {
  display: flex;
  gap: 2rem;
  width: 100%;
}

.cart-items {
  background: white;
  border-radius: 4px;
  padding: 1rem;
}

.cart-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 500;
}

.continue-shopping-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 0;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s ease;
  min-width: 250px;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.continue-shopping-btn i {
  font-size: 1.25rem;
}

.continue-shopping-btn:hover {
  background: #333;
}

.item-color {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.item-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 1rem;
}

.quantity-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quantity-controls > span {
  color: #666;
  font-size: 0.9rem;
}

.quantity-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-buttons button {
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
  font-weight: 600;
  font-size: 1.1rem;
}

.remove-item {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
}

.checkout-sidebar {
  position: sticky;
  top: 127px;
  width: 30%;
}

.order-summary {
  background: white;
  border-radius: 4px;
  padding: 1.5rem;
}

.order-summary h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666;
}

.total {
  display: flex;
  justify-content: space-between;
  margin: 1.5rem 0;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  font-weight: 600;
  font-size: 1.1rem;
}

.checkout-button {
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

.checkout-button i {
  font-size: 1.1rem;
}

.security-info {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
}

.security-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  justify-content: center;
}

.security-item:last-child {
  margin-bottom: 0;
}

.security-item i {
  margin-right: 0.5rem;
  font-size: 1.1rem;
  color: #333;
}

.security-item span {
  font-size: 0.85rem;
  color: #333;
}

@media (max-width: 1200px) {
  .checkout-container {
    padding: 2rem 1.5rem;
  }

  .checkout-content {
    gap: 1.5rem;
  }

  .checkout-sidebar {
    width: 35%;
  }
}

@media (max-width: 991px) {

  .checkout-container {
    padding: 1.5rem 1rem;
  }

  .checkout-content {
    flex-direction: column;
  }

  .checkout-sidebar {
    position: static;
    width: 100%;
  }

  .order-summary {
    max-width: 100%;
  }

  .cart-items {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 1.5rem 1rem;
  }

  .checkout-header {
    margin-bottom: 1.5rem;
  }

  .cart-progress {
    margin-bottom: 1.5rem;
  }

  .cart-item {
    padding: 1rem;
  }

  .cart-item-image {
    width: 100px;
    height: 100px;
  }

  .item-actions {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .quantity-controls {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    order: 2;
  }

  .quantity-controls > span {
    min-width: 40px;
  }

  .price-section {
    order: 1;
  }

  .remove-item {
    order: 3;
  }
}

@media (max-width: 576px) {
  .checkout-page {
    padding-top: 87px;
  }

  .checkout-container {
    padding: 1rem 0.5rem;
  }

  .checkout-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .cart-progress {
    padding: 0.75rem;
  }

  .cart-items {
    padding: 0.75rem;
  }

  .cart-item {
    flex-direction: column;
    padding: 1rem 0;
    position: relative;
  }

  .cart-item-image {
    width: 100%;
    height: 200px;
  }

  .cart-item-details {
    width: 100%;
  }

  .item-info {
    position: relative;
    padding-right: 2.5rem;
  }

  .remove-item {
    position: absolute;
    top: 230px;
    right: 0;
    padding: 0.5rem;
  }

  .item-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .quantity-controls {
    width: 100%;
    justify-content: flex-start;
  }

  .price-section {
    width: 100%;
  }

  .order-summary {
    padding: 1rem;
  }

  .security-info {
    padding: 0.75rem;
  }

  .security-item {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }

  .security-item i {
    margin-right: 0;
  }

  .empty-cart {
    min-height: 300px;
    padding: 1.5rem;
    margin: 0 1rem;
  }


  .cart-icon-container i {
    font-size: 3rem;
  }

  .empty-cart h2 {
    font-size: 1.25rem;
  }

  .empty-cart p {
    font-size: 0.9rem;
    margin: 0.5rem 0 1rem;
  }

  .continue-shopping-btn {
    padding: 0.875rem 1.5rem;
    min-width: 200px;
    font-size: 0.8rem;
  }
}
</style> 