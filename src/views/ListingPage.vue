<script setup>
import { ref, computed, watch, onMounted, defineProps } from 'vue';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import siteData from '../data/siteData.json';
import { useRouter, useRoute } from 'vue-router';

// Define props to handle query from router
defineProps({
  query: {
    type: Object,
    default: () => ({})
  }
});

const router = useRouter();
const route = useRoute();

const products = ref(siteData.beltBags);
const filters = ref(siteData.productFilters.beltBags);
const gridView = ref(4); // Default 4 columns
const isFilterDrawerOpen = ref(false); // State for filter drawer

// Toggle filter drawer
const toggleFilterDrawer = () => {
  isFilterDrawerOpen.value = !isFilterDrawerOpen.value;
  
  // When opening drawer, prevent body scrolling
  if (isFilterDrawerOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Close filter drawer
const closeFilterDrawer = () => {
  isFilterDrawerOpen.value = false;
  document.body.style.overflow = '';
};

// Active filters
const activeFilters = ref({
  model: [],
  style: [],
  color: [],
  size: []
});

// Sort options
const sortOptions = [
  { value: 'recommended', label: 'Önerilen Sıralama' },
  { value: 'price-asc', label: 'Fiyat (Düşükten Yükseğe)' },
  { value: 'price-desc', label: 'Fiyat (Yüksekten Düşüğe)' },
  { value: 'name-asc', label: 'İsim (A-Z)' },
  { value: 'name-desc', label: 'İsim (Z-A)' }
];

const selectedSort = ref('recommended');

// Helper function to properly parse price values in both formats: 149.00 and 1,149.00
const parsePriceValue = (priceStr) => {
  // Remove currency symbol or any non-numeric characters at start
  const cleanPrice = priceStr.replace(/[^\d,.]/g, '');
  
  // Check if the price uses comma as decimal separator or thousand separator
  if (cleanPrice.includes(',')) {
    // Count number of commas to determine the format
    const commaCount = (cleanPrice.match(/,/g) || []).length;
    
    if (commaCount === 1 && cleanPrice.indexOf(',') === cleanPrice.length - 3) {
      // Format: 149,00 (comma is decimal separator)
      return parseFloat(cleanPrice.replace(',', '.'));
    } else {
      // Format: 1,149.00 or 1,149,00 (comma is thousand separator)
      return parseFloat(cleanPrice.replace(/,/g, ''));
    }
  }
  
  // If no commas, just parse as float
  return parseFloat(cleanPrice);
};

// Filtered and sorted products
const filteredProducts = computed(() => {
  // Start with a fresh copy of products
  let result = [...products.value];
  
  // Apply filters - using a single loop to avoid multiple array iterations
  const hasModelFilter = activeFilters.value.model?.length > 0;
  const hasStyleFilter = activeFilters.value.style?.length > 0;
  const hasColorFilter = activeFilters.value.color?.length > 0;
  const hasSizeFilter = activeFilters.value.size?.length > 0;
  
  // Only filter if there are active filters
  if (hasModelFilter || hasStyleFilter || hasColorFilter || hasSizeFilter) {
    result = result.filter(product => {
      // Check model filter
      if (hasModelFilter && !activeFilters.value.model.includes(product.model)) {
        return false;
      }
      
      // Check style filter
      if (hasStyleFilter && !activeFilters.value.style.includes(product.style)) {
        return false;
      }
      
      // Check color filter
      if (hasColorFilter && !activeFilters.value.color.includes(product.color)) {
        return false;
      }
      
      // Check size filter
      if (hasSizeFilter && !activeFilters.value.size.includes(product.size)) {
        return false;
      }
      
      // Product passed all active filters
      return true;
    });
  }
  
  // Apply sorting
  if (selectedSort.value !== 'recommended') {
    switch (selectedSort.value) {
      case 'price-asc':
        result.sort((a, b) => {
          return parsePriceValue(a.price) - parsePriceValue(b.price);
        });
        break;
      case 'price-desc':
        result.sort((a, b) => {
          return parsePriceValue(b.price) - parsePriceValue(a.price);
        });
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
  }
  
  return result;
});

// Initialize from URL on component mount
onMounted(() => {
  // Small delay to avoid initialization conflicts
  setTimeout(() => {
    initializeFromURL();
  }, 0);
});

// Initialize filters from URL
const initializeFromURL = () => {
  const query = route.query;
  
  // Skip initialization if no query params present
  if (Object.keys(query).length === 0) {
    return;
  }
  
  // Reset filters
  const newFilters = {
    model: [],
    style: [],
    color: [],
    size: []
  };
  
  // Process each filter category
  Object.keys(newFilters).forEach(category => {
    if (query[category]) {
      const filterValues = query[category].split(',').map(val => {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? null : parsed;
      }).filter(val => val !== null);
      
      if (filterValues.length > 0) {
        newFilters[category] = filterValues;
      }
    }
  });
  
  // Compare current filters with new filters from URL
  const currentFiltersStr = JSON.stringify(activeFilters.value);
  const newFiltersStr = JSON.stringify(newFilters);
  
  // Only update if filters have changed
  if (currentFiltersStr !== newFiltersStr) {
    // Update active filters
    activeFilters.value = newFilters;
  }
  
  // Handle sort parameter
  if (query.sort && query.sort !== selectedSort.value) {
    selectedSort.value = query.sort;
  }
};

// Watch for route changes (only when query changes)
watch(
  () => route.query,
  (newQuery) => {
    // Prevent updating from own changes
    const queryObj = {};
    
    // Build the query object from active filters
    Object.entries(activeFilters.value).forEach(([category, values]) => {
      if (values && values.length > 0) {
        queryObj[category] = values.join(',');
      }
    });
    
    // Add sort if not default
    if (selectedSort.value !== 'recommended') {
      queryObj.sort = selectedSort.value;
    }
    
    // Check if route changed because of our own updateURL
    const ownChange = JSON.stringify(queryObj) === JSON.stringify(newQuery);
    
    // Only initialize from URL if it wasn't our own change
    if (!ownChange) {
      initializeFromURL();
    }
  },
  { deep: true }
);

const toggleFilter = (category, id) => {
  // Create a shallow copy to avoid reactivity issues
  const updatedFilters = JSON.parse(JSON.stringify(activeFilters.value));
  
  // Ensure the category array exists
  if (!updatedFilters[category]) {
    updatedFilters[category] = [];
  }
  
  // Find the index of the ID in the category array
  const index = updatedFilters[category].indexOf(id);
  
  if (index === -1) {
    // Add filter
    updatedFilters[category].push(id);
  } else {
    // Remove filter
    updatedFilters[category] = updatedFilters[category].filter(item => item !== id);
  }
  
  // Update active filters first to trigger reactive updates
  activeFilters.value = updatedFilters;
  
  // Then update the URL (separated to avoid race conditions)
  updateURL();
};

// Function to update the URL based on active filters
const updateURL = () => {
  // Create query object
  const query = {};
  
  // Add filter categories to query
  Object.entries(activeFilters.value).forEach(([category, values]) => {
    if (values && values.length > 0) {
      query[category] = values.join(',');
    }
  });
  
  // Add sort if not default
  if (selectedSort.value !== 'recommended') {
    query.sort = selectedSort.value;
  }
  
  // Only update if current URL is different to avoid unnecessary URL changes
  const currentQuery = route.query;
  const queryChanged = JSON.stringify(query) !== JSON.stringify(currentQuery);
  
  if (queryChanged) {
    // Update URL without page reload
    router.replace({ 
      path: route.path, 
      query 
    }).catch(err => {
      if (err.name !== 'NavigationDuplicated') {
        console.error('URL update error:', err);
      }
    });
  }
};

// Watch for selected sort changes
watch(
  selectedSort,
  (newVal) => {
    // Only update URL when user changes the sort
    if (newVal) {
      updateURL();
    }
  }
);

const clearFilters = () => {
  activeFilters.value = {
    model: [],
    style: [],
    color: [],
    size: []
  };
  
  // Reset sort option
  selectedSort.value = 'recommended';
  
  // Clear filters from URL as well
  updateURL();
};

const toggleGridView = (columns) => {
  gridView.value = columns;
};

// Add this function to handle sorting changes
const handleSortChange = (e) => {
  const newSort = e.target.value;
  
  // Skip if sort value hasn't changed
  if (newSort === selectedSort.value) {
    return;
  }
  
  // Update the selected sort value
  selectedSort.value = newSort;
  
  // Update URL immediately
  updateURL();
};

// Add this function in the script section
const navigateToProduct = (product) => {
  router.push({
    path: `/product/${product.id}`,
    query: { 
      model: product.model,
      color: product.color
    }
  });
};

const sortProducts = () => {
  if (selectedSort.value === 'recommended') {
    // Önerilen sıralama için mevcut sıralamayı koruyoruz
    return filteredProducts.value;
  } else if (selectedSort.value === 'price-asc') {
    // Fiyat düşükten yükseğe
    return [...filteredProducts.value].sort((a, b) => {
      return parsePriceValue(a.price) - parsePriceValue(b.price);
    });
  } else if (selectedSort.value === 'price-desc') {
    // Fiyat yüksekten düşüğe
    return [...filteredProducts.value].sort((a, b) => {
      return parsePriceValue(b.price) - parsePriceValue(a.price);
    });
  } else if (selectedSort.value === 'name-asc') {
    // En yeniler için mevcut işlemi koruyoruz
    return [...filteredProducts.value].sort((a, b) => a.name.localeCompare(b.name));
  } else if (selectedSort.value === 'name-desc') {
    // En yeniler için mevcut işlemi koruyoruz
    return [...filteredProducts.value].sort((a, b) => b.name.localeCompare(a.name));
  } else {
    return filteredProducts.value;
  }
};
</script>

<template>
  <Navbar />
  
  <div class="product-list-page">
    <div class="product-list-breadcrumb">
      <a href="/">Anasayfa</a>
      <span>/</span>
      <a href="/canta">Çanta</a>
      <span>/</span>
      <span>Bel Çantası</span>
    </div>
    
    <div class="product-list-page-title">
      <h1>Bel Çantası</h1>
      <span class="product-list-product-count">{{ filteredProducts.length }} ürün</span>
    </div>
    
    <div class="product-list-container">
      <!-- Mobile Filter Button (Only visible on tablet and below) -->
      <button class="product-list-filter-toggle" @click="toggleFilterDrawer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M10 18H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Filtrele</span>
      </button>
      
      <!-- Filter Drawer Overlay -->
      <div 
        v-if="isFilterDrawerOpen" 
        class="product-list-filter-overlay"
        @click="closeFilterDrawer"
      ></div>
      
      <!-- Filters Sidebar / Drawer -->
      <aside 
        class="product-list-filters-sidebar" 
        :class="{ 'drawer-active': isFilterDrawerOpen }"
      >
        <div class="product-list-filters-header">
          <h2>Filtrele</h2>
          <div class="product-list-filter-actions">
            <button class="product-list-clear-filters" @click="clearFilters">
              Temizle
            </button>
            <!-- Close button visible only in drawer mode -->
            <button class="product-list-drawer-close" @click="closeFilterDrawer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Filter content remains the same -->
        <!-- Model Filter -->
        <div class="product-list-filter-section">
          <h3>Model</h3>
          <div class="product-list-filter-options">
            <label v-for="model in filters.model" :key="model.id" class="product-list-filter-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.model.includes(model.id)"
                @change="toggleFilter('model', model.id)"
              >
              <span class="product-list-filter-label">{{ model.name }}</span>
              <span class="product-list-filter-count">({{ model.count }})</span>
            </label>
          </div>
        </div>
        
        <!-- Style Filter -->
        <div class="product-list-filter-section">
          <h3>Stil</h3>
          <div class="product-list-filter-options">
            <label v-for="style in filters.style" :key="style.id" class="product-list-filter-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.style.includes(style.id)"
                @change="toggleFilter('style', style.id)"
              >
              <span class="product-list-filter-label">{{ style.name }}</span>
              <span class="product-list-filter-count">({{ style.count }})</span>
            </label>
          </div>
        </div>
        
        <!-- Color Filter -->
        <div class="product-list-filter-section">
          <h3>Renk</h3>
          <div class="product-list-filter-options">
            <label v-for="color in filters.color" :key="color.id" class="product-list-filter-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.color.includes(color.id)"
                @change="toggleFilter('color', color.id)"
              >
              <span class="product-list-filter-label">{{ color.name }}</span>
              <span class="product-list-filter-count">({{ color.count }})</span>
            </label>
          </div>
        </div>
        
        <!-- Size Filter -->
        <div class="product-list-filter-section">
          <h3>Boyut</h3>
          <div class="product-list-filter-options">
            <label v-for="size in filters.size" :key="size.id" class="product-list-filter-option">
              <input 
                type="checkbox" 
                :checked="activeFilters.size.includes(size.id)"
                @change="toggleFilter('size', size.id)"
              >
              <span class="product-list-filter-label">{{ size.name }}</span>
              <span class="product-list-filter-count">({{ size.count }})</span>
            </label>
          </div>
        </div>
        
        <!-- Apply button only visible in drawer mode -->
        <button class="product-list-apply-filters-btn" @click="closeFilterDrawer">
          Filtreleri Uygula
        </button>
      </aside>
      
      <!-- Products Grid -->
      <div class="product-list-products-container">
        <div class="product-list-products-header">
          <select v-model="selectedSort" class="product-list-sort-select" @change="handleSortChange">
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <div class="product-list-view-options">
            <button 
              class="product-list-view-button" 
              :class="{ 'active': gridView === 3 }"
              @click="toggleGridView(3)"
              title="3'lü Görünüm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H8V8H3V3Z" fill="currentColor"/>
                <path d="M9.5 3H14.5V8H9.5V3Z" fill="currentColor"/>
                <path d="M16 3H21V8H16V3Z" fill="currentColor"/>
              </svg>
            </button>
            <button 
              class="product-list-view-button" 
              :class="{ 'active': gridView === 4 }"
              @click="toggleGridView(4)"
              title="4'lü Görünüm"
            >
              <svg width="22" height="18" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H7V8H3V3Z" fill="currentColor"/>
                <path d="M9 3H13V8H9V3Z" fill="currentColor"/>
                <path d="M15 3H19V8H15V3Z" fill="currentColor"/>
                <path d="M21 3H25V8H21V3Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="product-list-products-grid" :class="{ 'grid-view-3': gridView === 3, 'grid-view-4': gridView === 4 }">
          <div v-for="product in sortProducts()" :key="product.id" class="product-list-product-card" @click="navigateToProduct(product)">
            <div class="product-list-product-image-container">
              <img :src="product.image" :alt="product.name" class="product-list-main-image">
              <img :src="product.hoverImage" :alt="product.name" class="product-list-hover-image">
              <span v-if="product.discountPercentage" class="product-list-discount-badge">
                %{{ product.discountPercentage }}
              </span>
            </div>
            
            <div class="product-list-product-info">
              <div class="product-list-product-brand">{{ product.brand }}</div>
              <h3 class="product-list-product-name">{{ product.name }}</h3>
              
              <div class="product-list-product-rating">
                <div class="product-list-stars">
                  <span v-for="i in 5" :key="`star-${product.id}-${i}`" class="product-list-star" :class="{ 'filled': i <= product.rating }">
                    {{ i <= product.rating ? '★' : '☆' }}
                  </span>
                </div>
                <span class="product-list-reviews">{{ product.reviews }} değerlendirme</span>
              </div>
              
              <div class="product-list-product-price">
                <span v-if="product.discountPercentage" class="product-list-original-price">₺{{ product.originalPrice }}</span>
                <span class="product-list-current-price">₺{{ product.price }}</span>
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
.product-list-page {
  margin-top: 107px;
  padding: 2rem 0;
  background-color: #fff;
  width: 100%;
}

.product-list-breadcrumb {
  margin-bottom: 1rem !important;
  font-size: 0.9rem;
  color: #666;
  padding-left: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.product-list-breadcrumb a {
  color: #666;
  text-decoration: none;
}

.product-list-breadcrumb span {
  margin: 0 0.5rem;
  color: #999;
}

.product-list-page-title {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-left: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.product-list-page-title h1 {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  padding-left: 0;
}

.product-list-product-count {
  margin-left: 1rem;
  color: #666;
  font-size: 1rem;
}

.product-list-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  gap: 2rem;
}

/* Filters Sidebar */
.product-list-filters-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  padding: 4rem 1.5rem 1.5rem 2rem;
  border-radius: 0;
  box-shadow: 2px 0 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 127px;
  height: fit-content;
  margin-left: 0;
  z-index: 10;
}

.product-list-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-left: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.product-list-filters-header h2 {
  font-size: 1.2rem;
  margin: 0;
  font-weight: 600;
  color: #333;
}

.product-list-filter-actions {
  display: flex;
  gap: 0.5rem;
}

.product-list-clear-filters {
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.product-list-clear-filters:hover {
  color: #333;
  background-color: #f5f5f5;
}

.product-list-drawer-close {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  padding: 0.5rem;
  font-size: 1rem;
}

.product-list-filter-actions {
  display: flex;
  align-items: center;
}

.product-list-filter-section {
  margin-bottom: 2rem;
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem;
}

.product-list-filter-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-left: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

.product-list-filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0;
}

.product-list-filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: all 0.2s ease;
}

.product-list-filter-option:hover {
  background-color: #f8f8f8;
  border-radius: 4px;
}

.product-list-filter-option input[type="checkbox"] {
  position: relative;
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  border: 2px solid #ddd;
  border-radius: 4px;
  background-color: white;
  transition: all 0.2s ease;
}

.product-list-filter-option input[type="checkbox"]:checked {
  background-color: #333;
  border-color: #333;
}

.product-list-filter-option input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.product-list-filter-option input[type="checkbox"]:hover {
  border-color: #999;
}

.product-list-filter-option input[type="checkbox"]:checked:hover {
  border-color: #333;
}

.product-list-filter-label {
  font-size: 0.95rem;
  color: #333;
  flex: 1;
}

.product-list-filter-count {
  color: #666;
  font-size: 0.85rem;
  background-color: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 40px;
  text-align: center;
}

/* Products Container */
.product-list-products-container {
  flex: 1;
  min-width: 0;
  padding-right: 2rem;
}

.product-list-products-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.product-list-sort-select {
  padding: 0.5rem 2rem 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
  background-color: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23333' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
}

.product-list-view-options {
  display: flex;
  gap: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.25rem;
  background-color: white;
}

.product-list-view-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.product-list-view-button:hover {
  background-color: #f5f5f5;
  color: #333;
}

.product-list-view-button.active {
  background-color: #f0f0f0;
  color: #333;
}

.product-list-products-grid {
  display: grid;
  gap: 2rem;
  margin-top: 1.5rem;
}

.grid-view-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-view-4 {
  grid-template-columns: repeat(4, 1fr);
}

.product-list-product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  cursor: pointer;
}


.product-list-product-image-container {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
}

.product-list-product-image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.product-list-main-image {
  opacity: 1;
}

.product-list-hover-image {
  opacity: 0;
}

.product-list-product-card:hover .product-list-main-image {
  opacity: 0;
}

.product-list-product-card:hover .product-list-hover-image {
  opacity: 1;
}

.product-list-discount-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #ff0000;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.product-list-product-info {
  padding: 1rem;
}

