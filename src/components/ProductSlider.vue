<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import siteData from '../data/siteData.json';

const router = useRouter();

const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
});

const currentIndex = ref(0);
const visibleProducts = ref(4); // Default for desktop
const isTransitioning = ref(false);
const isSwiping = ref(false);
let touchStartX = 0;
let touchEndX = 0;

// Update visible products based on screen width
const updateVisibleProducts = () => {
  if (window.innerWidth <= 576) {
    visibleProducts.value = 1; // Mobile phones
  } else if (window.innerWidth <= 768) {
    visibleProducts.value = 2; // Tablets
  } else if (window.innerWidth <= 992) {
    visibleProducts.value = 3; // Small desktops
  } else {
    visibleProducts.value = 4; // Large desktops
  }
};

// Create a looped version of the products array for infinite scrolling
const loopedProducts = computed(() => {
  const buffer = [...props.products.slice(-visibleProducts.value), ...props.products, ...props.products.slice(0, visibleProducts.value)];
  return buffer;
});

onMounted(() => {
  updateVisibleProducts();
  window.addEventListener('resize', updateVisibleProducts);
  currentIndex.value = visibleProducts.value;
  
  autoScrollInterval = setInterval(() => {
    if (!isSwiping.value) {
      nextSlide();
    }
  }, 5000);
  
  const slider = document.querySelector('.product-slider');
  if (slider) {
    slider.addEventListener('touchstart', handleTouchStart, { passive: true });
    slider.addEventListener('touchmove', handleTouchMove, { passive: true });
    slider.addEventListener('touchend', handleTouchEnd, { passive: true });
  }
});

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
  isSwiping.value = true;
};

const handleTouchMove = (e) => {
  if (!isSwiping.value) return;
  touchEndX = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  if (!isSwiping.value) return;
  
  const swipeThreshold = 50;
  const swipeDistance = touchEndX - touchStartX;
  
  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0) {
      prevSlide();
    } else {
      nextSlide();
    }
  }
  
  isSwiping.value = false;
  resetInterval();
};

watch(visibleProducts, (newValue) => {
  currentIndex.value = newValue;
});

const nextSlide = () => {
  if (isTransitioning.value) return;
  
  isTransitioning.value = true;
  currentIndex.value++;
  
  if (currentIndex.value >= props.products.length + visibleProducts.value) {
    setTimeout(() => {
      isTransitioning.value = false;
      const wrapper = document.querySelector('.products-wrapper');
      if (wrapper) {
        wrapper.style.transition = 'none';
        currentIndex.value = visibleProducts.value;
        wrapper.offsetHeight;
        setTimeout(() => {
          wrapper.style.transition = 'transform 0.5s ease';
        }, 50);
      }
    }, 500);
  } else {
    setTimeout(() => {
      isTransitioning.value = false;
    }, 500);
  }
};

const prevSlide = () => {
  if (isTransitioning.value) return;
  
  isTransitioning.value = true;
  currentIndex.value--;
  
  if (currentIndex.value < visibleProducts.value) {
    setTimeout(() => {
      isTransitioning.value = false;
      const wrapper = document.querySelector('.products-wrapper');
      if (wrapper) {
        wrapper.style.transition = 'none';
        currentIndex.value = props.products.length + visibleProducts.value - 1;
        wrapper.offsetHeight;
        setTimeout(() => {
          wrapper.style.transition = 'transform 0.5s ease';
        }, 50);
      }
    }, 500);
  } else {
    setTimeout(() => {
      isTransitioning.value = false;
    }, 500);
  }
};

let autoScrollInterval = null;

const resetInterval = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(() => {
      if (!isSwiping.value) {
        nextSlide();
      }
    }, 5000);
  }
};

const navigateToProduct = (product) => {
  router.push({
    path: `/product/${product.id}`,
    query: { 
      model: product.model,
      color: product.color
    }
  });
};

onBeforeUnmount(() => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }
  window.removeEventListener('resize', updateVisibleProducts);
  
  const slider = document.querySelector('.product-slider');
  if (slider) {
    slider.removeEventListener('touchstart', handleTouchStart);
    slider.removeEventListener('touchmove', handleTouchMove);
    slider.removeEventListener('touchend', handleTouchEnd);
  }
});
</script>

