# Predictive Campus Analytics

A state-of-the-art **Campus Intelligence Platform** built for the KPMG Hackathon. This platform goes beyond raw data reporting by leveraging predictive modeling and generative AI to provide **Decision Intelligence** and **Actionable Analytics**. It identifies at-risk students and recommends automated, personalized interventions to improve student success.

## Features

- **Predictive Risk Engine**: Calculates a "Composite Success Score" based on multi-dimensional data (LMS activity, mock interviews, attendance, core skills) to segment the campus into four risk tiers (Thriving, On Track, Moderate Risk, Critical Risk).
- **Automated Action Center**: 24/7 scanning of student data to surface urgent issues, such as sudden attendance drops or high-risk placement profiles, right to the top of the dashboard.
- **Explainable AI (XAI)**: Understand the "why" behind every score. Dive deep into student profiles to see positive and negative score drivers and use the **What-If Predictive Simulator** to see how interventions could improve outcomes.
- **AI Counselor (Gemini Powered)**: Integrated with the live Google Gemini API to analyze student risk profiles dynamically, answer queries contextually, and draft personalized intervention emails.
- **Enterprise Scale**: Built with full data portability (CSV exports) and one-click Bulk AI Interventions to queue workflows for hundreds of students simultaneously.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI/Styling**: React, Tailwind CSS, Lucide React
- **Data Visualization**: Recharts
- **AI Integration**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone <your-repo-url>
   cd kpmg-hackathon
   ```

2. Install dependencies:
   ```bash
   npm install
   # or yarn install, pnpm install, bun install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or yarn dev, pnpm dev, bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
