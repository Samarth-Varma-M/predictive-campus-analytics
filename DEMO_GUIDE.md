# Predictive Campus Analytics - Pitch & Demo Guide

This document is designed to help you crush your hackathon presentation. Our project heavily targets the **"Decision Intelligence"** and **"Actionable Analytics"** requirements of the KPMG brief. 

Follow this script to demonstrate the platform to the judges.

---

## 1. The Hook (0:00 - 1:00)
**What to say:**
*"Most campus dashboards just show you raw data—like average attendance or grades. That’s reporting, not intelligence. For this KPMG challenge, we built a **Campus Intelligence Platform** that doesn’t just show you data; it predicts risk and tells you exactly how to intervene."*

**What to do on screen:**
- Open the dashboard (default view).
- Point out the clean, modern **Dark Mode / Zinc** interface. Emphasize that it’s designed for prolonged use by college administrators (reduced eye strain, high data density).

---

## 2. The Analytics Engine & Scoring (1:00 - 2:00)
**What to say:**
*"We built a proprietary scoring engine. Instead of just looking at CGPA, we calculate a **Composite Success Score** (0-100) using multi-dimensional data: LMS activity, mock interview ratings, attendance, and core technical skills. Based on this, the engine segments the entire campus into 4 risk tiers: Thriving, On Track, Moderate Risk, and Critical Risk."*

**What to do on screen:**
- Scroll down to the **Segmentation Distribution** (Donut Chart) and the **Performance Correlation** (Scatter Plot).
- Point out how the scatter plot shows realistic data distributions and outliers, proving our data models handle real-world variance.

---

## 3. The Action Center (2:00 - 3:00)
**What to say:**
*"The brief asked us to convert data into actionable insights. We built an automated **Action Center** that scans the database 24/7. It surfaces urgent issues—like a sudden drop in attendance or a high-risk placement student—and pushes them to the top of the dashboard."*

**What to do on screen:**
- Point to the 3 Alert Cards at the top of the page.
- Click the **"Review"** button on one of the alerts. 
- *Watch the judges' reaction as the main table instantly filters to show exactly those at-risk students.*

---

## 4. Explainable AI & Deep Dive (3:00 - 4:00)
**What to say:**
*"Once an admin spots an at-risk student, they need to know WHY. We built an **Explainable Score Driver** model. When we click 'Deep Dive', we don't just see numbers; the engine tells us the exact positive and negative factors driving that student's score."*

**What to do on screen:**
- Click **"Deep Dive"** on any student in the table. The modal flyout appears.
- Show the **Skills Profiler (Radar Chart)**.
- Highlight the **Explainable Score Drivers** section (e.g., "+3.2 pts for high LMS Activity", "-4.1 pts for poor attendance").
- Play with the **What-If Predictive Simulator** sliders to show how improving attendance actively changes their predicted tier in real-time.

---

## 5. The "Wow Factor" - AI Counselor & Interventions (4:00 - 5:00)
**What to say:**
*"Finally, the ultimate goal of the KPMG brief is Intervention. We integrated a student-specific **AI Counselor powered by the real Google Gemini API**. It securely analyzes the student's specific risk profile, dynamically answers any question you have, and suggests actionable interventions."*

**What to do on screen:**
- Inside the Deep Dive modal, click the **"AI Counselor"** tab at the top.
- Mention to the judges: *"This isn't a fake UI mockup. This is hooked up to a live Gemini API route in our backend."*
- Type a unique question like: *"Write a short, polite email to this student urging them to improve their attendance."* and hit Enter.
- Show how the Gemini AI generates a completely unique, context-aware response based on that specific student's data.
- Click back to the **"Overview & Interventions"** tab and show the **Log Interaction** section at the bottom where admins can record that they took action.

---

## 6. The Closer (5:00)
**What to say:**
*"To prove this scales to an enterprise level, we added two vital features. First, full **Data Portability**.* (Click 'Export CSV' to show the filtered data downloading). *Second, we built **Bulk AI Interventions**.* (Click the 'Bulk Intervention' button in the filter bar). *With one click, administrators can queue personalized AI workflows for hundreds of at-risk students simultaneously.*

*We didn't just build a dashboard; we built a complete, end-to-end Student Success Pipeline."*

---

### Final Checklist Before Submission
1. [x] Ensure `npm run dev` is running without errors.
2. [x] Click around and verify all filters reset properly when changing views.
3. [x] Test the AI chat and Email generator one last time.
4. [x] **WIN.** Good luck!