<template>
  <div class="product-slider-section">
    <div class="product-section-header">
      <h2 class="section-title">{{ title }}</h2>
    </div>
    
    <div class="product-slider">
      <button 
        class="slider-control prev" 
        @click="prevSlide"
      >
        <span>&lt;</span>
      </button>
      
      <div class="products-container">
        <div 
          class="products-wrapper"
          :style="{ transform: `translateX(-${currentIndex * (100 / visibleProducts)}%)` }"
        >
          <div 
            v-for="(product, index) in loopedProducts" 
            :key="`${product.id}-${index}`" 
            class="productslider-card"
            @click="navigateToProduct(product)"
          >
            <div class="product-image-container">
              <div class="product-image">
                <img class="main-image" :src="product.image" :alt="product.name">
                <img class="hover-image" :src="product.hoverImage" :alt="product.name">
              </div>
            </div>
            
            <div class="product-info">
              <div class="product-brand">{{ product.category }}</div>
              <h3 class="product-name">{{ product.name }}</h3>
              
              <div class="product-rating">
                <div class="stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= product.rating }">
                    {{ i <= product.rating ? '★' : '☆' }}
                  </span>
                </div>
                <span class="reviews">{{ product.reviews }} değerlendirme</span>
              </div>
              
              <div class="product-price">
                ₺ {{ product.price }}
              </div>
              
              <div class="product-colors">
                <span 
                  v-for="color in product.colors" 
                  :key="color"
                  class="color-option"
                  :class="color"
                  :title="color"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        class="slider-control next" 
        @click="nextSlide"
      >
        <span>&gt;</span>
      </button>
    </div>
  </div>
</template>

<style>
.product-slider-section {
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 50px;
  position: relative;
}

.product-section-header {
  display: flex;
  justify-content: center !important;
  margin-bottom: 30px;
}

.section-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  position: relative;
  padding-bottom: 24px;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 2px;
  background-color: #000;
}

.product-slider {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  touch-action: pan-y;
}

.slider-control {
  width: 40px;
  height: 40px;
  background-color: white;
  border: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  transition: background-color 0.3s;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  visibility: hidden;
}

.slider-control:hover {
  background-color: #f8f8f8;
}

.prev {
  left: -60px;
}

.next {
  right: -60px;
}

.product-slider-section:hover .slider-control {
  opacity: 1;
  visibility: visible;
}

.products-container {
  width: 100%;
  overflow: hidden;
}

.products-wrapper {
  display: flex;
  transition: transform 0.5s ease;
  width: 100%;
}

.productslider-card {
  text-decoration: none;
  color: inherit;
  display: block;
  flex: 0 0 calc(25% - 15px);
  margin: 0 7.5px;
  cursor: pointer;
}

.product-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.hover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.productslider-card:hover .hover-image {
  opacity: 1;
}

.productslider-card:hover .main-image {
  opacity: 0;
}

.product-info {
  padding: 15px 0;
}

.product-brand {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #666;
}

.product-name {
  font-size: 15px;
  margin-bottom: 3px;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 3px;
  font-size: 12px;
}

.stars {
  display: flex;
  margin-right: 5px;
}

.star {
  color: #ddd;
  font-size: 14px;
}

.star.filled {
  color: #ffc107;
}

.reviews {
  color: #666;
  font-size: 12px;
}

.product-price {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 3px;
  color: #333;
}

.product-colors {
  display: flex;
  gap: 6px;
}

.color-option {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-option:hover {
  transform: scale(1.2);
}

.color-option.black {
  background-color: #000;
}

@media (max-width: 992px) {
  .productslider-card {
    flex: 0 0 calc(33.333% - 15px);
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .product-slider-section {
    padding: 0 30px;
  }
  
  .product-image {
    height: 100% !important;
  }
  
  .prev {
    left: -40px;
  }
  
  .next {
    right: -40px;
  }
}

@media (max-width: 768px) {
  .productslider-card {
    flex: 0 0 calc(50% - 15px);
  }
  
  .section-title {
    font-size: 22px;
  }
  
  .product-slider-section {
    padding: 0 20px;
    margin: 40px auto;
  }
  
  .product-image {
    height: 180px;
  }
  
  .slider-control {
    width: 30px;
    height: 30px;
  }
  
  .product-name {
    font-size: 15px;
  }
  
  .discount-price {
    font-size: 16px;
  }
  
  .slider-control {
    display: none !important;
  }
  
  .products-container::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.5));
    pointer-events: none;
    z-index: 5;
  }
}

@media (max-width: 576px) {
  .productslider-card {
    flex: 0 0 calc(100% - 15px);
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .product-slider-section {
    padding: 0 15px;
    margin: 30px auto;
  }
  
  .product-image {
    height: 200px;
  }
  
  .product-name {
    font-size: 14px;
    height: auto;
  }
}
</style>