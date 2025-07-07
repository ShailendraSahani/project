// Global variables
let jobsData = [];
let resultsData = [];
let admitCardsData = [];
let answerKeysData = [];
let latestUpdatesData = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize Website
async function initializeWebsite() {
    try {
        // Show loading spinner
        showLoading();
        
        // Load initial data
        await loadAllData();
        
        // Initialize components
        initializeNavigation();
        initializeScrollEffects();
        initializeContactForm();
        
        // Load content
        loadLatestUpdates();
        loadJobs();
        loadResults();
        loadAdmitCards();
        loadAnswerKeys();
        
        // Hide loading spinner
        hideLoading();
        
        console.log('✅ Website initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing website:', error);
        hideLoading();
    }
}

// Loading functions
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        setTimeout(() => {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }, 1000);
    }
}

// Data loading functions
async function loadAllData() {
    try {
        const [jobs, results, admitCards, answerKeys, updates] = await Promise.all([
            fetchData('/api/jobs'),
            fetchData('/api/results'),
            fetchData('/api/admit-cards'),
            fetchData('/api/answer-keys'),
            fetchData('/api/latest-updates')
        ]);
        
        jobsData = jobs;
        resultsData = results;
        admitCardsData = admitCards;
        answerKeysData = answerKeys;
        latestUpdatesData = updates;
        
        updateStats();
    } catch (error) {
        console.error('Error loading data:', error);
        // Use fallback data
        loadFallbackData();
    }
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return [];
    }
}

function loadFallbackData() {
    // Fallback data when API is not available
    jobsData = generateSampleJobs();
    resultsData = generateSampleResults();
    admitCardsData = generateSampleAdmitCards();
    answerKeysData = generateSampleAnswerKeys();
    latestUpdatesData = generateSampleUpdates();
    updateStats();
}

// Navigation
function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Close mobile menu
                    navMenu.classList.remove('active');
                    
                    // Update active nav link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Smooth scroll to target
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Update active nav on scroll
    window.addEventListener('scroll', updateActiveNav);
}

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Scroll effects
function initializeScrollEffects() {
    // Back to top button
    const backToTop = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Animate elements on scroll
    observeElements();
}

function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.content-card, .quick-link-card, .contact-item').forEach(el => {
        observer.observe(el);
    });
}

// Stats update
function updateStats() {
    const totalJobs = document.getElementById('total-jobs');
    const totalResults = document.getElementById('total-results');
    const totalAdmitCards = document.getElementById('total-admit-cards');
    
    if (totalJobs) totalJobs.textContent = `${jobsData.length}+`;
    if (totalResults) totalResults.textContent = `${resultsData.length}+`;
    if (totalAdmitCards) totalAdmitCards.textContent = `${admitCardsData.length}+`;
}

// Latest updates ticker
function loadLatestUpdates() {
    const tickerContent = document.getElementById('ticker-content');
    if (!tickerContent || latestUpdatesData.length === 0) return;
    
    const updates = latestUpdatesData.map(update => 
        `📢 ${update.title} - ${update.date}`
    ).join(' • ');
    
    tickerContent.textContent = updates;
}

// Jobs section
function loadJobs() {
    const jobsList = document.getElementById('jobs-list');
    if (!jobsList) return;
    
    renderJobs(jobsData);
}

function renderJobs(jobs) {
    const jobsList = document.getElementById('jobs-list');
    if (!jobsList) return;
    
    if (jobs.length === 0) {
        jobsList.innerHTML = '<div class="text-center"><p>No jobs found matching your criteria.</p></div>';
        return;
    }
    
    jobsList.innerHTML = jobs.map(job => `
        <div class="content-card">
            <div class="card-title">${job.title}</div>
            <div class="card-meta">
                <span class="meta-item">
                    <i class="fas fa-building"></i>
                    ${job.department}
                </span>
                <span class="meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    ${job.state}
                </span>
                <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    ${job.lastDate}
                </span>
                <span class="status-badge ${job.status === 'New' ? 'status-new' : job.status === 'Active' ? 'status-active' : 'status-closed'}">
                    ${job.status}
                </span>
            </div>
            <div class="card-description">${job.description}</div>
            <div class="card-actions">
                <a href="${job.detailsLink}" class="btn btn-primary">
                    <i class="fas fa-eye"></i>
                    View Details
                </a>
                <a href="${job.applyLink}" class="btn btn-secondary">
                    <i class="fas fa-external-link-alt"></i>
                    Apply Now
                </a>
            </div>
        </div>
    `).join('');
}

