# MyPills 💊

MyPills is a modern, user-friendly medication management application designed to help users track their medicine inventory, monitor expiration dates, and manage their health efficiently.

## ✨ Features

- **Medication Inventory**: Easily add, view, and delete medications from your personal list.
- **Barcode Scanning**: Quickly add medications by scanning GS1 DataMatrix or CIP13 barcodes using your device's camera.
- **Expiration Tracking**: Monitor expiry dates and see visual indicators for expired or soon-to-expire medicines.
- **Stock Management**: Keep track of pill quantities and box counts.
- **Responsive Design**: Fully optimized for both desktop and mobile devices (PWA support).
- **Internationalization**: Available in English 🇬🇧 and French 🇫🇷.

## 🛠️ Technologies Used

### Frontend
- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue.js)
- **UI Library**: [Vuetify](https://vuetifyjs.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Internationalization**: [Vue I18n](https://vue-i18n.intlify.dev/)
- **Barcode Scanning**: [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- **Icons**: [Nuxt Icons](https://github.com/gitFoxCode/nuxt-icons) & MDI

### Backend
- **Platform**: [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- **Language**: TypeScript
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Database Migrations**: [Fireway](https://github.com/kev-roberts/fireway)

## 🚀 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd mypills-front
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    cd front
    yarn install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd ../back
    yarn install
    ```

## 🏃 Usage

To start the development environment with everything running (Nuxt frontend + Firebase Emulators):

1.  **Navigate to the frontend directory:**
    ```bash
    cd front
    ```

2.  **Run the development script:**
    ```bash
    yarn dev
    ```

This command will:
- Build the backend functions.
- Start the Firebase Emulators (Firestore, Auth, Functions).
- Run database migrations (locally).
- Start the Nuxt development server (usually at `http://localhost:3000`).

## 📂 Project Structure

- **`front/`**: Nuxt.js frontend application.
    - `app/`: Vue components, pages, stores, and logic.
    - `assets/`: SCSS, icons, and static assets.
    - `locales/`: Translation files (en.json, fr.json).
- **`back/`**: Firebase Functions backend.
    - `src/`: TypeScript source code for Cloud Functions.
    - `migrations/`: Database schema migration scripts.

## 🤝 Credits

This project uses the **[Medicaments API](https://medicaments-api.giygas.dev)** for retrieving detailed medication information.

## 📄 License

[MIT](LICENSE)
