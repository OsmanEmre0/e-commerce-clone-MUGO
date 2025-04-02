<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Navbar from '../components/Navbar.vue';
import PromoBanner from '../components/PromoBanner.vue';
import ProductSlider from '../components/ProductSlider.vue';
import CategoryBanners from '../components/CategoryBanners.vue';
import PackageCards from '../components/PackageCards.vue';
import DiscountedProductsSlider from '../components/DiscountedProductsSlider.vue';
import FeatureSection from '../components/FeatureSection.vue';
import Footer from '../components/Footer.vue';
import siteData from '../data/siteData.json';

// Extract data from siteData.json
const slides = ref(siteData.mainSlider);
const products = ref(siteData.products);
const banners = ref(siteData.banners);
const packages = ref(siteData.packages);
const discountedProducts = ref(siteData.discountedProducts);
const sliderTitles = ref(siteData.sliderSections);

const currentSlide = ref(0);
let slideInterval = null;

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
};

onMounted(() => {
  slideInterval = setInterval(nextSlide, 5000);
});

onBeforeUnmount(() => {
  if (slideInterval) clearInterval(slideInterval);
});
</script>

<template>
  <Navbar />
  <PromoBanner />
  
  <!-- Main Slider Section -->
  <div class="main-section">
    <!-- Carousel -->
    <div class="carousel">
      <button class="carousel-button prev" @click="prevSlide">&#10094;</button>
      <div class="carousel-inner">
        <div 
          v-for="(slide, index) in slides" 
          :key="slide.id"
          class="carousel-item"
          :class="{ active: index === currentSlide }"
        >
          <img :src="slide.image" :alt="slide.alt" class="d-block w-100">
          
          <!-- Overlay with promo text if enabled for this slide -->
          <div v-if="slide.promoOverlay && slide.promoOverlay.enabled && slide.promoOverlay.text" class="carousel-caption">
            <div class="promo-text">
              <h2>{{ slide.promoOverlay.text.line1.split(' ')[0] }} <span class="percentage">{{ slide.promoOverlay.text.line1.split(' ')[1] }}</span></h2>
              <h2 class="sepet-indirimi">{{ slide.promoOverlay.text.line2 }}</h2>
            </div>
          </div>
        </div>
      </div>
      <button class="carousel-button next" @click="nextSlide">&#10095;</button>
    </div>
  </div>
  
  <!-- Product Slider Section -->
  <ProductSlider :products="products" :title="sliderTitles.productSlider.title" />
  
  <!-- Category Banners Section -->
  <CategoryBanners :banners="banners" />
  
  <!-- Package Cards Section -->
  <PackageCards :packages="packages" />
  
  <!-- Discounted Products Slider Section -->
  <DiscountedProductsSlider :products="discountedProducts" :title="sliderTitles.discountedProductsSlider.title" />
  
  <!-- Feature Section -->
  <FeatureSection />
  
  <!-- Footer Section -->
  <Footer />
</template>

<style>
/* Carousel Styles */
.main-section {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  overflow: hidden;
}

.carousel {
  position: relative;
  width: 100%;
  height: 800px;
  touch-action: pan-y;
  background-color: #000;
}

.carousel-inner {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease-in-out;
}

.carousel-item.active {
  opacity: 1;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Carousel Controls */
.carousel-button {
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: 2px solid #222;
  border-radius: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  transition: all 0.3s ease;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  visibility: hidden;
}

.carousel-button.prev {
  left: 20px;
}

.carousel-button.next {
  right: 20px;
}

/* Show controls when hovering over the carousel */
.carousel:hover .carousel-button {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 991px) {
  .carousel-button {
    display: none;
  }
}

/* Carousel Indicators */
.carousel-indicators {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
  justify-content: center;
  width: 100%;
  margin-left: 0 !important;
}

.carousel-indicators button {
  width: 30px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.carousel-indicators button.active {
  background-color: #fff;
  width: 45px;
}

/* Promo Text */
.carousel-caption {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.8);
}

.promo-text {
  color: #ff0000;
  text-align: center;
}

.promo-text h2 {
  font-size: 5rem;
  font-weight: bold;
  line-height: 1;
  margin: 0;
}

.percentage {
  font-size: 8rem;
}

.sepet-indirimi {
  font-size: 4rem;
  margin-top: 10px;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .carousel {
    height: 400px;
  }
  
  .carousel-controls {
    display: none;
  }
  
  .carousel-indicators {
    display: none;
  }
  
  .promo-text h2 {
    font-size: 2.5rem;
  }
  
  .percentage {
    font-size: 4rem;
  }
  
  .sepet-indirimi {
    font-size: 2rem;
  }
  
  .carousel-caption {
    width: 100%;
    right: auto;
  }
}

@media (max-width: 576px) {
  .carousel {
    height: 300px;
  }
  
  .promo-text h2 {
    font-size: 2rem;
  }
  
  .percentage {
    font-size: 3rem;
  }
  
  .sepet-indirimi {
    font-size: 1.5rem;
  }
}
</style>