// Filter jobs
function applyJobFilters() {
    const category = document.getElementById('category-filter').value;
    const state = document.getElementById('state-filter').value;
    const search = document.getElementById('job-search').value;
    
    let filteredJobs = jobsData;
    
    if (category) {
        filteredJobs = filteredJobs.filter(job => job.category.toLowerCase() === category.toLowerCase());
    }
    
    if (state) {
        filteredJobs = filteredJobs.filter(job => job.state.toLowerCase() === state.toLowerCase());
    }
    
    if (search) {
        filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.department.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    renderJobs(filteredJobs);
}

// Results section
function loadResults() {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;
    
    renderResults(resultsData);
}

function renderResults(results) {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;
    
    if (results.length === 0) {
        resultsList.innerHTML = '<div class="text-center"><p>No results found.</p></div>';
        return;
    }
    
    resultsList.innerHTML = results.map(result => `
        <div class="content-card">
            <div class="card-title">${result.examName}</div>
            <div class="card-meta">
                <span class="meta-item">
                    <i class="fas fa-building"></i>
                    ${result.department}
                </span>
                <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    ${result.resultDate}
                </span>
                <span class="status-badge ${result.status === 'New' ? 'status-new' : 'status-active'}">
                    ${result.status}
                </span>
            </div>
            <div class="card-description">${result.description}</div>
            <div class="card-actions">
                <a href="${result.resultLink}" class="btn btn-primary">
                    <i class="fas fa-trophy"></i>
                    View Result
                </a>
                <a href="${result.downloadLink}" class="btn btn-secondary">
                    <i class="fas fa-download"></i>
                    Download PDF
                </a>
            </div>
        </div>
    `).join('');
}

// Search results
function searchResults() {
    const search = document.getElementById('result-search').value;
    
    let filteredResults = resultsData;
    
    if (search) {
        filteredResults = filteredResults.filter(result => 
            result.examName.toLowerCase().includes(search.toLowerCase()) ||
            result.department.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    renderResults(filteredResults);
}

// Admit cards section
function loadAdmitCards() {
    const admitCardsList = document.getElementById('admit-cards-list');
    if (!admitCardsList) return;
    
    if (admitCardsData.length === 0) {
        admitCardsList.innerHTML = '<div class="text-center"><p>No admit cards available.</p></div>';
        return;
    }
    
    admitCardsList.innerHTML = admitCardsData.map(card => `
        <div class="content-card">
            <div class="card-title">${card.examName}</div>
            <div class="card-meta">
                <span class="meta-item">
                    <i class="fas fa-building"></i>
                    ${card.department}
                </span>
                <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    ${card.examDate}
                </span>
                <span class="status-badge ${card.status === 'New' ? 'status-new' : 'status-active'}">
                    ${card.status}
                </span>
            </div>
            <div class="card-description">${card.description}</div>
            <div class="card-actions">
                <a href="${card.downloadLink}" class="btn btn-primary">
                    <i class="fas fa-id-card"></i>
                    Download Admit Card
                </a>
                <a href="${card.instructionsLink}" class="btn btn-secondary">
                    <i class="fas fa-info-circle"></i>
                    Instructions
                </a>
            </div>
        </div>
    `).join('');
}

// Answer keys section
function loadAnswerKeys() {
    const answerKeysList = document.getElementById('answer-keys-list');
    if (!answerKeysList) return;
    
    if (answerKeysData.length === 0) {
        answerKeysList.innerHTML = '<div class="text-center"><p>No answer keys available.</p></div>';
        return;
    }
    
    answerKeysList.innerHTML = answerKeysData.map(key => `
        <div class="content-card">
            <div class="card-title">${key.examName}</div>
            <div class="card-meta">
                <span class="meta-item">
                    <i class="fas fa-building"></i>
                    ${key.department}
                </span>
                <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    ${key.publishDate}
                </span>
                <span class="status-badge ${key.status === 'New' ? 'status-new' : 'status-active'}">
                    ${key.status}
                </span>
            </div>
            <div class="card-description">${key.description}</div>
            <div class="card-actions">
                <a href="${key.downloadLink}" class="btn btn-primary">
                    <i class="fas fa-key"></i>
                    Download Answer Key
                </a>
                <a href="${key.objectionLink}" class="btn btn-secondary">
                    <i class="fas fa-exclamation-triangle"></i>
                    Raise Objection
                </a>
            </div>
        </div>
    `).join('');
}

// Global search
function performGlobalSearch() {
    const searchTerm = document.getElementById('global-search').value.toLowerCase();
    if (!searchTerm) return;
    
    // Search in jobs
    const jobResults = jobsData.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.department.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
    );
    
    // Search in results
    const resultResults = resultsData.filter(result => 
        result.examName.toLowerCase().includes(searchTerm) ||
        result.department.toLowerCase().includes(searchTerm)
    );
    
    // Show results in a modal or navigate to relevant section
    if (jobResults.length > 0) {
        showSection('jobs');
        document.getElementById('job-search').value = searchTerm;
        renderJobs(jobResults);
    } else if (resultResults.length > 0) {
        showSection('results');
        document.getElementById('result-search').value = searchTerm;
        renderResults(resultResults);
    } else {
        alert('No results found for your search.');
    }
}

// Show section
function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
}

// Contact form
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// Sample data generators
function generateSampleJobs() {
    return [
        {
            id: 1,
            title: "Staff Selection Commission Multi Tasking Staff (SSC MTS) 2024",
            department: "Staff Selection Commission",
            category: "SSC",
            state: "All India",
            lastDate: "30-01-2024",
            status: "New",
            description: "SSC is recruiting for Multi Tasking Staff positions across various departments. Apply online for this government job opportunity.",
            detailsLink: "#",
            applyLink: "#"
        },
        {
            id: 2,
            title: "Railway Recruitment Board Group D Recruitment 2024",
            department: "Railway Recruitment Board",
            category: "Railway",
            state: "All India",
            lastDate: "15-02-2024",
            status: "Active",
            description: "RRB is conducting recruitment for Group D positions including Track Maintainer, Helper, Assistant Pointsman, and other posts.",
            detailsLink: "#",
            applyLink: "#"
        },
        {
            id: 3,
            title: "Institute of Banking Personnel Selection PO/Clerk 2024",
            department: "IBPS",
            category: "Banking",
            state: "All India",
            lastDate: "20-02-2024",
            status: "Active",
            description: "IBPS is recruiting for Probationary Officer and Clerk positions in participating banks across India.",
            detailsLink: "#",
            applyLink: "#"
        },
        {
            id: 4,
            title: "Union Public Service Commission Civil Services 2024",
            department: "UPSC",
            category: "UPSC",
            state: "All India",
            lastDate: "28-02-2024",
            status: "New",
            description: "UPSC is conducting Civil Services Examination for recruitment to IAS, IPS, IFS and other Group A & B services.",
            detailsLink: "#",
            applyLink: "#"
        },
        {
            id: 5,
            title: "Delhi Police Constable Recruitment 2024",
            department: "Delhi Police",
            category: "Police",
            state: "Delhi",
            lastDate: "10-02-2024",
            status: "Active",
            description: "Delhi Police is recruiting for Constable positions. Both male and female candidates can apply for this recruitment.",
            detailsLink: "#",
            applyLink: "#"
        }
    ];
}

function generateSampleResults() {
    return [
        {
            id: 1,
            examName: "SSC CHSL Tier-1 Result 2023",
            department: "Staff Selection Commission",
            resultDate: "15-01-2024",
            status: "New",
            description: "SSC has declared the result for CHSL Tier-1 examination conducted in 2023.",
            resultLink: "#",
            downloadLink: "#"
        },
        {
            id: 2,
            examName: "RRB NTPC CBT-2 Result 2023",
            department: "Railway Recruitment Board",
            resultDate: "10-01-2024",
            status: "New",
            description: "Railway Recruitment Board has announced the CBT-2 result for NTPC recruitment.",
            resultLink: "#",
            downloadLink: "#"
        },
        {
            id: 3,
            examName: "IBPS PO Mains Result 2023",
            department: "IBPS",
            resultDate: "05-01-2024",
            status: "Active",
            description: "IBPS has declared the Mains examination result for Probationary Officer recruitment.",
            resultLink: "#",
            downloadLink: "#"
        }
    ];
}

function generateSampleAdmitCards() {
    return [
        {
            id: 1,
            examName: "SSC MTS Admit Card 2024",
            department: "Staff Selection Commission",
            examDate: "15-03-2024",
            status: "New",
            description: "Download admit card for SSC MTS examination 2024.",
            downloadLink: "#",
            instructionsLink: "#"
        },
        {
            id: 2,
            examName: "RRB Group D Admit Card 2024",
            department: "Railway Recruitment Board",
            examDate: "20-03-2024",
            status: "Active",
            description: "Download admit card for RRB Group D CBT examination.",
            downloadLink: "#",
            instructionsLink: "#"
        }
    ];
}

function generateSampleAnswerKeys() {
    return [
        {
            id: 1,
            examName: "SSC CHSL Answer Key 2023",
            department: "Staff Selection Commission",
            publishDate: "20-12-2023",
            status: "Active",
            description: "Official answer key for SSC CHSL Tier-1 examination 2023.",
            downloadLink: "#",
            objectionLink: "#"
        },
        {
            id: 2,
            examName: "IBPS Clerk Answer Key 2023",
            department: "IBPS",
            publishDate: "18-12-2023",
            status: "Active",
            description: "Official answer key for IBPS Clerk Prelims examination 2023.",
            downloadLink: "#",
            objectionLink: "#"
        }
    ];
}

function generateSampleUpdates() {
    return [
        {
            id: 1,
            title: "SSC MTS 2024 notification released",
            date: "25-01-2024"
        },
        {
            id: 2,
            title: "RRB Group D result declared",
            date: "24-01-2024"
        },
        {
            id: 3,
            title: "IBPS PO interview schedule announced",
            date: "23-01-2024"
        },
        {
            id: 4,
            title: "UPSC Civil Services final result published",
            date: "22-01-2024"
        }
    ];
}

// Event listeners for search inputs
document.addEventListener('DOMContentLoaded', function() {
    // Global search on Enter key
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performGlobalSearch();
            }
        });
    }
    
    // Job search on Enter key
    const jobSearch = document.getElementById('job-search');
    if (jobSearch) {
        jobSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyJobFilters();
            }
        });
    }
    
    // Result search on Enter key
    const resultSearch = document.getElementById('result-search');
    if (resultSearch) {
        resultSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchResults();
            }
        });
    }
});