<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';

const router = useRouter();
const store = useStore();
const user = ref(null);
const activeTab = ref('profile');
const isEditingProfile = ref(false);
const isChangingPassword = ref(false);
const showAddressModal = ref(false);

// İl ve ilçe state'leri
const provinces = ref([]);
const districts = ref([]);
const selectedProvince = ref('');

// Form refs
const editedUser = ref({});
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Addresses from store
const addresses = computed(() => store.getters.userAddresses);

// İlleri getir ve alfabetik sırala
const fetchProvinces = async () => {
  try {
    const response = await axios.get('https://turkiyeapi.dev/api/v1/provinces');
    provinces.value = response.data.data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  } catch (error) {
    console.error('İller yüklenirken hata oluştu:', error);
  }
};

// Seçilen ile göre ilçeleri getir
const fetchDistricts = async (provinceId) => {
  if (!provinceId) {
    districts.value = [];
    return;
  }
  try {
    const response = await axios.get(`https://turkiyeapi.dev/api/v1/provinces/${provinceId}/districts`);
    if (response.data && response.data.data) {
      districts.value = response.data.data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    } else {
      console.error('No districts data found');
      districts.value = [];
    }
  } catch (error) {
    console.error('İlçeler yüklenirken hata oluştu:', error);
    districts.value = [];
  }
};

// İl değiştiğinde ilçeleri güncelle
const handleProvinceChange = (event) => {
  const provinceId = event.target.value;
  selectedProvince.value = provinceId;
  newAddress.value.city = provinces.value.find(p => p.id === Number(provinceId))?.name || '';
  newAddress.value.district = ''; // İl değiştiğinde ilçeyi sıfırla
  if (provinceId) {
    fetchDistricts(provinceId);
  } else {
    districts.value = [];
  }
};

// İlçe seçildiğinde
const handleDistrictChange = (event) => {
  const districtName = event.target.value;
  newAddress.value.district = districtName;
};

// Mock data for orders and favorites
const orders = ref([
  {
    id: '1234',
    date: '2024-02-20',
    status: 'Teslim Edildi',
    total: '1,299.00',
    items: [
      { name: 'MUGO Essential Unisex Zip Hoodie', quantity: 1, price: '1,139.40' }
    ]
  },
  {
    id: '1235',
    date: '2024-02-15',
    status: 'Kargoda',
    total: '899.40',
    items: [
      { name: 'MUGO Campus Sırt Çantası - Bordo', quantity: 1, price: '899.40' }
    ]
  }
]);

const favorites = ref([]);

const loadFavorites = () => {
  favorites.value = JSON.parse(localStorage.getItem('favorites') || '[]');
};

const removeFavorite = (productId) => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const updatedFavorites = favorites.filter(item => item.id !== productId);
  localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  loadFavorites(); // Reload favorites after removing
};

const newAddress = ref({
  id: null,
  firstName: '',
  lastName: '',
  title: '',
  address: '',
  postalCode: '',
  city: '',
  district: '',
  phone: ''
});

onMounted(() => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    router.push('/auth');
    return;
  }
  user.value = JSON.parse(currentUser);
  editedUser.value = { ...user.value };
  
  // İlleri yükle
  fetchProvinces();
  loadFavorites();
  store.commit('initializeAddresses');

  // URL'deki tab parametresini kontrol et
  const tabParam = router.currentRoute.value.query.tab;
  if (tabParam) {
    activeTab.value = tabParam;
  }
});

const handleLogout = () => {
  localStorage.removeItem('currentUser');
  router.push('/auth');
};

const startEditingProfile = () => {
  isEditingProfile.value = true;
  editedUser.value = { ...user.value };
};

const saveProfile = () => {
  user.value = { ...editedUser.value };
  localStorage.setItem('currentUser', JSON.stringify(user.value));
  isEditingProfile.value = false;
};

const cancelEditingProfile = () => {
  isEditingProfile.value = false;
  editedUser.value = { ...user.value };
};

const changePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Yeni şifreler eşleşmiyor!');
    return;
  }
  alert('Şifre başarıyla değiştirildi!');
  isChangingPassword.value = false;
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
};

const removeFromFavorites = (id) => {
  favorites.value = favorites.value.filter(item => item.id !== id);
};

