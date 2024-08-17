// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "./controllers"

// If you're using Tailwind CSS, you might want to import it here
// import "tailwindcss"

// Import any other JavaScript files or modules you're using in your application
// For example:
// import "./custom/my_module"

// You can also add any global JavaScript code here
document.addEventListener("turbo:load", function() {
    // Your code here
})