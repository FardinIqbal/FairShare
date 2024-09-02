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
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
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
