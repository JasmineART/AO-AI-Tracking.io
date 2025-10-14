import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  setLogLevel
} from 'firebase/firestore';

// --- Global Setup for Firebase ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'oa-sol-default-app';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const apiKey = ""; // API Key for Gemini API calls

// --- CONSTANTS ---
const DEMO_USER_ID = 'demo-user-12345678';
const TODAY = new Date().toLocaleDateString();
const GEMINI_MODEL = 'gemini-2.5-flash-preview-05-20';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

const AI_STAGES = [
    { value: 'Ideation', color: 'bg-gray-400', text: 'text-gray-800', order: 1, barColor: '#9CA3AF' },
    { value: 'Development', color: 'bg-blue-400', text: 'text-blue-800', order: 2, barColor: '#60A5FA' },
    { value: 'Pilot', color: 'bg-yellow-400', text: 'text-yellow-800', order: 3, barColor: '#FBBF24' },
    { value: 'Production', color: 'bg-green-500', text: 'text-green-800', order: 4, barColor: '#10B981' },
    { value: 'Retired', color: 'bg-red-500', text: 'text-red-800', order: 5, barColor: '#F87171' },
];

const DATA_SOURCE_TYPES = [
    { value: 'PostgreSQL', icon: 'Database' },
    { value: 'MySQL', icon: 'Database' },
    { value: 'Authenticated Database', icon: 'Server' }, 
    { value: 'MongoDB/NoSQL', icon: 'Server' },
    { value: 'CSV/Excel', icon: 'FileText' },
    { value: 'JSON/XML', icon: 'FileJson' },
    { value: 'External API', icon: 'Globe' },
    { value: 'Google Sheets', icon: 'Sheet' },
    { value: 'Data Lake/Warehouse', icon: 'HardDrive' },
    { value: 'Other', icon: 'Tag' },
];

const AUTH_TYPES = [
    'None (Public/Local)', 
    'Basic Login (User/Pass)', 
    'API Key', 
    'OAuth 2.0', 
    'Service Account', 
    'Kerberos/SSO'
];

// Utility to find stage order for progress calculations
const getStageOrder = (stageValue) => {
    return AI_STAGES.find(s => s.value === stageValue)?.order || 0;
};

// Utility to categorize ROI impact
const categorizeROI = (roiMetrics) => {
    if (!roiMetrics) return 'Other';
    const lowerMetrics = roiMetrics.toLowerCase();

    if (lowerMetrics.includes('cost reduction') || lowerMetrics.includes('cost save') || lowerMetrics.includes('reduce cost') || lowerMetrics.includes('budget')) {
        return 'Cost Reduction';
    }
    if (lowerMetrics.includes('revenue') || lowerMetrics.includes('sales') || lowerMetrics.includes('upsell') || lowerMetrics.includes('conversion')) {
        return 'Revenue Generation';
    }
    if (lowerMetrics.includes('efficiency') || lowerMetrics.includes('time save') || lowerMetrics.includes('faster') || lowerMetrics.includes('streamline')) {
        return 'Time/Efficiency Savings';
    }
    return 'Other';
};

// Icons (using inline SVG for guaranteed availability)
const Icon = ({ children, className = "w-5 h-5", title = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-label={title}>
        {children}
    </svg>
);

const UserIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </Icon>
);

const BoltIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </Icon>
);

const PlusIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </Icon>
);

const TrashIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.74 5.94m14.217 0H5.94" />
    </Icon>
);

const EditIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.653.883a.75.75 0 0 1-.9.843 8.356 8.356 0 0 0 1.343-4.99 4.5 4.5 0 0 1 1.13-1.897L16.862 4.487Z" />
    </Icon>
);

const StrategyIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.001 6.001 0 0 0 2.25.75m-2.25-.75a6.001 6.001 0 0 1-2.25.75M12 21A7.5 7.5 0 0 0 9 3.75v16.5a1.5 1.5 0 0 0 3 0V3.75A7.5 7.5 0 0 1 12 21Z" />
    </Icon>
);

const ProcessIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v12a2.25 2.25 0 0 0 2.25 2.25h9.25a2.25 2.25 0 0 0 2.25-2.25v-4.5m-1.5 0 2.25 2.25m0 0 2.25 2.25m-2.25-2.25-2.25 2.25m2.25-2.25-2.25-2.25" />
    </Icon>
);

const DataIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5" />
    </Icon>
);

const DatabaseIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 10.5h13.5M5.25 14.25h13.5M6 18.75h12c.621 0 1.125-.504 1.125-1.125v-9.75a1.125 1.125 0 0 0-1.125-1.125H6a1.125 1.125 0 0 0-1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125Z" />
    </Icon>
);

const FileTextIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v2.25a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5v-6.75a1.5 1.5 0 0 1 1.5-1.5h2.25m5.25 5.25 3-3m0 0 3 3m-3-3v8.25" />
    </Icon>
);

const FileJsonIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5V19.5M8.25 15.75H4.5m15 0h-3.75M8.25 8.25H4.5m15 0h-3.75" />
    </Icon>
);

const GlobeIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0V3m0 18a9 9 0 0 0 9-9 9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9Z" />
    </Icon>
);

const HardDriveIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.5a1.125 1.125 0 0 0-1.29 0l-1.95 1.3M21 7.5v9a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 16.5v-9a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5Z" />
    </Icon>
);

const SheetIcon = (props) => ( // Custom Icon for Google Sheets
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h16.5v16.5H3.75V3.75ZM6 7.5h12M6 12h12M6 16.5h12" />
    </Icon>
);

const ChartBarIcon = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125 7.25 9.375 10 12h11.25M6.75 12h.008M15.75 9h.008M12 17.25h.008" />
    </Icon>
);

const getIconForType = (type, props = {}) => {
    switch (type) {
        case 'PostgreSQL':
        case 'MySQL':
        case 'Authenticated Database':
            return <DatabaseIcon {...props} />;
        case 'MongoDB/NoSQL':
            return <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12h.01M10.5 12h.01M6 12h.01M19.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" /></Icon>; // Simple circle icon
        case 'CSV/Excel':
            return <FileTextIcon {...props} />;
        case 'JSON/XML':
            return <FileJsonIcon {...props} />;
        case 'External API':
            return <GlobeIcon {...props} />;
        case 'Google Sheets':
            return <SheetIcon {...props} />;
        case 'Data Lake/Warehouse':
            return <HardDriveIcon {...props} />;
        default:
            return <DataIcon {...props} />;
    }
}


// --- Component Definitions ---

