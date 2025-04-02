<script setup>
import { defineProps, ref } from 'vue';
import siteData from '../data/siteData.json';

const props = defineProps({
  packages: {
    type: Array,
    required: true
  }
});

const title = ref(siteData.sliderSections.packages.title);
</script>

<template>
  <div class="package-cards-section">
    <div class="package-section-header">
      <h2 class="section-title">{{ title }}</h2>
    </div>
    
    <div class="package-cards-container">
      <a 
        v-for="pkg in packages" 
        :key="pkg.id" 
        :href="pkg.link" 
        class="package-card-link"
      >
        <div class="package-card">
          <div class="package-image-container">
            <img :src="pkg.image" :alt="pkg.title" class="package-image">
          </div>
          
          <div class="package-info">
            <div class="package-brand">{{ pkg.brand }}</div>
            <h3 class="package-title">{{ pkg.title }}</h3>
            
            <div class="package-rating">
              <div class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= pkg.rating }">
                  {{ i <= pkg.rating ? '★' : '☆' }}
                </span>
              </div>
              <span class="reviews">{{ pkg.reviews }} değerlendirme</span>
            </div>
            
            <div class="package-price">
              <div class="original-price-row">
                <span class="original-price">{{ pkg.originalPrice }}</span>
              </div>
              <div class="discount-row">
                <span class="discount-badge">{{ pkg.discountPercentage }}</span>
                <span class="discount-price">{{ pkg.discountPrice }}</span>
              </div>
            </div>
            
            <div class="package-colors">
              <div class="color-dots">
                <span 
                  v-for="color in pkg.colors" 
                  :key="color"
                  class="color-option"
                  :class="color"
                  :title="color"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<style setup>
.package-cards-section {
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 50px;
}

.package-section-header {
  display: flex;
  justify-content: center;
  align-items: center;
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

.package-cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
}

.package-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.package-card {
  position: relative;
  border-radius: 0;
  overflow: hidden;
  background-color: #fff;
  transition: transform 0.3s ease;
}

.package-card:hover {
  transform: translateY(-5px);
}

.package-image-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-radius: 8px;
}

.package-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.package-card:hover .package-image {
  transform: scale(1.05);
}

.package-info {
  padding: 24px 0 0 0;
}

.package-brand {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.package-title {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: normal;
}

.package-rating {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.stars {
  display: flex;
  margin-right: 5px;
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

.package-price {
  margin-bottom: 10px;
}

.original-price-row {
  margin-bottom: 4px;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 14px;
}

.discount-row {
  display: flex;
  align-items: center;
}

.discount-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ff0000;
  color: white;
  font-weight: bold;
  font-size: 14px;
  width: 40px;
  height: 24px;
  margin-right: 8px;
  border-radius: 2px;
}

.discount-price {
  font-weight: bold;
  font-size: 18px;
  color: #000;
}

.package-colors {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.color-dots {
  display: flex;
  gap: 5px;
}

.color-option {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #ddd;
}

.color-option.black {
  background-color: #000;
}

.color-option.navy {
  background-color: #000080;
}

.color-option.gray {
  background-color: #808080;
}

.color-option.beige {
  background-color: #f5f5dc;
}

.color-option.brown {
  background-color: #8b4513;
}

.color-option.orange {
  background-color: #FFA500;
}

.color-option.blue {
  background-color: #0000FF;
}

@media (max-width: 1200px) {
  .package-cards-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .package-cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .package-cards-container {
    grid-template-columns: 1fr;
  }
}
</style>