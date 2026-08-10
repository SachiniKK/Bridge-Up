const prisma = require('../lib/prisma');

const ROLE_TEMPLATES = {
  'Backend Developer': [
    {
      skillName: 'REST APIs',
      demandPercent: 87,
      durationWeeks: 6,
      description: 'Asked in 87% of backend JDs across Colombo. Without this, you won\'t pass first-round interviews.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'HTTP methods, status codes, headers' },
        { weeks: 'Wk 3-4', content: 'Build your first API (Express.js / Flask)' },
        { weeks: 'Wk 5-6', content: 'JWT auth + deploy API' }
      ],
      resources: [
        {
          title: 'REST API & HTTP Crash Course — Traversy Media',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0',
          durationMins: 45,
          xpReward: 120,
          justification: 'Required for 87% of local job postings including WSO2 and Sysco LABS.'
        },
        {
          title: 'IBM Node.js & Express.js Back-End App Development',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/developing-backend-apps-with-nodejs-and-express',
          durationMins: 180,
          xpReward: 150,
          justification: 'Highly recommended by Sysco LABS for internship eligibility.'
        }
      ]
    },
    {
      skillName: 'Git & Version Control',
      demandPercent: 82,
      durationWeeks: 3,
      description: 'Every Sri Lankan tech company uses Git. Not knowing it signals lack of real project experience.',
      weeksDetails: [
        { weeks: 'Wk 1', content: 'Init, commit, branching' },
        { weeks: 'Wk 2', content: 'Pull requests & teamwork' },
        { weeks: 'Wk 3', content: 'Resolve merge conflicts' }
      ],
      resources: [
        {
          title: 'Git & GitHub Full Course for Beginners — freeCodeCamp',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
          durationMins: 60,
          xpReward: 80,
          justification: 'Required by 82% of entry-level engineering postings.'
        }
      ]
    },
    {
      skillName: 'SQL / Databases',
      demandPercent: 74,
      durationWeeks: 4,
      description: 'Backend roles almost always require databases. SQL is the most transferable skill.',
      weeksDetails: [
        { weeks: 'Wk 1', content: 'SELECT, WHERE, JOIN' },
        { weeks: 'Wk 2', content: 'GROUP BY, aggregations' },
        { weeks: 'Wk 3-4', content: 'Schema design + integrate with API' }
      ],
      resources: [
        {
          title: 'IBM Databases and SQL for Data Science with Python',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/sql-data-science',
          durationMins: 120,
          xpReward: 100,
          justification: 'Required for IFS screening assessment.'
        }
      ]
    }
  ],
  'Frontend Developer': [
    {
      skillName: 'React.js',
      demandPercent: 88,
      durationWeeks: 5,
      description: 'Industry standard frontend framework. Essential for building rich interactive interfaces.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Components, props, state' },
        { weeks: 'Wk 3-4', content: 'Hooks, context, router' },
        { weeks: 'Wk 5', content: 'State management (Redux/Zustand)' }
      ],
      resources: [
        {
          title: 'React JS Full Course 2024 — freeCodeCamp',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=x4rFhThSX04',
          durationMins: 120,
          xpReward: 100,
          justification: 'Directly requested in 88% of frontend postings including Creative Software.'
        }
      ]
    },
    {
      skillName: 'JavaScript',
      demandPercent: 84,
      durationWeeks: 4,
      description: 'Fundamental language for modern web applications.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'ES6+ syntax, promises, async/await' },
        { weeks: 'Wk 3-4', content: 'DOM operations, Fetch API' }
      ],
      resources: [
        {
          title: 'JavaScript Full Course for Beginners — Bro Code',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=lfmg-EJ8gm4',
          durationMins: 150,
          xpReward: 120,
          justification: 'Base requirement for Virtusa frontend training track.'
        }
      ]
    }
  ],
  'Software Developer': [
    {
      skillName: 'Algorithms & Data Structures',
      demandPercent: 78,
      durationWeeks: 5,
      description: 'Essential for technical interviews at top firms like WSO2 and Sysco LABS.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Arrays, Lists, Stacks, Queues' },
        { weeks: 'Wk 3-4', content: 'Sorting, searching, hashing' },
        { weeks: 'Wk 5', content: 'Big O notation & complexity' }
      ],
      resources: [
        {
          title: 'Algorithms Specialization — Stanford (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/specializations/algorithms',
          durationMins: 180,
          xpReward: 150,
          justification: 'Highly recommended for tech assessment preparation.'
        }
      ]
    },
    {
      skillName: 'Git & Version Control',
      demandPercent: 82,
      durationWeeks: 3,
      description: 'Standard version control system for code management.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Branching, merging, commit guidelines' },
        { weeks: 'Wk 3', content: 'GitHub flow & pull requests' }
      ],
      resources: [
        {
          title: 'Git & GitHub Crash Course — Traversy Media',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc',
          durationMins: 45,
          xpReward: 90,
          justification: 'Mandatory standard skill for all software developers.'
        }
      ]
    }
  ],
  'Software Engineer': [
    {
      skillName: 'Algorithms & Data Structures',
      demandPercent: 78,
      durationWeeks: 5,
      description: 'Core logic required to pass code assessments at major software exporters.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Trees, Graphs, Recursion' },
        { weeks: 'Wk 3-4', content: 'Dynamic programming, greedy algorithms' },
        { weeks: 'Wk 5', content: 'Algorithmic problem solving' }
      ],
      resources: [
        {
          title: 'Data Structures & Algorithms Full Course — freeCodeCamp',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=8hly31xKli0',
          durationMins: 120,
          xpReward: 130,
          justification: 'Helps pass WSO2 and Codegen interviews.'
        }
      ]
    },
    {
      skillName: 'System Design & Testing',
      demandPercent: 70,
      durationWeeks: 4,
      description: 'Designing scalable architectures and writing unit tests.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Architecture patterns, MVC, microservices' },
        { weeks: 'Wk 3-4', content: 'Unit testing, Jest, JUnit, mock frameworks' }
      ],
      resources: [
        {
          title: 'Software Architecture & Design of Modern Large Scale Systems',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=i53Gi_K3o7I',
          durationMins: 150,
          xpReward: 120,
          justification: 'Differentiates junior engineers from standard developers.'
        }
      ]
    }
  ],
  'Full Stack Developer': [
    {
      skillName: 'React.js & Frontend',
      demandPercent: 85,
      durationWeeks: 5,
      description: 'Building client-side applications with interactive states.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'React components, props, hooks' },
        { weeks: 'Wk 3-4', content: 'State management, routing, fetch API' },
        { weeks: 'Wk 5', content: 'Styling, Tailwind, component libraries' }
      ],
      resources: [
        {
          title: 'Full Stack Web Development with React — Hong Kong Univ. (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/specializations/full-stack-react',
          durationMins: 90,
          xpReward: 110,
          justification: 'Requested in 85% of full stack job postings.'
        }
      ]
    },
    {
      skillName: 'Node.js & Express APIs',
      demandPercent: 80,
      durationWeeks: 4,
      description: 'Building backends, handling auth, and managing server state.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Node runtime, Express router, middlewares' },
        { weeks: 'Wk 3-4', content: 'Database connections, Prisma integration, JWT' }
      ],
      resources: [
        {
          title: 'Node.js & Express.js Full Course — freeCodeCamp',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
          durationMins: 180,
          xpReward: 140,
          justification: 'Standard backend runtime for full stack roles.'
        }
      ]
    }
  ],
  'Data Analyst': [
    {
      skillName: 'SQL / Databases',
      demandPercent: 74,
      durationWeeks: 4,
      description: 'Writing queries, filtering, and aggregate analysis of records.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'SELECT, JOIN, WHERE, GROUP BY' },
        { weeks: 'Wk 3-4', content: 'Subqueries, window functions, CTEs' }
      ],
      resources: [
        {
          title: 'IBM Databases and SQL for Data Science with Python',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/sql-data-science',
          durationMins: 100,
          xpReward: 100,
          justification: 'Prerequisite for 74% of analyst roles in Colombo banks and telecom.'
        }
      ]
    },
    {
      skillName: 'Excel for Business',
      demandPercent: 80,
      durationWeeks: 3,
      description: 'Pivot tables, VLOOKUP, INDEX/MATCH, and business modeling.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Formulas, formatting, logic gates' },
        { weeks: 'Wk 3', content: 'Pivot tables, pivot charts, dashboards' }
      ],
      resources: [
        {
          title: 'Excel for Beginners to Advanced — Kevin Stratvert',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=PSNXoAs2FtQ',
          durationMins: 60,
          xpReward: 80,
          justification: 'Used daily by local companies like Dialog and Sri Lankan Airlines.'
        }
      ]
    }
  ],
  'ML / AI Engineer': [
    {
      skillName: 'Python & Numpy',
      demandPercent: 89,
      durationWeeks: 4,
      description: 'Standard programming language and numerical arrays library for ML.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'OOP Python, list comprehensions, modules' },
        { weeks: 'Wk 3-4', content: 'Numpy arrays, vectorization, matrix math' }
      ],
      resources: [
        {
          title: 'IBM Python for Data Science, AI & Development',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/python-for-applied-data-science-ai',
          durationMins: 140,
          xpReward: 110,
          justification: 'Baseline language for AI and machine learning fields.'
        }
      ]
    },
    {
      skillName: 'Supervised Machine Learning',
      demandPercent: 78,
      durationWeeks: 5,
      description: 'Regression, classification, scikit-learn, evaluation metrics.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Linear & Logistic Regression, Decision Trees' },
        { weeks: 'Wk 3-4', content: 'Model evaluation, precision, recall, ROC-AUC' },
        { weeks: 'Wk 5', content: 'Scikit-learn pipeline implementation' }
      ],
      resources: [
        {
          title: 'Machine Learning Specialization — Andrew Ng (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/specializations/machine-learning-introduction',
          durationMins: 200,
          xpReward: 160,
          justification: 'Highly recognized certification by Andrew Ng.'
        }
      ]
    }
  ],
  'DevOps / Cloud': [
    {
      skillName: 'Docker & Containerization',
      demandPercent: 82,
      durationWeeks: 4,
      description: 'Containerizing applications, writing Dockerfiles, and managing images.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Containers vs VMs, Docker run, volumes' },
        { weeks: 'Wk 3-4', content: 'Writing Dockerfiles, multi-stage builds, compose' }
      ],
      resources: [
        {
          title: 'Docker Tutorial for Beginners — TechWorld with Nana',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
          durationMins: 50,
          xpReward: 100,
          justification: 'Required by 82% of DevOps and Cloud engineering roles.'
        }
      ]
    },
    {
      skillName: 'AWS Cloud Infrastructure',
      demandPercent: 80,
      durationWeeks: 5,
      description: 'AWS essentials: EC2, S3, RDS, VPC, and IAM policies.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Cloud concepts, EC2 computing, S3 storage' },
        { weeks: 'Wk 3-4', content: 'VPC networking, security groups, RDS databases' },
        { weeks: 'Wk 5', content: 'IAM users, roles, security best practices' }
      ],
      resources: [
        {
          title: 'AWS Cloud Practitioner Essentials — Amazon (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/aws-cloud-practitioner-essentials',
          durationMins: 160,
          xpReward: 130,
          justification: 'Industry standard certification for cloud engineering.'
        }
      ]
    }
  ],
  'QA Engineer': [
    {
      skillName: 'Software Testing Fundamentals',
      demandPercent: 90,
      durationWeeks: 4,
      description: 'Test plans, test cases, bug lifecycles, and manual testing techniques.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Black-box vs White-box testing, SDLC models' },
        { weeks: 'Wk 3-4', content: 'Writing test cases, bug reporting, Jira workflow' }
      ],
      resources: [
        {
          title: 'Software Testing Full Course — Edureka',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=sO8eGL6SFsA',
          durationMins: 60,
          xpReward: 90,
          justification: 'Essential base for entering Quality Assurance departments.'
        }
      ]
    },
    {
      skillName: 'Selenium Automation',
      demandPercent: 82,
      durationWeeks: 4,
      description: 'Writing automation test scripts in Selenium Webdriver.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Locators (XPath, CSS), WebDriver setup' },
        { weeks: 'Wk 3-4', content: 'Automating forms, assertions, page object model' }
      ],
      resources: [
        {
          title: 'Selenium WebDriver with Java — Basics to Advanced (Udemy preview on YouTube)',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=_JNeiGbAgL4',
          durationMins: 120,
          xpReward: 120,
          justification: 'Highest demanded automation testing skill in local industry.'
        }
      ]
    }
  ],
  'UX/UI Designer': [
    {
      skillName: 'Figma Design Essentials',
      demandPercent: 92,
      durationWeeks: 4,
      description: 'Vector paths, components, autolayout, UI design patterns.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Figma interface, tools, grids, frames' },
        { weeks: 'Wk 3-4', content: 'Autolayout, variables, components, variants' }
      ],
      resources: [
        {
          title: 'Figma UI Design Tutorial — Full Course for Beginners (DesignCourse)',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=HZuk6Wkx_Eg',
          durationMins: 80,
          xpReward: 100,
          justification: 'Required by 92% of local visual and UI designer listings.'
        }
      ]
    },
    {
      skillName: 'UX Research Methods',
      demandPercent: 85,
      durationWeeks: 4,
      description: 'User personas, interviews, mapping journeys, and usability studies.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Conducting user interviews, empathy maps' },
        { weeks: 'Wk 3-4', content: 'Journey mapping, usability metrics, report writing' }
      ],
      resources: [
        {
          title: 'Google UX Design Professional Certificate — Google (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/professional-certificates/google-ux-design',
          durationMins: 240,
          xpReward: 180,
          justification: 'Highly regarded and structured UX foundation course.'
        }
      ]
    }
  ],
  'UI/UX Designer': [
    {
      skillName: 'Figma Design Essentials',
      demandPercent: 92,
      durationWeeks: 4,
      description: 'Master Figma tools, autolayout, components, and design systems.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Frames, grids, vectors, typography' },
        { weeks: 'Wk 3-4', content: 'Autolayout, components, prototyping interactions' }
      ],
      resources: [
        {
          title: 'Figma UI Design Tutorial — Full Course for Beginners (DesignCourse)',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=HZuk6Wkx_Eg',
          durationMins: 80,
          xpReward: 100,
          justification: 'The standard UI layout tool used by 92% of Sri Lankan tech companies.'
        }
      ]
    },
    {
      skillName: 'UX Research Methods',
      demandPercent: 85,
      durationWeeks: 4,
      description: 'User interviews, personas, empathy maps, and usability evaluations.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Qualitative interviews, journey mapping' },
        { weeks: 'Wk 3-4', content: 'Usability testing, feedback analysis, design adjustments' }
      ],
      resources: [
        {
          title: 'UX Research & Design Specialization — Michigan Univ. (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/specializations/michiganux',
          durationMins: 110,
          xpReward: 110,
          justification: 'Crucial for developing user-centric web & mobile architectures.'
        }
      ]
    }
  ],
  'Business Analyst': [
    {
      skillName: 'Requirements Gathering',
      demandPercent: 88,
      durationWeeks: 4,
      description: 'Eliciting requirements, writing user stories, and managing scopes.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Stakeholder interviews, brainstorming, surveys' },
        { weeks: 'Wk 3-4', content: 'Writing BRDs, SRS documents, and user story maps' }
      ],
      resources: [
        {
          title: 'Requirements Elicitation & Analysis — UNSW (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/requirements-elicitation',
          durationMins: 90,
          xpReward: 90,
          justification: 'Primary function of a Business Analyst in local project delivery.'
        }
      ]
    },
    {
      skillName: 'Agile & Scrum Processes',
      demandPercent: 85,
      durationWeeks: 3,
      description: 'Scrum ceremonies, product backlogs, and sprint planning.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Scrum values, roles, ceremonies (daily, planning, review)' },
        { weeks: 'Wk 3', content: 'Refining backlog, sprint estimations, burn-down charts' }
      ],
      resources: [
        {
          title: 'Agile & Scrum Full Course for Beginners — Simplilearn',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=GzzkpAOxHXs',
          durationMins: 45,
          xpReward: 80,
          justification: 'Requested by Virtusa, Sysco LABS, and 99x for project coordinators.'
        }
      ]
    }
  ],
  'Product Manager': [
    {
      skillName: 'Product Strategy & Lifecycle',
      demandPercent: 87,
      durationWeeks: 4,
      description: 'Market analysis, value propositions, and metrics (North Star, retention).',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Competitor analysis, business model canvas' },
        { weeks: 'Wk 3-4', content: 'Defining metrics, product lifecycle stages' }
      ],
      resources: [
        {
          title: 'IBM Product Manager Professional Certificate (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/professional-certificates/ibm-product-manager',
          durationMins: 120,
          xpReward: 110,
          justification: 'Essential for defining product scope and strategy.'
        }
      ]
    },
    {
      skillName: 'Agile & Roadmapping',
      demandPercent: 85,
      durationWeeks: 3,
      description: 'Building visual product roadmaps and prioritizing backlogs.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Roadmapping tools, Gantt charts, timeline planning' },
        { weeks: 'Wk 3', content: 'Prioritization frameworks: RICE, MoSCoW' }
      ],
      resources: [
        {
          title: 'How to Build a Product Roadmap — Product School',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=QSHn12S6cWQ',
          durationMins: 50,
          xpReward: 95,
          justification: 'Core deliverable for Product Managers communicating with developers.'
        }
      ]
    }
  ],
  'Digital Marketing': [
    {
      skillName: 'SEO & Content Optimization',
      demandPercent: 90,
      durationWeeks: 4,
      description: 'On-page SEO, link building, keyword research, and metadata.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Keyword indexing, search intents, site auditing' },
        { weeks: 'Wk 3-4', content: 'Meta tags, headers, image alt text, backlinks' }
      ],
      resources: [
        {
          title: 'SEO Training Course — Ahrefs (YouTube)',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=xsVTqzratPs',
          durationMins: 100,
          xpReward: 100,
          justification: 'Requested in 90% of local digital marketing listings.'
        }
      ]
    },
    {
      skillName: 'Google Analytics & SEM',
      demandPercent: 85,
      durationWeeks: 3,
      description: 'Configuring GA4, analyzing traffic, and running search ad campaigns.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'GA4 installation, metrics tracking, event conversions' },
        { weeks: 'Wk 3', content: 'Google Ads, bidding strategies, ad copy' }
      ],
      resources: [
        {
          title: 'Google Analytics 4 (GA4) Tutorial for Beginners — Loves Data',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=M5F-M07eFzQ',
          durationMins: 90,
          xpReward: 90,
          justification: 'The standard measurement tool for conversion and growth marketing.'
        }
      ]
    }
  ],
  'Marketing Executive': [
    {
      skillName: 'Market Research & Analysis',
      demandPercent: 85,
      durationWeeks: 4,
      description: 'Understanding consumer trends, surveys, and competitor landscapes.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'SWOT analysis, demographic segments' },
        { weeks: 'Wk 3-4', content: 'Writing surveys, gathering customer feedback reports' }
      ],
      resources: [
        {
          title: 'Market Research Specialization — UC Davis (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/specializations/market-research',
          durationMins: 110,
          xpReward: 95,
          justification: 'Prerequisite for general marketing campaigns.'
        }
      ]
    },
    {
      skillName: 'Business Communication',
      demandPercent: 90,
      durationWeeks: 3,
      description: 'Pitching, presenting, PR writing, and verbal persuasion.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Slide deck presentation skills, pitch delivery' },
        { weeks: 'Wk 3', content: 'Press releases, emailing strategies, negotiations' }
      ],
      resources: [
        {
          title: 'Business Communication Skills — TED Talks Playlist',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=HAnw168huqA',
          durationMins: 45,
          xpReward: 80,
          justification: 'Crucial for client pitches and corporate partnerships.'
        }
      ]
    }
  ],
  'HR / People Ops': [
    {
      skillName: 'Talent Acquisition',
      demandPercent: 88,
      durationWeeks: 4,
      description: 'Sourcing candidates, interviewing structures, and salary negotiation.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Job spec writing, screening applications, sourcing on LinkedIn' },
        { weeks: 'Wk 3-4', content: 'Behavioral interviews, scoring matrices, making job offers' }
      ],
      resources: [
        {
          title: 'Recruiting, Hiring and Onboarding Employees — Minnesota Univ. (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/recruiting',
          durationMins: 100,
          xpReward: 100,
          justification: 'Key requirement for entry-level HR executives.'
        }
      ]
    },
    {
      skillName: 'Employee Onboarding & Training',
      demandPercent: 82,
      durationWeeks: 3,
      description: 'Designing first-week programs, resource setup, and corporate training plans.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Onboarding flows, team intros, document signoffs' },
        { weeks: 'Wk 3', content: 'Internal skill training programs, performance evaluations' }
      ],
      resources: [
        {
          title: 'Employee Onboarding Best Practices — SHRM',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=mO2oXQEHhHk',
          durationMins: 40,
          xpReward: 80,
          justification: 'Sustains employee retention in high-growth companies.'
        }
      ]
    }
  ],
  'Content Writer': [
    {
      skillName: 'Content Writing & Copywriting',
      demandPercent: 90,
      durationWeeks: 4,
      description: 'Writing engaging blogs, website copy, articles, and call-to-actions.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Grammar, tone of voice, sentence rhythms' },
        { weeks: 'Wk 3-4', content: 'Landing page copy, newsletters, call-to-action hooks' }
      ],
      resources: [
        {
          title: 'Copywriting Course: Become a Freelance Copywriter — Alex Cattoni',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=N6rMGKBRFDA',
          durationMins: 75,
          xpReward: 100,
          justification: 'Base skill needed for marketing agencies and web publishers.'
        }
      ]
    },
    {
      skillName: 'SEO Optimization',
      demandPercent: 85,
      durationWeeks: 3,
      description: 'Keyword density, readability indices, and linking strategies.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'SEO keyword search, Yoast SEO setups' },
        { weeks: 'Wk 3', content: 'H1/H2 header structures, meta snippets' }
      ],
      resources: [
        {
          title: 'SEO Fundamentals — Coursera / UC Davis',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/search-engine-optimization',
          durationMins: 90,
          xpReward: 90,
          justification: 'Ensures that articles rank well on search engines.'
        }
      ]
    }
  ],
  'UX Writer': [
    {
      skillName: 'UX Writing & Tone of Voice',
      demandPercent: 88,
      durationWeeks: 4,
      description: 'Writing button copy, error messages, user flows, and tooltips.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Microcopy guidelines, clarity, conciseness' },
        { weeks: 'Wk 3-4', content: 'Error messaging, navigation prompts, empty states' }
      ],
      resources: [
        {
          title: 'UX Writing: How to Write for Design — Google (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/ux-writing-google',
          durationMins: 90,
          xpReward: 95,
          justification: 'Highly valued specialization in product design groups.'
        }
      ]
    },
    {
      skillName: 'Figma for Writers',
      demandPercent: 75,
      durationWeeks: 3,
      description: 'Navigating Figma, editing copy directly in components, and branch updates.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Figma view structures, locating text blocks' },
        { weeks: 'Wk 3', content: 'Modifying text properties, collaborating with UI developers' }
      ],
      resources: [
        {
          title: 'Figma for Non-Designers — The Complete Guide',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=4W4LvJnNegA',
          durationMins: 45,
          xpReward: 80,
          justification: 'Critical collaboration skill between writers and designers.'
        }
      ]
    }
  ],
  'Journalist / Editor': [
    {
      skillName: 'Reporting & Interviewing',
      demandPercent: 90,
      durationWeeks: 4,
      description: 'Investigating sources, framing questions, and drafting news reports.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Sourcing verify methods, interview preparations' },
        { weeks: 'Wk 3-4', content: 'Structuring headlines, write-ups, and lead paragraphs' }
      ],
      resources: [
        {
          title: 'Journalism for Social Change — Berkeley (edX)',
          type: 'edx',
          url: 'https://www.edx.org/learn/journalism/university-of-california-berkeley-journalism-for-social-change',
          durationMins: 110,
          xpReward: 100,
          justification: 'Baseline requirement for journalism associates.'
        }
      ]
    },
    {
      skillName: 'Copyediting & Formatting',
      demandPercent: 85,
      durationWeeks: 3,
      description: 'AP Style, punctuation checks, spelling edits, and logical clarity.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Sentence structures, punctuation review, passive voice reduction' },
        { weeks: 'Wk 3', content: 'Publishing structures, content layout flow' }
      ],
      resources: [
        {
          title: 'Editing and Proofreading Tips — Grammarly & ProWritingAid',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=0V7rRfOaDno',
          durationMins: 55,
          xpReward: 85,
          justification: 'Key skill for editorial positions.'
        }
      ]
    }
  ],
  'Research / Policy': [
    {
      skillName: 'Research Methodologies',
      demandPercent: 90,
      durationWeeks: 5,
      description: 'Quantitative vs qualitative methods, literature reviews, ethics.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Literature database search, framing hypotheses' },
        { weeks: 'Wk 3-4', content: 'Survey design, research ethics, focus group plans' },
        { weeks: 'Wk 5', content: 'Formatting bibliographies and citations' }
      ],
      resources: [
        {
          title: 'Research Methods — University of London (Coursera)',
          type: 'coursera',
          url: 'https://www.coursera.org/learn/research-methods-university-of-london',
          durationMins: 150,
          xpReward: 120,
          justification: 'Baseline academic and policy research skill.'
        }
      ]
    },
    {
      skillName: 'Policy Analysis & Reports',
      demandPercent: 85,
      durationWeeks: 4,
      description: 'Analyzing political, economic, or social policies and writing brief reports.',
      weeksDetails: [
        { weeks: 'Wk 1-2', content: 'Stakeholder mapping, impact modeling' },
        { weeks: 'Wk 3-4', content: 'Drafting policy briefs, executive summaries, and action plans' }
      ],
      resources: [
        {
          title: 'Introduction to Public Policy — MIT OpenCourseWare',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=EFPQ21NQxOI',
          durationMins: 60,
          xpReward: 90,
          justification: 'Required by think-tanks and NGOs.'
        }
      ]
    }
  ]
};