const Header = ({ user, onSignOut, page, onNavigate, isDemo }) => {
    
    const navItemClass = (target) => 
        `px-3 py-1 text-sm font-medium rounded-lg transition duration-150 ${
            page === target 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-100'
        }`;

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <button 
                    onClick={() => onNavigate('home')} 
                    className="flex items-center text-xl font-extrabold text-indigo-700 hover:text-indigo-900 transition duration-150 ease-in-out"
                >
                    <BoltIcon className="w-7 h-7 mr-2 text-yellow-500" />
                    OA Sol
                </button>
                <nav className="flex items-center space-x-2 md:space-x-4">
                    <button onClick={() => onNavigate('home')} className={navItemClass('home')}>
                        Home
                    </button>
                    <button onClick={() => onNavigate('about')} className={navItemClass('about')}>
                        About Us
                    </button>
                    {(user || isDemo) && (
                        <button onClick={() => onNavigate('dashboard')} className={navItemClass('dashboard')}>
                            Dashboard
                        </button>
                    )}

                    {(user || isDemo) ? (
                        <button
                            onClick={onSignOut}
                            className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-full hover:bg-red-600 transition duration-150 ease-in-out shadow-lg ml-4"
                        >
                            {isDemo ? 'Exit Demo' : 'Sign Out'}
                        </button>
                    ) : (
                        <button
                            onClick={() => onNavigate('login')}
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out shadow-lg ml-4"
                        >
                            Sign In
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

const HomePage = ({ onNavigate }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                Accelerate Your <span className="text-indigo-600">AI Implementation</span> Strategy
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                OA Sol provides the unified dashboard to track, manage, and optimize the entire lifecycle of your enterprise AI systems, from ideation to production.
            </p>
            <button
                onClick={() => onNavigate('login')}
                className="px-8 py-4 text-lg font-bold text-white bg-yellow-500 rounded-xl hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105 shadow-xl shadow-yellow-500/50"
            >
                Start Tracking Today
            </button>
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Real-Time Status", desc: "Monitor system health and performance across departments.", icon: <BoltIcon className="w-8 h-8 text-indigo-600" /> },
                    { title: "ROI Visibility", desc: "Clearly link AI projects to measurable business outcomes.", icon: <Icon className="w-8 h-8 text-indigo-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.879m0 0 2.24 2.24m-2.24-2.24V21M12 6V3M6.364 21a2.25 2.25 0 0 0 2.24-2.077L9.75 16.5m0-1.284a1.5 1.5 0 0 1-1.404-1.956L8.25 10.5m0 0a1.5 1.5 0 0 0-1.956-1.404l-2.24 2.24m.879.879L6.364 21" /></Icon> },
                    { title: "Data Lineage", desc: "Track all data sources feeding your AI for governance and compliance.", icon: <DataIcon className="w-8 h-8 text-indigo-600" /> }
                ].map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-center mb-4">{item.icon}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-500">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const AboutUsPage = () => (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-12">
            <header className="text-center mb-12">
                <BoltIcon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h1 className="text-4xl font-extrabold text-gray-900">
                    Powering the Future of Business with AI Automation
                </h1>
                <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                    OA Sol (Operation Automation Solutions) specializes in designing and implementing customized AI and automation solutions that streamline operations, reduce costs, and accelerate growth for leading companies.
                </p>
            </header>

            <section className="mt-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b-2 border-indigo-200 pb-2">
                    Our Core Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Service 1: AI Strategy & Implementation */}
                    <div className="bg-indigo-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                        <StrategyIcon className="w-10 h-10 text-indigo-600 mb-3" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Strategy & Implementation</h3>
                        <p className="text-gray-600">
                            We guide you in identifying high-impact automation opportunities and building a clear roadmap for successful implementation. Our approach focuses on seamless integration into your existing workflows.
                        </p>
                    </div>

                    {/* Service 2: Process Automation */}
                    <div className="bg-green-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                        <ProcessIcon className="w-10 h-10 text-green-600 mb-3" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Process Automation</h3>
                        <p className="text-gray-600">
                            From repetitive data entry to complex workflows, we automate processes to free up your team for strategic, value-added work. We specialize in solutions for field services, sales, and logistics.
                        </p>
                    </div>

                    {/* Service 3: Data Governance & Lineage */}
                    <div className="bg-yellow-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                        <DataIcon className="w-10 h-10 text-yellow-600 mb-3" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Governance & Lineage</h3>
                        <p className="text-gray-600">
                            We help establish robust data pipelines, ensuring your AI models are fed clean, compliant data, and provide tools for tracking data sources end-to-end.
                        </p>
                    </div>
                </div>
            </section>
            
            <section className="mt-16 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Ready to Transform Your Operations?
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                    Our solutions are not just about technology; they're about transforming your business to be more efficient and responsive to market demands.
                </p>
                <button
                    onClick={() => console.log('Contact us link clicked')} // Placeholder for real contact link
                    className="px-8 py-3 text-lg font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition duration-300 ease-in-out shadow-lg"
                >
                    Request a Consultation
                </button>
            </section>
        </div>
    </div>
);

const LoginPage = ({ onGoogleSignIn, onDemoLogin, error, isLoading }) => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl text-center">
            <BoltIcon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to OA Sol</h2>
            <p className="text-gray-500 mb-8">Sign in or try the demo dashboard.</p>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg" role="alert">
                    <p className="font-bold">Authentication Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <button
                onClick={onGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 px-6 py-3 border border-gray-300 rounded-xl shadow-lg text-gray-700 font-semibold bg-white hover:bg-gray-50 transition duration-150 ease-in-out disabled:opacity-50"
            >
                <img className="w-6 h-6" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="Google logo" />
                <span>{isLoading ? 'Signing In...' : 'Sign in with Google'}</span>
            </button>
            
            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
                onClick={onDemoLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-xl shadow-lg font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition duration-150 ease-in-out disabled:opacity-50"
            >
                <span>{isLoading ? 'Loading Demo...' : 'Try Demo Dashboard'}</span>
            </button>

            <p className="mt-6 text-sm text-gray-400">
                The demo is read-only and loads data from a backend API call. Sign in with Google to save your own data securely.
            </p>
        </div>
    </div>
);

// Component to handle adding/removing data sources within the main modal
const DataSourceConfiguration = ({ dataSources, setDataSources }) => {
    const [newSource, setNewSource] = useState({ 
        type: DATA_SOURCE_TYPES[0].value, 
        authType: AUTH_TYPES[0], 
        connectionDetailOrUrl: '', // Updated field name
        format: '' 
    });

    // Helper to determine the placeholder based on the selected type
    const getDetailsPlaceholder = (type) => {
        switch (type) {
            case 'Google Sheets':
                return 'Enter Google Sheet URL or ID (e.g., https://docs.google.com/spreadsheets/d/...)';
            case 'PostgreSQL':
            case 'MySQL':
            case 'Authenticated Database':
                return 'Enter Host/Connection String (e.g., Host: prod.db.com:5432)';
            case 'CSV/Excel':
                return 'Enter File Path or Storage URL (e.g., s3://bucket/data/file.csv or C:/local/path)';
            case 'External API':
                return 'Enter API Endpoint URL (e.g., https://api.service.com/data/v1)';
            case 'Data Lake/Warehouse':
                return 'Enter Warehouse Schema/Location (e.g., Snowflake://warehouse_prod)';
            default:
                return 'Enter URL, File Path, or specific identifier';
        }
    };

    const handleAddSource = () => {
        if (!newSource.connectionDetailOrUrl || !newSource.format || !newSource.authType) return;
        
        const sourceToAdd = {
            ...newSource,
            // Simple unique ID for list management in the UI
            id: Date.now() + Math.random(), 
        };
        setDataSources([...dataSources, sourceToAdd]);
        setNewSource({ 
            type: DATA_SOURCE_TYPES[0].value, 
            authType: AUTH_TYPES[0], 
            connectionDetailOrUrl: '', 
            format: '' 
        });
    };

    const handleRemoveSource = (id) => {
        setDataSources(dataSources.filter(source => source.id !== id));
    };

    const handleNewSourceChange = (e) => {
        setNewSource({ ...newSource, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-4 p-4 border border-indigo-200 rounded-xl bg-indigo-50">
            <h3 className="text-lg font-bold text-indigo-800 flex items-center">
                <DataIcon className="w-5 h-5 mr-2" />
                Data Source Configuration ({dataSources.length}) - Tracking Lineage & Security
            </h3>

            {/* Existing Sources List */}
            {dataSources.map(source => (
                <div key={source.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="flex flex-col text-sm w-full md:w-auto md:flex-grow">
                        <div className="flex items-center space-x-2 text-gray-800 font-bold mb-1">
                            {getIconForType(source.type, { className: 'w-4 h-4 text-indigo-600' })}
                            <span>{source.type}</span>
                            <span className="text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                Auth: {source.authType}
                            </span>
                        </div>
                        <p className="text-gray-600 text-xs truncate pl-6" title={source.connectionDetailOrUrl}>
                            {source.connectionDetailOrUrl} ({source.format})
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleRemoveSource(source.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition flex-shrink-0 mt-2 md:mt-0"
                        aria-label="Remove data source"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}

            {/* Add New Source Form */}
            <div className="pt-2 border-t border-indigo-100 space-y-3">
                <p className="text-sm font-medium text-gray-700">Add New Source:</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {/* Source Type */}
                    <select
                        name="type"
                        value={newSource.type}
                        onChange={handleNewSourceChange}
                        className="col-span-2 md:col-span-1 rounded-lg border-gray-300 shadow-sm p-2 text-sm border focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {DATA_SOURCE_TYPES.map(s => (
                            <option key={s.value} value={s.value}>{s.value}</option>
                        ))}
                    </select>

                    {/* Auth Type */}
                    <select
                        name="authType"
                        value={newSource.authType}
                        onChange={handleNewSourceChange}
                        className="col-span-2 md:col-span-1 rounded-lg border-gray-300 shadow-sm p-2 text-sm border focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    >
                        {AUTH_TYPES.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                    
                    {/* Connection Detail/URL */}
                    <input
                        type="text"
                        name="connectionDetailOrUrl"
                        placeholder={getDetailsPlaceholder(newSource.type)}
                        value={newSource.connectionDetailOrUrl}
                        onChange={handleNewSourceChange}
                        className="col-span-2 md:col-span-1 rounded-lg border-gray-300 shadow-sm p-2 text-sm border focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />

                    {/* Format */}
                    <input
                        type="text"
                        name="format"
                        placeholder="Data Format (e.g., SQL, JSON, Parquet)"
                        value={newSource.format}
                        onChange={handleNewSourceChange}
                        className="col-span-2 md:col-span-1 rounded-lg border-gray-300 shadow-sm p-2 text-sm border focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAddSource}
                    className="w-full flex justify-center items-center space-x-1 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-200 rounded-lg hover:bg-indigo-300 transition"
                    disabled={!newSource.connectionDetailOrUrl || !newSource.format || !newSource.authType}
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Source</span>
                </button>
            </div>
        </div>
    );
};

// New Modal Component for External Dashboard Link
const DashboardLinkModal = ({ department, googleSheetsLink, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <ChartBarIcon className="w-6 h-6 mr-2 text-indigo-600" />
                    {department} Department Dashboard
                </h2>
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 mb-4">
                    <p className="text-sm text-indigo-800 font-medium">
                        This link simulates accessing a live reporting dashboard (e.g., Looker Studio, Tableau) that pulls data from the source sheet.
                    </p>
                </div>
                
                {googleSheetsLink ? (
                    <div className="space-y-3">
                        <p className="text-gray-700 font-semibold">Data Source Link:</p>
                        <a 
                            href={googleSheetsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block truncate text-indigo-600 hover:text-indigo-800 underline text-sm p-3 bg-gray-100 rounded-lg"
                        >
                            {googleSheetsLink}
                        </a>
                        <button
                            onClick={() => {
                                // Simulate copying to clipboard
                                // Using document.execCommand('copy') as navigator.clipboard.writeText() can fail in iframes
                                try {
                                    const tempInput = document.createElement('input');
                                    tempInput.value = googleSheetsLink;
                                    document.body.appendChild(tempInput);
                                    tempInput.select();
                                    document.execCommand('copy');
                                    document.body.removeChild(tempInput);
                                    
                                    // Custom alert replacement
                                    const modal = document.createElement('div');
                                    modal.innerHTML = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;"><div style="background:white;padding:20px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);"><p>Link copied to clipboard!</p><button onclick="this.parentNode.parentNode.remove()" style="margin-top:10px;padding:5px 10px;background:#4F46E5;color:white;border:none;border-radius:5px;">OK</button></div></div>';
                                    document.body.appendChild(modal);

                                } catch (err) {
                                    console.error('Could not copy text: ', err);
                                    // Custom alert replacement for failure
                                    const modal = document.createElement('div');
                                    modal.innerHTML = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;"><div style="background:white;padding:20px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);"><p>Failed to copy link. Check console for details.</p><button onclick="this.parentNode.parentNode.remove()" style="margin-top:10px;padding:5px 10px;background:#EF4444;color:white;border:none;border-radius:5px;">OK</button></div></div>';
                                    document.body.appendChild(modal);
                                }
                            }}
                            className="w-full py-2 text-white font-semibold bg-green-500 rounded-lg hover:bg-green-600 transition"
                        >
                            Copy Dashboard Link
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-red-700 font-semibold">No Google Sheets Data Source Found</p>
                        <p className="text-sm text-red-600 mt-2">
                            To enable the external dashboard link, ensure at least one AI system in this department has a **Google Sheets** data source with a valid URL.
                        </p>
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-semibold bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Project Tracker Component (Original Dashboard View) ---
const ProjectTracker = ({ systemsByDepartment, departmentMetrics, openEditModal, handleDeleteSystem, openDashboardModal, isDemo, loading }) => {
    
    // System Card Renderer
    const renderSystemCard = (system) => (
        <div key={system.id} className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between transition duration-300 hover:shadow-xl">
            <div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${system.stageColor} ${AI_STAGES.find(s => s.value === system.stage)?.text || 'text-gray-800'} mb-2 inline-block`}>
                    {system.stage}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">{system.name}</h3>
                <p className="text-xs text-gray-500 mb-3">Last Update: {system.lastUpdated}</p>
                
                <div className="mt-2 text-sm text-gray-600 mb-4">
                    <p className="font-semibold text-gray-800">ROI/Impact:</p>
                    <p className="italic text-xs">{system.roiMetrics || 'N/A'}</p>
                </div>
            </div>
            <div className="flex justify-between items-center mt-3 border-t pt-3">
                 <p className="text-xs font-medium text-indigo-600">Sources: {system.dataSources?.length || 0}</p>
                <div className="flex space-x-2">
                    <button
                        onClick={() => openEditModal(system)}
                        className={`p-1 rounded-full transition ${isDemo ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100'}`}
                        aria-label={`Edit ${system.name}`}
                        disabled={isDemo}
                    >
                        <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteSystem(system.id)}
                        className={`p-1 rounded-full transition ${isDemo ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100'}`}
                        aria-label={`Delete ${system.name}`}
                        disabled={isDemo || loading}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    // Department Section Renderer
    const renderDepartmentSection = (department, systems, metrics) => {
        // Calculate progress for the progress bar rendering (used locally here)
        const totalStageScore = systems.reduce((sum, s) => sum + getStageOrder(s.stage), 0);
        const maxStageOrder = AI_STAGES.map(s => s.order).reduce((a, b) => Math.max(a, b));
        const maxScore = systems.length * maxStageOrder;
        
        return (
            <div key={department} className="mb-10 p-6 bg-white rounded-2xl shadow-xl border border-indigo-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center mb-3 sm:mb-0">
                        <ProcessIcon className="w-7 h-7 mr-2 text-indigo-600" />
                        {department} Projects ({metrics.total})
                    </h2>
                    <button
                        onClick={() => openDashboardModal(department, metrics.sheetsLink)}
                        className="flex items-center space-x-1 px-4 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50"
                        disabled={isDemo && !metrics.sheetsLink}
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        <span>View Dept Dashboard</span>
                    </button>
                </div>

                {/* Department Progress Bar */}
                <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Overall Progress: {metrics.progress}% Complete</p>
                    <div className="flex rounded-full overflow-hidden h-3 bg-gray-200">
                        {systems.sort((a, b) => getStageOrder(a.stage) - getStageOrder(b.stage))
                            .map((s, index) => {
                                const stage = AI_STAGES.find(st => st.value === s.stage);
                                return (
                                    <div 
                                        key={index}
                                        className={`h-full ${stage.color} hover:opacity-80 transition duration-150`}
                                        style={{ width: `${100 / metrics.total}%` }}
                                        title={`${s.name} (${s.stage})`}
                                    ></div>
                                );
                            })
                        }
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <p>{metrics.ideation} in Ideation</p>
                        <p>{metrics.production} in Production</p>
                    </div>
                </div>

                {/* Systems Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systems.map(renderSystemCard)}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-8 space-y-12">
            {Object.keys(systemsByDepartment)
                .sort((a, b) => departmentMetrics[b].production - departmentMetrics[a].production) // Sort by number of production systems
                .map(dept => renderDepartmentSection(dept, systemsByDepartment[dept], departmentMetrics[dept]))
            }
        </div>
    );
};

// --- New ROI/Cost Dashboard Component ---
const ROICostDashboard = ({ aiSystems }) => {

    const chartColors = {
        'Cost Reduction': '#4F46E5', // Indigo
        'Revenue Generation': '#10B981', // Green
        'Time/Efficiency Savings': '#FBBF24', // Yellow
        'Other': '#6B7280', // Gray
    };

    // 1. Process data for charts
    const { costReductionSystems, impactDistribution } = useMemo(() => {
        const costReductionSystems = [];
        const impactDistribution = {
            'Cost Reduction': 0,
            'Revenue Generation': 0,
            'Time/Efficiency Savings': 0,
            'Other': 0,
        };

        aiSystems.forEach(system => {
            const impactType = categorizeROI(system.roiMetrics);
            impactDistribution[impactType]++;

            if (impactType === 'Cost Reduction') {
                costReductionSystems.push(system);
            }
        });

        return { costReductionSystems, impactDistribution };
    }, [aiSystems]);

    // 2. Process data for Cost Reduction Stages Chart
    const stageData = useMemo(() => {
        const stageCounts = AI_STAGES.reduce((acc, stage) => {
            acc[stage.value] = { count: 0, color: stage.barColor, label: stage.value };
            return acc;
        }, {});

        costReductionSystems.forEach(system => {
            if (stageCounts[system.stage]) {
                stageCounts[system.stage].count++;
            }
        });
        
        return Object.values(stageCounts).filter(d => d.count > 0);
    }, [costReductionSystems]);

    // 3. Process data for Impact Distribution Bar Chart
    const impactData = useMemo(() => {
        return Object.entries(impactDistribution).map(([label, count]) => ({
            label,
            count,
            color: chartColors[label]
        })).filter(d => d.count > 0);
    }, [impactDistribution]);


    // --- Generic Bar Chart Component (using SVG) ---
    const BarChart = ({ data, title, totalCount, barMax, categoryLabel }) => {
        const chartHeight = 250;
        const barWidth = 25;
        const padding = 10;
        const totalDataPoints = data.length;
        // Dynamically calculate the total width based on the number of data points
        const totalWidth = totalDataPoints * (barWidth + padding * 2) + 60;
        const maxVal = barMax || Math.max(...data.map(d => d.count), 1);
        const scaleY = (val) => (val / maxVal) * (chartHeight - 40);

        return (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 mb-4">Total Systems: {totalCount} ({categoryLabel} focus)</p>
                
                {/* Fixed width for SVG to handle small number of bars correctly, but ensure container can scroll */}
                <svg width={Math.max(400, totalWidth)} height={chartHeight} viewBox={`0 0 ${Math.max(400, totalWidth)} ${chartHeight}`} preserveAspectRatio="xMinYMin meet">
                    {/* Y-Axis Line */}
                    <line x1="40" y1="10" x2="40" y2={chartHeight - 30} stroke="#E5E7EB" strokeWidth="2" />
                    
                    {/* X-Axis Line */}
                    <line x1="40" y1={chartHeight - 30} x2={Math.max(400, totalWidth)} y2={chartHeight - 30} stroke="#E5E7EB" strokeWidth="2" />

                    {/* Bars and Labels */}
                    {data.map((item, index) => {
                        const barHeight = scaleY(item.count);
                        const xPos = 50 + index * (barWidth + padding * 2);
                        const yPos = chartHeight - 30 - barHeight;

                        return (
                            <g key={item.label}>
                                {/* Bar */}
                                <rect 
                                    x={xPos} 
                                    y={yPos} 
                                    width={barWidth} 
                                    height={barHeight} 
                                    fill={item.color} 
                                    rx="3" 
                                    ry="3"
                                />
                                {/* Value Label */}
                                <text 
                                    x={xPos + barWidth / 2} 
                                    y={yPos - 5} 
                                    textAnchor="middle" 
                                    fontSize="12" 
                                    fontWeight="bold"
                                    fill={item.color}
                                >
                                    {item.count}
                                </text>
                                {/* Category Label */}
                                <text 
                                    x={xPos + barWidth / 2} 
                                    y={chartHeight - 15} 
                                    textAnchor="middle" 
                                    fontSize="10" 
                                    fill="#6B7280"
                                >
                                    {item.label.split(' ')[0]}
                                </text>
                            </g>
                        );
                    })}

                    {/* Y-Axis Max Label */}
                    <text x="35" y="25" textAnchor="end" fontSize="10" fill="#6B7280">
                        {maxVal}
                    </text>
                    <text x="35" y={chartHeight - 30} textAnchor="end" fontSize="10" fill="#6B7280">
                        0
                    </text>
                </svg>
            </div>
        );
    };

    if (aiSystems.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Add systems in the **Project Tracker** tab to view financial insights here.</p>
            </div>
        );
    }
    
    const totalSystems = aiSystems.length;
    const totalCostReduction = costReductionSystems.length;

    return (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Cost Reduction Systems Progress */}
            <BarChart
                data={stageData}
                title="Cost Reduction Systems by Implementation Stage"
                totalCount={totalCostReduction}
                categoryLabel="Cost Reduction"
                barMax={totalCostReduction > 0 ? totalCostReduction : 1}
            />

            {/* Chart 2: Overall System Impact Distribution */}
            <BarChart
                data={impactData}
                title="Portfolio Distribution by Primary ROI Impact"
                totalCount={totalSystems}
                categoryLabel="All Systems"
                barMax={totalSystems > 0 ? totalSystems : 1}
            />
        </div>
    );
};


// Main Dashboard Component
const AIDashboard = ({ userId, db, aiSystems, setAiSystems, isDemo, apiLoading }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSystem, setCurrentSystem] = useState(null); // System being edited or null for new system
    const [currentTab, setCurrentTab] = useState('project_tracker'); // 'project_tracker' or 'roi_dashboard'
    const [formState, setFormState] = useState({ 
        name: '', 
        department: '', 
        stage: 'Ideation', 
        roiMetrics: '',
        dataSources: [], // New field initialization
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dashboardModal, setDashboardModal] = useState({ isOpen: false, department: '', sheetsLink: null }); // New state for external dashboard modal

    const AI_SYSTEMS_COLLECTION = `artifacts/${appId}/users/${userId}/ai_systems`;

    // --- Department Grouping and Metrics ---
    const systemsByDepartment = useMemo(() => {
        return aiSystems.reduce((acc, system) => {
            const dept = system.department || 'Unassigned';
            if (!acc[dept]) {
                acc[dept] = [];
            }
            acc[dept].push(system);
            return acc;
        }, {});
    }, [aiSystems]);
    
    const departmentMetrics = useMemo(() => {
        return Object.keys(systemsByDepartment).reduce((acc, dept) => {
            const systems = systemsByDepartment[dept];
            const total = systems.length;
            const production = systems.filter(s => s.stage === 'Production').length;
            const ideation = systems.filter(s => s.stage === 'Ideation').length;

            // Simple weighted progress score: Production (4), Pilot (3), Dev (2), Ideation (1)
            const totalStageScore = systems.reduce((sum, s) => sum + getStageOrder(s.stage), 0);
            const maxStageOrder = AI_STAGES.map(s => s.order).reduce((a, b) => Math.max(a, b));
            const maxScore = total * maxStageOrder;
            
            const progress = maxScore > 0 ? (totalStageScore / maxScore) * 100 : 0;
            
            // Find a Google Sheets link for the department dashboard
            // Note: Data sources are arrays, so we need to flatten/find the first sheets link
            const sheetsSource = systems.find(s => 
                s.dataSources?.some(d => d.type === 'Google Sheets' && d.connectionDetailOrUrl)
            );
            const sheetsLink = sheetsSource?.dataSources?.find(d => d.type === 'Google Sheets')?.connectionDetailOrUrl || null;

            acc[dept] = {
                total,
                production,
                ideation,
                progress: Math.round(progress),
                sheetsLink
            };
            return acc;
        }, {});
    }, [systemsByDepartment]);

    // --- Modal Handlers ---

    // Reset form for a new system
    const openAddModal = () => {
        if (isDemo) return;
        setCurrentSystem(null);
        setFormState({ 
            name: '', 
            department: '', 
            stage: 'Ideation', 
            roiMetrics: '',
            dataSources: [], 
        });
        setIsModalOpen(true);
    };

    // Open form to edit an existing system
    const openEditModal = (system) => {
        if (isDemo) return;
        setCurrentSystem(system);
        setFormState({ 
            name: system.name, 
            department: system.department, 
            stage: system.stage, 
            roiMetrics: system.roiMetrics,
            dataSources: system.dataSources || [], // Load existing data sources
        });
        setIsModalOpen(true);
    };
    
    const openDashboardModal = (department, sheetsLink) => {
        setDashboardModal({ isOpen: true, department, sheetsLink });
    };

    const closeDashboardModal = () => {
        setDashboardModal({ isOpen: false, department: '', sheetsLink: null });
    };


    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const findStageColor = (stage) => {
        return AI_STAGES.find(s => s.value === stage)?.color || 'bg-gray-200';
    };

    // CRUD Operations
    const handleSaveSystem = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setError(null);
        
        // --- START: Added Defensive Checks for Saving ---
        if (isDemo) {
             setError("Action blocked: Demo mode is read-only. Please sign in to save data.");
             setIsModalOpen(false);
             setLoading(false);
             return;
        }
        if (!db || !userId) {
            setError("Database connection or user authentication failed. Please refresh and try again.");
            setLoading(false);
            return;
        }
        // --- END: Added Defensive Checks for Saving ---

        try {
            const systemData = {
                ...formState,
                // Ensure department is capitalized/cleaned for grouping
                department: formState.department.trim() || 'Unassigned',
                stageColor: findStageColor(formState.stage),
                // Remove temporary IDs from dataSources before saving to Firestore
                dataSources: formState.dataSources.map(({ id, ...rest }) => rest), 
                lastUpdated: serverTimestamp(),
            };

            if (currentSystem) {
                // Update existing system
                const docRef = doc(db, AI_SYSTEMS_COLLECTION, currentSystem.id);
                await updateDoc(docRef, systemData);
            } else {
                // Add new system
                await addDoc(collection(db, AI_SYSTEMS_COLLECTION), {
                    ...systemData,
                    createdAt: serverTimestamp(),
                });
            }

            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving AI system:", err);
            setError(`Save Failed: ${currentSystem ? 'Failed to update system.' : 'Failed to add new system.'} Check console for details.`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSystem = async (systemId) => {
        if (isDemo) {
            setError("Action blocked: Demo mode is read-only. Please sign in to delete data.");
            return;
        }

        // Custom modal replacement for confirm()
        const isConfirmed = () => {
             const modal = document.createElement('div');
             modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
             modal.innerHTML = `
                 <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm text-center">
                     <p class="font-bold text-gray-900 mb-4">Confirm Deletion</p>
                     <p class="text-gray-700 mb-6">Are you sure you want to delete this AI system? This action cannot be undone.</p>
                     <div class="flex justify-center space-x-4">
                         <button id="cancelBtn" class="px-4 py-2 text-gray-700 font-semibold bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                         <button id="confirmBtn" class="px-4 py-2 text-white font-semibold bg-red-600 rounded-lg hover:bg-red-700 transition">Delete</button>
                     </div>
                 </div>
             `;
             document.body.appendChild(modal);

             return new Promise(resolve => {
                 document.getElementById('cancelBtn').onclick = () => {
                     modal.remove();
                     resolve(false);
                 };
                 document.getElementById('confirmBtn').onclick = () => {
                     modal.remove();
                     resolve(true);
                 };
             });
        };
        
        const confirmed = await isConfirmed();
        if (!confirmed) return;
        
        setLoading(true);
        setError(null);
        try {
            await deleteDoc(doc(db, AI_SYSTEMS_COLLECTION, systemId));
        } catch (err) {
            console.error("Error deleting AI system:", err);
            setError('Failed to delete system.');
        } finally {
            setLoading(false);
        }
    };


    const tabClass = (tabName) => 
        `px-4 py-2 font-semibold text-sm rounded-t-lg transition-all duration-200 ${
            currentTab === tabName 
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 md:mb-0">
                        AI System Portfolio Tracking
                    </h1>
                    <button
                        onClick={openAddModal}
                        disabled={isDemo}
                        className={`flex items-center space-x-2 px-6 py-3 font-semibold rounded-xl transition duration-150 ease-in-out shadow-lg ${isDemo ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add New System</span>
                    </button>
                </div>

                {isDemo && (
                     <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-xl shadow-md">
                        <p className="font-bold">DEMO MODE ACTIVE (READ-ONLY)</p>
                        <p className="text-sm">This dashboard loads data from a backend API call. **Saving is disabled.** Sign in with Google to create and save your own systems using the cloud database.</p>
                    </div>
                )}


                <div className="text-sm text-gray-500 mb-6 p-4 bg-white rounded-xl shadow">
                    <p className="font-mono break-all">
                        <UserIcon className="inline-block w-4 h-4 mr-2" />
                        {isDemo ? 'Demo User ID:' : 'Your User ID:'} **{userId}**
                    </p>
                    <p className="text-xs mt-1">This ID uniquely secures your private data.</p>
                </div>

                {(loading || apiLoading) && <p className="text-center text-indigo-600 font-medium my-4">Processing request...</p>}
                {error && <p className="text-center text-red-600 font-medium my-4">{error}</p>}
                
                {/* --- Dashboard Tabs --- */}
                <div className="border-b border-gray-200 mb-4">
                    <nav className="flex space-x-2">
                        <button 
                            onClick={() => setCurrentTab('project_tracker')} 
                            className={tabClass('project_tracker')}
                        >
                            <ProcessIcon className="w-4 h-4 inline mr-1" />
                            Project Tracker
                        </button>
                        <button 
                            onClick={() => setCurrentTab('roi_dashboard')} 
                            className={tabClass('roi_dashboard')}
                        >
                            <ChartBarIcon className="w-4 h-4 inline mr-1" />
                            ROI/Financial Dashboard
                        </button>
                    </nav>
                </div>

                {/* --- Tab Content --- */}
                {aiSystems.length === 0 && !apiLoading ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 mt-8">
                        <BoltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900">No AI Systems Tracked</h3>
                        <p className="mt-1 text-gray-500">Get started by adding your first enterprise AI project.</p>
                        <button
                            onClick={openAddModal}
                            className="mt-4 px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                            disabled={isDemo}
                        >
                            Add System
                        </button>
                    </div>
                ) : (
                    <>
                        {currentTab === 'project_tracker' && (
                            <ProjectTracker 
                                systemsByDepartment={systemsByDepartment} 
                                departmentMetrics={departmentMetrics}
                                openEditModal={openEditModal}
                                handleDeleteSystem={handleDeleteSystem}
                                openDashboardModal={openDashboardModal}
                                isDemo={isDemo}
                                loading={loading}
                            />
                        )}
                        {currentTab === 'roi_dashboard' && (
                            <ROICostDashboard aiSystems={aiSystems} />
                        )}
                    </>
                )}
            </div>

            {/* Modal for Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                            {currentSystem ? 'Edit AI System' : 'Add New AI System'}
                        </h2>
                        <form onSubmit={handleSaveSystem} className="space-y-6">
                            {/* --- General Details --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">System Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formState.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department/Owner</label>
                                    <input
                                        type="text"
                                        id="department"
                                        name="department"
                                        value={formState.department}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            
                            {/* --- Stage and ROI --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="stage" className="block text-sm font-medium text-gray-700">Implementation Stage</label>
                                    <select
                                        id="stage"
                                        name="stage"
                                        value={formState.stage}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {AI_STAGES.map(s => (
                                            <option key={s.value} value={s.value}>{s.value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="roiMetrics" className="block text-sm font-medium text-gray-700">Key ROI / Impact Metrics</label>
                                    <textarea
                                        id="roiMetrics"
                                        name="roiMetrics"
                                        rows="1"
                                        value={formState.roiMetrics}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g., 20% cost reduction, 15% increase in lead conversion."
                                    />
                                </div>
                            </div>

                            {/* --- Data Source Configuration --- */}
                            <DataSourceConfiguration
                                dataSources={formState.dataSources}
                                setDataSources={(newSources) => setFormState({ ...formState, dataSources: newSources })}
                            />

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 font-semibold bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 text-white font-semibold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : (currentSystem ? 'Update System' : 'Create System')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* External Dashboard Modal */}
            {dashboardModal.isOpen && (
                <DashboardLinkModal 
                    department={dashboardModal.department} 
                    googleSheetsLink={dashboardModal.sheetsLink} 
                    onClose={closeDashboardModal} 
                />
            )}
        </div>
    );
};


// --- Main Application Component (App) ---
const App = () => {
    // State
    const [page, setPage] = useState('home'); // 'home', 'login', 'dashboard', 'about'
    const [user, setUser] = useState(null);
    const [isDemo, setIsDemo] = useState(false); // New state for demo mode
    const [authLoading, setAuthLoading] = useState(true);
    const [apiLoading, setApiLoading] = useState(false); // New state for API calls
    const [authError, setAuthError] = useState(null);
    const [aiSystems, setAiSystems] = useState([]);

    // Firebase instances
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);

    /**
     * Exponential Backoff Retry Fetch Utility
     * @param {string} url - The API endpoint URL.
     * @param {object} options - Fetch options (method, headers, body).
     * @param {number} maxRetries - Maximum number of retries.
     * @returns {Promise<Response>} - The successful response object.
     */
    const retryFetch = async (url, options, maxRetries = 3) => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(url, options);
                if (response.ok) {
                    return response;
                }
                // Handle rate limiting (429) or other retryable errors (5xx)
                if (response.status === 429 || response.status >= 500) {
                    throw new Error(`Retryable error: ${response.status} ${response.statusText}`);
                }
                // For non-retryable errors (e.g., 400 Bad Request), throw immediately
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(`Non-retryable error: ${response.status} ${response.statusText} - ${errorBody.error?.message || 'Unknown API Error'}`);
            } catch (error) {
                if (attempt === maxRetries - 1) {
                    // console.error(`Fetch attempt ${attempt + 1} failed, max retries reached:`, error); // Do not log retries
                    throw error; // Last attempt, throw the error
                }
                // console.warn(`Fetch attempt ${attempt + 1} failed. Retrying in ${delay / 1000}s...`); // Do not log retries
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };
    
    /**
     * Fetches structured demo data from the Gemini API.
     */
    const fetchDemoDataFromApi = useCallback(async () => {
        setApiLoading(true);
        setAuthError(null);
        
        // Define the JSON schema for the AI Systems array
        const systemSchema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    "name": { "type": "STRING", "description": "Name of the AI System." },
                    "department": { "type": "STRING", "description": "The department owning the system." },
                    "stage": { "type": "STRING", "enum": AI_STAGES.map(s => s.value), "description": "Current implementation stage." },
                    "roiMetrics": { "type": "STRING", "description": "Key quantifiable impact metrics." },
                    "stageColor": { "type": "STRING", "description": "Tailwind color class corresponding to the stage." },
                    "lastUpdated": { "type": "STRING", "description": "Today's date in 'MM/DD/YYYY' format." },
                    "dataSources": {
                        "type": "ARRAY",
                        "description": "List of data sources used by the system.",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "type": { "type": "STRING", "enum": DATA_SOURCE_TYPES.map(s => s.value), "description": "Type of data source." },
                                "connectionDetailOrUrl": { "type": "STRING", "description": "The database host/URL, file path, or API endpoint URL." },
                                "format": { "type": "STRING", "description": "Data format (e.g., SQL table, JSON, CSV)." },
                                "authType": { "type": "STRING", "enum": AUTH_TYPES, "description": "Required authentication method." },
                            },
                            "required": ["type", "connectionDetailOrUrl", "format", "authType"]
                        }
                    }
                },
                "required": ["name", "department", "stage", "roiMetrics", "dataSources", "stageColor", "lastUpdated"]
            }
        };

        const userQuery = `Generate 4 diverse enterprise AI system tracking records. 
        - One system must be focused on **Cost Reduction** and be in **Production** stage. 
        - One system must be focused on **Revenue Generation** and be in **Development** stage.
        - One system must be focused on **Time/Efficiency Savings** and be in **Pilot** stage. 
        - **Crucially, one system must have a 'Google Sheets' data source with a realistic URL** to demonstrate the departmental dashboard link (e.g., https://docs.google.com/spreadsheets/d/1BxdjHwEwK.../edit). Set lastUpdated to ${TODAY}. Ensure each data source object includes all required fields.`;
        
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: systemSchema,
            },
            systemInstruction: {
                parts: [{ text: "You are a data generator for an AI system tracking dashboard. Your output MUST be valid JSON adhering strictly to the provided schema. Ensure departments are diverse (e.g., Finance, HR, Sales)." }]
            }
        };

        try {
            const response = await retryFetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!jsonText) {
                throw new Error("API response was empty or malformed.");
            }

            const parsedData = JSON.parse(jsonText);
            
            // Add temporary IDs for UI management
            const systemsWithTempIds = parsedData.map((system, systemIndex) => ({
                id: `demo-${systemIndex + 1}`,
                ...system,
                dataSources: system.dataSources ? system.dataSources.map((source, sourceIndex) => ({
                    ...source,
                    id: sourceIndex + 1 // Use index as a simple temp ID for UI
                })) : [],
                stageColor: findStageColor(system.stage), // Re-calculate color based on local constants
            }));

            setAiSystems(systemsWithTempIds);
            return systemsWithTempIds;
        } catch (e) {
            console.error("API Demo Data Fetch Failed:", e);
            setAuthError(`Failed to load demo data from API. Error: ${e.message}`);
            return [];
        } finally {
            setApiLoading(false);
        }
    }, [TODAY]); // TODAY added to dependency array just in case it changes, but functionally static here.

    // Auth Initialization and Listener
    useEffect(() => {
        if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is missing or empty.");
            setAuthError("Configuration Error: Firebase settings are missing.");
            setAuthLoading(false);
            return;
        }

        try {
            setLogLevel('debug');
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authInstance = getAuth(app);
            setDb(firestore);
            setAuth(authInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                    setUserId(currentUser.uid);
                    setIsDemo(false); 
                    if (page !== 'home' && page !== 'about') {
                        setPage('dashboard');
                    }
                } else {
                    setUser(null);
                    setUserId(null);
                    if (page === 'dashboard' && !isDemo) {
                        setPage('home');
                    }
                }
                setAuthLoading(false);
            });

            // Initial sign-in attempt
            const signInInitial = async () => {
                try {
                    if (initialAuthToken && authInstance) {
                        await signInWithCustomToken(authInstance, initialAuthToken);
                    } else if (authInstance) {
                        await signInAnonymously(authInstance);
                    }
                } catch (e) {
                    console.error("Initial Auth Sign-In failed, falling back to anonymous or sign-in page:", e);
                }
            };
            
            signInInitial();

            return () => unsubscribe();
        } catch (e) {
            console.error("Firebase initialization failed:", e);
            setAuthError("Could not initialize Firebase services.");
            setAuthLoading(false);
        }
    }, [page, isDemo, initialAuthToken]); 

    // Firestore Data Listener (Runs when user/db/userId is set AND NOT in demo mode)
    useEffect(() => {
        if (!db || !userId || isDemo) {
            if (!isDemo && !apiLoading) setAiSystems([]); // Clear systems if not demo and not authenticated
            return;
        }

        const AI_SYSTEMS_COLLECTION = `artifacts/${appId}/users/${userId}/ai_systems`;
        const q = collection(db, AI_SYSTEMS_COLLECTION);
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const systems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore Timestamp to readable string if it exists
                lastUpdated: doc.data().lastUpdated?.toDate ? doc.data().lastUpdated.toDate().toLocaleDateString() : 'N/A',
                stageColor: findStageColor(doc.data().stage) // Ensure color is updated
            })).sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)); 

            // Add temporary IDs back for dataSources list management in the UI
            const systemsWithTempIds = systems.map(system => ({
                ...system,
                dataSources: system.dataSources ? system.dataSources.map((source, index) => ({
                    ...source,
                    id: index + 1 // Use index as a simple temp ID for UI
                })) : []
            }));

            setAiSystems(systemsWithTempIds);
        }, (error) => {
            console.error("Firestore data snapshot failed:", error);
            setAuthError("Failed to load AI systems data.");
        });

        return () => unsubscribe();
    }, [db, userId, isDemo, apiLoading]);


    // --- Authentication Handlers ---

    const handleGoogleSignIn = async () => {
        setAuthError(null);
        setAuthLoading(true);
        setIsDemo(false); // Exit demo mode if attempting real sign-in
        try {
            const provider = new GoogleAuthProvider();
            if(auth) await signInWithPopup(auth, provider);
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Google Sign-In Error:", errorCode, errorMessage);
            
            if (errorCode === 'auth/popup-closed-by-user') {
                setAuthError("Sign-in window closed. Please try again.");
            } else {
                setAuthError(`Sign-In Failed: ${errorMessage}`);
            }
        } finally {
            setAuthLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setAuthError(null);
        setAuthLoading(true);
        
        // 1. Set up Demo state
        const demoUser = {
            uid: DEMO_USER_ID,
            email: 'demo@oa-sol.com',
            displayName: 'Demo User'
        };
        setUser(demoUser);
        setUserId(DEMO_USER_ID);
        setIsDemo(true);
        setPage('dashboard');

        // 2. Fetch data from API
        await fetchDemoDataFromApi();
        setAuthLoading(false);
    }


    const handleSignOut = async () => {
        // Handle both Firebase sign out and Demo exit
        if (isDemo) {
            setUser(null);
            setUserId(null);
            setIsDemo(false);
            setAiSystems([]);
            setPage('home');
            return;
        }

        setAuthLoading(true);
        setAuthError(null);
        try {
            if(auth) await signOut(auth);
        } catch (error) {
            console.error("Sign Out Error:", error);
            setAuthError("Sign out failed. Please try refreshing.");
        } finally {
            setAuthLoading(false);
        }
    };
    
    // --- Navigation ---
    const navigateTo = (targetPage) => {
        if (targetPage === 'dashboard' && !user && !isDemo) {
            setPage('login');
        } else if (targetPage === 'login' && (user || isDemo)) {
            setPage('dashboard');
        } else {
            setPage(targetPage);
        }
    }


    if (authLoading && !isDemo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-700 font-medium">Securing connection to OA Sol...</p>
                </div>
            </div>
        );
    }
    
    // Main App Structure
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header user={user} onSignOut={handleSignOut} page={page} onNavigate={navigateTo} isDemo={isDemo} />
            <main>
                {page === 'home' && <HomePage onNavigate={navigateTo} />}
                {page === 'about' && <AboutUsPage />}
                {page === 'login' && !user && !isDemo && <LoginPage onGoogleSignIn={handleGoogleSignIn} onDemoLogin={handleDemoLogin} error={authError} isLoading={authLoading || apiLoading} />}
                {page === 'dashboard' && (user || isDemo) && userId && (
                    <AIDashboard 
                        userId={userId} 
                        db={db} 
                        aiSystems={aiSystems} 
                        setAiSystems={setAiSystems} 
                        isDemo={isDemo}
                        apiLoading={apiLoading}
                    />
                )}
            </main>
            <footer className="bg-gray-800 text-white text-center p-4 text-sm mt-12">
                &copy; 2024 OA Sol. AI Enterprise Tracking Solution.
            </footer>
        </div>
    );
};

export default App;

