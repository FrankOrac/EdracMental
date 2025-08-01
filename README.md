# EDRAC - AI-Powered CBT & Smart Learning Platform

> **Africa's first comprehensive AI-driven Computer-Based Testing platform, revolutionizing education across Nigeria and West Africa.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://postgresql.org/)

## 🚀 Overview

EDRAC is a comprehensive AI-powered Computer-Based Testing (CBT) and smart learning platform specifically designed for Nigerian students and educational institutions. It combines GPT-4 intelligence with authentic exam simulation, advanced proctoring, collaborative learning, and complete institutional management to transform how students prepare for major examinations like JAMB, WAEC, NECO, and GCE.

### 🎯 Key Features

#### **AI-Powered Learning Intelligence**
- **24/7 GPT-4 Tutoring** - Intelligent tutoring with personalized learning paths and offline capability
- **AI Question Generation** - Automated content creation with curriculum alignment and bulk import
- **Smart Content Validation** - Real-time grammar checking, typo correction, and optimization
- **Predictive Analytics** - Advanced performance tracking with weakness identification

#### **Enterprise-Grade CBT System**
- **Authentic Exam Simulation** - Precise replication of real JAMB/WAEC conditions with advanced timing
- **Multi-Modal Proctoring** - Webcam, audio, and behavior analysis with 99.5% violation detection
- **Advanced Anti-Cheating** - Tab-switch detection, focus monitoring, and session integrity verification
- **Instant AI Feedback** - Comprehensive explanations with personalized study recommendations

#### **Collaborative Learning Platform**
- **AI-Powered Study Groups** - Intelligent student matching based on performance and preferences
- **Real-time Collaboration** - Live study sessions with shared practice tests and problem-solving
- **Peer Learning Networks** - Community-driven question sharing and knowledge exchange
- **Social Learning Features** - Discussion forums and collaborative problem-solving

#### **Complete Institutional Management**
- **Comprehensive Administration** - Student enrollment, bulk operations, and custom exam creation
- **White-label Solutions** - Full platform customization with institutional branding
- **Advanced Analytics** - Real-time dashboards with class comparisons and administrative insights
- **Scalable Architecture** - Support for 100-50,000 students with role-based access control

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Wouter** for lightweight, fast routing
- **Tailwind CSS** with **shadcn/ui** for modern, accessible design
- **TanStack Query** for powerful data fetching and caching
- **Vite** for lightning-fast development and building

### Backend
- **Express.js** with TypeScript for robust API development
- **PostgreSQL** with **Drizzle ORM** for type-safe database operations
- **Replit Auth** with OpenID Connect for secure authentication
- **Express Sessions** with PostgreSQL storage for session management

### AI & Services
- **OpenAI GPT-4** integration for intelligent tutoring and content generation
- **Paystack** for Nigerian payment processing and subscription management
- **Advanced Proctoring** with multi-modal security monitoring
- **Real-time Features** with WebSocket support for collaborative sessions

### Infrastructure
- **Progressive Web App (PWA)** with offline capability
- **Mobile-first responsive design** optimized for Nigerian infrastructure
- **Cloud-native architecture** with horizontal scaling support
- **Comprehensive analytics** with real-time performance monitoring

## 📚 Nigerian Curriculum Coverage

### Supported Examinations
- **JAMB (Joint Admissions and Matriculation Board)**
- **WAEC (West African Examinations Council)**
- **NECO (National Examinations Council)**
- **GCE (General Certificate of Education)**
- **Post-UTME** (Post-Unified Tertiary Matriculation Examination)

### Subject Areas
- **Sciences**: Mathematics, Physics, Chemistry, Biology
- **Commercial**: Economics, Accounting, Commerce, Government
- **Arts**: English Language, Literature, Government, History
- **Technical**: Further Mathematics, Technical Drawing, Computer Studies

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL database
- OpenAI API key (optional for AI features)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/edrac.git
   cd edrac
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb edrac_dev
   
   # Push database schema
   npm run db:push
   ```

4. **Configure environment variables**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Configure your database URL and API keys
   DATABASE_URL="postgresql://user:password@localhost:5432/edrac_dev"
   OPENAI_API_KEY="your-openai-api-key"
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open http://localhost:5000 in your browser
   - Use demo accounts: `student@edrac.com`, `institution@edrac.com`, `admin@edrac.com`

## 📖 Documentation

### Developer Resources
- **[Codebase Overview](./docs/codebase-overview.md)** - Complete system architecture and file structure
- **[API Development](./docs/api-development.md)** - Backend API development and database operations
- **[Component Development](./docs/component-development.md)** - Frontend component creation and updates
- **[Development Workflow](./docs/development-workflow.md)** - Daily development practices and best practices

### Business Resources
- **[Go-to-Market Strategy](./go-to-market/GTM_STRATEGY.md)** - Comprehensive market strategy and growth plans
- **[Pitch Deck](./pitch-deck/EDRAC_PITCH_DECK.md)** - Complete investor presentation and business overview
- **[Financial Models](./go-to-market/FINANCIAL_MODELS.md)** - Revenue projections and unit economics

## 🎯 Market Impact

### Target Market
- **47 million students** annually taking major Nigerian examinations
- **20,000+ secondary schools** and educational institutions
- **1,000+ training centers** and exam preparation facilities
- **Growing EdTech market** valued at $2.3B in Nigeria

### Social Impact
- **Democratizing access** to quality education across all economic levels
- **Reducing educational inequality** between urban and rural students
- **Supporting teachers** with advanced analytics and administrative tools
- **Improving national exam performance** through personalized AI tutoring

## 💰 Business Model

### Revenue Streams
- **Student Subscriptions**: ₦2,500/month premium access with unlimited practice
- **Institutional Packages**: ₦150,000-₦1,000,000/year for schools and training centers
- **AI Content Licensing**: API access and white-label solutions for other platforms
- **Transaction Fees**: Payment processing and certification services

### Financial Projections
- **Year 1**: $2.5M revenue (10,000 students, 50 institutions)
- **Year 3**: $25M revenue (100,000 students, 750 institutions)
- **Year 5**: $75M revenue (500,000 students, 3,000 institutions)

## 🤝 Contributing

We welcome contributions from developers, educators, and students passionate about transforming education in Africa.

### Development Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Educational Content
- Subject matter experts can contribute question banks and study materials
- Teachers can provide curriculum insights and pedagogical guidance
- Students can share feedback and improvement suggestions

## 📞 Contact & Support

### Development Team
- **Technical Issues**: [GitHub Issues](https://github.com/your-org/edrac/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-org/edrac/discussions)

### Business Inquiries
- **Partnership Opportunities**: partnerships@edrac.ai
- **Investment Inquiries**: investors@edrac.ai
- **Demo Requests**: demo@edrac.ai

### Community
- **Discord Server**: Join our developer and educator community
- **Newsletter**: Subscribe for platform updates and educational insights
- **Social Media**: Follow @EdracPlatform for news and updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Nigerian Ministry of Education** for curriculum guidance and support
- **West African Examinations Council (WAEC)** for examination standards
- **Joint Admissions and Matriculation Board (JAMB)** for official guidelines
- **OpenAI** for GPT-4 API enabling intelligent tutoring capabilities
- **Replit** for hosting infrastructure and development platform support

---

**Made with ❤️ for Nigerian students and educators**

*Transforming education through artificial intelligence, one student at a time.*