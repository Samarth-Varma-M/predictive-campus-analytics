export interface Student {
  id: string;
  name: string;
  department: "CSE" | "ECE" | "MECH" | "IT";
  year: 1 | 2 | 3 | 4;
  semester: number;
  cgpa: number;
  internalMarks: number;
  backlogs: number;
  attendancePct: number;
  lmsLoginsPerWeek: number;
  assignmentCompletionPct: number;
  hackathonsCount: number;
  techClubMember: boolean;
  certificationsCount: number;
  aptitudeScore: number;
  codingScore: number;
  mockInterviewRating: number;
  coreTechnicalScore: number;
  softSkillsRating: number;
  studentSatisfactionRating: number;
  facultySentimentRating: number;
  historicalScores: Array<{ semester: string; score: number }>;
}

export interface ScoredStudent extends Student {
  academicIndex: number;
  placementIndex: number;
  lmsIndex: number;
  compositeSuccessScore: number;
  tier: "Thriving" | "On Track" | "Moderate Risk" | "Critical Risk";
  academicRisk: "High" | "Medium" | "Low";
  placementRisk: "High" | "Medium" | "Low";
  compoundRisk: boolean;
  segment: "High Potential, Low Industry Readiness" | "Disengaged High-Performer" | "Critical Dual-Risk" | "Consistent Achiever" | "Average Explorer";
  positiveDrivers: Array<{ feature: string; impact: number }>;
  negativeDrivers: Array<{ feature: string; impact: number }>;
  recommendedInterventions: string[];
  trajectory: "Improving" | "Stable" | "Declining";
}

