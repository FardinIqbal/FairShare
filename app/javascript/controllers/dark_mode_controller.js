console.log("Dark mode controller loaded");
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["icon", "sunIcon", "moonIcon"]

  connect() {
    this.updateTheme()
    this.updateIcon()
  }

  toggleDarkMode() {
    if (localStorage.theme === 'dark') {
      localStorage.theme = 'light'
    } else {
      localStorage.theme = 'dark'
    }
    this.updateTheme()
    this.updateIcon()
  }

  updateTheme() {
    if (localStorage.theme === 'dark' || !localStorage.theme) { // Default to dark mode
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark' // Ensure it's set to dark in localStorage
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  updateIcon() {
    if (document.documentElement.classList.contains('dark')) {
      this.moonIconTarget.classList.add('hidden')
      this.sunIconTarget.classList.remove('hidden')
    } else {
      this.sunIconTarget.classList.add('hidden')
      this.moonIconTarget.classList.remove('hidden')
    }
  }
}