const toggleAddressModal = () => {
  showAddressModal.value = !showAddressModal.value;
  if (!showAddressModal.value) {
    // Reset form when closing modal
    newAddress.value = {
      id: null,
      firstName: '',
      lastName: '',
      title: '',
      address: '',
      postalCode: '',
      city: '',
      district: '',
      phone: ''
    };
    selectedProvince.value = '';
    districts.value = [];
  }
};

const removeAddress = (id) => {
  store.commit('removeAddress', id);
};

const editAddress = (address) => {
  newAddress.value = {
    ...address,
    phone: address.phone.substring(3) // Remove +90 when editing
  };
  
  // İl seçimini ayarla
  const province = provinces.value.find(p => p.name === address.city);
  if (province) {
    selectedProvince.value = province.id.toString();
    fetchDistricts(province.id);
  }
  
  showAddressModal.value = true;
};

const saveEditedAddress = () => {
  const updatedAddress = {
    ...newAddress.value,
    phone: '+90' + newAddress.value.phone
  };
  
  store.commit('updateAddress', { id: updatedAddress.id, address: updatedAddress });
  toggleAddressModal();
};

const handleAddressSubmit = () => {
  if (newAddress.value.id) {
    saveEditedAddress();
  } else {
    const addressToAdd = {
      ...newAddress.value,
      phone: '+90' + newAddress.value.phone
    };
    store.commit('addAddress', addressToAdd);
  }
  toggleAddressModal();
};

