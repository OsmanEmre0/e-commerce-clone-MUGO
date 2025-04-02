<template>
  <div class="payment-page">
    <div class="payment-container">
      <!-- Mobile Cart Summary Dropdown -->
      <div class="mobile-cart-summary">
        <div class="mobile-summary-header" @click="toggleMobileSummary">
          <h3>
            <i class="bi bi-cart"></i>
            Sipariş Özeti
          </h3>
          <div class="header-right">
            <span class="total-amount">₺{{ finalTotal }}</span>
            <i class="bi bi-chevron-down mobile-summary-toggle" :class="{ active: isMobileSummaryOpen }"></i>
          </div>
        </div>
        <div class="mobile-summary-content" :class="{ active: isMobileSummaryOpen }">
          <div v-for="(item, index) in cartItems" :key="index" class="summary-item">
            <div class="summary-item-image">
              <img :src="item.image" :alt="item.name">
            </div>
            <div class="item-details">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
            </div>
            <span class="item-price">₺{{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</span>
          </div>
          <div class="summary-totals">
            <div class="summary-row">
              <span>Ara Toplam</span>
              <span>₺{{ cartTotal }}</span>
            </div>
            <div class="summary-row">
              <span>Kargo</span>
              <span v-if="shippingFree">Ücretsiz</span>
              <span v-else>₺{{ shippingCost }}</span>
            </div>
            <div class="summary-row total">
              <span>Toplam</span>
              <span>₺{{ finalTotal }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Sol Kolon: Form -->
        <div class="col-md-6">
          <div class="payment-steps">
            <div class="payment-step-header">
              <div class="payment-header-content">
                <router-link to="/" class="payment-logo">
                  <img :src="siteInfo.logo.src" :alt="siteInfo.logo.alt">
                </router-link>
              </div>
            </div>
            
            <!-- Step Forms -->
            <div class="payment-step-forms">
              <!-- Step 1: Adres -->
              <div class="payment-step-form" :class="{ 'payment-active': currentStep === 1 }">
                <div class="payment-step-number">
                  <span>1</span>
                  <h2>Adres</h2>
                </div>
                
                <div class="payment-address-form" v-if="currentStep === 1">
                  <h3>Teslimat Adresi</h3>
                  
                  <div class="payment-address-type">
                    <label class="payment-radio-container">
                      <input type="radio" v-model="addressType" value="new">
                      <span class="payment-radio"></span>
                      <span>Yeni Adres</span>
                    </label>
                    <label class="payment-radio-container" v-if="savedAddresses.length > 0">
                      <input type="radio" v-model="addressType" value="saved">
                      <span class="payment-radio"></span>
                      <span>Kayıtlı Adres</span>
                    </label>
                  </div>
                  
                  <!-- Saved Addresses -->
                  <div v-if="addressType === 'saved'" class="payment-saved-addresses">
                    <div v-for="address in savedAddresses" :key="address.id" 
                         class="payment-saved-address-card"
                         :class="{ 'selected': selectedAddress && selectedAddress.id === address.id }">
                      <div class="payment-saved-address-header">
                        <h4>{{ address.title }}</h4>
                        <div class="payment-address-actions">
                          <button class="payment-edit-address" @click.stop="editSavedAddress(address)">
                            <i class="bi bi-pencil"></i>
                          </button>
                        </div>
                      </div>
                      <div class="payment-saved-address-content" @click="selectSavedAddress(address)">
                        <p>{{ address.firstName }} {{ address.lastName }}</p>
                        <p>{{ address.address }}</p>
                        <p v-if="address.addressDetails">{{ address.addressDetails }}</p>
                        <p>{{ address.district }}/{{ address.city }}</p>
                        <p>{{ address.phone }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="payment-address-inputs" v-if="addressType === 'new'">
                    <div class="payment-form-row">
                      <div class="payment-form-group">
                        <label>Ad <span class="required">*</span></label>
                        <input 
                          type="text" 
                          v-model="addressForm.firstName"
                          :class="{ 'error': v$.firstName.$error }"
                          @blur="v$.firstName.$touch()"
                          placeholder="Adınız">
                        <span class="error-message" v-if="v$.firstName.$error">
                          {{ v$.firstName.$errors[0].$message }}
                        </span>
                      </div>
                      <div class="payment-form-group">
                        <label>Soyad <span class="required">*</span></label>
                        <input 
                          type="text" 
                          v-model="addressForm.lastName"
                          :class="{ 'error': v$.lastName.$error }"
                          @blur="v$.lastName.$touch()"
                          placeholder="Soyadınız">
                        <span class="error-message" v-if="v$.lastName.$error">
                          {{ v$.lastName.$errors[0].$message }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="payment-form-group">
                      <label>Adres <span class="required">*</span></label>
                      <input 
                        type="text" 
                        v-model="addressForm.address"
                        :class="{ 'error': v$.address.$error }"
                        @blur="v$.address.$touch()"
                        placeholder="Sokak, mahalle, cadde vb.">
                      <span class="error-message" v-if="v$.address.$error">
                        {{ v$.address.$errors[0].$message }}
                      </span>
                    </div>
                    
                    <div class="payment-form-row">
                      <div class="payment-form-group">
                        <label>Apartman, Daire vb.</label>
                        <input 
                          type="text" 
                          v-model="addressForm.addressDetails"
                          placeholder="Apartman no, daire no, kat vb.">
                      </div>
                      <div class="payment-form-group">
                        <label>Posta Kodu</label>
                        <input 
                          type="text" 
                          v-model="addressForm.zipCode"
                          placeholder="Posta Kodu"
                          maxlength="5"
                          @input="handleZipCodeInput"
                          @keypress="(event) => {
                            if (!/[0-9]/.test(event.key)) {
                              event.preventDefault();
                            }
                          }">
                      </div>
                    </div>
                    
                    <div class="payment-form-row">
                      <div class="payment-form-group">
                        <label>İl <span class="required">*</span></label>
                        <select 
                          v-model="addressForm.city"
                          :class="{ 'error': v$.city.$error }"
                          @change="handleCityChange"
                          @blur="v$.city.$touch()">
                          <option value="" disabled selected>İl seçiniz</option>
                          <option v-for="city in cities" :key="city.id" :value="city.id">
                            {{ city.name }}
                          </option>
                        </select>
                        <span class="error-message" v-if="v$.city.$error">
                          {{ v$.city.$errors[0].$message }}
                        </span>
                      </div>
                      <div class="payment-form-group">
                        <label>İlçe <span class="required">*</span></label>
                        <select 
                          v-model="addressForm.district"
                          :class="{ 'error': v$.district.$error }"
                          @change="handleDistrictChange"
                          @blur="v$.district.$touch()"
                          :disabled="!addressForm.city">
                          <option value="" disabled selected>İlçe seçiniz</option>
                          <option v-for="district in districts" :key="district.id" :value="district.id">
                            {{ district.name }}
                          </option>
                        </select>
                        <span class="error-message" v-if="v$.district.$error">
                          {{ v$.district.$errors[0].$message }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="payment-form-group">
                      <label>Telefon <span class="required">*</span></label>
                      <div class="payment-phone-input" :class="{ 'error': v$.phone.$error }">
                        <div class="payment-country-code">
                          <span>+90</span>
                        </div>
                        <input 
                          type="tel" 
                          v-model="addressForm.phone"
                          @blur="v$.phone.$touch()"
                          placeholder="5XX XXX XX XX"
                          maxlength="10"
                          @input="handlePhoneInput($event)"
                          @keypress="(event) => {
                            if (!/[0-9]/.test(event.key)) {
                              event.preventDefault();
                            }
                          }"
                        >
                      </div>
                      <span class="error-message" v-if="v$.phone.$error">
                        {{ v$.phone.$errors[0].$message }}
                      </span>
                    </div>
                    
                    <div class="payment-checkbox-group">
                      <label class="payment-checkbox-container">
                        <input type="checkbox" v-model="addressForm.saveAddress">
                        <span class="payment-checkmark"></span>
                        <span>Bir sonraki işlem için bu adresi kaydet</span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="payment-step-buttons">
                    <button class="payment-continue-btn" @click="goToStep(2)" :disabled="!isAddressFormValid">
                      Devam Et
                    </button>
                  </div>
                </div>

                <!-- Adres özeti -->
                <div v-if="currentStep > 1" class="payment-step-summary">
                  <div class="payment-step-summary-content">
                    <div class="payment-step-summary-header">
                      <i class="bi bi-check-circle-fill step-completed"></i>
                      <h3>Adres</h3>
                      <button class="payment-edit-step" @click="goToStep(1)">Düzenle</button>
                    </div>
                    <div class="payment-summary-details">
                      
                      <p>{{ addressType === 'saved' && selectedAddress ? selectedAddress.firstName + ' ' + selectedAddress.lastName : addressForm.firstName + ' ' + addressForm.lastName }}</p>
                      <p>{{ addressType === 'saved' && selectedAddress ? selectedAddress.address : addressForm.address }}</p>
                      <p>{{ addressType === 'saved' && selectedAddress ? getCityName(selectedAddress.city) + ', ' + getDistrictName(selectedAddress.district) + ', Türkiye' : getCityName(addressForm.city) + ', ' + getDistrictName(addressForm.district) + ', Türkiye' }}</p>
                      <p>+90{{ addressType === 'saved' && selectedAddress ? selectedAddress.phone : addressForm.phone }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Step 2: Kargo -->
              <div class="payment-step-form" :class="{ 'payment-active': currentStep === 2 }">
                <div class="payment-step-number">
                  <span>2</span>
                  <h2>Kargo</h2>
                </div>
                
                <!-- Kargo özeti -->
                <div v-if="currentStep > 2" class="payment-step-summary">
                  <div class="payment-step-summary-content">
                    <div class="payment-step-summary-header">
                      <i class="bi bi-check-circle-fill step-completed"></i>
                      <h3>Kargo</h3>
                    </div>
                    <div class="payment-summary-details">
                      <p>{{ shippingFree ? 'Ücretsiz Kargo' : `Kargo / ${shippingCost} TL` }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Step 3: Ödeme -->
              <div class="payment-step-form" :class="{ 'payment-active': currentStep === 3 }">
                <div class="payment-step-number">
                  <span>3</span>
                  <h2>Ödeme</h2>
                </div>
                
                <div class="payment-options-form" v-if="currentStep === 3">
                  <div class="payment-card-form">
                    <div class="payment-method-header">
                      <i class="bi bi-check-circle-fill"></i>
                      <span>Kredi Kartı</span>
                    </div>

                    <div class="payment-card-inputs">
                      <div class="payment-form-group">
                        <input 
                          type="text" 
                          v-model="cardForm.number"
                          placeholder="Kart Numarası"
                          maxlength="19"
                          @input="formatCardNumber">
                      </div>

                      <div class="payment-form-group">
                        <input 
                          type="text" 
                          v-model="cardForm.name"
                          placeholder="Kart Üzerindeki İsim">
                      </div>

                      <div class="payment-form-row">
                        <div class="payment-form-group">
                          <input 
                            type="text" 
                            v-model="cardForm.expiry"
                            placeholder="Ay / Yıl"
                            maxlength="5"
                            @input="formatExpiry">
                        </div>
                        <div class="payment-form-group cvc-group">
                          <input 
                            type="text" 
                            v-model="cardForm.cvc"
                            placeholder="CVC"
                            maxlength="3">
                          <i class="bi bi-question-circle help-icon" data-tooltip="Kartınızın arkasındaki 3 haneli güvenlik kodu"></i>
                        </div>
                      </div>

                      <div class="payment-checkbox-group">
                        <label class="payment-checkbox-container">
                          <input type="checkbox" v-model="cardForm.saveCard">
                          <span class="payment-checkmark"></span>
                          <span>Kartımı <span class="masterpass-text">masterpass</span> altyapısında saklamak istiyorum.</span>
                        </label>
                      </div>

                      <div class="payment-checkbox-group">
                        <label class="payment-checkbox-container">
                          <input type="checkbox" v-model="termsAccepted">
                          <span class="payment-checkmark"></span>
                          <span>Gizlilik Sözleşmesini ve Satış Sözleşmesini okudum, onaylıyorum.</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="payment-submit-section">
                    <button class="payment-submit-btn" @click="submitOrder" :disabled="!isPaymentFormValid || !termsAccepted">
                      Siparişi Tamamla
                    </button>
                    <div class="secure-payment-info">
                      <i class="bi bi-lock"></i>
                      <span>Ödemeler güvenli ve şifrelidir</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sağ Kolon: Sepet Özeti -->
        <div class="col-md-6">
          <div class="payment-cart-summary">
            <div class="payment-cart-item" v-for="(item, index) in cartItems" :key="index">
              <div class="payment-cart-item-image">
                <img :src="item.image" :alt="item.name">
              </div>
              <div class="payment-cart-item-details">
                <h4>{{ item.name }}</h4>
                <p class="payment-item-color" v-if="item.color">{{ item.color }}</p>
                <div class="payment-product-price">
                  <span v-if="item.discountPercentage" class="payment-original-price">₺{{ (parseFloat(item.originalPrice) * item.quantity).toFixed(2) }}</span>
                  <span class="payment-current-price">₺{{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>
            <div class="payment-cart-totals">
              <div class="payment-total-row">
                <span>Ara Toplam</span>
                <span>₺{{ cartTotal }}</span>
              </div>
              <div class="payment-total-row">
                <span>Teslimat / Kargo</span>
                <span>₺{{ shippingCost }}</span>
              </div>
              <div class="payment-total-row payment-grand-total">
                <span>Toplam</span>
                <span>₺{{ finalTotal }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, helpers } from '@vuelidate/validators';
import siteData from '../data/siteData.json';
import axios from 'axios';

const store = useStore();
const router = useRouter();
const cartItems = computed(() => store.state.cartItems);
const cartTotal = computed(() => store.getters.cartTotal);
const savedAddresses = computed(() => store.getters.userAddresses);

// Site bilgileri
const siteInfo = computed(() => siteData.siteInfo);

// Form state
const addressType = ref('new');
const selectedAddress = ref(null);
const addressForm = ref({
  firstName: '',
  lastName: '',
  address: '',
  addressDetails: '',
  zipCode: '',
  city: '',
  district: '',
  phone: '',
  saveAddress: false,
  invoiceInfo: false
});

const cardForm = ref({
  number: '',
  name: '',
  expiry: '',
  cvc: '',
  saveCard: false
});

// Form validation rules
const rules = {
  firstName: { 
    required: helpers.withMessage('Ad alanı zorunludur', required),
    minLength: helpers.withMessage('Ad en az 2 karakter olmalıdır', minLength(2))
  },
  lastName: { 
    required: helpers.withMessage('Soyad alanı zorunludur', required),
    minLength: helpers.withMessage('Soyad en az 2 karakter olmalıdır', minLength(2))
  },
  address: { 
    required: helpers.withMessage('Adres alanı zorunludur', required),
    minLength: helpers.withMessage('Adres en az 5 karakter olmalıdır', minLength(5))
  },
  city: { required: helpers.withMessage('İl seçimi zorunludur', required) },
  district: { required: helpers.withMessage('İlçe seçimi zorunludur', required) },
  phone: { 
    required: helpers.withMessage('Telefon numarası zorunludur', required),
    validPhone: helpers.withMessage(
      'Geçerli bir telefon numarası giriniz (5XX XXX XX XX)',
      (value) => /^5[0-9]{9}$/.test(value)
    )
  }
};

const v$ = useVuelidate(rules, addressForm);

// Cities and Districts data
const cities = ref([]);
const districts = ref([]);

// Fetch cities and sort alphabetically
const fetchCities = async () => {
  try {
    const response = await axios.get('https://turkiyeapi.dev/api/v1/provinces');
    cities.value = response.data.data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  } catch (error) {
    console.error('İller yüklenirken hata oluştu:', error);
  }
};

// Fetch districts based on selected city
const fetchDistricts = async (cityId) => {
  if (!cityId) {
    districts.value = [];
    return;
  }
  try {
    const response = await axios.get(`https://turkiyeapi.dev/api/v1/provinces/${cityId}/districts`);
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

// Handle city change
const handleCityChange = async (event) => {
  const cityId = event.target.value;
  addressForm.value.city = cityId;
  addressForm.value.district = ''; // Reset district when city changes
  if (cityId) {
    await fetchDistricts(cityId);
  } else {
    districts.value = [];
  }
};

// Handle district change
const handleDistrictChange = (event) => {
  const districtId = event.target.value;
  addressForm.value.district = districtId;
};

// Get city name helper function
const getCityName = (cityId) => {
  const city = cities.value.find(c => c.id === Number(cityId));
  return city ? city.name : '';
};

// Get district name helper function
const getDistrictName = (districtId) => {
  const district = districts.value.find(d => d.id === Number(districtId));
  return district ? district.name : '';
};

// Shipping calculations
const shippingFree = computed(() => {
  return cartTotal.value >= 1000;
});

const shippingCost = computed(() => {
  return shippingFree.value ? 0 : 59.99;
});

// Current step tracking
const currentStep = ref(1);
const goToStep = async (step) => {
  if (step === 2) {
    if (addressType.value === 'new') {
      const isValid = await v$.value.$validate();
      if (!isValid) {
        const firstError = document.querySelector('.error-message');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      // If saving a new address
      if (addressForm.value.saveAddress) {
        const formattedPhone = addressForm.value.phone.startsWith('5') ? 
          addressForm.value.phone : 
          addressForm.value.phone.replace(/^0*/, '');
          
        store.commit('addAddress', {
          ...addressForm.value,
          phone: formattedPhone,
          title: 'Yeni Adres',
          id: Date.now()
        });
      }
    } else if (!selectedAddress.value) {
      alert('Lütfen kayıtlı bir adres seçin');
      return;
    }

    // Show shipping step briefly, then proceed to payment
    currentStep.value = 2;
    setTimeout(() => {
      currentStep.value = 3;
    }, 500);
    return;
  }
  
  currentStep.value = step;
};

// Computed for validations
const isAddressFormValid = computed(() => {
  if (addressType.value === 'saved') return selectedAddress.value !== null;
  return !v$.value.$invalid;
});

const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\D/g, '');
  value = value.replace(/(\d{4})/g, '$1 ').trim();
  cardForm.value.number = value;
};

const formatExpiry = (event) => {
  let value = event.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2);
  }
  cardForm.value.expiry = value;
};

const termsAccepted = ref(false);

const isPaymentFormValid = computed(() => {
  return cardForm.value.number.replace(/\s/g, '').length === 16 &&
         cardForm.value.name.length > 0 &&
         cardForm.value.expiry.length === 5 &&
         cardForm.value.cvc.length === 3;
});

const isOrderValid = computed(() => {
  return true;
});

// Order summary computations
const finalTotal = computed(() => {
  return (parseFloat(cartTotal.value) + parseFloat(shippingCost.value)).toFixed(2);
});

// Submit order
const submitOrder = () => {
  alert('Siparişiniz alındı, teşekkür ederiz!');
  router.push('/');
  store.commit('clearCart');
};

// Handle saved address selection
const selectSavedAddress = (address) => {
  if (addressType.value !== 'saved') {
    addressType.value = 'saved';
  }
  selectedAddress.value = address;
};

const handlePhoneInput = (event) => {
  // Sadece rakamları al
  const numericValue = event.target.value.replace(/\D/g, '');
  // En fazla 10 rakam olacak şekilde güncelle
  addressForm.value.phone = numericValue.slice(0, 10);
};

// Handle saved address actions
const editSavedAddress = (address) => {
  // Prevent event propagation
  event?.stopPropagation();
  
  addressForm.value = { 
    firstName: address.firstName,
    lastName: address.lastName,
    address: address.address,
    addressDetails: address.addressDetails || '',
    zipCode: address.zipCode || '',
    city: address.city,
    district: address.district,
    phone: address.phone,
    email: address.email || '',
    saveAddress: true,
    id: address.id
  };
  
  // Set address type to new for editing
  addressType.value = 'new';
  selectedAddress.value = null;
  goToStep(1);
};

const isMobileSummaryOpen = ref(false);

const toggleMobileSummary = () => {
  isMobileSummaryOpen.value = !isMobileSummaryOpen.value;
};

const handleZipCodeInput = (event) => {
  // Sadece rakamları al
  const numericValue = event.target.value.replace(/\D/g, '');
  // En fazla 5 rakam olacak şekilde güncelle
  addressForm.value.zipCode = numericValue.slice(0, 5);
};

onMounted(async () => {
  await fetchCities();
  store.commit('initializeCart');
  store.commit('initializeAddresses');
  
  if (cartItems.value.length === 0) {
    router.push('/checkout');
  }
});
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 2rem 0;
}

.payment-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
}

.payment-steps {
  background: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  height: 100%;
}

.payment-step-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 1.5rem;
}

.payment-header-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.payment-logo {
  height: 40px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.payment-logo:hover {
  opacity: 0.8;
}

.payment-logo img {
  height: 100%;
  width: auto;
}

.payment-step-number {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-step-number span {
  width: 32px;
  height: 32px;
  background: #1a1a1a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.payment-step-number h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.payment-step-form {
  opacity: 0.5;
  transition: all 0.3s ease;
}

.payment-step-form.payment-active {
  opacity: 1;
}

.payment-form-row {
  display: flex;
  gap: 1.5rem;
}

.payment-form-group {
  flex: 1;
  margin-bottom: 1.5rem;
}

.payment-form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #1a1a1a;
  font-weight: 500;
}

.payment-form-group input,
.payment-form-group select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.payment-form-group input:focus,
.payment-form-group select:focus {
  outline: none;
  border-color: #1a1a1a;
  box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.1);
}

.payment-form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23333' stroke-width='1.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.payment-phone-input {
  display: flex;
  align-items: stretch;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.payment-country-code {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 0 1rem;
  color: #1a1a1a;
  font-weight: 500;
  border-right: 1.5px solid #e0e0e0;
  min-width: 60px;
  justify-content: center;
}

.payment-phone-input input {
  flex: 1;
  border: none;
  border-radius: 0;
  padding: 0.875rem 1rem;
  width: auto;
}

.payment-phone-input input:focus {
  box-shadow: none;
}

.payment-phone-input.error {
  border-color: #dc3545;
}

.payment-phone-input.error input:focus {
  box-shadow: none;
}

.payment-checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.payment-checkbox-container input {
  width: 20px;
  height: 20px;
  margin: 0;
}

.payment-step-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.5rem;
}

.payment-back-btn,
.payment-continue-btn,
.payment-submit-btn {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.payment-back-btn {
  background: #fff;
  border: 1.5px solid #e0e0e0;
  color: #1a1a1a;
}

.payment-back-btn:hover {
  background: #f5f5f5;
}

.payment-continue-btn,
.payment-submit-btn {
  background: #1a1a1a;
  border: none;
  color: #fff;
}

.payment-continue-btn:hover,
.payment-submit-btn:hover {
  background: #333;
}

.payment-continue-btn:disabled,
.payment-submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.payment-cart-summary {
  background: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 2rem;
}

.payment-cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.payment-cart-item:last-child {
  border-bottom: none;
}

.payment-cart-item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.payment-cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.payment-cart-item-details {
  flex: 1;
}

.payment-cart-item-details h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 500;
}

.payment-item-color {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
}

.payment-product-price {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
}

.payment-current-price {
  font-weight: 600;
  color: #333;
}

.payment-cart-totals {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.payment-total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.payment-grand-total {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}


@media (max-width: 991px) {
    .payment-cart-summary {
        display: none;
    }
}



@media (max-width: 768px) {

  .payment-container {
    padding: 0 1rem;
  }
  
  .payment-cart-summary {
    margin-top: 2rem;
    position: static;
  }
  
  .payment-steps {
    margin-bottom: 2rem;
  }

  .payment-form-row {
    flex-direction: column;
    gap: 0;
  }

  .payment-step-buttons {
    flex-direction: column;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .payment-back-btn,
  .payment-continue-btn,
  .payment-submit-btn {
    width: 100%;
  }

  .payment-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .payment-logo {
    height: 30px;
  }

  .payment-logo:hover {
    opacity: 1;
  }

  .payment-logo img {
    height: 100%;
    width: auto;
  }
}

.required {
  color: #dc3545;
  margin-left: 2px;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.payment-form-group input.error,
.payment-form-group select.error,
.payment-phone-input.error {
  border-color: #dc3545;
}

.payment-form-group input.error:focus,
.payment-form-group select.error:focus {
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.1);
}

.payment-radio-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  cursor: pointer;
}

.payment-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  position: relative;
  display: inline-block;
}

.payment-radio-container input[type="radio"] {
  display: none;
}

.payment-radio-container input[type="radio"]:checked + .payment-radio::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: #1a1a1a;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.payment-checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.payment-checkbox-container input[type="checkbox"] {
  display: none;
}

.payment-checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  margin-top: 2px;
}

.payment-checkbox-container input[type="checkbox"]:checked + .payment-checkmark::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 12px;
  border: solid #1a1a1a;
  border-width: 0 2px 2px 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg) translate(-2px, -2px);
}

