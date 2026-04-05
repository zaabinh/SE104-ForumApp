// ROLE:
// You are a senior SaaS product designer and UI/UX expert. Your task is to redesign and optimize the entire UI system including New Feed, Profile Page, Dashboard, and overall design system to make the platform modern, clean, and technology-focused.

// DESIGN GOAL:
// The system should look like a modern SaaS platform similar to:

// * Facebook (feed layout)
// * LinkedIn (profile layout)
// * Notion (clean UI)
// * Vercel / Linear (modern SaaS dashboard)
// * Discord (community layout)

// The UI must feel like a modern AI-powered technology platform, not a traditional forum.

// BRAND & STYLE:

// * Use UIT blue as primary color.
// * Gradient based on UIT blue.
// * Clean, minimal, modern SaaS style.
// * Font must support Vietnamese: Be Vietnam Pro or Inter.
// * Use card layout, rounded corners, soft shadows.
// * Use glassmorphism and gradient highlights.
// * Fully responsive.

// GLOBAL LAYOUT:

// * Left sidebar navigation
// * Main content area in center
// * Right sidebar for additional info
// * Top navbar with search, notification, profile menu

// NAVIGATION STRUCTURE:
// Sidebar menu:

// * Home / Feed
// * Explore
// * My Profile
// * Messages
// * Bookmarks
// * AI Suggestions
// * Settings
// * Admin (if role = admin)

// NEW FEED DESIGN:
// Design a modern social feed similar to Facebook/LinkedIn but cleaner.

// Feed layout:

// * Create Post box at top
// * Post card layout
// * Each post includes:

//   * User avatar
//   * Username
//   * Time
//   * Content
//   * Image (optional)
//   * Tags
//   * Like button
//   * Comment button
//   * Share button
//   * Save button
// * Right sidebar:

//   * Trending topics
//   * Suggested users
//   * AI suggested posts

// PROFILE PAGE DESIGN:
// Modern profile page layout:

// Profile header:

// * Cover image
// * Avatar
// * Username
// * Bio
// * Stats (Posts, Followers, Following)
// * Edit profile button

// Profile tabs:

// * Posts
// * About
// * Activity
// * Saved posts

// DASHBOARD DESIGN:
// Modern SaaS dashboard layout.

// Dashboard includes:

// * Statistics cards (Users, Posts, Comments, AI usage)
// * Charts (line chart, bar chart)
// * Recent activity
// * Notifications
// * Quick actions
// * Admin panel (if admin role)

// DESIGN SYSTEM:
// Create a consistent design system including:

// * Color palette
// * Typography scale
// * Spacing system
// * Button styles
// * Card styles
// * Form styles
// * Modal styles
// * Table styles
// * Icon style
// * Grid system (12 columns)

// UI COMPONENTS:
// Design reusable components:

// * Navbar
// * Sidebar
// * Post card
// * Profile card
// * Comment component
// * Notification dropdown
// * Search bar
// * Buttons
// * Cards
// * Modals
// * Forms
// * Tables

// UX REQUIREMENTS:

// * Clear visual hierarchy
// * Easy navigation
// * Reduce user cognitive load
// * Important actions must be visible
// * Responsive design
// * Consistent UI across all pages
// * Modern micro-interactions (hover, click animation)
// * Smooth transitions

// STYLE KEYWORDS:
// modern, SaaS, AI platform, technology, clean, minimal, futuristic, glassmorphism, gradient, card UI, startup style

// OUTPUT REQUIRED:

// * Wireframe for Feed
// * Wireframe for Profile
// * Wireframe for Dashboard
// * Design system
// * UI components
// * Layout structure
// * If possible, generate React + Tailwind components
'use client';

import StatsCards from './StatsCards';
import ModernTable from './ModernTable';
import Sidebar from '../layout/Sidebar';
import Topbar from '../layout/Topbar';
import Rightbar from '../layout/Rightbar';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userEmail] = useState('student@uit.edu.vn');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={toggleSidebarCollapse}
        onCloseMobile={closeMobileSidebar}
      />
      
      <div className={`transition-all duration-200 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60'}`}>
        <Topbar 
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenMobileSidebar={toggleMobileSidebar}
          userEmail={userEmail}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <main className="p-8 space-y-8">
          {/* Stats Row */}
          <div className="grid gap-6">
            <StatsCards />
          </div>
          
          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {children}
            </div>
            <Rightbar />
          </div>
          
          {/* Recent Activity */}
          <div className="dashboard-card p-6 lg:col-span-3">
            <ModernTable />
          </div>
        </main>
      </div>
    </div>
  );
}
