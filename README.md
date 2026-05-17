# Music Album Review System

## 📝 Project Overview & Objectives

This project is a **Full-Stack CRUD Application** designed to provide a streamlined platform for music enthusiasts to document and manage their personal album reviews. The primary goal is to implement a functional system with distinct User and Admin roles, ensuring data integrity, secure access, and automated deployment.

To view the public link please use:http://3.25.110.212
(note: due to technical restraints this link may change.

Due to this fact please refer to:
EC2 Instance ID and Name:
i-0c1b6ccb2c6e36794 // Music_Album_Review_System_Team42-1
i-062b72b30801f74c7 // Music_Album_Review_System_Team42-2

For questions regarding load balancing please use:
ALB DNS Name: MusicAlbumALB-72304737.ap-southeast-2.elb.amazonaws.com
)

---

## 🔐 Test Accounts

To quickly test the application, you can use the following pre-configured accounts:

**Admin Account:**

- **Email:** `felix@gmail.com`
- **Password:** `123`

**User Accounts:**

- **Email:** `felix123@gmail.com` | **Password:** `123` (this account has 9 reviews)
- **Email:** `felix2405@gmail.com` | **Password:** `123` (this account has no review)

---

## 🚀 MVP Features

- **User Authentication:** Secure Login and Registration.
- **Album Review CRUD:** Users can Create, Read, Update, and Delete their own reviews.
- **Admin Dashboard:** Oversight capabilities for administrators to manage all system content.
- **Protected Access:** Route guards to prevent unauthorized access.

---

## 📂 System Structure

### **1. Backend (Node.js & Express)**

- `config/db.js`: MongoDB connection setup.
- `controllers/`: Logic for `auth`, `album`, `review`, and `admin` operations.
- `models/`: Data schemas for `User.js`, `Album.js`, and `Review.js`.
- `routes/`: API Endpoints (e.g., `reviewRoutes.js`, `adminRoutes.js`).
- `middleware/`:
  - `authMiddleware.js`: Validates JWT tokens.
  - `adminMiddleware.js`: Restricts access to Admin-only resources.
- `test/test.js`: Scripts for automated testing in CI/CD.

### **2. Frontend (React.js)**

- `src/context/AuthContext.js`: Manages global user state and authentication tokens.
- `src/components/`:
  - `ReviewForm.jsx` & `ReviewList.jsx`: Core CRUD UI components.
  - **Route Guards:** `ProtectedRoute.jsx`, `AdminRoute.jsx`, and `RedirectIfLoggedIn.jsx` to prevent unauthorized access
- `src/pages/`: Main views including `Login.jsx`, `Register.jsx`, `Reviews.jsx`, and `AdminPanel.jsx`.
- `src/App.js`: Defines application routes and applies security wrappers.

---

## 🔄 Core Application Flows

### **1. Authentication & Security Guard**

- **Guest Access:** Guests can choose to register a new account or log in to the system.
- **Unauthorized Access:** If a guest attempts to access a User-specific URL, they are automatically redirected to the **Login** screen.
- **Logged-in Redirection:** If an authenticated user attempts to access the **Login** or **Register** pages, they are redirected back to their main view.
- **Boundary Control:** If a guest or a regular user attempts to access the **Admin Panel**, access is denied, and they are redirected away from the page.

### **2. User Review Logic**

- **Uniqueness:** A User is restricted to writing **only one review per album**.
- **Authorization:** Users can only edit or delete their own reviews. The system prevents editing or deleting reviews belonging to other users.
- **Data Integrity:** Users are not allowed to edit reviews that they have already deleted themselves, nor can they edit reviews that have been removed by an Admin. **This same restriction applies to the delete action**: users cannot delete a review that has already been removed.

### **3. Admin Authority**

- **Full CRUD:** Admins have the same capabilities as users regarding their own content.
- **Review Moderation:** Admins have exclusive access to the **Admin Panel**, allowing them to view all user reviews and delete any invalid or inappropriate content.

---

## 🛠 Tech Stack

- **Frontend:** React.js, Axios, Context API.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **DevOps:** GitHub Actions (`.github/workflows/ci.yml`).

---

## ⚙️ Installation & Environment Setup

### 1. Database Configuration (MongoDB Atlas)

Before running the application, you must configure a MongoDB database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a **New Cluster**.
2. Navigate to **Database Access** and add a new database user (save the username and password).
3. Navigate to **Network Access** and add a new IP address whitelist: `0.0.0.0/0` (Allow access from anywhere).
4. Go back to your Cluster, click **Connect** -> **Drivers**, and copy the connection string.

> **💡 Note for Assessors:** You can still use the current `.env` file provided with the project. However, if you wish to log into MongoDB Atlas to view and modify the raw database directly, please use the following credentials:
>
> - **Email:** `felixsuperbb@gmail.com`
> - **Password:** `Pqyolo@2405`

### 2. Clone the Repository

Open your terminal or command prompt and clone the repository using this link: `https://github.com/Phuc2405/Music-Album-Review-System.git`. Once the download is complete, navigate into the newly created project folder.

### 3. Backend Setup

First, type `cd backend` to navigate into the backend folder, then type `npm install` to install all necessary backend dependencies.
After the installation finishes, revise the file named `.env` directly inside the `backend` folder. Open this file and add your MongoDB connection string and a secret key. It should look something like this: `MONGO_URI=mongodb+srv://<username>:<password>@cluster0...` and `JWT_SECRET=your_super_secret_key`.
Finally, check the backend server by typing `npm start`.

### 4. Frontend Setup

Open a new terminal window, type `cd ../frontend` (or `cd frontend` if you are at the root) to navigate into the frontend folder, and type `npm install` to install all required frontend dependencies.
Once everything is installed, check the frontend server by typing `npm start`.

### 5. Run the System

To run the full application properly, go back to the root folder of the project in your terminal. Start the whole system to test it by typing `npm start`.
