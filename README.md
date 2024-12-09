# Conversa - MERN Chat Application

![Project Banner](screenshots/banner.png)

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) chat application with Personal Chatbot. Conversa is a chat-app with various features like personalized chatbot which remembers the context, login, signup, profile photo uploading, dark and light mode, real-time chatting, message notifications, typing animation, message deletion, active/online status tracking, message seen status, and sending image messages with captions.

NOTE!!! if you want to use the given website please wait for 1 minute after logging in for the first time for the backend server to get restarted as it is a free server.

Guest User login accounts:
```
username : guestuser1@gmail.com, guestuser2@gmail.com
password: 1234guest
```



## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Screenshots](#screenshots)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

### Dark/Light Mode and Responsive Website
- Users can switch between dark and light themes for better readability and responsive website for dekstop and mobile.

![Dark and Light Mode](screenshots/1_home.png)

### Authentication
- Users can sign up, log in, and upload profile photos.
- Forgot password functionality is also available with OTP verification.

![Authentication](screenshots/2_login_signup.png)

### Responsive Dashboard
- Different UI of dashboard for desktop and phone.

![Chatting](screenshots/3_dashboard.png)

### New Chat
- Chatting with new users.

![Chatting](screenshots/4_newchat.png)

### Smooth Searching
- Search chats for easy access.

![Chatting](screenshots/5_searching.png)

### Chatting Area & Real-time Communication
- Users can chat with friends or create new chats with anyone on the app.

![Chatting](screenshots/6_chatting_area.png)

### New Message Real-time Notification
- Real-time messaging with notifications ensures seamless communication.

![Real-time Communication](screenshots/new_message.png)

### Typing Animation
- Typing animation indicates when another user is typing a message.

![Typing Animation](screenshots/typing_animation.png)

### Message Management
- Users can delete messages for themselves or for everyone in the chat.

![Message Management](screenshots/8_delete_message.png)

### Active Now Status
- Users can see the active status of their friends.

![Active Status](screenshots/6_chatting_area.png)

### Message Seen Status
- Users can see if their messages have been seen by the recipient.

![Message Seen Status](screenshots/6_chatting_area.png)

### Personalized Chatbot
- Each user has a personalized chatbot that remembers previous chat contexts.

![Personalized Chatbot](screenshots/personal_chatbot.png)

### Image Messages
- Users can send images as messages along with captions.

![Image Messages](screenshots/7_send_photo.png)

### Login using Otp
- Login using otp if user forgets the password

![Image Messages](screenshots/9_login_otp.png)

## Technologies Used

![MongoDB](https://img.shields.io/badge/mongodb-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge)
![React.js](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/socket.io-%23000000.svg?style=for-the-badge&logo=socket.io&logoColor=white)

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Git

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/mern-chat-app.git
   ```
2. Navigate to the backend folder and frontend folter then install dependencies:
    ```
    cd backend
    npm install
    ```
    
    ```
    cd frontend
    npm install
    ```
    
3. Create a .env file in the backend folder and add necessary environment variables:
    ```
    PORT=5000
    GENERATIVE_API_KEY = ""
    MONGO_URI = ""
    EMAIL = ""
    PASSWORD= ""
    CLOUDINARY_ClOUD_NAME = ""
    CLOUDINARY_API_KEY = ""
    CLOUDINARY_API_SECRET = ""
    JWT_SECRET = ""
    AWS_ACCESS_KEY = ""
    AWS_SECRET = ""
    AWS_BUCKET_NAME = ""
    ```

## Usage
1. Start the backend server:
    ```
    cd backend
    npm install
    nodemon ./index.js
    ```
2. Start the frontend development server:
    ```
    cd frontend
    npm install
    npm run start
    ```
3. Open your browser and navigate to http://localhost:3000 to view the application.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the MIT License.

## About the Author 📝
This project was developed by **Pankil Soni**. Feel free to reach out with any questions or suggestions.
- gmail - pmsoni2016@gmail.com
- kaggle - https://www.kaggle.com/pankilsoni
- LinkedIn - https://www.linkedin.com/in/pankil-soni-5a0541170/
