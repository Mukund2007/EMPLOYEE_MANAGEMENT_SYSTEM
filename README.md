# Employee Management System (EMS)

A modern, responsive, full-stack Employee Management System built with **Spring Boot** and **React (Vite)**.

## 🚀 Live Demo (Frontend Only)
**[https://employeemanagementsystem-lemon.vercel.app/](https://employeemanagementsystem-lemon.vercel.app/)**

---

## 🛠 Tech Stack
* **Frontend**: React, Vite, Lucide React (Icons), Recharts (Analytics), Vanilla CSS (Curated harmony, dark/light modes)
* **Backend**: Spring Boot, Spring Security (JWT, RBAC), Spring Data JPA, Hibernate
* **Database**: MySQL

---

## ✨ Features
1. **User Authentication & RBAC**: Secure sign-in with role validation (Admin/User), registration, and JWT token protection.
2. **Account Link Request Flow**: Standard users can request their account to be linked to an employee profile. Admins can view, link, or dismiss requests via the sidebar badge and **Requests** page.
3. **Leave Tracker**: 
   * Users can submit leave requests (Annual, Sick, Personal, etc.) and view request history.
   * Admins can approve or reject pending leave requests.
4. **Employee Directory**: Sortable, filterable (search, department, salary slider), and paginated employee directory (soft delete support).
5. **Analytics**: Rich charts (using Recharts) representing department headcounts, salary averages, and payroll distributions.
6. **Dark / Light Modes**: Responsive UI with state persisted in `localStorage`.
7. **Export to CSV**: Easily export the filtered employee roster to CSV.

---

## ⚙️ Running Locally

### 1. Database Setup
Create a MySQL database named `ems`:
```sql
CREATE DATABASE ems;
```
Configure your credentials in `backend/src/main/resources/application.properties`.

### 2. Run Backend
```bash
cd backend
./mvnw spring-boot:run
```
The server will start on port `8080`.

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
The development server will run on `http://localhost:5173`.
