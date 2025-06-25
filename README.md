# ScamGuard - Scam Reporting Web Application

ScamGuard is a community-driven platform for users to report scams and spam, and to search existing reports to protect themselves and the community. This is a frontend-only application using React (via ES modules and import maps) and Tailwind CSS, with `localStorage` acting as a mock backend.

## Features

*   User Authentication (Sign Up, Login, Logout) with simulated email/phone verification and reCAPTCHA.
*   Report Scams: Authenticated users can submit scam reports with details and evidence (file metadata stored).
*   Search & Filter Reports: Publicly viewable reports can be searched and filtered.
*   Admin Dashboard:
    *   Manage Reports: Approve, reject, or delete submitted reports.
    *   Manage Users: View users, change roles (admin/user), ban/unban users.
    *   Manage Advertisement: Control a simple CPC advertisement image and link on the homepage.
*   Commenting: Authenticated users can comment on approved reports, with an option for anonymity.
*   Responsive Design with Tailwind CSS.

## Tech Stack (Frontend Only)

*   **React 19** (via ES Modules and import maps - no traditional build step like Webpack/Vite configured in this version)
*   **React Router DOM** for routing
*   **Tailwind CSS** for styling (via CDN)
*   **Heroicons** for icons (via CDN)
*   **react-google-recaptcha** for simulated CAPTCHA
*   **TypeScript**
*   **localStorage** for data persistence (simulated backend)

## Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd scamguard-project 
    ```
2.  **Open `index.html`:**
    Since this project uses ES modules and loads dependencies via CDN through an import map in `index.html`, there's no build step required to run it locally. Simply open the `index.html` file in your web browser.
    *   You can right-click `index.html` in your file explorer and choose "Open with" your preferred browser.
    *   Or, use a simple live server extension in your code editor (like "Live Server" for VS Code) to serve the `index.html` file.

3.  **Google reCAPTCHA:**
    *   The project uses a **test key** for Google reCAPTCHA by default, which works on `localhost`.
    *   If you deploy it or want to use your own domain, you'll need to:
        1.  Obtain your own reCAPTCHA v2 ("I'm not a robot" Checkbox) Site Key from the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/).
        2.  Update the `RECAPTCHA_SITE_KEY` in `constants.tsx` or follow the Netlify deployment instructions below to set it via snippet injection.

## Project Structure

*   `index.html`: Main HTML entry point, includes CDN links and import map.
*   `index.tsx`: Main React application entry point.
*   `App.tsx`: Root application component with routing.
*   `components/`: Reusable UI components.
*   `pages/`: Page-level components.
*   `services/`: Mock services for authentication, reports, etc. (using `localStorage`).
*   `context/`: React context for global state (e.g., AuthContext).
*   `hooks/`: Custom React hooks.
*   `types.ts`: TypeScript type definitions.
*   `constants.tsx`: Global constants, SVG icons, and reCAPTCHA site key.
*   `metadata.json`: Basic application metadata.
*   `netlify.toml`: Configuration for Netlify deployment.
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
*   `README.md`: This file.

## Deployment to Netlify

This project can be deployed as a static site on Netlify.

1.  **Push to GitHub (or GitLab/Bitbucket):**
    Ensure your project is in a Git repository and pushed to a remote provider that Netlify can connect to.

2.  **Sign up/Log in to Netlify.**

3.  **Create a New Site from Git:**
    *   Click "Add new site" -> "Import an existing project".
    *   Connect to your Git provider and select your repository.

4.  **Build Settings:**
    *   **Branch to deploy:** Choose your main branch (e.g., `main`, `master`).
    *   **Build command:** Since there's no build step, you can leave this blank or use `echo "No build command"`.
    *   **Publish directory:** Set this to `.` (root of the repository, as `index.html` is there).
    *   The `netlify.toml` file in this repository pre-configures these settings.

5.  **Environment Variables (for reCAPTCHA):**
    *   Netlify doesn't automatically inject build-time environment variables into static client-side JavaScript without a build process that handles them (like Vite or Create React App).
    *   **Recommended Method: Snippet Injection**
        1.  In your Netlify site dashboard, go to "Site configuration" -> "Build & deploy" -> "Post processing" -> "Snippet injection".
        2.  Click "Add snippet".
        3.  **Inject before `</body>`**:
        4.  In the "HTML" field, add the following script. **Replace `YOUR_ACTUAL_RECAPTCHA_SITE_KEY_HERE` with your actual Google reCAPTCHA v2 Site Key.**
            ```html
            <script>
              window.VITE_RECAPTCHA_SITE_KEY = 'YOUR_ACTUAL_RECAPTCHA_SITE_KEY_HERE';
            </script>
            ```
        5.  Save the snippet.
        The `constants.tsx` file is set up to read `window.VITE_RECAPTCHA_SITE_KEY`. This injected script will define it globally for your application when deployed on Netlify.

6.  **Deploy Site:**
    Click the "Deploy site" button. Netlify will fetch your repository and deploy the files from the publish directory.

7.  **Custom Domain (Optional):**
    Once deployed, you can set up a custom domain in your Netlify site's domain settings.

## Designated Admin User

*   The email `fardinbd@mail.com` is configured as a designated admin. The first user to sign up will also be granted admin privileges if this email is not used first.
*   Admin users have access to additional dashboards for managing reports and users.

## Data Persistence

*   All data (users, reports, comments, advertisement config) is stored in the browser's `localStorage`. This means:
    *   Data is specific to the browser and device being used.
    *   Clearing browser data will erase all stored information.
    *   This is for demonstration purposes only and not suitable for a production application requiring shared, persistent data.

## Limitations

*   **No Backend:** All operations are client-side and data is stored in `localStorage`.
*   **Security:** Client-side authentication and authorization are illustrative and not secure for production.
*   **File Uploads:** Evidence "uploads" store file metadata and, for small images, a base64 Data URL in `localStorage`. Actual file persistence is not implemented.
*   **Email/Phone Verification & Notifications:** These are simulated (e.g., console logs for notifications, any code for verification). Real implementation requires a backend and email/SMS services.
*   **reCAPTCHA:** Verification is client-side only (checks if a token is received). True reCAPTCHA security requires backend token validation.

This project serves as a comprehensive frontend demonstration.
# scamguard
