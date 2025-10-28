const CV_CONTENT_FR = {
  personal: {
    name: "Leo Macias",
    jobTitle: "Software / Data Engineer",
    location: "Bordeaux",
    email: "leomacias@hotmail.fr",
    phone: "07 62 66 74 88",
    website: "meo-mumu.io",
    photoPath: "pages/curriculum-vitae/me-pro.PNG"
  },

  description: "Je suis passionné par les technologies de l'information et le développement logiciel. Après cinq années en data engineering, j’ai choisi le freelancing pour continuer à progresser en autodidacte et élargir mon champ d’action, notamment à travers mes recherches personnelles en sound design et art numérique. Je mets aujourd'hui ma rigueur et ma capacité d'adaptation au service de projets exigeants et innovants",
  experiences: [
    {
      period: "2024-2025",
      duration: "(9 mois)",
      title: "Data Engineer",
      company: "Betclic",
      isFreelance: true,
      tasks: [
        [{text: "Maintien et création de pipelines "}, {text: "SQL", bold: true}, {text: " sous "}, {text: "Snowflake", bold: true}],
        [{text: "Orchestration via "}, {text: "Talend", bold: true}, {text: " et "}, {text: "Airflow", bold: true}, {text: " (hébergé sur "}, {text: "AWS", bold: true}, {text: ")"}],
        [{text: "Dashboard "}, {text: "Tableau", bold: true}, {text: " et envoi de rapports "}, {text: "Excel", bold: true}, {text: " automatisés"}],
        [{text: "CI/CD via "}, {text: "GitHub", bold: true}],
        [{text: "Data :", bold: true}, {text: " comportement des joueurs de casino et poker en ligne"}]
      ]
    },
    {
      period: "2023-2024",
      duration: "(8 mois)",
      title: "Data Engineer",
      company: "Mc Ma Solutions",
      isFreelance: true,
      tasks: [
        [{text: "Refonte et migration des pipelines et microservices data sur "}, {text: "Python", bold: true}, {text: " et "}, {text: "Mage AI", bold: true}],
        [{text: "Dashboards temps réel "}, {text: "Grafana", bold: true}],
        [{text: "Intervention auprès des clients et de leurs problématiques métiers"}]
      ]
    },
    {
      period: "2017-2022",
      duration: "(5 ans)",
      title: "Data Engineer",
      company: "Mc Ma Solutions",
      isFreelance: false,
      tasks: [
        [{text: "Création du pôle data : conception et développement de microservices data ("}, {text: "API REST", bold: true}, {text: ")"}],
        [{text: "Stack technique : ETL "}, {text: "Talend", bold: true}, {text: ", orchestration "}, {text: "Scala", bold: true}, {text: ", backend "}, {text: "Java", bold: true}, {text: ", BDD "}, {text: "MySQL", bold: true}, {text: ", "}, {text: "Clickhouse", bold: true}, {text: ", "}, {text: "ElasticSearch", bold: true}],
        [{text: "Différentes temporalités à gérer (microbatch, temps réel, événementiel)"}],
        [{text: "Dashboards temps réel "}, {text: "Grafana", bold: true}],
        [{text: "Suivi clients, élaboration de roadmaps, gestion de projet"}],
        [{text: "Supervision de stagiaires"}],
        [{text: "CI/CD via "}, {text: "GitLab", bold: true}],
        [{text: "Data :", bold: true}, {text: " Factures énergétiques, consommations temps réel, météo, prix de l'énergie, infrastructures clientes"}]
      ]
    }
  ],

  skills: [
    {
      category: "Langages",
      items: ["Python", "Kotlin", "JavaScript", "GLSL"]
    },
    {
      category: "Database",
      items: ["Snowflake", "MySQL", "Clickhouse", "Elasticsearch"]
    },
    {
      category: "Orchestration & ETL",
      items: ["Airflow", "Talend", "Mage AI"]
    },
    {
      category: "Visualisation BI",
      items: ["Grafana", "Tableau"]
    },
    {
      category: "Gestion de projet",
      items: ["Encadrement de stagiaires", "Analyse des besoins et roadmap", "Relation client", "Anglais professionnel"]
    }
  ],

  education: [
    {
      period: "2014-2017",
      duration: "(3 ans)",
      title: "Ingénieur Informatique et Statistique",
      institution: "Polytech Lille",
      detail: "3ème année en Erasmus à l'Université Polytechnique de Lodz, Pologne"
    },
    {
      period: "2012-2014",
      duration: "(2 ans)",
      title: "DUT Statistique et Informatique Décisionnelle",
      institution: "IUT Paris V"
    }
  ],

  interests: [
    {
      category: "Sport",
      items: ["Danse", "Tennis"]
    },
    {
      category: "Musique",
      items: ["Sound design", "Modulaire", "Piano", "DJ"]
    },
    {
      category: "Art génératif",
      items: ["p5.js", "GLSL"]
    }
  ]
};

const CV_THEME_FR = {
  colors: {
    background: [255, 255, 255],
    accent: [74, 107, 68],
    accentLight: [74, 107, 68, 39],
    accentBackground: [220, 239, 220, 31],
    textPrimary: [34, 34, 34],
    textSecondary: [68, 68, 68],
    textMedium: [51, 51, 51],
    neomorphic: {
      background: [244, 243, 241],          // Couleur de base (même que le background global)
      lightShadow: [255, 255, 255, 1.0],    // Ombre claire très marquée
      darkShadow: [180, 180, 180, 1.0],     // Ombre foncée très marquée
      surfaceHighlight: [248, 247, 245],    // Léger highlight pour la surface
      surfaceDepth: [240, 239, 237]         // Léger assombrissement pour la profondeur
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