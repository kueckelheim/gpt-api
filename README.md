# GPT-API

This project is a backend application that integrates with OpenAI's GPT-4 model to simulate a sales manager for an online clothing store. It is built with TypeScript, Express, Handlebars, and OpenAI's API. The core objective of this project is to serve as a proof of concept, demonstrating how OpenAI's `function calling/tools` feature can enable ChatGPT to interact with backend services. In this scenario, it can access the `productService` to retrieve existing products and create invoices.

## Project Structure

```
gpt-api
├── src
│   ├── app.ts                # Entry point of the application
│   ├── controllers           # Contains controllers for handling requests
│   │   └── index.ts          # Index controller
│   ├── routes                # Contains route definitions
│   │   └── index.ts          # Route setup
│   ├── views                 # Contains Handlebars views
│   │   └── index.hbs         # Main view template
│   ├── services              # Contains service classes
│   │   ├── chatGPTService.ts # Service for interacting with OpenAI's GPT-4
│   │   └── productService.ts # Service for managing products and orders
│       └── products.json     # JSON file with product data
│   └── public                # Contains static files
│       ├── styles.css        # CSS styles
├── package.json              # NPM package configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd gpt-api
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

## Usage

To start the application, run:

```
npm start
```

The application will be available at `http://localhost:3000`.

## Features

- **Chat Interface**: Users can interact with a simulated sales manager.
- **Product Management**: The sales manager can suggest products and create orders.
- **Invoice Generation**: Generates an invoice for the user's purchase.

## License

This project is licensed under the MIT License.
