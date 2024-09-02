// app/javascript/controllers/dropdown_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu"]

  connect() {
    this.hideMenu()
  }

  toggle() {
    if (this.menuTarget.classList.contains('hidden')) {
      this.showMenu()
    } else {
      this.hideMenu()
    }
  }

  hide(event) {
    if (!this.element.contains(event.target)) {
      this.hideMenu()
    }
  }

  showMenu() {
    this.menuTarget.classList.remove('hidden')
  }

  hideMenu() {
    this.menuTarget.classList.add('hidden')
  }
}