.payment-address-type {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.payment-saved-addresses {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.payment-saved-address-card {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-saved-address-card:hover {
  border-color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-saved-address-card.selected {
  border-color: #1a1a1a;
  background-color: #f8f8f8;
}

.payment-saved-address-header {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-saved-address-header h4 {
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

.payment-saved-address-content {
  cursor: pointer;
}

.payment-saved-address-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.payment-edit-address {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
  color: #1a1a1a;
}

.payment-edit-address:hover {
  background: #e9ecef;
}

.payment-address-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .payment-saved-addresses {
    grid-template-columns: 1fr;
  }
}

.payment-step-summary {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
}

.payment-step-summary-content {
  display: flex;
  flex-direction: column;
}

.payment-step-summary-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  position: relative;
}

.step-completed {
  color: #4CAF50;
  font-size: 1.1rem;
}

.payment-step-summary-header h3 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.payment-edit-step {
  position: absolute;
  right: 0;
  background: none;
  border: none;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
}

.payment-summary-details {
  padding-left: 1.5rem;
}

.payment-summary-details p {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.payment-summary-details p:last-child {
  margin-bottom: 0;
}

.user-email {
  color: #1a1a1a !important;
  font-weight: 500;
}

.payment-card-form {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.payment-method-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.payment-method-header i {
  color: #4CAF50;
  font-size: 1.2rem;
}

.payment-method-header span {
  font-size: 1.1rem;
  font-weight: 500;
  color: #1a1a1a;
}

.payment-card-inputs {
  display: flex;
  flex-direction: column;
}

.payment-card-inputs .payment-form-group input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.payment-card-inputs .payment-form-group input:focus {
  outline: none;
  border-color: #1a1a1a;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.1);
}

.payment-form-row {
  display: flex;
  gap: 1rem;
}

.cvc-group {
  position: relative;
  max-width: 140px;
}

.help-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  cursor: help;
  font-size: 1rem;
}

.help-icon[data-tooltip] {
  position: relative;
}

.help-icon[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 10px);
  right: -10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  white-space: nowrap;
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 1000;
}

.help-icon[data-tooltip]::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  right: 5px;
  border: 8px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s ease;
}

.help-icon[data-tooltip]:hover::after,
.help-icon[data-tooltip]:hover::before {
  visibility: visible;
  opacity: 1;
}

.payment-checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.payment-checkbox-container span {
  font-size: 0.9rem;
  color: #666;
}

.masterpass-text {
  text-decoration: underline;
  color: #1a1a1a;
  cursor: pointer;
  font-weight: 500;
}

.payment-checkmark {
  width: 18px;
  height: 18px;
  border: 1.5px solid #e0e0e0;
  border-radius: 4px;
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.payment-checkbox-container input[type="checkbox"]:checked + .payment-checkmark {
  background: #1a1a1a;
  border-color: #1a1a1a;
}

.payment-checkbox-container input[type="checkbox"]:checked + .payment-checkmark::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
}

.payment-terms-checkbox {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.payment-terms-checkbox .payment-checkbox-container span {
  font-size: 0.9rem;
  color: #1a1a1a;
}

.payment-submit-section {
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.payment-submit-btn {
  width: 100%;
  max-width: 500px;
  padding: 1rem;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-submit-btn:hover {
  background: #333;
}

.payment-submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.secure-payment-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.secure-payment-info i {
  font-size: 1rem;
}

.mobile-cart-summary {
  display: none;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
  width: 100%;
}

.mobile-summary-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #fff;
  border-radius: 12px;
}

.mobile-summary-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.total-amount {
  font-weight: 600;
  font-size: 1rem;
}

.mobile-summary-toggle {
  transition: transform 0.3s ease;
  font-size: 0.9rem;
}

.mobile-summary-toggle.active {
  transform: rotate(180deg);
}

.mobile-summary-content {
  padding: 1.5rem;
  display: none;
  border-top: 1px solid #eee;
}

.mobile-summary-content.active {
  display: block;
}

.summary-item {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.summary-item:first-child {
  padding-top: 0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  margin-right: 1rem;
}

.summary-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
  min-width: 0;
  padding-right: 1rem;
}

.item-name {
  font-size: 0.9rem;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-quantity {
  font-size: 0.85rem;
  color: #666;
}

.item-price {
  font-weight: 600;
  white-space: nowrap;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.summary-totals {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: #666;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

@media (max-width: 991px) {
  .payment-container {
    padding: 0;
    width: 100%;
    max-width: 100%;
  }

  .payment-steps {
    width: 100%;
    padding: 1.5rem;
    border-radius: 0;
    margin: 0;
  }

  .row {
    width: 100%;
    margin: 0;
  }

  .col-md-6 {
    width: 100%;
    padding: 0;
  }

  .payment-card-form {
    width: 100%;
    border-radius: 0;
    margin: 0;
    padding: 1.5rem;
  }

  .payment-submit-section {
    width: 100%;
  }

  .payment-submit-btn {
    width: 100%;
    max-width: none;
  }

  .mobile-cart-summary {
    display: block;
    border-radius: 0;
    margin: 0 0 1rem 0;
  }

  .mobile-summary-header {
    border-radius: 0;
  }

  .payment-step-summary {
    border-radius: 0;
    margin: 1rem 0;
  }
}
</style> 
