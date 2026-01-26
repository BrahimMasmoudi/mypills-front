# MyPills 💊

MyPills is a modern, user-friendly medication management application designed to help users track their medicine inventory, monitor expiration dates, and receive timely reminders via push notifications.

✨ Features
- **Smart Scanning:** Instantly add medications by scanning GS1 DataMatrix or CIP13 barcodes.
- **Medication Inventory:** A centralized dashboard for your personal pharmacy.
- **Expiration Tracking:** Visual alerts for expired or soon-to-expire medicines.
- **Stock Management:** Real-time tracking of pill quantities and box counts.
- **🔔 Smart Reminders:** Set custom schedules for your medications.
- **📲 Push Notifications:** Receive instant alerts on your device via Firebase Cloud Messaging (FCM).
- **Responsive Design:** Fully optimized PWA (Progressive Web App).
- **Internationalization:** Support for English 🇬🇧 and French 🇫🇷.

🛠️ Technologies Used
### Frontend
- **Framework:** Nuxt 3 (Vue.js)
- **UI Library:** Vuetify
- **State Management:** Pinia
- **Messaging:** Firebase Cloud Messaging (Web SDK)
- **Scanning:** html5-qrcode

### Backend
- **Platform:** Firebase (Cloud Functions & FCM)
- **Database:** Cloud Firestore
- **Scheduling:** Cloud Functions (Pub/Sub or Cloud Tasks)
- **Database Migrations:** Fireway

🚀 Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mypills-front