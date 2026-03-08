# AI-Based Sports Talent Assessment App

## Overview
The **AI-Based Sports Talent Assessment App** is a full-stack mobile application that uses artificial intelligence and computer vision to automatically evaluate athletic performance. The system allows users to record or upload videos of standardized fitness tests such as the **30m Sprint, Sit-ups, and Vertical Jump**.

These videos are analyzed using AI models built with **MediaPipe and OpenCV** to extract performance metrics and generate benchmark-based results.

The goal of this project is to make sports talent identification more **accessible, scalable, and unbiased**, especially for athletes who may not have access to centralized trials or professional coaching.

---

## Features
- User registration and login system  
- Mobile app for recording or uploading test videos  
- AI-powered analysis of sports performance  
- Automated evaluation of three fitness tests:
  - 30m Sprint
  - Sit-ups
  - Vertical Jump
- Benchmark-based scoring and performance feedback  
- Test history tracking and user profile management  
- Secure backend API for video processing and data storage  

---

## System Architecture
The system follows a **full-stack architecture** consisting of a mobile frontend, backend server, AI processing modules, and a database.

### Frontend
- React Native mobile application
- Provides user interface for authentication, test selection, video recording/upload, and result display

### Backend
- Node.js and Express.js server
- Handles API requests, authentication, video uploads, and AI model execution

### AI Processing
- Python scripts using OpenCV and MediaPipe
- Analyze video frames to detect body movements and calculate performance metrics

### Database
- MongoDB database to store user data and test results

---

## Technologies Used
- React Native
- Node.js
- Express.js
- MongoDB
- Python
- OpenCV
- MediaPipe
- Machine Learning

---

## How It Works
1. The user logs into the mobile application.
2. The user selects a fitness test (Sprint, Sit-ups, or Vertical Jump).
3. The user records a video or uploads one from their device.
4. The video is sent to the backend server.
5. The backend executes the corresponding AI model.
6. The AI model analyzes the video and calculates performance metrics.
7. The results are compared with benchmark standards and displayed in the app.

## License
This project is developed for **educational and research purposes**.
