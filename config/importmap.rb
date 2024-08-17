# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin_all_from "app/javascript/controllers", under: "controllers"

# Add these lines for Tailwind CSS (if you're using Tailwind)
pin "tailwindcss", to: "https://ga.jspm.io/npm:tailwindcss@2.2.19/lib/index.js"
pin "@tailwindcss/forms", to: "https://ga.jspm.io/npm:@tailwindcss/forms@0.3.4/index.js"

# Add any other npm packages you're using
# For example:
# pin "lodash", to: "https://ga.jspm.io/npm:lodash@4.17.21/lodash.js"