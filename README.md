# ScamGuard - Full-Stack Scam Reporting Platform (React + PHP)

ScamGuard is a community-driven platform for users to report and search for scams. This application is built with a modern **React** frontend and a **PHP/MySQL backend**.

This guide provides the complete steps to deploy the application.

## Architecture Overview

*   **Frontend (React)**: Built with Vite and designed to be hosted on a static hosting provider like **Netlify**. This provides a fast, global CDN for your users.
*   **Backend (PHP API)**: A set of PHP scripts in the `/api` directory that connect to your MySQL database. This is designed to run on standard web hosting like **cPanel**.
*   **Database (MySQL)**: Hosted on your **cPanel** account.

---

## Final Deployment Guide

Deploying this application is a three-part process. Follow these steps carefully.

### Part 1: Backend Setup on cPanel

First, we will set up the database and upload the API files to your cPanel hosting.

**1. Create the Database & User:**
   - Log in to your cPanel account (`xpressdecor.com/cpanel`).
   - Go to **"MySQL® Database Wizard"**.
   - Create a new database named `scamguard_db`.
   - Create a new database user named `scamguard_usr` with a strong password (`Fardin#123@`).
   - **Add the user to the database** and grant it **"All Privileges"**.

**2. Run the SQL Queries:**
   - Go back to the cPanel dashboard and open **"phpMyAdmin"**.
   - Select the `scamguard_db` database on the left.
   - Click the **"SQL"** tab.
   - Copy and paste the entire block of SQL code below and click **"Go"**.

   ```sql
    CREATE TABLE users (
        id VARCHAR(255) PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        is_banned BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_code VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE reports (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        target_type VARCHAR(50),
        category VARCHAR(50),
        description TEXT NOT NULL,
        reported_by_id VARCHAR(255),
        created_at BIGINT,
        status VARCHAR(50) DEFAULT 'Pending',
        contact_info TEXT,
        FOREIGN KEY (reported_by_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE evidence_files (
        id VARCHAR(255) PRIMARY KEY,
        report_id VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100),
        size BIGINT,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );

    CREATE TABLE comments (
        id VARCHAR(255) PRIMARY KEY,
        report_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        text TEXT NOT NULL,
        created_at BIGINT,
        is_anonymous BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE advertisement (
        id INT PRIMARY KEY AUTO_INCREMENT,
        image_url VARCHAR(255),
        target_url VARCHAR(255),
        is_enabled BOOLEAN DEFAULT FALSE
    );

    -- Insert a default row for the advertisement config
    INSERT INTO advertisement (id, is_enabled) VALUES (1, FALSE);
   ```

**3. Upload API Files:**
   - In cPanel, go to **"File Manager"**.
   - Navigate into the `public_html` directory.
   - Click **"Upload"** and upload a `.zip` file containing the `api` folder from this project.
   - Once uploaded, right-click the `.zip` file and **"Extract"** it. This should create a folder at `/public_html/api`.
   - Inside the `/public_html/api` folder, create a **new folder** called `uploads`. This is where evidence files will be stored.

**4. Configure the Backend:**
   - In the File Manager, navigate to `public_html/api`.
   - **Rename** `config.example.php` to `config.php`.
   - Right-click `config.php` and select **"Edit"**.
   - **Important:** Fill in your database credentials. They should match what you created in Step 1.
   - Generate a **new, secure JWT Secret Key** from a site like [RandomKeygen.com](https://randomkeygen.com/) and paste it into the `JWT_SECRET` field.
   - Save the file.

### Part 2: Upload Project to GitHub

Next, we'll get your code into a GitHub repository, which Netlify will use.

1.  **Create a Repository:**
    - Go to [GitHub](https://github.com) and create a new, public repository. Do not initialize it with a README.
2.  **Push Your Code:**
    - Open a terminal or command prompt in your project's main directory on your computer.
    - Run the following commands, replacing `YOUR_GITHUB_REPO_URL` with the URL of the repository you just created.
    ```bash
    git init -b main
    git add .
    git commit -m "Finalize application for deployment"
    git remote add origin YOUR_GITHUB_REPO_URL
    git push -u origin main
    ```

### Part 3: Deploy Frontend to Netlify

Finally, we'll deploy the React app and connect it to the backend.

1.  **Create a New Site on Netlify:**
    - Log in to your [Netlify](https://app.netlify.com) account.
    - Click **"Add new site"** -> **"Import an existing project"**.
    - Connect to GitHub and select the repository you just pushed your code to.
2.  **Configure Build Settings:**
    - Netlify should automatically detect your settings. Verify they are:
        - **Build command:** `vite build`
        - **Publish directory:** `dist`
3.  **Add the Environment Variable (Crucial Step):**
    - Go to your new site's settings: **"Site configuration"** -> **"Environment variables"**.
    - Click **"Add a variable"**.
    - Enter the following:
        - **Key:** `VITE_API_URL`
        - **Value:** `https://xpressdecor.com/api`
    - Click **"Create variable"**.
4.  **Deploy the Site:**
    - Go to the **"Deploys"** tab and trigger a new deploy, or it may have started automatically.
    - Netlify will build your React application and deploy it. Once finished, your site at `https://scamguards.netlify.app` will be live and connected to your backend!
