const CV_CONTENT = {
  personal: {
    name: "Leo Macias",
    jobTitle: "Software / Data Engineer",
    location: "Bordeaux",
    email: "leomacias@hotmail.fr",
    phone: "07 62 66 74 88",
    website: "meo-mumu.io",
    photoPath: "pages/curriculum-vitae/me-pro.PNG"
  },

  description: "Après 5 ans en data engineering, je me suis tourné vers le freelancing pour combiner expertise technique et explorations artistiques (sound design, art numérique, ..). Je mets ma rigueur et ma capacité d'adaptation au service de projets exigeants et innovants. Je reste aussi ouvert à un poste salarié offrant des perspectives d'évolution.",

  experiences: [
    {
      period: "2024-2025",
      duration: "(9 mois)",
      title: "Data Engineer",
      company: "Betclic",
      isFreelance: true,
      tasks: [
        "Maintien et création de pipelines SQL sous Snowflake",
        "Orchestration via Talend et Airflow",
        "Dashboard Tableau et envoi de rapports automatisés",
        "Data : comportement des joueurs de casino et poker en ligne"
      ]
    },
    {
      period: "2023-2024",
      duration: "(8 mois)",
      title: "Data Engineer",
      company: "Mc Ma Solutions",
      isFreelance: true,
      tasks: [
        "Refonte et migration des microservices data sur Python et Mage AI",
        "Dashboards temps réel Grafana",
        "Intervention auprès des clients et de leurs problématiques métiers"
      ]
    },
    {
      period: "2017-2022",
      duration: "(5 ans)",
      title: "Data Engineer",
      company: "Mc Ma Solutions",
      isFreelance: false,
      tasks: [
        "Création du pôle data : conception et développement de microservices data (API REST)",
        "Stack technique : ETL Talend, orchestration Scala, backend Java, BDD MySQL, Clickhouse, ElasticSearch",
        "Différentes temporalités à gérer (microbatch, temps réel, événementiel)",
        "Dashboards temps réel Grafana",
        "Suivi clients, élaboration de roadmaps, gestion de projet",
        "Supervision de stagiaires",
        "Data : Factures énergétiques, consommations temps réel, météo, prix de l'énergie, infrastructures clientes"
      ]
    }
  ],

  skills: [
    {
      category: "Langages",
      items: ["Python", "Kotlin", "JavaScript", "GLSL"]
    },
    {
      category: "Data & Pipeline",
      items: ["SQL", "NoSQL", "Snowflake", "Talend", "Airflow", "Mage AI"]
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
      items: ["Piano", "Sound design", "Modulaire", "DJ"]
    },
    {
      category: "Art génératif",
      items: ["p5.js", "GLSL"]
    }
  ]
};

const CV_THEME = {
  colors: {
    background: [255, 255, 255],
    accent: [74, 107, 68],
    accentLight: [74, 107, 68, 39],
    accentBackground: [220, 239, 220, 31],
    textPrimary: [34, 34, 34],
    textSecondary: [68, 68, 68],
    textMedium: [51, 51, 51]
  },

  dimensions: {
    photoSize: 140,
    photoRadius: 15,
    containerPadding: 60,
    sectionSpacing: 30,
    lineSpacing: 22
  },

  typography: {
    nameSize: 42,
    titleSize: 28,
    contactSize: 18,
    descriptionSize: 18,
    sectionTitleSize: 22,
    experienceTitleSize: 18,
    experienceMetaSize: 16,
    experienceTaskSize: 16
  }
};