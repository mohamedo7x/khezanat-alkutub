# Khezanat Alkutub Book Store API

This is a Node.js RESTful API for a book store application, supporting user management, product (book) handling, file uploads, localization, and more.

## Features

- **User Management:** Registration, authentication, and scheduled cleanup of inactive accounts.
- **Product Management:** Upload and process book cover images and PDF files.
- **Localization:** Multi-language support via JSON files in [`locale/`](locale/).
- **File Uploads:** Handles image and PDF uploads for products.
- **Security:** Uses Helmet, rate limiting, HPP, and input escaping.
- **Error Handling:** Centralized error middleware.
- **Cloud Storage:** Integrates with Cloudinary for media storage.
- **Database:** MongoDB connection via Mongoose.
- **Environment Config:** Uses dotenv for environment variables.
- **Logging:** Morgan for request logging in development.
- **Scheduled Tasks:** Cleans up inactive users hourly with node-cron.

## Project Structure

- [`app.js`](app.js): Main application entry point.
- [`config/`](config/): Configuration files for database, cloud storage, localization, etc.
- [`src/controllers/`](src/controllers/): Route handlers for products, orders, etc.
- [`src/models/`](src/models/): Mongoose models.
- [`src/routes/`](src/routes/): API route definitions.
- [`src/middlewares/`](src/middlewares/): Custom middleware (error handling, locale, etc.).
- [`uploads/`](uploads/): Uploaded files (images, PDFs).
- [`locale/`](locale/): Localization files for supported languages.

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Configure environment variables:**  
   Create a `.env` file or edit [`config/config.env`](config/config.env) with your MongoDB URI, Cloudinary credentials, etc.

3. **Run the app:**
   ```sh
   npm start
   ```

## API Endpoints

- `GET /api/v1` — Welcome endpoint.
- Product, user, and order endpoints as defined in [`src/routes/`](src/routes/).
