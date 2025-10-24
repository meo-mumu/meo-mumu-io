const CV_CONTENT_EN = {
  personal: {
    name: "Leo Macias",
    jobTitle: "Software / Data Engineer",
    location: "Bordeaux",
    email: "leomacias@hotmail.fr",
    phone: "07 62 66 74 88",
    website: "meo-mumu.io",
    photoPath: "pages/curriculum-vitae/me-pro.PNG"
  },

  description: "I am passionate about information technology and software development. After five years in data engineering, I chose freelancing to continue my self-taught progression and broaden my scope, particularly through my personal research in sound design and digital art. Today, I bring my rigor and adaptability to demanding and innovative projects",

  experiences: [
    {
      period: "2024-2025",
      duration: "(9 months)",
      title: "Data Engineer",
      company: "Betclic",
      isFreelance: true,
      tasks: [
        [{text: "Maintenance and creation of "}, {text: "SQL", bold: true}, {text: " pipelines on "}, {text: "Snowflake", bold: true}],
        [{text: "Orchestration with "}, {text: "Talend", bold: true}, {text: " and "}, {text: "Airflow", bold: true}],
        [{text: "Dashboards "}, {text: "Tableau", bold: true}, {text: " and automated reporting"}],
        [{text: "Data:", bold: true}, {text: " casino and online poker player behavior"}]
      ]
    },
    {
      period: "2023-2024",
      duration: "(8 months)",
      title: "Data Engineer",
      company: "Mc Ma Solutions",
      isFreelance: true,
      tasks: [
        [{text: "Redesign and migration of data microservices on "}, {text: "Python", bold: true}, {text: " and "}, {text: "Mage AI", bold: true}],
        [{text: "Real-time dashboards "}, {text: "Grafana", bold: true}],
        [{text: "Client support and business challenges"}]
      ]
    },
    {
      period: "2017-2022",
      duration: "(5 years)",
      title: "Data Engineer",
      company: "Mc Ma Solutions",
      isFreelance: false,
      tasks: [
        [{text: "Created the data team: design and development of data microservices ("}, {text: "REST API", bold: true}, {text: ")"}],
        [{text: "Tech stack: ETL "}, {text: "Talend", bold: true}, {text: ", orchestration "}, {text: "Scala", bold: true}, {text: ", backend "}, {text: "Java", bold: true}, {text: ", DB "}, {text: "MySQL", bold: true}, {text: ", "}, {text: "Clickhouse", bold: true}, {text: ", "}, {text: "ElasticSearch", bold: true}],
        [{text: "Multiple time granularities (microbatch, real-time, event-driven)"}],
        [{text: "Real-time dashboards "}, {text: "Grafana", bold: true}],
        [{text: "Client follow-up, roadmap development, project management"}],
        [{text: "Supervision of interns"}],
        [{text: "Data:", bold: true}, {text: " Energy bills, real-time consumption, weather, energy prices, client infrastructures"}]
      ]
    }
  ],

  skills: [
    {
      category: "Languages",
      items: ["Python", "Kotlin", "JavaScript", "GLSL"]
    },
    {
      category: "Data & Pipeline",
      items: ["SQL", "NoSQL", "Snowflake", "Talend", "Airflow", "Mage AI"]
    },
    {
      category: "BI Visualization",
      items: ["Grafana", "Tableau"]
    },
    {
      category: "Project Management",
      items: ["Intern supervision", "Requirements analysis and roadmap", "Client relations", "Professional English"]
    }
  ],

  education: [
    {
      period: "2014-2017",
      duration: "(3 years)",
      title: "Computer Science and Statistics Engineer",
      institution: "Polytech Lille",
      detail: "3rd year Erasmus at Lodz University of Technology, Poland"
    },
    {
      period: "2012-2014",
      duration: "(2 years)",
      title: "Associate Degree in Statistics and Business Intelligence",
      institution: "IUT Paris V"
    }
  ],

  interests: [
    {
      category: "Sports",
      items: ["Dance", "Tennis"]
    },
    {
      category: "Music",
      items: ["Piano", "Sound design", "Modular", "DJ"]
    },
    {
      category: "Generative Art",
      items: ["p5.js", "GLSL"]
    }
  ]
};

const CV_THEME_EN = {
  colors: {
    background: [255, 255, 255],
    accent: [74, 107, 68],
    accentLight: [74, 107, 68, 39],
    accentBackground: [220, 239, 220, 31],
    textPrimary: [34, 34, 34],
    textSecondary: [68, 68, 68],
    textMedium: [51, 51, 51],
    neomorphic: {
      background: [244, 243, 241],          // Base color (same as global background)
      lightShadow: [255, 255, 255, 1.0],    // Very pronounced light shadow
      darkShadow: [180, 180, 180, 1.0],     // Very pronounced dark shadow
      surfaceHighlight: [248, 247, 245],    // Slight highlight for surface
      surfaceDepth: [240, 239, 237]         // Slight darkening for depth
    }
  },

  dimensions: {
    photoSize: 160,
    photoRadius: 15,
    containerPadding: 60,
    sectionSpacing: 30,
    lineSpacing: 22
  },

  typography: {
    nameSize: 42,
    titleSize: 32,
    contactSize: 20,
    descriptionSize: 18,
    sectionTitleSize: 24,
    experienceTitleSize: 18,
    experienceMetaSize: 16,
    experienceTaskSize: 16
  }
};
