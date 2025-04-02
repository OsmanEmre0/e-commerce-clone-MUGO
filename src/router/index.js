import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Auth from '../views/Auth.vue';
import Profile from '../views/Profile.vue';
import Contact from '../views/Contact.vue';
import Brands from '../views/Brands.vue';
import ListingPage from '../views/ListingPage.vue';
import ReturnPolicy from '../views/ReturnPolicy.vue';
import FAQ from '../views/FAQ.vue';
import PreInfo from '../views/PreInfo.vue';
import SalesAgreement from '../views/SalesAgreement.vue';
import ProductDetail from '../views/ProductDetail.vue';
import Checkout from '../views/Checkout.vue';
import Payment from '../views/Payment.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  },
  {
    path: '/markalar',
    name: 'Brands',
    component: Brands
  },
  {
    path: '/canta/bel-cantasi',
    name: 'ListingPage',
    component: ListingPage,
    props: route => ({ query: route.query })
  },
  {
    path: '/listing',
    name: 'Listing',
    component: ListingPage,
    props: route => ({ query: route.query })
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout
  },
  {
    path: '/payment',
    name: 'Payment',
    component: Payment
  },
  {
    path: '/iade-kosullari',
    name: 'ReturnPolicy',
    component: ReturnPolicy
  },
  {
    path: '/sss',
    name: 'FAQ',
    component: FAQ
  },
  {
    path: '/on-bilgilendirme',
    name: 'PreInfo',
    component: PreInfo
  },
  {
    path: '/satis-sozlesmesi',
    name: 'SalesAgreement',
    component: SalesAgreement
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

export default router;