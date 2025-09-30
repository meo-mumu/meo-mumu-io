class CvPageP5 {
  constructor() {
    this.scrollState = {
      current: 0,
      target: 0,
      max: 0,
      isDragging: false
    };

    this.ui = {
      contentHeight: 0,
      scrollbarBounds: {},
      exportButtonBounds: {}
    };

    this.assets = {
      profileImage: null
    };

    this.theme = CV_THEME;
    this.content = CV_CONTENT;

    this.loadAssets();
  }

  loadAssets() {
    loadImage(this.content.personal.photoPath,
      (img) => {
        this.assets.profileImage = img;
        console.log('Profile image loaded successfully');
      },
      (err) => console.error('Failed to load profile image:', err)
    );
  }

  async appear() {
    console.log('CvPageP5 appear');
    shockwave.appearEffect('extended-bubbling');
    await sleep(5000);
    herald.addMessage("> Voici mon CV en p5.js", 3000);
  }

  async hide() {
    console.log('CvPageP5 hide');
    shockwave.hideEffect();
  }

  handleScroll(deltaY) {
    this.scrollState.target = constrain(this.scrollState.target + deltaY, 0, this.scrollState.max);
  }

  // === UTILITY METHODS ===

  applyFont(context = graphic) {
    if (fonts.segoeUI) context.textFont(fonts.segoeUI);
  }

  applyColor(colorArray, context = graphic) {
    context.fill(...colorArray);
  }

  setTextStyle(size, colorArray, align = graphic.LEFT, context = graphic) {
    this.applyFont(context);
    context.textSize(size);
    context.textAlign(align, context.TOP);
    this.applyColor(colorArray, context);
  }

  createClippingMask(x, y, width, height, borderRadius = 0, context = graphic) {
    context.push();
    context.drawingContext.save();
    context.drawingContext.beginPath();

    if (borderRadius > 0) {
      context.drawingContext.roundRect(x, y, width, height, borderRadius);
    } else {
      context.drawingContext.rect(x, y, width, height);
    }

    context.drawingContext.clip();
    return () => {
      context.drawingContext.restore();
      context.pop();
    };
  }

  wrapText(text, maxWidth, fontSize, context = graphic) {
    this.applyFont(context);
    context.textSize(fontSize);

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (context.textWidth(testLine) > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  render() {
    this.clearAndSetBackground();
    this.updateScrollPosition();

    const layout = this.calculateLayout();
    this.renderContainer(layout);
    this.renderContentWithClipping(layout);
    this.updateScrollMetrics(layout);
    this.renderUI(layout);
  }

  clearAndSetBackground() {
    graphic.clear();
    graphic.background(244, 243, 241);
  }

  updateScrollPosition() {
    this.scrollState.current = lerp(this.scrollState.current, this.scrollState.target, 0.08);
  }

  calculateLayout() {
    const containerWidth = min(width * 0.95, 1400);
    const containerX = (width - containerWidth) / 2;
    const containerY = 50;
    const containerHeight = height - 2 * containerY;
    const padding = this.theme.dimensions.containerPadding;
    const contentWidth = containerWidth - 2 * padding;

    return {
      container: { x: containerX, y: containerY, width: containerWidth, height: containerHeight },
      content: { x: containerX + padding, width: contentWidth, startY: containerY + padding },
      padding
    };
  }

  renderContainer(layout) {
    this.drawContainerWithShadow(layout.container);
  }

  renderContentWithClipping(layout) {
    const restoreClipping = this.createClippingMask(
      layout.container.x, layout.container.y,
      layout.container.width, layout.container.height
    );

    graphic.translate(0, -this.scrollState.current);

    const sectionSpacing = this.theme.dimensions.sectionSpacing; // Uniform spacing
    const headerSpacing = sectionSpacing * 1.5; // Larger spacing after header (60px)
    let currentY = layout.content.startY;

    currentY = this.renderHeader(layout.content.x, currentY, layout.content.width);
    currentY += headerSpacing; // Larger spacing after header

    currentY = this.renderExperiences(layout.content.x, currentY, layout.content.width);
    currentY += sectionSpacing; // Uniform spacing after experiences

    currentY = this.renderSkills(layout.content.x, currentY, layout.content.width);
    currentY += sectionSpacing; // Uniform spacing after skills

    currentY = this.renderEducation(layout.content.x, currentY, layout.content.width);
    currentY += sectionSpacing; // Uniform spacing after education

    currentY = this.renderInterests(layout.content.x, currentY, layout.content.width);

    this.ui.contentHeight = currentY;
    restoreClipping();
  }

  updateScrollMetrics(layout) {
    this.scrollState.max = max(0,
      this.ui.contentHeight - (layout.container.y + layout.container.height) + layout.padding
    );
  }

  renderUI(layout) {
    this.renderScrollIndicator(layout.container);
    this.renderExportButton(layout.container);
  }

  drawContainerWithShadow({ x, y, width, height }) {
    // Shadow
    graphic.fill(0, 0, 0, 13);
    for (let i = 0; i < 10; i++) {
      graphic.noStroke();
      graphic.rect(x + i, y + i, width, height, 12);
    }

    // Main container
    this.applyColor(this.theme.colors.background);
    graphic.stroke(...this.theme.colors.accentLight);
    graphic.strokeWeight(1);
    graphic.rect(x, y, width, height, 12);
  }

  // === SECTION RENDERERS ===

  renderHeader(x, startY, width) {
    let y = startY;
    const personal = this.content.personal;
    const theme = this.theme;

    // Photo positioning
    const photoSize = theme.dimensions.photoSize;
    const photoX = x + width - photoSize;

    // Render profile photo
    if (this.assets.profileImage) {
      const restoreClipping = this.createClippingMask(
        photoX, startY, photoSize, photoSize, theme.dimensions.photoRadius
      );
      graphic.image(this.assets.profileImage, photoX, startY, photoSize, photoSize);
      restoreClipping();
    }

    // Calculate intelligent spacing - distribute remaining space evenly
    const totalTextHeight = theme.typography.nameSize + theme.typography.titleSize + theme.typography.contactSize;
    const remainingSpace = photoSize - totalTextHeight;
    const gapBetweenLines = remainingSpace / 3; // Space between and around lines

    // Name - use Courier font
    y += gapBetweenLines * 0.5; // Half gap at top
    if (fonts.courier) graphic.textFont(fonts.courier);
    graphic.textSize(theme.typography.nameSize);
    graphic.textAlign(graphic.LEFT, graphic.TOP);
    this.applyColor(theme.colors.textPrimary);
    graphic.text(personal.name, x, y);
    y += theme.typography.nameSize + gapBetweenLines;

    // Job title - use Courier font
    if (fonts.courier) graphic.textFont(fonts.courier);
    graphic.textSize(theme.typography.titleSize);
    this.applyColor(theme.colors.accent);
    graphic.text(personal.jobTitle, x, y);
    y += theme.typography.titleSize + gapBetweenLines;

    // Contact info
    this.setTextStyle(theme.typography.contactSize, theme.colors.textSecondary);
    const contact = `${personal.location}  |  ${personal.email}  |  ${personal.phone}  |  ${personal.website}`;
    graphic.text(contact, x, y);
    y += theme.typography.contactSize;

    // Description below photo with reduced spacing
    const descriptionY = startY + photoSize + 20; // Reduced spacing
    this.setTextStyle(theme.typography.descriptionSize, theme.colors.textPrimary);
    const lines = this.wrapText(this.content.description, width, theme.typography.descriptionSize);
    let currentDescY = descriptionY;
    for (const line of lines) {
      graphic.text(line, x, currentDescY);
      currentDescY += theme.dimensions.lineSpacing;
    }

    return Math.max(y + gapBetweenLines * 0.5, currentDescY); // Clean end, no extra spacing
  }

  renderExperiences(x, startY, width) {
    let y = this.renderSectionTitle("Expérience professionnelle", x, startY, width);
    y += 20;

    for (const experience of this.content.experiences) {
      y = this.renderExperienceItem(experience, x, y, width);
      y += 20; // Reduced spacing between experience items
    }

    return y; // Remove extra spacing
  }

  renderSkills(x, startY, width) {
    let y = this.renderSectionTitle("Compétences", x, startY, width);
    y += 20;
    y = this.renderSkillsGrid(x, y, width);
    return y; // Remove extra spacing
  }

  renderEducation(x, startY, width) {
    let y = this.renderSectionTitle("Formation", x, startY, width);
    y += 20;

    for (const education of this.content.education) {
      y = this.renderEducationItem(education, x, y, width);
      y += 20; // Reduced spacing between education items
    }

    return y; // Remove extra spacing
  }

  renderInterests(x, startY, width) {
    let y = this.renderSectionTitle("Centres d'intérêt", x, startY, width);
    y += 20;
    y = this.renderInterestsGrid(x, y, width);
    return y;
  }

  // === COMPONENT RENDERERS ===

  renderSectionTitle(title, x, y, width) {
    // Use Courier font for section titles
    if (fonts.courier) graphic.textFont(fonts.courier);
    graphic.textSize(this.theme.typography.sectionTitleSize);
    graphic.textAlign(graphic.LEFT, graphic.TOP);
    this.applyColor(this.theme.colors.accent);

    graphic.text(title, x, y);
    const titleWidth = graphic.textWidth(title);

    // Decorative line
    graphic.stroke(...this.theme.colors.accentLight);
    graphic.strokeWeight(1);
    graphic.line(x + titleWidth + 16, y + 12, x + width, y + 12);
    graphic.noStroke();

    return y + 30;
  }

  renderExperienceItem(experience, x, y, width) {
    const theme = this.theme;

    // Calculate the height of this experience item to size the side bar appropriately
    const itemHeight = 30 + (experience.tasks.length * 20);

    // Side bar - aligned with content
    this.applyColor(this.theme.colors.accentLight);
    graphic.noStroke();
    graphic.rect(x, y - 5, 2, itemHeight);

    // Period and duration - offset to accommodate bar
    this.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent);
    graphic.text(experience.period, x + 10, y);

    graphic.textSize(12);
    this.applyColor([...theme.colors.accent, 180]);
    graphic.text(experience.duration, x + 10, y + 20);

    // Title - shifted right
    this.setTextStyle(theme.typography.experienceTitleSize, theme.colors.textPrimary);
    const titleText = experience.title + (experience.isFreelance ? " (freelance)" : "");
    graphic.text(titleText, x + 160, y);

    // Company - aligned right
    this.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent, graphic.RIGHT);
    graphic.text(experience.company, x + width, y);

    // Tasks - shifted right
    this.setTextStyle(theme.typography.experienceTaskSize, theme.colors.textMedium, graphic.LEFT);
    let taskY = y + 30;
    for (const task of experience.tasks) {
      graphic.text(task, x + 180, taskY);
      taskY += 20;
    }

    return taskY; // Remove extra spacing
  }

  renderEducationItem(education, x, y, width) {
    const theme = this.theme;

    // Period and duration
    this.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent);
    graphic.text(education.period, x, y);

    graphic.textSize(12);
    this.applyColor([...theme.colors.accent, 180]);
    graphic.text(education.duration, x, y + 20);

    // Title
    this.setTextStyle(theme.typography.experienceTitleSize, theme.colors.textPrimary);
    graphic.text(education.title, x + 150, y);

    // Institution - aligned right
    this.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent, graphic.RIGHT);
    graphic.text(education.institution, x + width, y);

    // Detail if present
    let entryHeight = 30;
    if (education.detail) {
      this.setTextStyle(theme.typography.experienceTaskSize, theme.colors.textMedium, graphic.LEFT);
      graphic.text("• " + education.detail, x + 170, y + 25);
      entryHeight = 50;
    }

    return y + entryHeight; // Remove extra spacing
  }

  renderSkillsGrid(x, y, width) {
    for (const skillGroup of this.content.skills) {

      // Category - use Courier font
      if (fonts.courier) graphic.textFont(fonts.courier);
      graphic.textSize(14);
      graphic.textAlign(graphic.LEFT, graphic.TOP);
      this.applyColor(this.theme.colors.textSecondary);
      graphic.text(skillGroup.category.toUpperCase(), x, y);

      // Skill tags
      let tagX = x + 150;
      let tagY = y - 5;
      let startTagY = tagY; // Remember starting Y position

      for (const skill of skillGroup.items) {
        // Calculate exact text width with consistent font size
        this.setTextStyle(14, this.theme.colors.textMedium);
        const textWidth = graphic.textWidth(skill);
        const padding = 16; // Reduced padding for better proportions
        const tagWidth = textWidth + padding;
        const tagHeight = 26;

        // Check if tag fits on current line BEFORE drawing
        if (tagX + tagWidth > x + width) {
          tagX = x + 150;
          tagY += 30; // Reduced line spacing
        }

        // Tag background - rounded rectangle
        this.applyColor(this.theme.colors.accentBackground);
        graphic.stroke(...this.theme.colors.accentLight);
        graphic.strokeWeight(1);
        graphic.rect(tagX, tagY, tagWidth, tagHeight, 8);

        // Tag text - perfectly centered
        graphic.textAlign(graphic.LEFT, graphic.CENTER); // CENTER for vertical alignment
        this.applyColor(this.theme.colors.textMedium);
        graphic.textSize(14);
        this.applyFont();
        const textX = tagX + (tagWidth - textWidth) / 2; // Perfect horizontal centering
        const textY = tagY + tagHeight/2 - 1; // Slightly higher
        graphic.text(skill, textX, textY);

        tagX += tagWidth + 10;
      }

      // Use the last tagY position + tag height + small margin
      y = tagY + 26 + 15; // Height of tag + small margin
    }
    return y;
  }

  renderInterestsGrid(x, y, width) {
    for (const interestGroup of this.content.interests) {

      // Category - use Courier font
      if (fonts.courier) graphic.textFont(fonts.courier);
      graphic.textSize(14);
      graphic.textAlign(graphic.LEFT, graphic.TOP);
      this.applyColor(this.theme.colors.textSecondary);
      graphic.text(interestGroup.category.toUpperCase(), x, y);

      // Interest tags
      let tagX = x + 150;
      let tagY = y - 5;

      for (const interest of interestGroup.items) {
        // Calculate exact text width with consistent font size
        this.setTextStyle(14, this.theme.colors.textMedium);
        const textWidth = graphic.textWidth(interest);
        const padding = 16; // Reduced padding for better proportions
        const tagWidth = textWidth + padding;
        const tagHeight = 26;

        // Check if tag fits on current line BEFORE drawing
        if (tagX + tagWidth > x + width) {
          tagX = x + 150;
          tagY += 30; // Reduced line spacing
        }

        // Tag background - rounded rectangle
        this.applyColor(this.theme.colors.accentBackground);
        graphic.stroke(...this.theme.colors.accentLight);
        graphic.strokeWeight(1);
        graphic.rect(tagX, tagY, tagWidth, tagHeight, 8);

        // Tag text - perfectly centered
        graphic.textAlign(graphic.LEFT, graphic.CENTER); // CENTER for vertical alignment
        this.applyColor(this.theme.colors.textMedium);
        graphic.textSize(14);
        this.applyFont();
        const textX = tagX + (tagWidth - textWidth) / 2; // Perfect horizontal centering
        const textY = tagY + tagHeight/2 - 1; // Slightly higher
        graphic.text(interest, textX, textY);

        tagX += tagWidth + 10;
      }

      // Use the last tagY position + tag height + small margin
      y = tagY + 26 + 15; // Height of tag + small margin
    }
    return y;
  }

  // === UI RENDERERS ===

  renderScrollIndicator({ x, y, width, height }) {
    if (this.scrollState.max <= 0) return;

    // Track positioning
    const trackX = x + width - 12;
    const trackY = y + 20;
    const trackHeight = height - 40;
    const trackWidth = 4;

    // Background track
    this.applyColor([...this.theme.colors.accentLight, 26]);
    graphic.noStroke();
    graphic.rect(trackX, trackY, trackWidth, trackHeight, 2);

    // Calculate scroll progress
    const scrollProgress = constrain(this.scrollState.current / this.scrollState.max, 0, 1);

    // Thumb positioning
    const thumbSize = 8;
    const thumbTravel = trackHeight - thumbSize;
    const thumbY = trackY + (scrollProgress * thumbTravel);
    const thumbX = trackX - 2;

    // Thumb shadow
    graphic.fill(0, 0, 0, 20);
    graphic.rect(thumbX + 1, thumbY + 1, thumbSize, thumbSize);

    // Main thumb
    this.applyColor(this.theme.colors.accent);
    graphic.rect(thumbX, thumbY, thumbSize, thumbSize);

    // Store bounds for interaction
    this.ui.scrollbarBounds = {
      trackX, trackY, trackWidth, trackHeight,
      thumbX, thumbY, thumbSize
    };
  }

  renderExportButton({ x, y, width, height }) {
    const buttonWidth = 100;
    const buttonHeight = 30;
    const buttonX = x + width - buttonWidth - 20;
    const buttonY = y + height - buttonHeight - 15; // Bottom right position

    // Store bounds for interaction (ajustés pour le système WEBGL)
    // Les coordonnées de rendu sont déjà dans le bon système après translate()
    this.ui.exportButtonBounds = {
      x: buttonX, y: buttonY,
      width: buttonWidth, height: buttonHeight
    };

    // Button background
    this.applyColor(this.theme.colors.accent);
    graphic.noStroke();
    graphic.rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

    // Button text
    graphic.fill(255);
    graphic.textAlign(graphic.CENTER, graphic.CENTER);
    this.applyFont();
    graphic.textSize(12);
    graphic.text("Export PDF", buttonX + buttonWidth/2, buttonY + buttonHeight/2);
  }

  drawHeader(x, y, w) {
    if (fonts.segoeUI) graphic.textFont(fonts.segoeUI);

    let startY = y;
    let photoSize = 120;
    let photoX = x + w - photoSize; // Position à droite, alignée sur la marge

    // Photo de profil (si chargée)
    if (this.profileImg) {
      // Clipping carré arrondi pour la photo
      graphic.push();
      graphic.drawingContext.save();

      // Créer un chemin carré arrondi
      let radius = 15; // Arrondi des coins
      graphic.drawingContext.beginPath();
      graphic.drawingContext.roundRect(photoX, startY, photoSize, photoSize, radius);
      graphic.drawingContext.clip();

      // Dessiner la photo
      graphic.image(this.profileImg, photoX, startY, photoSize, photoSize);

      graphic.drawingContext.restore();
      graphic.pop();
    }

    // Ajuster la largeur du texte pour laisser de la place à la photo
    let textWidth = w - photoSize - 40;

    // Calculer l'espacement pour répartir sur la hauteur de la photo
    let headerLineSpacing = photoSize / 3; // 120px / 2 = 60px par section

    // Nom
    graphic.fill(this.colors.text);
    graphic.textSize(36);
    graphic.textAlign(graphic.LEFT, graphic.TOP);
    graphic.text(this.cvData.name, x, y);
    y += headerLineSpacing;

    // Titre du poste
    graphic.fill(this.colors.accent);
    graphic.textSize(24);
    graphic.text(this.cvData.jobTitle, x, y);
    y += headerLineSpacing;

    // Contact
    graphic.fill(this.colors.textLight);
    graphic.textSize(16);
    let contact = `${this.cvData.location}  |  ${this.cvData.email}  |  ${this.cvData.phone}  |  ${this.cvData.website}`;
    graphic.text(contact, x, y);
    y += headerLineSpacing;

    // Description - justifiée sur toute la largeur sous la photo
    graphic.fill(this.colors.text);
    graphic.textSize(16);
    graphic.textAlign(graphic.LEFT, graphic.TOP);
    let descriptionY = startY + photoSize + 20;
    let descriptionWidth = w; // Toute la largeur disponible
    let lines = this.wrapText(this.cvData.description, descriptionWidth, 16);
    for (let line of lines) {
      graphic.text(line, x, descriptionY);
      descriptionY += 22;
    }

    // S'assurer que y dépasse la description
    y = Math.max(y, descriptionY + 20);

    return y;
  }

  drawSection(title, x, y, w) {
    graphic.fill(this.colors.accent);
    graphic.textSize(20);
    graphic.textAlign(graphic.LEFT, graphic.TOP);
    if (fonts.segoeUI) graphic.textFont(fonts.segoeUI);

    graphic.text(title, x, y);
    let titleWidth = graphic.textWidth(title);

    // Ligne décorative - s'arrête à la marge de droite
    graphic.stroke(this.colors.accentLight);
    graphic.strokeWeight(1);
    graphic.line(x + titleWidth + 16, y + 12, x + w, y + 12);

    return y + 30;
  }

  drawExperience(exp, x, y, w) {
    if (fonts.segoeUI) graphic.textFont(fonts.segoeUI);

    // Date et durée
    graphic.fill(this.colors.accent);
    graphic.textSize(14);
    graphic.textAlign(graphic.LEFT, graphic.TOP);
    graphic.text(exp.period, x, y);
    graphic.textSize(12);
    graphic.fill(this.colors.accent[0], this.colors.accent[1], this.colors.accent[2], 180);
    graphic.text(exp.duration, x, y + 20);

    // Titre
    graphic.fill(this.colors.text);
    graphic.textSize(16);
    let titleText = exp.title + (exp.freelance ? " (freelance)" : "");
    graphic.text(titleText, x + 150, y);

    // Entreprise à droite - alignée sur la marge
    graphic.fill(this.colors.accent);
    graphic.textSize(14);
    graphic.textAlign(graphic.RIGHT, graphic.TOP);
    graphic.text(exp.company, x + w, y);

    // Retour à l'alignement gauche pour les tâches
    graphic.textAlign(graphic.LEFT, graphic.TOP);
    graphic.fill(this.colors.textMedium);
    graphic.textSize(14);
    let taskY = y + 30;
    for (let task of exp.tasks) {
      graphic.text("• " + task, x + 170, taskY);
      taskY += 20;
    }

    return taskY + 10;
  }

  calculateExperienceHeight(exp, w) {
    return 50 + (exp.tasks.length * 20);
  }

  drawSkills(x, y, w) {
    let startY = y;
    for (let skillGroup of this.cvData.skills) {
      // Barre latérale
      graphic.fill(this.colors.accentLight);
      graphic.noStroke();
      graphic.rect(x - 5, y - 5, 2, 40);

      // Catégorie
      graphic.fill(this.colors.textLight);
      graphic.textSize(12);
      if (fonts.segoeUI) graphic.textFont(fonts.segoeUI);
      graphic.textAlign(graphic.LEFT, graphic.TOP);
      graphic.text(skillGroup.category.toUpperCase(), x + 10, y);

      // Tags des compétences
      let tagX = x + 200;
      let tagY = y - 5;
      for (let skill of skillGroup.items) {
        let tagWidth = graphic.textWidth(skill) + 20;

        // Background du tag
        graphic.fill(this.colors.accentBg);
        graphic.stroke(this.colors.accentLight);
        graphic.strokeWeight(1);
        graphic.rect(tagX, tagY, tagWidth, 25, 12);

        // Texte du tag
        graphic.fill(this.colors.textMedium);
        graphic.textSize(12);
        graphic.text(skill, tagX + 10, tagY + 7);

        tagX += tagWidth + 10;
        if (tagX + tagWidth > x + w) {
          tagX = x + 200;
          tagY += 35;
        }
      }

      y = tagY + 40;
    }
    return y;
  }

  drawFormation(formation, x, y, w) {
    if (fonts.segoeUI) graphic.textFont(fonts.segoeUI);

    // Date et durée
    graphic.fill(this.colors.accent);
    graphic.textSize(14);
    graphic.textAlign(graphic.LEFT, graphic.TOP);
    graphic.text(formation.period, x, y);
    graphic.textSize(12);
    graphic.fill(this.colors.accent[0], this.colors.accent[1], this.colors.accent[2], 180);
    graphic.text(formation.duration, x, y + 20);

    // Titre
    graphic.fill(this.colors.text);
    graphic.textSize(16);
    graphic.text(formation.title, x + 150, y);

    // Institut à droite - aligné sur la marge
    graphic.fill(this.colors.accent);
    graphic.textSize(14);
    graphic.textAlign(graphic.RIGHT, graphic.TOP);
    graphic.text(formation.company, x + w, y);

    // Retour à l'alignement gauche pour le détail
    graphic.textAlign(graphic.LEFT, graphic.TOP);
    let entryHeight = 30;
    if (formation.detail) {
      graphic.fill(this.colors.textMedium);
      graphic.textSize(14);
      graphic.text("• " + formation.detail, x + 170, y + 25);
      entryHeight = 50;
    }

    return y + entryHeight + 30;
  }

  drawInterests(x, y, w) {
    for (let interestGroup of this.cvData.interests) {
      // Barre latérale
      graphic.fill(this.colors.accentLight);
      graphic.noStroke();
      graphic.rect(x - 5, y - 5, 2, 40);

      // Catégorie
      graphic.fill(this.colors.textLight);
      graphic.textSize(12);
      if (fonts.segoeUI) graphic.textFont(fonts.segoeUI);
      graphic.textAlign(graphic.LEFT, graphic.TOP);
      graphic.text(interestGroup.category.toUpperCase(), x + 10, y);

      // Tags des intérêts
      let tagX = x + 200;
      let tagY = y - 5;
      for (let interest of interestGroup.items) {
        let tagWidth = graphic.textWidth(interest) + 20;

        // Background du tag
        graphic.fill(this.colors.accentBg);
        graphic.stroke(this.colors.accentLight);
        graphic.strokeWeight(1);
        graphic.rect(tagX, tagY, tagWidth, 25, 12);

        // Texte du tag
        graphic.fill(this.colors.textMedium);
        graphic.textSize(12);
        graphic.text(interest, tagX + 10, tagY + 7);

        tagX += tagWidth + 10;
        if (tagX + tagWidth > x + w) {
          tagX = x + 200;
          tagY += 35;
        }
      }

      y = tagY + 50;
    }
    return y;
  }

  wrapText(text, maxWidth, fontSize) {
    if (fonts.segoeUI) graphic.textFont(fonts.segoeUI);
    graphic.textSize(fontSize);

    let words = text.split(' ');
    let lines = [];
    let currentLine = '';

    for (let word of words) {
      let testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (graphic.textWidth(testLine) > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  drawScrollIndicator(containerX, containerY, containerWidth, containerHeight) {
    // Ne dessiner que s'il y a du contenu à scroller
    if (this.maxScroll <= 0) return;

    // Position du track : côté droit du container
    let trackX = containerX + containerWidth - 12;
    let trackY = containerY + 20;
    let trackHeight = containerHeight - 40;
    let trackWidth = 4; // Plus fin

    // Track de fond (rectangle arrondi transparent)
    graphic.fill(this.colors.accentLight[0], this.colors.accentLight[1], this.colors.accentLight[2], 26); // opacité 0.1
    graphic.noStroke();
    graphic.rect(trackX, trackY, trackWidth, trackHeight, 2);

    // Calculer la progression du scroll (0 à 1)
    let scrollProgress = this.scrollY / this.maxScroll;
    scrollProgress = constrain(scrollProgress, 0, 1);

    // Position et taille du curseur
    let thumbSize = 8; // Plus gros
    let thumbTravel = trackHeight - thumbSize;
    let thumbY = trackY + (scrollProgress * thumbTravel);
    let thumbX = trackX - 2; // Centré sur le track plus fin

    // Ombre subtile du curseur
    graphic.fill(0, 0, 0, 20);
    graphic.rect(thumbX + 1, thumbY + 1, thumbSize, thumbSize);

    // Curseur principal (carré sans arrondi)
    graphic.fill(this.colors.accent);
    graphic.rect(thumbX, thumbY, thumbSize, thumbSize);

    // Stocker les bounds pour la détection de clic
    this.scrollbarBounds = {
      trackX: trackX,
      trackY: trackY,
      trackWidth: trackWidth,
      trackHeight: trackHeight,
      thumbX: thumbX,
      thumbY: thumbY,
      thumbSize: thumbSize
    };
  }

  onMousePressed() {
    // Check export button click
    if (this.ui.exportButtonBounds) {
      const bounds = this.ui.exportButtonBounds;
      const isInside = mouseX >= bounds.x &&
             mouseX <= bounds.x + bounds.width &&
             mouseY >= bounds.y &&
             mouseY <= bounds.y + bounds.height;

      if (isInside) {
        this.exportToPDF();
        return;
      }
    }

    // Check scrollbar interaction
    if (this.scrollState.max > 0 && this.isMouseOnScrollbar()) {
      this.scrollState.isDragging = true;

      // Jump to position if clicking on track (not thumb)
      if (!this.isMouseOnThumb()) {
        this.jumpToMousePosition();
      }
    }
  }

  onMouseReleased() {
    this.scrollState.isDragging = false;
  }

  onMouseDragged() {
    if (this.scrollState.isDragging) {
      this.jumpToMousePosition();
    }
  }

  onMouseWheel(event) {
    this.handleScroll(event.delta * 3);
    return false;
  }

  // === INTERACTION HELPERS ===

  isMouseOnScrollbar() {
    const bounds = this.ui.scrollbarBounds;
    const adjustedMouseX = mouseX - width/2;
    const adjustedMouseY = mouseY - height/2;
    return adjustedMouseX >= bounds.trackX &&
           adjustedMouseX <= bounds.trackX + bounds.trackWidth &&
           adjustedMouseY >= bounds.trackY &&
           adjustedMouseY <= bounds.trackY + bounds.trackHeight;
  }

  isMouseOnThumb() {
    const bounds = this.ui.scrollbarBounds;
    const adjustedMouseX = mouseX - width/2;
    const adjustedMouseY = mouseY - height/2;
    return adjustedMouseX >= bounds.thumbX &&
           adjustedMouseX <= bounds.thumbX + bounds.thumbSize &&
           adjustedMouseY >= bounds.thumbY &&
           adjustedMouseY <= bounds.thumbY + bounds.thumbSize;
  }


  jumpToMousePosition() {
    const bounds = this.ui.scrollbarBounds;
    const adjustedMouseY = mouseY - height/2;
    const relativeY = adjustedMouseY - bounds.trackY;
    const trackProgress = constrain(relativeY / bounds.trackHeight, 0, 1);
    this.scrollState.target = trackProgress * this.scrollState.max;
  }

  drawExportButton(containerX, containerY, containerWidth) {
    // Position du bouton : coin supérieur droit du container
    let buttonWidth = 100;
    let buttonHeight = 30;
    let buttonX = containerX + containerWidth - buttonWidth - 20;
    let buttonY = containerY + 15;

    // Stocker les bounds pour la détection de clic
    this.exportButtonBounds = {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight
    };

    // Background du bouton
    graphic.fill(this.colors.accent);
    graphic.noStroke();
    graphic.rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

    // Texte du bouton
    graphic.fill(255);
    graphic.textAlign(graphic.CENTER, graphic.CENTER);
    if (fonts.segoeUI) graphic.textFont(fonts.segoeUI);
    graphic.textSize(12);
    graphic.text("Export PDF", buttonX + buttonWidth/2, buttonY + buttonHeight/2);
  }

  isMouseOnExportButton() {
    if (!this.exportButtonBounds) return false;
    let bounds = this.exportButtonBounds;
    return mouseX >= bounds.x &&
           mouseX <= bounds.x + bounds.width &&
           mouseY >= bounds.y &&
           mouseY <= bounds.y + bounds.height;
  }

  exportToPDF() {
    console.log("Export PDF démarré...");

    // Vérifier si jsPDF est disponible
    if (typeof window.jspdf === 'undefined') {
      console.error("jsPDF n'est pas chargé!");
      alert("Erreur: jsPDF n'est pas disponible. Vérifiez que la librairie est bien chargée.");
      return;
    }

    // Créer un graphics haute résolution pour le PDF (A4 à 300 DPI)
    const pdfWidth = 2480;  // A4 width à 300 DPI (8.27" * 300)
    const pdfHeight = 3508; // A4 height à 300 DPI (11.69" * 300)
    const pdfGraphics = createGraphics(pdfWidth, pdfHeight);

    // Configurer le graphics PDF directement sans toucher au global
    pdfGraphics.background(255, 255, 255);

    // Calculer l'échelle par rapport à l'affichage actuel
    const currentLayout = this.calculateLayout();
    const scaleX = (pdfWidth * 0.9) / currentLayout.container.width; // 90% de la largeur PDF
    const scaleY = scaleX; // Garder les proportions

    // Appliquer l'échelle sur le graphics PDF
    pdfGraphics.push();
    pdfGraphics.scale(scaleX, scaleY);

    // Calculer les dimensions mises à l'échelle
    const scaledMargin = 50 / scaleX;
    const scaledContentWidth = (pdfWidth * 0.9) / scaleX;
    const scaledContentX = ((pdfWidth - (pdfWidth * 0.9)) / 2) / scaleX;

    // Temporairement utiliser le graphics PDF pour le rendu
    const originalGraphic = graphic;
    graphic = pdfGraphics;

    // Rendu du contenu
    const sectionSpacing = this.theme.dimensions.sectionSpacing;
    const headerSpacing = sectionSpacing * 1.5;
    let currentY = scaledMargin;

    // Header
    currentY = this.renderHeader(scaledContentX, currentY, scaledContentWidth);
    currentY += headerSpacing;

    // Expériences
    currentY = this.renderSectionTitle("Expérience professionnelle", scaledContentX, currentY, scaledContentWidth);
    currentY += 20;
    for (const experience of this.content.experiences) {
      currentY = this.renderExperienceItem(experience, scaledContentX, currentY, scaledContentWidth);
      currentY += 20;
    }
    currentY += sectionSpacing;

    // Compétences
    currentY = this.renderSectionTitle("Compétences", scaledContentX, currentY, scaledContentWidth);
    currentY += 20;
    currentY = this.renderSkillsGrid(scaledContentX, currentY, scaledContentWidth);
    currentY += sectionSpacing;

    // Formation
    currentY = this.renderSectionTitle("Formation", scaledContentX, currentY, scaledContentWidth);
    currentY += 20;
    for (const education of this.content.education) {
      currentY = this.renderEducationItem(education, scaledContentX, currentY, scaledContentWidth);
      currentY += 20;
    }
    currentY += sectionSpacing;

    // Centres d'intérêt
    currentY = this.renderSectionTitle("Centres d'intérêt", scaledContentX, currentY, scaledContentWidth);
    currentY += 20;
    currentY = this.renderInterestsGrid(scaledContentX, currentY, scaledContentWidth);

    // Restaurer le graphics original IMMÉDIATEMENT
    graphic = originalGraphic;
    pdfGraphics.pop();

    // Convertir en image et créer le PDF
    const canvas = pdfGraphics.canvas;
    const imgData = canvas.toDataURL('image/png');

    // Créer le PDF avec jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Ajouter l'image au PDF (210mm x 297mm = A4)
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

    // Télécharger le PDF
    pdf.save('CV_Leo_Macias.pdf');

    console.log("Export PDF terminé !");
  }


  // Méthodes pour gérer le scroll avec la molette
  onMouseWheel(event) {
    this.handleScroll(event.delta * 3);
    return false; // Empêcher le scroll par défaut
  }
}