const DEFAULT_TEMPLATE = [
  {
    skillName: 'General Programming',
    demandPercent: 60,
    durationWeeks: 4,
    description: 'Master general programming concepts and algorithmic logic.',
    weeksDetails: [
      { weeks: 'Wk 1-2', content: 'Variables, loops, and conditions' },
      { weeks: 'Wk 3-4', content: 'Functions and basic data structures' }
    ],
    resources: [
      {
          title: 'CS50: Introduction to Computer Science — Harvard (edX)',
          type: 'edx',
          url: 'https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science',
          durationMins: 45,
          xpReward: 100,
          justification: 'Baseline skill for all technology paths.'
      }
    ]
  }
];

/**
 * Generate roadmap for a student based on target role.
 */
async function generateRoadmap(studentId, targetRole, selfAssessments = {}) {
  // Clear any existing roadmap
  const existing = await prisma.learningRoadmap.findUnique({
    where: { studentId }
  });
  if (existing) {
    await prisma.learningRoadmap.delete({ where: { id: existing.id } });
  }

  const template = ROLE_TEMPLATES[targetRole] || DEFAULT_TEMPLATE;
  const totalWeeks = template.reduce((sum, item) => sum + item.durationWeeks, 0);
  const potentialXP = template.reduce((sum, item) => {
    return sum + item.resources.reduce((rSum, res) => rSum + res.xpReward, 0);
  }, 0);

  const roadmap = await prisma.learningRoadmap.create({
    data: {
      studentId,
      targetRole,
      totalWeeks,
      potentialXP
    }
  });

  for (let i = 0; i < template.length; i++) {
    const item = template[i];
    const skillRating = selfAssessments[item.skillName] || 'None';

    // Status: Completed if rated Comfortable, active if first step, locked otherwise
    let status = 'locked';
    if (skillRating === 'Comfortable') {
      status = 'completed';
    } else if (i === 0 || (i > 0 && template[i - 1].skillName && selfAssessments[template[i - 1].skillName] === 'Comfortable')) {
      status = 'active';
    }

    // fallback active step rule if nothing matches active
    if (i === 0 && status === 'locked') {
      status = 'active';
    }

    const step = await prisma.roadmapStep.create({
      data: {
        roadmapId: roadmap.id,
        skillName: item.skillName,
        demandPercent: item.demandPercent,
        durationWeeks: item.durationWeeks,
        status,
        order: i + 1,
        description: item.description,
        weeksDetails: item.weeksDetails
      }
    });

    for (const res of item.resources) {
      await prisma.roadmapResource.create({
        data: {
          stepId: step.id,
          title: res.title,
          type: res.type,
          url: res.url,
          durationMins: res.durationMins,
          xpReward: res.xpReward,
          completed: status === 'completed',
          justification: res.justification
        }
      });
    }
  }

  // Ensure at least one step is active if there are incomplete steps
  await ensureActiveStep(roadmap.id);

  return await prisma.learningRoadmap.findUnique({
    where: { id: roadmap.id },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        include: { resources: true }
      }
    }
  });
}

