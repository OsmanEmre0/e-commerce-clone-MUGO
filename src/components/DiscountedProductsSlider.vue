<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'İndirimli Ürünler'
  }
});

const currentIndex = ref(0);
const visibleProducts = ref(5); // Default for desktop
const isTransitioning = ref(false);
const isHovering = ref(false);
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
  } else if (window.innerWidth <= 1200) {
    visibleProducts.value = 4; // Medium desktops
  } else {
    visibleProducts.value = 5; // Large desktops
  }
};

// Create a looped version of the products array for infinite scrolling
// Add extra items at beginning and end to create seamless transition
const loopedProducts = computed(() => {
  // Create a buffer of products at the beginning and end for smooth looping
  const buffer = [...props.products.slice(-visibleProducts.value), ...props.products, ...props.products.slice(0, visibleProducts.value)];
  return buffer;
});

// Adjust the initial position to start at the first "real" item (after the buffer)
onMounted(() => {
  // Set initial visible products based on screen size
  updateVisibleProducts();
  
  // Add resize event listener
  window.addEventListener('resize', updateVisibleProducts);
  
  // Initialize current index after visibleProducts is set
  currentIndex.value = visibleProducts.value;
  
  // Start auto-scrolling
  autoScrollInterval = setInterval(() => {
    if (!isHovering.value && !isSwiping.value) {
      nextSlide();
    }
  }, 5000);
  
  // Add touch swipe functionality
  const slider = document.querySelector('.discounted-products-slider');
  if (slider) {
    slider.addEventListener('touchstart', handleTouchStart, { passive: true });
    slider.addEventListener('touchmove', handleTouchMove, { passive: true });
    slider.addEventListener('touchend', handleTouchEnd, { passive: true });
  }
});

// Touch event handlers
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
  
  const swipeThreshold = 50; // Minimum distance to be considered a swipe
  const swipeDistance = touchEndX - touchStartX;
  
  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0) {
      // Swipe right - go to previous slide
      prevSlide();
    } else {
      // Swipe left - go to next slide
      nextSlide();
    }
  }
  
  isSwiping.value = false;
  resetInterval();
};

// Watch for changes in visibleProducts and update currentIndex
watch(visibleProducts, (newValue) => {
  currentIndex.value = newValue;
});

const nextSlide = () => {
  if (isTransitioning.value) return;
  
  isTransitioning.value = true;
  currentIndex.value++;
  
  // If we've reached the end of the original items, wait for transition to complete
  // then instantly (no animation) reset to the beginning of the duplicated items
  if (currentIndex.value >= props.products.length + visibleProducts.value) {
    setTimeout(() => {
      isTransitioning.value = false;
      // Disable transition temporarily
      const wrapper = document.querySelector('.discounted-products-wrapper');
      if (wrapper) {
        wrapper.style.transition = 'none';
        // Reset to the beginning of the duplicated set (after the buffer)
        currentIndex.value = visibleProducts.value;
        // Force reflow to make the transition removal take effect
        wrapper.offsetHeight;
        // Re-enable transition
        setTimeout(() => {
          wrapper.style.transition = 'transform 0.5s ease';
        }, 50);
      }
    }, 500); // This should match the CSS transition time
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
  
  // If we've reached the beginning of the original items, wait for transition to complete
  // then instantly (no animation) reset to the end of the duplicated items
  if (currentIndex.value < visibleProducts.value) {
    setTimeout(() => {
      isTransitioning.value = false;
      // Disable transition temporarily
      const wrapper = document.querySelector('.discounted-products-wrapper');
      if (wrapper) {
        wrapper.style.transition = 'none';
        // Reset to the end of the duplicated set (before the buffer)
        currentIndex.value = props.products.length + visibleProducts.value - 1;
        // Force reflow to make the transition removal take effect
        wrapper.offsetHeight;
        // Re-enable transition
        setTimeout(() => {
          wrapper.style.transition = 'transform 0.5s ease';
        }, 50);
      }
    }, 500); // This should match the CSS transition time
  } else {
    setTimeout(() => {
      isTransitioning.value = false;
    }, 500);
  }
};

// Auto-scroll functionality
let autoScrollInterval = null;

// Reset interval when user interacts with slider
const resetInterval = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(() => {
      if (!isHovering.value && !isSwiping.value) {
        nextSlide();
      }
    }, 5000);
  }
};

// Clean up interval when component is unmounted
onBeforeUnmount(() => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }
  window.removeEventListener('resize', updateVisibleProducts);
  
  // Remove touch event listeners
  const slider = document.querySelector('.discounted-products-slider');
  if (slider) {
    slider.removeEventListener('touchstart', handleTouchStart);
    slider.removeEventListener('touchmove', handleTouchMove);
    slider.removeEventListener('touchend', handleTouchEnd);
  }
});

// Mouse enter/leave handlers for showing/hiding controls
const handleMouseEnter = () => {
  isHovering.value = true;
};

