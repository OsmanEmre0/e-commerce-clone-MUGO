import { createStore } from 'vuex'

export default createStore({
  state: {
    cartItems: [],
    user: JSON.parse(localStorage.getItem('currentUser')) || null,
    savedAddresses: JSON.parse(localStorage.getItem('savedAddresses')) || []
  },
  getters: {
    cartTotal: (state) => {
      return state.cartItems.reduce((total, item) => {
        const itemTotal = parseFloat((item.price * item.quantity).toFixed(2))
        return parseFloat((total + itemTotal).toFixed(2))
      }, 0)
    },
    remainingForFreeShipping: (state, getters) => {
      const FREE_SHIPPING_THRESHOLD = 1000
      const remaining = FREE_SHIPPING_THRESHOLD - getters.cartTotal
      return remaining > 0 ? parseFloat(remaining.toFixed(2)) : 0
    },
    finalTotal: (state, getters) => {
      const shippingCost = getters.cartTotal >= 1000 ? 0 : 29.90
      return parseFloat((getters.cartTotal + shippingCost).toFixed(2))
    },
    currentUser: (state) => state.user,
    userAddresses: (state) => state.savedAddresses
  },
  mutations: {
    setCartItems(state, items) {
      state.cartItems = items
      localStorage.setItem('cartItems', JSON.stringify(items))
    },
    removeFromCart(state, index) {
      state.cartItems.splice(index, 1)
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
    },
    updateQuantity(state, { index, newQuantity }) {
      if (newQuantity > 0) {
        state.cartItems[index].quantity = newQuantity
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
      }
    },
    initializeCart(state) {
      const savedCartItems = localStorage.getItem('cartItems')
      if (savedCartItems) {
        state.cartItems = JSON.parse(savedCartItems)
      }
    },
    addAddress(state, address) {
      const newAddress = {
        ...address,
        id: Date.now()
      }
      state.savedAddresses.push(newAddress)
      localStorage.setItem('savedAddresses', JSON.stringify(state.savedAddresses))
    },
    updateAddress(state, { id, address }) {
      const index = state.savedAddresses.findIndex(addr => addr.id === id)
      if (index !== -1) {
        state.savedAddresses[index] = { ...address, id }
        localStorage.setItem('savedAddresses', JSON.stringify(state.savedAddresses))
      }
    },
    removeAddress(state, id) {
      state.savedAddresses = state.savedAddresses.filter(addr => addr.id !== id)
      localStorage.setItem('savedAddresses', JSON.stringify(state.savedAddresses))
    },
    initializeAddresses(state) {
      const savedAddresses = localStorage.getItem('savedAddresses')
      if (savedAddresses) {
        state.savedAddresses = JSON.parse(savedAddresses)
      }
    }
  }
}) 