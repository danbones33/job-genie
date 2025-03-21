import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

// Define types for our application
interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  type: string; // remote, hybrid, on-site
  postedDate: string;
  url: string;
  source: string; // which job board it came from
}

interface UserPreferences {
  industry: string;
  location: string;
  minSalary: string;
  maxSalary: string;
  jobType: string;
  keywords: string;
}

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock database for saved jobs and user preferences
const mockDB: {
  savedJobs: JobListing[];
  userPreferences: UserPreferences;
} = {
  savedJobs: [],
  userPreferences: {
    industry: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    jobType: 'any',
    keywords: '',
  },
};

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Search for jobs
app.post('/api/jobs/search', async (req, res) => {
  try {
    const { keywords, location, industry, minSalary, maxSalary, jobType } = req.body;
    
    console.log('Searching for jobs with criteria:', req.body);
    
    // In a real implementation, this would call various job board APIs
    // For now, we'll return mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockJobListings: JobListing[] = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        salary: '$120,000 - $150,000',
        description: 'We are looking for a skilled frontend developer with React experience...',
        type: 'Remote',
        postedDate: '2023-11-15',
        url: 'https://example.com/job1',
        source: 'LinkedIn'
      },
      {
        id: '2',
        title: 'Full Stack Engineer',
        company: 'Innovative Solutions',
        location: 'New York, NY',
        salary: '$130,000 - $160,000',
        description: 'Join our team to build cutting-edge web applications...',
        type: 'Hybrid',
        postedDate: '2023-11-10',
        url: 'https://example.com/job2',
        source: 'Indeed'
      },
      {
        id: '3',
        title: 'React Developer',
        company: 'Digital Creations',
        location: 'Austin, TX',
        salary: '$100,000 - $130,000',
        description: 'Looking for a React developer to join our growing team...',
        type: 'On-site',
        postedDate: '2023-11-05',
        url: 'https://example.com/job3',
        source: 'Glassdoor'
      },
      {
        id: '4',
        title: 'Senior Software Engineer',
        company: 'Tech Innovations',
        location: 'Seattle, WA',
        salary: '$140,000 - $170,000',
        description: 'Join our engineering team to build scalable solutions...',
        type: 'Hybrid',
        postedDate: '2023-11-12',
        url: 'https://example.com/job4',
        source: 'Indeed'
      },
      {
        id: '5',
        title: 'Frontend Developer',
        company: 'Creative Solutions',
        location: 'Remote',
        salary: '$90,000 - $120,000',
        description: 'Looking for a frontend developer with React and TypeScript experience...',
        type: 'Remote',
        postedDate: '2023-11-08',
        url: 'https://example.com/job5',
        source: 'LinkedIn'
      }
    ];
    
    // Filter results based on criteria (in a real app)
    // This would be much more sophisticated
    let filteredJobs = [...mockJobListings];
    
    if (keywords) {
      const keywordsLower = keywords.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(keywordsLower) || 
        job.description.toLowerCase().includes(keywordsLower) ||
        job.company.toLowerCase().includes(keywordsLower)
      );
    }
    
    if (location && location !== 'Remote') {
      const locationLower = location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    } else if (location === 'Remote') {
      filteredJobs = filteredJobs.filter(job => job.type === 'Remote');
    }
    
    if (jobType && jobType !== 'any') {
      filteredJobs = filteredJobs.filter(job => 
        job.type.toLowerCase() === jobType.toLowerCase()
      );
    }
    
    res.status(200).json({ jobs: filteredJobs });
  } catch (error) {
    console.error('Error searching for jobs:', error);
    res.status(500).json({ error: 'Failed to search for jobs' });
  }
});

// Perform deep dive analysis on a job
app.post('/api/jobs/deep-dive', async (req, res) => {
  try {
    const { jobId, resume } = req.body;
    
    console.log(`Performing deep dive analysis for job ID: ${jobId}`);
    
    // In a real implementation, this would:
    // 1. Scrape company information, reviews, salary data
    // 2. Use AI to analyze the job against the resume
    // 3. Generate personalized insights
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock deep dive result
    const mockDeepDiveResult = {
      companyAnalysis: 'TechCorp Inc. is a mid-sized technology company founded in 2010. They specialize in enterprise software solutions and have shown steady growth over the past 5 years.',
      employeeReviews: 'Overall positive reviews with 4.2/5 average rating. Employees praise work-life balance but mention occasional communication issues.',
      salaryData: 'The offered salary range is competitive for the industry and location, sitting at the 70th percentile for similar positions.',
      marketTrends: 'Frontend development roles have seen a 15% increase in demand over the past year, with React skills being particularly valuable.',
      recentNews: 'The company recently secured $20M in Series B funding and announced plans to expand their product line.',
      skillsMatch: 'Based on your resume, you match approximately 85% of the required skills for this position.',
      redFlags: [
        'The job posting has been active for over 30 days, which might indicate slow hiring processes.',
        'Some reviews mention high turnover in the engineering department.'
      ],
      opportunities: [
        'The company offers clear career advancement paths for developers.',
        'They provide education stipends and encourage conference attendance.',
        'Their tech stack aligns well with your experience and career goals.'
      ],
      resumeSuggestions: 'Consider highlighting your experience with performance optimization and state management in React applications to better align with their requirements.'
    };
    
    res.status(200).json(mockDeepDiveResult);
  } catch (error) {
    console.error('Error performing deep dive analysis:', error);
    res.status(500).json({ error: 'Failed to perform deep dive analysis' });
  }
});

// Save a job to user's profile
app.post('/api/jobs/save', (req, res) => {
  try {
    const { job } = req.body as { job: JobListing };
    
    // Check if job already exists in saved jobs
    const jobExists = mockDB.savedJobs.some(savedJob => savedJob.id === job.id);
    
    if (!jobExists) {
      mockDB.savedJobs.push(job);
    }
    
    res.status(200).json({ success: true, savedJobs: mockDB.savedJobs });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// Get saved jobs
app.get('/api/jobs/saved', (req, res) => {
  res.status(200).json({ savedJobs: mockDB.savedJobs });
});

// Update user preferences
app.post('/api/user/preferences', (req, res) => {
  try {
    const { preferences } = req.body as { preferences: UserPreferences };
    
    mockDB.userPreferences = {
      ...mockDB.userPreferences,
      ...preferences
    };
    
    res.status(200).json({ success: true, preferences: mockDB.userPreferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get user preferences
app.get('/api/user/preferences', (req, res) => {
  res.status(200).json({ preferences: mockDB.userPreferences });
});

// Process resume for skills extraction
app.post('/api/resume/analyze', async (req, res) => {
  try {
    // In a real implementation, this would:
    // 1. Parse the PDF resume
    // 2. Extract skills, experience, education
    // 3. Use AI to analyze strengths and weaknesses
    
    // Mock response
    const mockResumeAnalysis = {
      skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'CSS', 'HTML'],
      experience: '5 years',
      education: 'Bachelor of Science in Computer Science',
      strengths: ['Frontend development', 'UI/UX design', 'Performance optimization'],
      weaknesses: ['Limited backend experience', 'No cloud certification'],
      suggestions: 'Consider adding more details about your project achievements and metrics.'
    };
    
    res.status(200).json(mockResumeAnalysis);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 