import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

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

interface DeepDiveResult {
  companyAnalysis: string;
  employeeReviews: string;
  salaryData: string;
  marketTrends: string;
  recentNews: string;
  skillsMatch: string;
  redFlags: string[];
  opportunities: string[];
  resumeSuggestions: string;
}

// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to check if the server is running
const checkServerConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Server connection error:', error);
    return false;
  }
};

function App() {
  // User profile and preferences
  const [resume, setResume] = useState<File | null>(null)
  const [userPreferences, setUserPreferences] = useState({
    industry: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    jobType: 'any', // remote, hybrid, on-site, any
    keywords: '',
  })

  // Job search state
  const [isSearching, setIsSearching] = useState(false)
  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  
  // Deep dive state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [deepDiveResult, setDeepDiveResult] = useState<DeepDiveResult | null>(null)
  
  // UI state
  const [activeTab, setActiveTab] = useState<'search' | 'profile'>('search')
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add server connection state
  const [serverConnected, setServerConnected] = useState(true);

  // Load saved preferences on initial load
  useEffect(() => {
    // Check server connection first
    const checkConnection = async () => {
      const isConnected = await checkServerConnection();
      setServerConnected(isConnected);
      
      if (!isConnected) {
        setError('Cannot connect to the server. Please make sure the backend is running.');
        return;
      }
      
      loadPreferences();
    };
    
    checkConnection();
  }, []);
  
  const loadPreferences = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/preferences`);
      if (response.data && response.data.preferences) {
        setUserPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Use default preferences if API fails
    }
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setResume(file)
    }
  }

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserPreferences(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const savePreferences = async () => {
    try {
      await axios.post(`${API_BASE_URL}/user/preferences`, {
        preferences: userPreferences
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  const handleJobSearch = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSearching(true)
    setError(null)
    
    try {
      // Save preferences when searching
      await savePreferences();
      
      // Call the backend API
      const response = await axios.post(`${API_BASE_URL}/jobs/search`, {
        keywords: userPreferences.keywords,
        location: userPreferences.location,
        industry: userPreferences.industry,
        minSalary: userPreferences.minSalary,
        maxSalary: userPreferences.maxSalary,
        jobType: userPreferences.jobType
      });
      
      if (response.data && response.data.jobs) {
        setJobListings(response.data.jobs);
      } else {
        setJobListings([]);
      }
    } catch (error) {
      console.error('Error searching for jobs:', error);
      setError('Failed to search for jobs. Please try again.');
    } finally {
      setIsSearching(false)
    }
  }

  const handleDeepDive = async (job: JobListing) => {
    setSelectedJob(job)
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Call the backend API with JSON data
      const response = await axios.post(`${API_BASE_URL}/jobs/deep-dive`, {
        jobId: job.id,
        // We'll handle resume upload separately in a real implementation
      });
      
      setDeepDiveResult(response.data);
    } catch (error) {
      console.error('Error performing deep dive analysis:', error);
      setError('Failed to analyze job. Please try again.');
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveJob = async (job: JobListing) => {
    try {
      await axios.post(`${API_BASE_URL}/jobs/save`, { job });
      alert('Job saved to your profile!');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. Please try again.');
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Job Genie 🧞‍♂️</h1>
        <p>Your AI-powered job search and analysis assistant</p>
        
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Job Search
          </button>
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </button>
        </div>
      </header>

      <main className="main-content">
        {!serverConnected && (
          <div className="server-error">
            <h2>Server Connection Error</h2>
            <p>Cannot connect to the backend server. Please make sure it's running at {API_BASE_URL}</p>
            <button 
              className="retry-button"
              onClick={async () => {
                const isConnected = await checkServerConnection();
                setServerConnected(isConnected);
                if (isConnected) {
                  setError(null);
                  loadPreferences();
                }
              }}
            >
              Retry Connection
            </button>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {activeTab === 'profile' ? (
          <div className="profile-section">
            <h2>My Profile</h2>
            
            <div className="form-group">
              <label htmlFor="resume">Upload your resume (PDF)</label>
              <input
                type="file"
                id="resume"
                accept=".pdf"
                onChange={handleResumeUpload}
              />
              {resume && <p className="file-name">Current file: {resume.name}</p>}
            </div>
            
            <h3>Job Preferences</h3>
            <div className="preferences-form">
              <div className="form-group">
                <label htmlFor="industry">Industry</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={userPreferences.industry}
                  onChange={handlePreferenceChange}
                  placeholder="e.g. Technology, Healthcare, Finance"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={userPreferences.location}
                  onChange={handlePreferenceChange}
                  placeholder="e.g. San Francisco, Remote, United States"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="minSalary">Min Salary</label>
                  <input
                    type="text"
                    id="minSalary"
                    name="minSalary"
                    value={userPreferences.minSalary}
                    onChange={handlePreferenceChange}
                    placeholder="e.g. 80000"
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="maxSalary">Max Salary</label>
                  <input
                    type="text"
                    id="maxSalary"
                    name="maxSalary"
                    value={userPreferences.maxSalary}
                    onChange={handlePreferenceChange}
                    placeholder="e.g. 120000"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="jobType">Job Type</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={userPreferences.jobType}
                  onChange={handlePreferenceChange}
                >
                  <option value="any">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="keywords">Keywords</label>
                <input
                  type="text"
                  id="keywords"
                  name="keywords"
                  value={userPreferences.keywords}
                  onChange={handlePreferenceChange}
                  placeholder="e.g. React, JavaScript, Senior"
                />
              </div>
              
              <button 
                className="save-preferences-button"
                onClick={savePreferences}
              >
                Save Preferences
              </button>
            </div>
          </div>
        ) : (
          <div className="search-section">
            <form onSubmit={handleJobSearch} className="search-form">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={userPreferences.keywords}
                  onChange={(e) => setUserPreferences(prev => ({...prev, keywords: e.target.value}))}
                />
                <input
                  type="text"
                  placeholder="Location or 'Remote'"
                  value={userPreferences.location}
                  onChange={(e) => setUserPreferences(prev => ({...prev, location: e.target.value}))}
                />
                <button type="submit" disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search Jobs'}
                </button>
              </div>
              
              <div className="filter-toggle">
                <button 
                  type="button" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="toggle-button"
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
              
              {showFilters && (
                <div className="advanced-filters">
                  <div className="form-group">
                    <label htmlFor="industry">Industry</label>
                    <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={userPreferences.industry}
                      onChange={handlePreferenceChange}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="minSalary">Min Salary</label>
                      <input
                        type="text"
                        id="minSalary"
                        name="minSalary"
                        value={userPreferences.minSalary}
                        onChange={handlePreferenceChange}
                      />
                    </div>
                    
                    <div className="form-group half">
                      <label htmlFor="maxSalary">Max Salary</label>
                      <input
                        type="text"
                        id="maxSalary"
                        name="maxSalary"
                        value={userPreferences.maxSalary}
                        onChange={handlePreferenceChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="jobType">Job Type</label>
                    <select
                      id="jobType"
                      name="jobType"
                      value={userPreferences.jobType}
                      onChange={handlePreferenceChange}
                    >
                      <option value="any">Any</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                </div>
              )}
            </form>
            
            <div className="results-container">
              {isSearching ? (
                <div className="loading-indicator">Searching across job boards...</div>
              ) : jobListings.length > 0 ? (
                <div className="job-results">
                  <h2>Job Matches</h2>
                  <div className="job-list">
                    {jobListings.map(job => (
                      <div 
                        key={job.id} 
                        className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`}
                        onClick={() => setSelectedJob(job)}
                      >
                        <h3>{job.title}</h3>
                        <div className="job-company">{job.company}</div>
                        <div className="job-details">
                          <span>{job.location}</span>
                          <span>{job.type}</span>
                          <span>{job.salary}</span>
                        </div>
                        <div className="job-source">
                          <span>Posted: {job.postedDate}</span>
                          <span>Source: {job.source}</span>
                        </div>
                        <button 
                          className="deep-dive-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeepDive(job);
                          }}
                        >
                          Deep Dive
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-results">
                  <p>Start your job search by entering keywords and location above.</p>
                </div>
              )}
              
              {selectedJob && deepDiveResult && (
                <div className="deep-dive-results">
                  <h2>Deep Dive Analysis: {selectedJob.title} at {selectedJob.company}</h2>
                  
                  <div className="analysis-section">
                    <h3>Company Analysis</h3>
                    <p>{deepDiveResult.companyAnalysis}</p>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>Employee Reviews</h3>
                    <p>{deepDiveResult.employeeReviews}</p>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>Salary Data</h3>
                    <p>{deepDiveResult.salaryData}</p>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>Market Trends</h3>
                    <p>{deepDiveResult.marketTrends}</p>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>Recent News</h3>
                    <p>{deepDiveResult.recentNews}</p>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>Skills Match</h3>
                    <p>{deepDiveResult.skillsMatch}</p>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>Potential Red Flags</h3>
                    <ul>
                      {deepDiveResult.redFlags.map((flag, index) => (
                        <li key={index}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>Growth Opportunities</h3>
                    <ul>
                      {deepDiveResult.opportunities.map((opportunity, index) => (
                        <li key={index}>{opportunity}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="analysis-section">
                    <h3>Resume Suggestions</h3>
                    <p>{deepDiveResult.resumeSuggestions}</p>
                  </div>
                  
                  <div className="action-buttons">
                    <a 
                      href={selectedJob.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="apply-button"
                    >
                      Apply Now
                    </a>
                    <button 
                      className="save-button"
                      onClick={() => handleSaveJob(selectedJob)}
                    >
                      Save Job
                    </button>
                  </div>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="analyzing-overlay">
                  <div className="analyzing-content">
                    <div className="spinner"></div>
                    <p>Performing deep dive analysis...</p>
                    <p className="analyzing-detail">Researching company information, employee reviews, salary data, and more...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
