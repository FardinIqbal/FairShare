import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.updateTheme()
  }

  toggleDarkMode() {
    if (localStorage.theme === 'dark') {
      localStorage.theme = 'light'
    } else {
      localStorage.theme = 'dark'
    }
    this.updateTheme()
  }

  updateTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}