<script setup>
import { ref } from 'vue';

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const firstName = ref('');
const lastName = ref('');
const birthDate = ref('');
const showPassword = ref(false);
const acceptTerms = ref(false);
const acceptNewsletter = ref(false);

const toggleView = () => {
  isLogin.value = !isLogin.value;
  // Reset form fields
  email.value = '';
  password.value = '';
  firstName.value = '';
  lastName.value = '';
  birthDate.value = '';
  acceptTerms.value = false;
  acceptNewsletter.value = false;
};

const handleSubmit = () => {
  if (email.value === 'admin' && password.value === 'admin') {
    alert('Giriş başarılı!');
    // Burada giriş sonrası yönlendirme yapılabilir
  } else {
    alert('Hatalı email veya şifre!');
  }
};
</script>

<template>
  <div class="auth-modal">
    <div class="auth-container">
      <!-- Login Form -->
      <div v-if="isLogin" class="auth-form">
        <h2>Üye Girişi</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>
              <span class="required">*</span> Email
            </label>
            <input 
              type="text" 
              v-model="email" 
              placeholder="Email adresinizi giriniz"
              required
            >
          </div>

          <div class="form-group">
            <label>
              <span class="required">*</span> Şifre
            </label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Şifrenizi giriniz"
                required
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">Üye Girişi</button>
          </div>

          <div class="auth-links">
            <a href="#" class="forgot-password">Parolamı Unuttum</a>
            <button type="button" class="toggle-auth" @click="toggleView">
              Üye Ol
            </button>
          </div>

          <div class="social-login">
            <button type="button" class="google-login">
              <i class="bi bi-google"></i>
              Google ile giriş yap
            </button>
          </div>
        </form>
      </div>

      <!-- Register Form -->
      <div v-else class="auth-form">
        <h2>Üye Ol</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>
              <span class="required">*</span> Ad
            </label>
            <input 
              type="text" 
              v-model="firstName" 
              placeholder="Adınızı giriniz"
              required
            >
          </div>

          <div class="form-group">
            <label>
              <span class="required">*</span> Soyad
            </label>
            <input 
              type="text" 
              v-model="lastName" 
              placeholder="Soyadınızı giriniz"
              required
            >
          </div>

          <div class="form-group">
            <label>
              <span class="required">*</span> Email
            </label>
            <input 
              type="email" 
              v-model="email" 
              placeholder="Email adresinizi giriniz"
              required
            >
          </div>

          <div class="form-group">
            <label>
              <span class="required">*</span> Şifre
            </label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Şifrenizi giriniz"
                required
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Doğum Tarihi</label>
            <input 
              type="date" 
              v-model="birthDate"
            >
          </div>

          <div class="form-group checkbox">
            <input 
              type="checkbox" 
              id="terms" 
              v-model="acceptTerms"
              required
            >
            <label for="terms">
              <span class="required">*</span>
              <a href="#" class="terms-link">KVKK Aydınlatma Metnini</a> okudum, kabul ediyorum.
            </label>
          </div>

          <div class="form-group checkbox">
            <input 
              type="checkbox" 
              id="newsletter" 
              v-model="acceptNewsletter"
            >
            <label for="newsletter">
              Kampanyalardan haberdar olmak için Ticari Elektronik İleti Onayı metnini okudum, onaylıyorum. Tarafımdan gönderilecek ticari elektronik iletiyi almak istiyorum.
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">Hesap Oluştur</button>
          </div>

          <div class="auth-links">
            <button type="button" class="toggle-auth" @click="toggleView">
              Üye Girişi
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
.auth-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.auth-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.auth-form h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #333;
}

.required {
  color: #ff0000;
  margin-right: 4px;
}

.form-group input:not([type="checkbox"]) {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #666;
}

.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.checkbox input {
  margin-top: 4px;
}

.checkbox label {
  font-size: 0.85rem;
  line-height: 1.4;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #333;
}

.auth-links {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.toggle-auth {
  background: none;
  border: none;
  color: #ff0000;
  cursor: pointer;
  font-weight: bold;
  padding: 0;
}

.social-login {
  margin-top: 1.5rem;
  text-align: center;
}

.google-login {
  width: 100%;
  padding: 0.75rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.google-login:hover {
  background-color: #f5f5f5;
}

.terms-link {
  color: #ff0000;
  text-decoration: none;
}

@media (max-width: 576px) {
  .auth-container {
    padding: 1.5rem;
    margin: 1rem;
  }
}
</style>