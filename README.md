# FairShare

FairShare is a cloud-native web application for expense sharing and group finance management. Built with Ruby on Rails and styled with Tailwind CSS. FairShare aims to simplify group expenses and promote financial collaboration.

## Features

- User authentication and account management
- Create and manage expense groups
- Add and categorize expenses within groups
- Automatic balance calculation
- Responsive design with Tailwind CSS

## Prerequisites

- Ruby 3.1.2 or higher
- Rails 7.1 or higher
- PostgreSQL
- Node.js and Yarn (for Webpacker and Tailwind CSS)

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fairshare.git
   cd fairshare
   ```

2. Install dependencies:
   ```
   bundle install
   yarn install
   ```

3. Setup the database:
   ```
   rails db:create db:migrate
   ```

4. Start the Rails server and Tailwind CSS watcher:
   ```
   ./bin/dev
   ```

5. Visit `http://localhost:3000` in your browser

## Running Tests

We use RSpec for testing. Run the test suite with:

```
bundle exec rspec
```

## Code Style

We follow the Ruby Style Guide. Please ensure your code adheres to these standards.

## Tailwind CSS

We use Tailwind CSS for styling. The configuration file is at `config/tailwind.config.js`. To compile Tailwind CSS:

```
rails tailwindcss:build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

## Project Structure

- `app/models`: ActiveRecord models
- `app/controllers`: Controllers for handling requests
- `app/views`: View templates (ERB)
- `app/javascript`: JavaScript files
- `app/assets`: Static assets and Tailwind CSS file
- `config`: Application configuration
- `db`: Database migrations and schema
- `spec`: Test files

## Deployment

(Add deployment instructions here once you have a deployment process set up)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.