.product-list-product-brand {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.product-list-product-name {
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.5rem;
}

.product-list-product-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.product-list-stars {
  color: #ffd700;
}

.product-list-reviews {
  font-size: 0.8rem;
  color: #666;
}

.product-list-product-price {
  display: flex;
  align-items: start;
  gap: 1rem;
}

.product-list-original-price {
  font-size: 0.9rem;
  color: #999;
  text-decoration: line-through;
}

.product-list-current-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

/* Responsive Styles */
@media (max-width: 1600px) {
  .product-list-container,
  .product-list-breadcrumb,
  .product-list-page-title {
    max-width: 1400px;
  }
}

@media (max-width: 1400px) {

  .product-list-view-options {
    display: none;
  }

  .product-list-container,
  .product-list-breadcrumb,
  .product-list-page-title {
    max-width: 1200px;
  }
  
  .grid-view-4 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .grid-view-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .product-list-filters-sidebar {
    width: 250px;
    padding: 3rem 1.25rem 1.5rem 1.5rem;
  }
}

@media (max-width: 1200px) {
  .product-list-container,
  .product-list-breadcrumb,
  .product-list-page-title {
    max-width: 992px;
  }
}

@media (max-width: 992px) {
  .product-list-page {
    margin-top: 80px;
  }
  
  .product-list-container {
    padding: 0 1rem;
    gap: 1.5rem;
  }
  
  .product-list-filters-sidebar {
    width: 220px;
    padding: 1.5rem 1rem 1.5rem 1rem;
    top: 100px;
  }
  
  .product-list-breadcrumb,
  .product-list-page-title {
    padding-left: 1rem;
  }
  
  .product-list-page-title h1 {
    font-size: 1.5rem;
  }
  
  .product-list-products-container {
    padding-right: 1rem;
  }
  
  .grid-view-4,
  .grid-view-3 {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .product-list-filter-section {
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .product-list-filter-section h3 {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .product-list-page {
    padding: 1rem 0;
    margin-top: 70px;
  }
  
  .product-list-breadcrumb {
    font-size: 0.8rem;
    margin-bottom: 0.5rem !important;
  }
  
  .product-list-page-title {
    margin-bottom: 1rem;
  }
  
  .product-list-container {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
  
  .product-list-filters-sidebar {
    width: 100%;
    position: static;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border-radius: 8px;
  }
  
  .product-list-filters-header {
    margin-bottom: 1rem;
  }
  
  .product-list-products-container {
    padding: 0;
  }
  
  /* Make filter sections collapsible on mobile */
  .product-list-filter-section {
    margin-bottom: 0.75rem;
  }
  
  .product-list-products-header {
    margin-bottom: 1rem;
  }
  
  .grid-view-4,
  .grid-view-3 {
    gap: 1rem;
  }
  
  /* Hide view options on mobile */
  .product-list-view-options {
    display: none;
  }
  
  .product-list-sort-select {
    flex: 1;
    max-width: 100%;
  }
  
  .product-list-products-header {
    justify-content: stretch;
  }
}

@media (max-width: 576px) {
  .product-list-page {
    margin-top: 60px;
    padding: 0.5rem 0;
  }
  
  .product-list-container,
  .product-list-breadcrumb,
  .product-list-page-title {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .product-list-page-title {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 40px;
  }
  
  .product-list-product-count {
    margin-left: 0;
    margin-top: 0.25rem;
  }
  
  .grid-view-4,
  .grid-view-3 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .product-list-product-card {
    max-width: 100%;
  }
  
  .product-list-filter-section {
    padding: 0.5rem;
  }
  
  .product-list-filter-option {
    padding: 0.35rem 0;
  }
  
  .product-list-product-info {
    padding: 0.75rem;
  }
  
  .product-list-filters-sidebar {
    padding: 0.75rem;
  }
  
  /* Smaller font sizes for mobile */
  .product-list-page-title h1 {
    font-size: 1.3rem;
  }
  
  .product-list-filter-section h3 {
    font-size: 0.95rem;
  }
  
  .product-list-filter-label {
    font-size: 0.85rem;
  }
  
  .product-list-filter-count {
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
  }
}

/* Small mobile devices */
@media (max-width: 375px) {
  .product-list-page {
    margin-top: 55px;
  }
  
  .product-list-container,
  .product-list-breadcrumb,
  .product-list-page-title {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .product-list-page-title h1 {
    font-size: 1.2rem;
  }
  
  .product-list-product-name {
    font-size: 0.9rem;
    height: 2.2rem;
  }
  
  .product-list-current-price {
    font-size: 1rem;
  }
}

/* Filter Toggle Button (Visible on tablet and mobile) */
.product-list-filter-toggle {
  display: none;
  align-items: center;
  gap: 0.5rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.product-list-filter-toggle:hover {
  background-color: #222;
}

.product-list-filter-toggle svg {
  margin-right: 0.25rem;
}

/* Filter Drawer Overlay */
.product-list-filter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Apply Filters Button (visible only in drawer mode) */
.product-list-apply-filters-btn {
  display: none;
  width: 100%;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.product-list-apply-filters-btn:hover {
  background-color: #222;
}

.product-list-drawer-close {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  padding: 0.5rem;
  font-size: 1rem;
}

.product-list-filter-actions {
  display: flex;
  align-items: center;
}

/* Tablet and Mobile Styles for Drawer */
@media (max-width: 992px) {
  .product-list-filter-toggle {
    display: flex;
    width: 100%;
    justify-content: center;
  }
  
  .product-list-filter-overlay {
    display: block;
  }
  
  .product-list-filters-sidebar {
    position: fixed;
    top: 0;
    left: -320px;
    width: 300px;
    height: 100vh;
    z-index: 1000;
    overflow-y: auto;
    padding: 1.5rem;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transition: left 0.3s ease;
    margin: 0;
  }
  
  .product-list-filters-sidebar.drawer-active {
    left: 0;
  }
  
  .product-list-drawer-close {
    display: block;
  }
  
  .product-list-apply-filters-btn {
    display: block;
    position: sticky;
    bottom: 0;
    margin-top: 2rem;
    padding: 1rem;
    border-radius: 4px;
    background-color: #333;
    color: white;
    text-align: center;
    font-weight: 600;
  }
  
  .product-list-container {
    display: block;
  }
  
  .product-list-products-container {
    width: 100%;
    padding: 0;
  }

  .product-list-view-options{
    display: none;
  }
}

@media (max-width: 768px) {
  /* Existing mobile styles... */
  
  .product-list-filters-sidebar {
    width: 280px;
  }
}

@media (max-width: 576px) {
  /* Existing mobile styles... */
  
  .product-list-filters-sidebar {
    width: 100%;
    max-width: 320px;
  }
}

.product-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 1:1 Aspect Ratio */
  overflow: hidden;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}



.product-brand {
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.product-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.original-price {
  font-size: 0.9rem;
  color: #999;
  text-decoration: line-through;
}

/* Responsive styles */
@media (max-width: 768px) {
  .product-info {
    padding: 0.75rem;
  }

  .product-brand {
    font-size: 0.8rem;
  }

  .product-name {
    font-size: 0.9rem;
  }

  .current-price {
    font-size: 1rem;
  }

  .original-price {
    font-size: 0.8rem;
  }
}
</style>