// Add this function to handle product click
const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`);
};

const handlePhoneInput = (event) => {
  // Sadece rakamları al
  const numericValue = event.target.value.replace(/\D/g, '');
  // En fazla 10 rakam olacak şekilde güncelle
  newAddress.value.phone = numericValue.slice(0, 10);
};
</script>

<template>
  <Navbar />
  <div class="profile-page">
    <div class="profile-container" v-if="user">
      <div class="profile-sidebar">
        <div class="profile-header">
          <div class="user-info">
            <h2 class="user-name">{{ user.firstName }} {{ user.lastName }}</h2>
            <p class="user-email">{{ user.email }}</p>
          </div>
        </div>

        <div class="profile-nav">
          <button 
            v-for="tab in ['profile', 'orders', 'favorites', 'addresses']" 
            :key="tab"
            @click="activeTab = tab"
            :class="['nav-button', { active: activeTab === tab }]"
          >
            <i :class="'bi bi-' + (tab === 'profile' ? 'person' : tab === 'orders' ? 'box' : tab === 'favorites' ? 'heart' : 'geo-alt')"></i>
            {{ tab === 'profile' ? 'Profilim' : tab === 'orders' ? 'Siparişlerim' : tab === 'favorites' ? 'Favorilerim' : 'Adreslerim' }}
          </button>
        </div>

        <button class="logout-button" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i>
          Çıkış Yap
        </button>
      </div>

      <div class="profile-content">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="content-section">
          <div class="section-header">
            <h2>Kişisel Bilgiler</h2>
            <button v-if="!isEditingProfile" class="edit-button" @click="startEditingProfile">
              <i class="bi bi-pencil"></i> Düzenle
            </button>
          </div>

          <div v-if="!isEditingProfile" class="profile-info">
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">Ad</span>
                <span class="info-value">{{ user.firstName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Soyad</span>
                <span class="info-value">{{ user.lastName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ user.email }}</span>
              </div>
              <div class="info-item" v-if="user.birthDate">
                <span class="info-label">Doğum Tarihi</span>
                <span class="info-value">{{ user.birthDate }}</span>
              </div>
            </div>
          </div>

          <form v-else class="edit-form" @submit.prevent="saveProfile">
            <div class="form-grid">
              <div class="form-group">
                <label>Ad</label>
                <input type="text" v-model="editedUser.firstName" required>
              </div>
              <div class="form-group">
                <label>Soyad</label>
                <input type="text" v-model="editedUser.lastName" required>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="editedUser.email" required>
              </div>
              <div class="form-group">
                <label>Doğum Tarihi</label>
                <input type="date" v-model="editedUser.birthDate">
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-button" @click="cancelEditingProfile">İptal</button>
              <button type="submit" class="save-button">Kaydet</button>
            </div>
          </form>

          <div class="section-divider"></div>

          <div class="section-header">
            <h2>Şifre Değiştir</h2>
          </div>

          <form v-if="isChangingPassword" @submit.prevent="changePassword" class="password-form">
            <div class="form-group">
              <label>Mevcut Şifre</label>
              <input type="password" v-model="passwordForm.currentPassword" required>
            </div>
            <div class="form-group">
              <label>Yeni Şifre</label>
              <input type="password" v-model="passwordForm.newPassword" required>
            </div>
            <div class="form-group">
              <label>Yeni Şifre Tekrar</label>
              <input type="password" v-model="passwordForm.confirmPassword" required>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-button" @click="isChangingPassword = false">İptal</button>
              <button type="submit" class="save-button">Şifreyi Değiştir</button>
            </div>
          </form>
          <button v-else class="change-password-button" @click="isChangingPassword = true">
            <i class="bi bi-key"></i> Şifre Değiştir
          </button>
        </div>

        <!-- Orders Tab -->
        <div v-if="activeTab === 'orders'" class="content-section">
          <div class="section-header">
            <h2>Siparişlerim</h2>
          </div>
          
          <div class="orders-grid">
            <div v-for="order in orders" :key="order.id" class="order-card">
              <div class="order-header">
                <div class="order-info">
                  <span class="order-id">Sipariş #{{ order.id }}</span>
                  <span class="order-date">{{ order.date }}</span>
                </div>
                <span class="order-status" :class="order.status.toLowerCase().replace(' ', '-')">
                  {{ order.status }}
                </span>
              </div>
              
              <div class="order-items">
                <div v-for="item in order.items" :key="item.name" class="order-item">
                  <span class="item-name">{{ item.name }}</span>
                  <div class="item-details">
                    <span class="item-quantity">x{{ item.quantity }}</span>
                    <span class="item-price">₺{{ item.price }}</span>
                  </div>
                </div>
              </div>
              
              <div class="order-footer">
                <span class="order-total">Toplam: ₺{{ order.total }}</span>
                <button class="details-button">Detayları Görüntüle</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Favorites Tab -->
        <div v-if="activeTab === 'favorites'" class="content-section">
          <div class="section-header">
            <h2>Favorilerim</h2>
          </div>
          
          <div class="favorites-section">
            <div v-if="favorites.length === 0" class="empty-favorites">
              <i class="bi bi-heart"></i>
              <p>Henüz favori ürününüz bulunmuyor.</p>
            </div>
            <div v-else class="favorites-grid">
              <div v-for="product in favorites" :key="product.id" class="favorite-product-card">
                <button class="remove-favorite" @click.stop="removeFavorite(product.id)">
                  <i class="bi bi-x"></i>
                </button>
                <div class="profile-product-content" @click="goToProductDetail(product.id)">
                  <img :src="product.image" :alt="product.name" class="profile-product-image">
                  <div class="profile-product-info">
                    <h3>{{ product.name }}</h3>
                    <p class="brand">{{ product.brand }}</p>
                    <p class="price">₺{{ product.price }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Addresses Tab -->
        <div v-if="activeTab === 'addresses'" class="content-section">
          <div class="section-header">
            <h2>Adreslerim</h2>
            <button class="add-address-button" @click="toggleAddressModal">
              <i class="bi bi-plus"></i> Yeni Adres Ekle
            </button>
          </div>
          
          <div class="addresses-grid">
            <div v-for="address in addresses" :key="address.id" class="address-card">
              <div class="address-header">
                <h3 class="address-title">{{ address.title }}</h3>
                <div class="address-actions">
                  <button class="edit-address" @click="editAddress(address)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="remove-address" @click="removeAddress(address.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <div class="address-content">
                <p class="address-details">{{ address.firstName }} {{ address.lastName }}</p>
                <p class="address-details">{{ address.address }}</p>
                <p class="address-details">{{ address.postalCode }}, {{ address.district }}/{{ address.city }}</p>
                <p class="address-details">{{ address.phone }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Address Modal -->
    <div v-if="showAddressModal" class="modal-overlay" @click.self="toggleAddressModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ newAddress.id ? 'Adresi Düzenle' : 'Yeni Adres Ekle' }}</h3>
          <button class="close-modal" @click="toggleAddressModal">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleAddressSubmit" class="add-address-form">
          <div class="form-group">
            <label>Ad</label>
            <input type="text" v-model="newAddress.firstName" required>
          </div>
          <div class="form-group">
            <label>Soyad</label>
            <input type="text" v-model="newAddress.lastName" required>
          </div>
          <div class="form-group">
            <label>Adres Başlığı</label>
            <input type="text" v-model="newAddress.title" required>
          </div>
          <div class="form-group full-width">
            <label>Adres</label>
            <input type="text" v-model="newAddress.address" required>
          </div>
          <div class="form-group">
            <label>İl</label>
            <select 
              v-model="selectedProvince"
              @change="handleProvinceChange"
              class="form-select"
            >
              <option value="">İl Seçiniz</option>
              <option 
                v-for="province in provinces" 
                :key="province.id"
                :value="province.id"
              >
                {{ province.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>İlçe</label>
            <select 
              v-model="newAddress.district"
              @change="handleDistrictChange"
              class="form-select"
              :disabled="!selectedProvince"
            >
              <option value="">İlçe Seçiniz</option>
              <option 
                v-for="district in districts" 
                :key="district.id"
                :value="district.name"
              >
                {{ district.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Posta Kodu</label>
            <input type="text" v-model="newAddress.postalCode" required pattern="[0-9]*">
          </div>
          <div class="form-group">
            <label>Telefon</label>
            <div class="phone-input-container">
              <span class="country-code">+90</span>
              <input 
                type="tel" 
                v-model="newAddress.phone" 
                required 
                pattern="[0-9]{10}"
                maxlength="10"
                placeholder="5XX XXX XX XX"
                class="phone-input"
                @input="handlePhoneInput($event)"
                @keypress="(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }"
              >
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="toggleAddressModal">İptal</button>
            <button type="submit" class="save-button">
              {{ newAddress.id ? 'Güncelle' : 'Kaydet' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style>
.profile-page {
  min-height: calc(100vh - 147px);
  background-color: #f8f8f8;
  padding: 2rem;
  margin-top: 107px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
}

/* Sidebar Styles */
.profile-sidebar {
  width: 300px;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 127px;
}

.profile-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.user-info {
  text-align: center;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #1a1a1a;
}

.user-email {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
  word-break: break-all;
}

.profile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.nav-button {
  width: 100%;
  padding: 1rem 1.25rem;
  border: none;
  background: none;
  border-radius: 12px;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
}

.nav-button:hover {
  background: #f8f8f8;
  color: #1a1a1a;
}

.nav-button.active {
  background: #1a1a1a;
  color: white;
  font-weight: 500;
}

.nav-button i {
  font-size: 1.2rem;
}

.logout-button {
  width: 100%;
  padding: 1rem;
  background: #ff3b30;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.logout-button:hover {
  background: #ff2419;
  transform: translateY(-1px);
}

/* Content Styles */
.profile-content {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.content-section {
  animation: fadeIn 0.3s ease;
}

.section-header {
  display: flex;
  justify-content: space-between !important;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  margin: 0;
  color: #1a1a1a;
}

.section-divider {
  height: 2px;
  background: #f0f0f0;
  margin: 2rem 0;
}

/* Profile Info Styles */
.info-card {
  background: #f8f8f8;
  border-radius: 16px;
  padding: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  gap: 1rem;
  flex-wrap: wrap;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
  font-size: 0.95rem;
  min-width: 100px;
}

.info-value {
  font-weight: 500;
  color: #1a1a1a;
  word-break: break-all;
  flex: 1;
  text-align: right;
}

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #eee;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: #1a1a1a;
  outline: none;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
}

/* Phone Input Styles */
.phone-input-container {
  display: flex;
  align-items: center;
  border: 2px solid #eee;
  border-radius: 12px;
  overflow: hidden;
}

.country-code {
  background-color: #f8f8f8;
  padding: 0.875rem;
  color: #666;
  font-weight: 500;
  border-right: 2px solid #eee;
  user-select: none;
}

.phone-input {
  border: none !important;
  border-radius: 0 !important;
  padding-left: 0.875rem !important;
  flex: 1;
}

.phone-input:focus {
  box-shadow: none !important;
}

.phone-input-container:focus-within {
  border-color: #1a1a1a;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Button Styles */
.edit-button,
.change-password-button {
  padding: 0.875rem 1.5rem;
  background: none;
  border: 2px solid #1a1a1a;
  color: #1a1a1a;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-button:hover,
.change-password-button:hover {
  background: #1a1a1a;
  color: white;
}

.save-button {
  padding: 0.875rem 1.5rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-button:hover {
  background: #333;
  transform: translateY(-1px);
}

.cancel-button {
  padding: 0.875rem 1.5rem;
  background: none;
  border: 2px solid #666;
  color: #666;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: #666;
  color: white;
}

/* Orders Styles */
.orders-grid {
  display: grid;
  gap: 1.5rem;
}

.order-card {
  background: #f8f8f8;
  border-radius: 16px;
  padding: 1.5rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.order-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.order-id {
  font-weight: 600;
  color: #1a1a1a;
}

.order-date {
  color: #666;
  font-size: 0.95rem;
}

.order-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
}

.order-status.teslim-edildi {
  background: #dcf7e3;
  color: #2e7d32;
}

.order-status.kargoda {
  background: #e3f2fd;
  color: #1976d2;
}

.order-items {
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.order-item .order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.order-item:last-child {
  margin-bottom: 0;
}

.item-name {
  font-weight: 500;
  color: #1a1a1a;
}

.item-details {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.item-quantity {
  color: #666;
}

.item-price {
  font-weight: 600;
  color: #1a1a1a;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-total {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.details-button {
  padding: 0.75rem 1.25rem;
  background: none;
  border: 2px solid #1a1a1a;
  color: #1a1a1a;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.details-button:hover {
  background: #1a1a1a;
  color: white;
}

/* Favorites Styles */
.favorites-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.favorites-section h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #333;
}

.empty-favorites {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.empty-favorites i {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 15px;
}

.empty-favorites p {
  font-size: 1rem;
  color: #666;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.favorite-product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  position: relative;
}

.favorite-product-card:hover {
  transform: translateY(-5px);
}

.profile-product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.profile-product-info {
  padding: 15px 10px;
}

.profile-product-info h3 {
  font-size: 1rem;
  margin-bottom: 5px;
  color: #333;
}

.brand {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.price {
  font-size: 1.1rem;
  font-weight: bold;
  color: #000;
}

/* Address Styles */
.addresses-grid {
  display: grid;
  gap: 1.5rem;
}

.address-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.address-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.address-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-address,
.remove-address {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-address {
  background: #f8f9fa;
  color: #1a1a1a;
}

.edit-address:hover {
  background: #e9ecef;
}

.remove-address {
  background: #fee2e2;
  color: #dc2626;
}

.remove-address:hover {
  background: #fecaca;
}

.address-content {
  color: #4b5563;
}

.address-details {
  margin: 0.25rem 0;
  line-height: 1.5;
}

.add-address-button {
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-address-button:hover {
  background: #218838;
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.5rem;
  margin: 0;
  color: #1a1a1a;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
  transition: color 0.3s ease;
}

.close-modal:hover {
  color: #1a1a1a;
}

.add-address-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.add-address-form .form-group.full-width {
  grid-column: 1 / -1;
}

.form-select {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #eee;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
}

.form-select:focus {
  border-color: #1a1a1a;
  outline: none;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
}

.form-select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Styles */
@media (max-width: 992px) {
  .profile-container {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
    position: static;
    margin-bottom: 2rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
  
  .profile-content {
    padding: 1.5rem;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .add-address-form {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }
}

@media (max-width: 576px) {
  .profile-page {
    padding: 0.5rem;
  }
  
  .profile-container,
  .profile-content {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .edit-button,
  .change-password-button {
    width: 100%;
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-button,
  .cancel-button {
    width: 100%;
  }
  
  .favorites-grid {
    grid-template-columns: 1fr;
  }
}

.favorite-product-card {
  position: relative;
}

.remove-favorite {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.remove-favorite:hover {
  background: #ff4b4b;
  color: white;
  transform: scale(1.1);
}

.remove-favorite i {
  font-size: 18px;
}

.profile-product-content {
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-product-content:hover {
  opacity: 0.9;
}
</style>
