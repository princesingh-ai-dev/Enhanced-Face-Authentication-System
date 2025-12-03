# FaceGuard Auth - Secure Face Authentication System

FaceGuard Auth is a secure, real-time biometric access system built with Node.js, Express, and face-api.js. It allows users to register their face, authenticate to gain access to protected content, and manage registered users.

## Features

- **Real-time Face Detection**: Uses `face-api.js` for fast and accurate face detection in the browser.
- **Secure Authentication**: Verifies user identity by comparing face descriptors with a stored database.
- **User Management**: Register new users and delete existing ones.
- **Responsive Design**: Modern, glassmorphism-inspired UI that works on various screen sizes.
- **Local Privacy**: Face descriptors are stored locally in a JSON file (`embeddings.json`), ensuring data privacy.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- A webcam or camera-enabled device.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd Face_Authentication_using_Trae
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

    *Note: This will also automatically download the necessary face-api.js models to the `public/models` directory.*

## Usage

1.  **Start the server:**

    ```bash
    npm start
    ```

2.  **Open the application:**

    Open your browser and navigate to `http://localhost:3000`.

3.  **Allow Camera Access:**

    When prompted, allow the browser to access your camera.

4.  **Register a User:**
    -   Enter your name in the input field.
    -   Click "Register Face".
    -   Follow the on-screen instructions (stay still while it captures frames).

5.  **Authenticate:**
    -   Click "Authenticate".
    -   If your face matches a registered user, you will be granted access to the protected content.

## Project Structure

-   `server.js`: The Express backend server handling API requests and data storage.
-   `public/`: Contains frontend assets (HTML, CSS, JS) and models.
    -   `index.html`: The main application page.
    -   `script.js`: Frontend logic for camera handling and face-api.js interaction.
    -   `style.css`: Styling for the application.
    -   `models/`: Directory where face-api.js models are stored (downloaded during setup).
-   `embeddings.json`: JSON file storing registered user data (created automatically).
-   `download_models.js`: Script to download required models.

## Troubleshooting

-   **Models not loading?**
    Run `npm run postinstall` manually to download the models.
-   **Camera not working?**
    Ensure your browser has permission to access the camera and that no other application is using it.
-   **"Face Mismatch"?**
    Ensure good lighting and look directly at the camera during authentication.

## License

This project is open source and available under the [ISC License](LICENSE).