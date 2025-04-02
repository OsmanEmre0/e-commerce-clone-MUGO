<script setup>
import siteData from '../data/siteData.json';

const features = siteData.features;
</script>

<template>
  <div class="feature-section">
    <div class="feature-container">
      <div v-for="feature in features" :key="feature.id" class="featuresection-item">
        <div class="feature-icon">
          <i :class="feature.icon"></i>
        </div>
        <div class="feature-text">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.feature-section {
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 50px;
}

.feature-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  padding: 40px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.featuresection-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #000;
}

.feature-text h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.feature-text p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}
</style>