export function scoreStudent(student: Student): ScoredStudent {
  // 1. Academic Index
  const academicIndex = (student.cgpa * 10) * 0.6 + Math.max(0, 100 - student.backlogs * 25) * 0.4;

  // 2. Placement Index
  const placementIndex = student.codingScore * 0.4 + student.aptitudeScore * 0.3 + (student.mockInterviewRating * 20) * 0.3;

  // 3. LMS Index
  const lmsIndex = student.assignmentCompletionPct * 0.7 + Math.min(100, (student.lmsLoginsPerWeek / 20) * 100) * 0.3;

  // Engagement & Skills
  const engagementScore = Math.min(100, (student.certificationsCount * 10) + (student.hackathonsCount * 15) + (student.softSkillsRating * 10));

  // 4. Composite Student Success Score (0-100)
  const compositeSuccessScore = (academicIndex * 0.35) + (student.attendancePct * 0.20) + (lmsIndex * 0.15) + (placementIndex * 0.20) + (engagementScore * 0.10);

  // 5. Tiers
  let tier: ScoredStudent["tier"] = "Critical Risk";
  if (compositeSuccessScore >= 85) tier = "Thriving";
  else if (compositeSuccessScore >= 70) tier = "On Track";
  else if (compositeSuccessScore >= 50) tier = "Moderate Risk";

  // 6. Dual-Track Risk Identification
  let academicRisk: ScoredStudent["academicRisk"] = "Low";
  if (student.backlogs >= 2 || student.attendancePct < 75 || student.cgpa < 6.0) {
    academicRisk = "High";
  } else if (student.backlogs === 1 || student.attendancePct < 80) {
    academicRisk = "Medium";
  }

  let placementRisk: ScoredStudent["placementRisk"] = "Low";
  if ((student.codingScore < 50 || student.aptitudeScore < 50) && student.year >= 3) {
    placementRisk = "High";
  } else if (student.codingScore < 60 && student.year >= 3) {
    placementRisk = "Medium";
  }

  const compoundRisk = academicRisk === "High" && placementRisk === "High";

  // 7. Student Segmentation
  let segment: ScoredStudent["segment"] = "Average Explorer";
  if (compoundRisk) {
    segment = "Critical Dual-Risk";
  } else if (student.cgpa >= 7.5 && placementIndex < 55) {
    segment = "High Potential, Low Industry Readiness";
  } else if (student.codingScore >= 75 && (student.attendancePct < 75 || lmsIndex < 60)) {
    segment = "Disengaged High-Performer";
  } else if (compositeSuccessScore >= 80 && student.backlogs === 0 && student.attendancePct >= 85) {
    segment = "Consistent Achiever";
  }

  // 8. Explainable Score Drivers
  const benchmarks = {
    cgpa: 7.5,
    attendance: 80,
    coding: 65,
    lms: 75
  };

  const drivers = [
    { feature: "CGPA", impact: (student.cgpa - benchmarks.cgpa) * 3 },
    { feature: "Attendance", impact: (student.attendancePct - benchmarks.attendance) * 0.5 },
    { feature: "Coding Skills", impact: (student.codingScore - benchmarks.coding) * 0.4 },
    { feature: "LMS Engagement", impact: (lmsIndex - benchmarks.lms) * 0.3 },
    { feature: "Backlogs", impact: student.backlogs > 0 ? -(student.backlogs * 5) : 2 },
    { feature: "Aptitude", impact: (student.aptitudeScore - 60) * 0.3 }
  ];

  const positiveDrivers = drivers.filter(d => d.impact > 0).sort((a, b) => b.impact - a.impact).slice(0, 3);
  const negativeDrivers = drivers.filter(d => d.impact < 0).sort((a, b) => a.impact - b.impact).slice(0, 3);

  // 9. Prescriptive Interventions
  const recommendedInterventions: string[] = [];
  if (student.backlogs > 0) recommendedInterventions.push("Assign Remedial Lab & Academic Counseling");
  if (student.attendancePct < 75) recommendedInterventions.push("Mandate Weekend Attendance Recovery");
  if (placementRisk === "High") recommendedInterventions.push("Recommend Resume & Mock Interview Workshop");
  if (student.codingScore < 60) recommendedInterventions.push("Assign Peer Coding Mentor");
  if (lmsIndex < 60) recommendedInterventions.push("Send LMS Engagement Reminders");

  if (recommendedInterventions.length === 0) {
    recommendedInterventions.push("Encourage Leadership in Tech Clubs");
  }

  // 10. Predictive Trajectory
  let trajectory: ScoredStudent["trajectory"] = "Stable";
  if (student.facultySentimentRating > 0.5 && student.attendancePct > 80 && student.backlogs === 0) {
    trajectory = "Improving";
  } else if (student.facultySentimentRating < -0.2 || student.attendancePct < 70 || student.backlogs > 0) {
    trajectory = "Declining";
  }

  return {
    ...student,
    academicIndex,
    placementIndex,
    lmsIndex,
    compositeSuccessScore,
    tier,
    academicRisk,
    placementRisk,
    compoundRisk,
    segment,
    positiveDrivers,
    negativeDrivers,
    recommendedInterventions: recommendedInterventions.slice(0, 3),
    trajectory
  };
}

