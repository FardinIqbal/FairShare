# FinShare

FinShare is a cloud-native web application for expense sharing and micro-lending among friends and groups. Built with Ruby on Rails and React, FinShare aims to simplify group finances and promote financial collaboration.

## Features

### Expense Sharing
- Create and manage expense groups
- Add expenses to groups
- Automatically calculate balances within groups
- Settle up between users
- View expense history and summaries

### Micro-Lending (Planned)
- Request small loans from group members
- Offer loans to group members
- Track loan repayments
- Set interest rates and repayment terms

### User Dashboard
- Overview of all groups and outstanding balances
- Recent activity feed
- Personal finance summary

## Technology Stack

- Backend: Ruby on Rails
- Frontend: React
- Database: PostgreSQL
- Hosting: AWS (ECS, RDS, S3)
- Authentication: Devise
- Testing: RSpec, FactoryBot

## Setup

1. Clone the repository
```
git clone https://github.com/yourusername/finshare.git
cd finshare
```

2. Install dependencies
```
bundle install
yarn install
```

3. Set up the database
```
rails db:create db:migrate
```

4. Start the Rails server
```
rails server
```

5. In a new terminal, start the React development server
```
bin/webpack-dev-server
```

6. Visit `http://localhost:3000` in your browser

## Testing

Run the test suite with:
```
bundle exec rspec
```

## Deployment

FinShare is designed to be deployed on AWS using ECS (Elastic Container Service). Deployment instructions will be added as the project progresses.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.