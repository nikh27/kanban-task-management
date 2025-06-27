# 🗂️ Kanban Project

A full-stack Kanban board application built with a **Django REST Framework backend** and **React (TypeScript) frontend**. It includes features like task tracking, drag-and-drop functionality, user assignments, and dark mode support.

---

## 🚀 Features

- 🔐 User authentication (login/register)
- ✅ Task management (CRUD, assign users, labels, due dates)
- 💬 Comments and attachments on tasks
- 🔍 Search tasks by title, description, or assignee
- 🖱️ Drag and drop tasks between columns
- 📊 Dashboard analytics
- 🌙 Dark mode support
- 📱 Mobile responsive design

---

## 🎬 Demo

📹 [Watch Demo Video](https://drive.google.com/file/d/1-zditI3nJyraWdOY4VpbuijxKM9-_kzK/view?usp=sharing)

---

## 🧩 Tech Stack

- **Backend:** Django, Django REST Framework, django-filter
- **Frontend:** React, TypeScript, Tailwind CSS
- **API:** RESTful with JWT authentication

---

## 🛠️ Getting Started

### 🧠 Backend Setup

1. **Set up a virtual environment and install dependencies:**

    ```bash
    cd kanban_backend
    python -m venv venv
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    # source venv/bin/activate
    pip install -r requirements.txt
    ```

2. **Apply migrations:**

    ```bash
    python manage.py migrate
    ```

3. **Create a superuser (optional):**

    ```bash
    python manage.py createsuperuser
    ```

4. **Run the development server:**

    ```bash
    python manage.py runserver
    ```

---

### 💻 Frontend Setup

1. **Install dependencies:**

    ```bash
    cd ../kanban_fronted
    npm install
    ```

2. **Start the development server:**

    ```bash
    npm run dev
    ```

    The frontend will be available at [http://localhost:3000](http://localhost:5173) and connect to the backend at [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api).

---


## 🙋‍♂️ Author

**Nikhil Pandey**  
Made with ❤️ in India

---

_Stay tuned — I’ll keep updating this project with new features and improvements!_