/**
 * Ensure that the first incomplete step is active
 */
async function ensureActiveStep(roadmapId) {
  const steps = await prisma.roadmapStep.findMany({
    where: { roadmapId },
    orderBy: { order: 'asc' }
  });

  const firstIncompleteIdx = steps.findIndex(s => s.status !== 'completed');
  if (firstIncompleteIdx !== -1) {
    for (let i = 0; i < steps.length; i++) {
      let targetStatus = steps[i].status;
      if (i < firstIncompleteIdx) {
        targetStatus = 'completed';
      } else if (i === firstIncompleteIdx) {
        targetStatus = 'active';
      } else {
        targetStatus = 'locked';
      }

      if (steps[i].status !== targetStatus) {
        await prisma.roadmapStep.update({
          where: { id: steps[i].id },
          data: { status: targetStatus }
        });
      }
    }
  }
}

/**
 * Complete a resource in the roadmap.
 * Awards XP and writes the completed course to the student's Skill Passport.
 */
async function completeResource(studentId, resourceId) {
  const crypto = require('crypto');

  const resource = await prisma.roadmapResource.findUnique({
    where: { id: resourceId },
    include: { step: { include: { roadmap: true } } }
  });

  if (!resource) throw new Error('Resource not found');
  if (resource.step.roadmap.studentId !== studentId) {
    throw new Error('Unauthorized access to this resource');
  }

  if (resource.completed) {
    return { alreadyCompleted: true, resource };
  }

  const updatedResource = await prisma.roadmapResource.update({
    where: { id: resourceId },
    data: { completed: true, completedAt: new Date() }
  });

  // Award XP
  const xpService = require('./xpService');
  const xpResult = await xpService.awardXP(
    studentId,
    resource.xpReward,
    'learning_resource_completed',
    null,
    resourceId
  );

  // Write completed course to Skill Passport (upsert is idempotent)
  let passportCourse = null;
  try {
    const passport = await prisma.skillPassport.upsert({
      where: { studentId },
      create: {
        studentId,
        isPublic: false,
        shareToken: crypto.randomBytes(16).toString('hex')
      },
      update: {} // passport already exists — no changes needed
    });

    passportCourse = await prisma.passportCourse.upsert({
      where: {
        passportId_resourceId: {
          passportId: passport.id,
          resourceId
        }
      },
      create: {
        passportId: passport.id,
        resourceId,
        title: resource.title,
        type: resource.type,
        url: resource.url,
        skillName: resource.step.skillName,
        completedAt: new Date()
      },
      update: {} // already recorded — keep original completedAt
    });
  } catch (err) {
    // Non-fatal: XP and completion are already saved; log and continue
    console.error('[completeResource] Failed to write PassportCourse:', err.message);
  }

  // Check if all resources in this step are completed
  const allResources = await prisma.roadmapResource.findMany({
    where: { stepId: resource.stepId }
  });
  const allDone = allResources.every(r => r.completed);

  if (allDone) {
    await prisma.roadmapStep.update({
      where: { id: resource.stepId },
      data: { status: 'completed' }
    });
    // Unlock next steps
    await ensureActiveStep(resource.step.roadmap.id);
  }

  return { alreadyCompleted: false, resource: updatedResource, xpResult, passportCourse };
}

/**
 * Get student learning roadmap
 */
async function getRoadmap(studentId) {
  const roadmap = await prisma.learningRoadmap.findUnique({
    where: { studentId },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        include: { resources: true }
      }
    }
  });

  return roadmap;
}

module.exports = {
  generateRoadmap,
  completeResource,
  getRoadmap
};