export function generateMockStudents(count: number = 400): ScoredStudent[] {
  const students: Student[] = [];
  const depts = ["CSE", "ECE", "MECH", "IT"] as const;
  
  const firstNames = ["Aarav", "Vihaan", "Aditya", "Arjun", "Sai", "Rohan", "Ishaan", "Ananya", "Diya", "Aditi", "Sneha", "Kavya", "Riya", "Neha", "Pooja", "Rahul", "Karthik", "Siddharth", "Vikram", "Ayesha", "Priya", "Manoj", "Sanjay", "Rajesh", "Suresh", "Kiran", "Nikhil", "Amit", "Rakesh", "Meera"];
  const lastNames = ["Sharma", "Patel", "Reddy", "Singh", "Kumar", "Gupta", "Desai", "Iyer", "Menon", "Rao", "Nair", "Pillai", "Varma", "Joshi", "Kulkarni", "Choudhury", "Bose", "Das", "Mukherjee", "Chatterjee"];

  for (let i = 1; i <= count; i++) {
    const year = Math.floor(Math.random() * 4) + 1 as 1 | 2 | 3 | 4;
    const department = depts[Math.floor(Math.random() * depts.length)];
    
    // Determine Target Tier to guarantee ratio:
    // 50% Thriving, 30% On Track, 15% Moderate, 5% Critical
    const ratio = i / count;
    let baseAttendance = 0;
    
    if (ratio <= 0.50) {
      baseAttendance = 82 + (Math.random() * 18); // 82-100
    } else if (ratio <= 0.80) {
      baseAttendance = 70 + (Math.random() * 18); // 70-88
    } else if (ratio <= 0.95) {
      baseAttendance = 55 + (Math.random() * 20); // 55-75
    } else {
      baseAttendance = 30 + (Math.random() * 30); // 30-60
    }

    const attendancePct = Math.min(100, Math.max(0, baseAttendance));
    
    const yearPrefix = 25 - year; // Mock enrollment year
    const deptCode = department === "CSE" ? "BCE" : department === "ECE" ? "BEC" : department === "MECH" ? "BME" : "BIT";
    const id = `${yearPrefix}${deptCode}${i.toString().padStart(3, '0')}`;
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    // Linear correlation: CGPA is based on Attendance, but with more noise to blur the hard line
    let baseCgpa = (attendancePct / 10) + (Math.random() * 2.4 - 1.2); // +/- 1.2 noise
    
    // 10% chance of being a completely random outlier
    if (Math.random() > 0.90) {
      baseCgpa = Math.random() * 6 + 3.5;
    }
    
    if (ratio <= 0.50 && baseCgpa < 9.0) {
      baseCgpa += 0.4; // Gentle bump to keep average success score high
    }
    
    const cgpa = Math.max(3.0, Math.min(10.0, baseCgpa));
    const backlogs = cgpa < 6 ? Math.floor(Math.random() * 3) + 1 : (Math.random() > 0.9 ? 1 : 0);

    const codingScore = Math.max(30, Math.min(100, (cgpa * 9) + (Math.random() * 10 - 5)));
    const aptitudeScore = Math.max(30, Math.min(100, (cgpa * 9) + (Math.random() * 10 - 5)));
    
    // Generate realistic historical scores leading up to the current composite score
    // The current composite score will be calculated in scoreStudent, but we need
    // an approximate current score to work backwards from.
    const approxCurrentScore = (cgpa * 6) + (attendancePct * 0.3) + (codingScore * 0.1);
    
    const historicalScores = [];
    const pastSemesters = (year - 1) * 2 + (year * 2 - (Math.random() > 0.5 ? 0 : 1) % 2 === 0 ? 1 : 0);
    // At least 2 past points for a good graph, even for first years
    const dataPoints = Math.max(3, pastSemesters);
    
    let currentTrend = approxCurrentScore;
    for (let s = dataPoints; s >= 1; s--) {
      // Add some random walk noise
      currentTrend = currentTrend + (Math.random() * 10 - 5);
      historicalScores.unshift({
        semester: `Sem ${s}`,
        score: Math.max(40, Math.min(100, Math.floor(currentTrend)))
      });
    }

    students.push({
      id,
      name: `${firstName} ${lastName}`,
      department,
      year,
      semester: year * 2 - (Math.random() > 0.5 ? 0 : 1),
      cgpa: Number(cgpa.toFixed(2)),
      internalMarks: Math.floor(cgpa * 9),
      backlogs,
      attendancePct: Number(attendancePct.toFixed(1)),
      lmsLoginsPerWeek: Math.floor(attendancePct / 4) + Math.floor(Math.random() * 5),
      assignmentCompletionPct: Math.max(10, Math.min(100, attendancePct + (Math.random() * 20 - 10))),
      hackathonsCount: Math.floor(Math.random() * (cgpa > 7 ? 5 : 2)),
      techClubMember: Math.random() > 0.6,
      certificationsCount: Math.floor(Math.random() * 4),
      aptitudeScore: Math.floor(aptitudeScore),
      codingScore: Math.floor(codingScore),
      mockInterviewRating: Math.max(1, Math.min(5, (aptitudeScore / 20) + (Math.random() * 1 - 0.5))),
      coreTechnicalScore: Math.floor(codingScore * 0.8 + cgpa * 2),
      softSkillsRating: Math.max(1, Math.min(5, (aptitudeScore / 20))),
      studentSatisfactionRating: Math.max(1, Math.min(5, (attendancePct / 20))),
      facultySentimentRating: Math.max(-1, Math.min(1, (cgpa - 6) / 4)),
      historicalScores
    });
  }

  return students.map(scoreStudent);
}

export const initialStudents = generateMockStudents(400);
