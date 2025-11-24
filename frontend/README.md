# Frontend Expo App

## How to Run

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies (if not already installed):**

    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npx expo start
    ```

## How to View on Your Phone

1.  **Install Expo Go:**

    - **iOS:** Download "Expo Go" from the App Store.
    - **Android:** Download "Expo Go" from the Google Play Store.

2.  **Connect:**
    - Ensure your phone and computer are on the **same Wi-Fi network**.
    - **iOS:** Open the Camera app and scan the QR code displayed in the terminal after running `npx expo start`.
    - **Android:** Open the Expo Go app and scan the QR code using the app's scanner.

## Troubleshooting

- If the QR code doesn't work, try pressing `c` in the terminal to show the QR code again.
- If you have connection issues, ensure your firewall isn't blocking the connection.
- You can also run `npx expo start --tunnel` if you are on a different network (requires installing `@expo/ngrok` globally or in the project).
