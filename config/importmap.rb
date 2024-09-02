# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin_all_from "app/javascript/controllers", under: "controllers"

# Add these lines for Tailwind CSS (if you're using Tailwind)
pin "tailwindcss", to: "https://cdn.jsdelivr.net/npm/tailwindcss@3.3.2/lib/index.min.js"
pin "@tailwindcss/forms", to: "https://cdn.jsdelivr.net/npm/@tailwindcss/forms@0.5.3/src/index.min.js"

# Add any other npm packages you're using
# For example:
# pin "lodash", to: "https://ga.jspm.io/npm:lodash@4.17.21/lodash.js"