const handleMouseLeave = () => {
  isHovering.value = false;
};
</script>

<template>
  <div 
    class="discounted-products-section"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="discounted-section-header">
      <h2 class="section-title">{{ title }}</h2>
    </div>
    
    <div class="discounted-products-slider">
      <button 
        class="slider-control prev" 
        @click="prevSlide"
        :class="{ 'visible': isHovering }"
      >
        <span>&lt;</span>
      </button>
      
      <div class="discounted-products-container">
        <div 
          class="discounted-products-wrapper"
          :style="{ transform: `translateX(-${currentIndex * (100 / visibleProducts)}%)` }"
        >
          <div 
            v-for="(product, index) in loopedProducts" 
            :key="`${product.id}-${index}`" 
            class="discounted-product-card"
          >
            <router-link :to="'/product/' + product.id" class="product-link">
              <div class="product-image-container">
                <div class="discount-badge">%{{ product.discountPercentage }}</div>
                <div class="product-image">
                  <img class="main-image" :src="product.image" :alt="product.name">
                  <img class="hover-image" :src="product.hoverImage" :alt="product.name">
                </div>
              </div>
              
              <div class="product-info">
                <div class="product-brand">{{ product.brand }}</div>
                <h3 class="product-name">{{ product.name }}</h3>
                
                <div class="product-rating">
                  <div class="stars">
                    <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= product.rating }">
                      {{ i <= product.rating ? '★' : '☆' }}
                    </span>
                  </div>
                  <span class="reviews">{{ product.reviews }} değerlendirme</span>
                </div>
                
                <div class="discounted-product-price">
                  <div class="original-price">₺ {{ product.originalPrice }}</div>
                  <div class="discount-price">₺ {{ product.price }}</div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
      
      <button 
        class="slider-control next" 
        @click="nextSlide"
        :class="{ 'visible': isHovering }"
      >
        <span>&gt;</span>
      </button>
    </div>
  </div>
</template>

<style>
.discounted-products-section {
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 50px;
  position: relative;
}

.discounted-section-header {
  display: flex;
  justify-content: center;
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

.discounted-products-slider {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  touch-action: pan-y; /* Enable horizontal swiping */
}

/* Slider controls */
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

.slider-control.visible {
  opacity: 1;
  visibility: visible;
}

.prev {
  left: -60px;
}

.next {
  right: -60px;
}

/* Show controls when hovering over the product slider section */
.discounted-products-section:hover .slider-control {
  opacity: 1;
  visibility: visible;
}

.discounted-products-container {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.discounted-products-wrapper {
  display: flex;
  transition: transform 0.5s ease;
}

.discounted-product-card {
  flex: 0 0 calc(100% / 5);
  padding: 0 10px;
  box-sizing: border-box;
  margin-bottom: 20px;
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
  height: 100%;
}

.product-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
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
  opacity: 1;
  z-index: 1;
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
  z-index: 2;
}

.product-link:hover .hover-image {
  opacity: 1;
}

.product-link:hover .main-image {
  opacity: 0;
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff0000;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  z-index: 3;
}

.product-brand {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #666;
}

.product-name {
  font-size: 16px;
  margin-bottom: 12px;
  font-weight: normal;
  line-height: 1.4;
  height: 44px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.stars {
  display: flex;
  margin-right: 8px;
}

.star {
  color: #ccc;
}

.star.filled {
  color: #ffc107;
}

.reviews {
  color: #666;
  font-size: 12px;
}

.discounted-product-price {
  display: flex;
  align-items: start;
  gap: 1rem;
  flex-direction: column;
  gap: 4px;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 14px;
}

.discount-price {
  font-weight: bold;
  font-size: 18px;
  color: #ff0000;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .discounted-product-card {
    flex: 0 0 calc(100% / 4);
  }
  
  .section-title {
    font-size: 26px;
  }
  
  .discounted-products-section {
    padding: 0 40px;
  }
}

@media (max-width: 992px) {
  .discounted-product-card {
    flex: 0 0 calc(100% / 3);
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .discounted-products-section {
    padding: 0 30px;
  }
  
  .product-image {
    height: 200px;
  }
  
  .prev {
    left: -40px;
  }
  
  .next {
    right: -40px;
  }
}

@media (max-width: 768px) {
  .discounted-product-card {
    flex: 0 0 calc(100% / 2);
  }
  
  .section-title {
    font-size: 22px;
  }
  
  .discounted-products-section {
    padding: 0 20px;
    margin: 40px auto;
  }
  
  .product-image {
    height: 180px;
  }
  
  .slider-control {
    width: 30px;
    height: 30px;
    display: none !important;
  }
  
  .product-name {
    font-size: 15px;
  }
  
  .discount-price {
    font-size: 16px;
  }
  
  /* Add swipe hint for mobile */
  .discounted-products-container::after {
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
  .discounted-product-card {
    flex: 0 0 100%;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .discounted-products-section {
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