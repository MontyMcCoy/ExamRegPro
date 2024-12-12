# Exam Registration System (ERS)

# Purpose
  As a project for college, we assembled a group that was tasked to make an exam registration website for the CIT department for CSN. This system allows students to register for certification exams and enables faculty to manage these registrations efficiently.
  Team Members
  
 - Aaron Lambou-selgestad
 - Matthew Proctor
 - Monty McCoy
 - Riley Walsh
 

## Overview
The Exam Registration System (ERS) is a web application designed for CSN students and faculty to manage exam registrations. The system provides a streamlined interface for students to schedule certification exams and for faculty to monitor registrations.

## Features include the following:

### Authentication & User Management
- CSN email authentication (NSHE#@student.csn.edu)
- Role-based access (Student/Faculty)
- Automated profile creation using student data
- Secure password handling

### Student Features
#### Profile Management
- Personalized dashboard
- Profile information display
- Basic/non-editable information:
  - Username (FirstName + Last 4 NSHE)
  - NSHE number
  - CSN email
- Editable information:
  - Phone number
  - Major

#### Exam Registration
- Up to 3 different exam bookings
- Available exams:
  - CompTIA A+ Certification
  - Cisco Certified Network Associate (CCNA)
  - AWS Certified Cloud Practitioner
- Campus selection:
  - West Charleston
  - Henderson
  - North Las Vegas
- Automated duplicate booking prevention
- Real-time seat availability tracking
- Exam scheduling with:
  - Date selection (future dates only)
  - Time slot selection
- Confirmation system with exam details

#### Student Management
- View current exam bookings
- Cancel existing reservations
- Access booking history
- Quick links to essential CSN resources

### Faculty Features
#### Profile Management
- Faculty dashboard
- Department and contact information
- Message system access

#### Exam Management
- View registered students
- Track exam capacities
- Generate detailed reports with filters:
  - By campus
  - By exam type
  - By date
- Monitor seat availability

### System Controls
- Maximum 20 seats per exam session
- Automatic session hiding when full
- One reservation per exam type per student
- Real-time availability updates

## Technical Specifications

### Frontend
- EJS templating
- Modern CSS with school colors:
  - Primary Blue (#004890)
  - Yellow (#FFD200)
  - Light Yellow (#F9F1E2)
- Responsive design
- Interactive form elements
- User-friendly interfaces

### Backend
- Node.js server
- Express.js framework
- Database integration for:
  - User authentication
  - Exam scheduling
  - Session management
- RESTful API endpoints

### Database Schema
- Users table (students/faculty)
- Exams table
- Bookings table
- Session capacity tracking

### Security Features
- Role-based access control
- Session management
- Form validation
- SQL injection prevention
- XSS protection

## Implementation Details

### Student Interface
- Modern, grid-based layout
- Quick access to essential functions
- Clear exam booking process
- Interactive confirmation system

### Faculty Interface
- Comprehensive reporting system
- Student management tools
- Exam session monitoring
- Administrative controls

### Styling
- Consistent CSN branding
- Responsive components
- Accessible design
- Modern UI elements

## Installation & Setup

### Prerequisites
- HTML
- CSS
- EJS
- React
- Node.js
- npm
- MySQL/PostgreSQL

### Installation Steps
1. Clone repository
2. Install dependencies
3. Configure database
4. Set environment variables
5. Run migrations
6. Start server

## Contributing
- Code style guidelines
- Testing requirements
- Pull request process
- Bug reporting procedure

## Future Enhancements
- Email notifications
- Calendar integration
- Mobile app version
- Advanced reporting features

## Support
- Technical documentation
- User guides
- Contact information
- Troubleshooting tips
