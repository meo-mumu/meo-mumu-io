/**
 * Méthodes de rendu pour CvPageP5
 */
class CvPageRenderers {
  constructor(cvPage) {
    this.cvPage = cvPage;
  }

  // -------------------------------------------- text rendering

  // render une section de texte simple
  renderSectionWithGlitch(text, x, y, size, bold = false) {
    if (bold) {
      graphic.drawingContext.font = `bold ${this.cvPage.getScaledSize(size)}px "Segoe UI"`;
    }
    graphic.text(text, x, y);
  }

  // alias pour compatibilité
  renderTextWithGlitch(text, x, y, size, bold = false) {
    this.renderSectionWithGlitch(text, x, y, size, bold);
  }

  // === CORE RENDERING ===

  render() {
    graphic.clear();
    
    this.clearAndSetBackground();
    this.updateScrollPosition();

    const layout = this.cvPage.calculateLayout();
    this.renderContainer(layout);
    this.renderContentWithClipping(layout);
    this.updateScrollMetrics(layout);
    this.renderUI(layout);
  }

  clearAndSetBackground() {
    graphic.clear();
    graphic.background(...this.cvPage.COLORS.BACKGROUND);
  }

  updateScrollPosition() {
    this.cvPage.scrollState.current = lerp(this.cvPage.scrollState.current, this.cvPage.scrollState.target, 0.08);
  }

  renderContainer(layout) {
    this.drawContainer(layout.container);
  }

  renderContentWithClipping(layout) {
    const restoreClipping = this.cvPage.createClippingMask(
      layout.container.x, layout.container.y,
      layout.container.width, layout.container.height
    );

    graphic.translate(0, -this.cvPage.scrollState.current);

    const uniformSpacing = this.cvPage.getScaledSpacing(50); // Espacement uniforme entre sections
    let currentY = layout.content.startY;

    currentY = this.renderHeader(layout.content.x, currentY, layout.content.width);
    currentY += uniformSpacing;

    currentY = this.renderExperiences(layout.content.x, currentY, layout.content.width);
    currentY += uniformSpacing;

    currentY = this.renderSkills(layout.content.x, currentY, layout.content.width);
    currentY += uniformSpacing;

    currentY = this.renderEducation(layout.content.x, currentY, layout.content.width);
    currentY += uniformSpacing;

    currentY = this.renderInterests(layout.content.x, currentY, layout.content.width);

    this.cvPage.ui.contentHeight = currentY;
    restoreClipping();
  }

  updateScrollMetrics(layout) {
    this.cvPage.scrollState.max = max(0,
      this.cvPage.ui.contentHeight - (layout.container.y + layout.container.height) + layout.padding
    );
  }

  renderUI(layout) {
    this.renderScrollIndicator(layout.container);
    this.renderLanguageButtons(layout.container);
    this.renderDownloadButton(layout.container);
  }

  // === CONTAINER AND BASIC DRAWING ===

  drawContainer({ x, y, width, height }) {
    graphic.drawingContext.save();

    // Ombre foncée (bas/droite)
    graphic.drawingContext.shadowColor = 'rgba(163, 177, 198, 0.6)';
    graphic.drawingContext.shadowBlur = 15;
    graphic.drawingContext.shadowOffsetX = 6;
    graphic.drawingContext.shadowOffsetY = 6;

    graphic.fill(...this.cvPage.COLORS.BACKGROUND);
    graphic.noStroke();
    graphic.rect(x, y, width, height, 12);

    graphic.drawingContext.restore();

    // Dégradé neomorphique haut/gauche (du bg vers blanc)
    graphic.push();
    const restoreClip = this.cvPage.createClippingMask(x, y, width, height, 12);

    const gradient = graphic.drawingContext.createRadialGradient(
      x + 20, y + 20, 0,    // centre proche du coin
      x + 20, y + 20, 150   // rayon court pour effet concentré
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // blanc fort au coin
    gradient.addColorStop(1, 'rgba(244, 243, 241, 0)');   // fade vers transparent

    graphic.drawingContext.fillStyle = gradient;
    graphic.drawingContext.fillRect(x, y, width, height);

    restoreClip();
    graphic.pop();
  }

  drawTag(text, tagX, tagY, tagWidth, tagHeight) {
    this.drawTagBase(text, tagX, tagY, tagWidth, tagHeight, true);
  }

  drawTagNoShadow(text, tagX, tagY, tagWidth, tagHeight) {
    this.drawTagBase(text, tagX, tagY, tagWidth, tagHeight, false);
  }

  drawTagBase(text, tagX, tagY, tagWidth, tagHeight, withShadow = false) {
    // Tag background - style néomorphique avec ombre grise légère
    graphic.drawingContext.save();
    graphic.drawingContext.shadowColor = 'rgba(120, 120, 120, 0.2)';
    graphic.drawingContext.shadowBlur = 1;
    graphic.drawingContext.shadowOffsetX = 1;
    graphic.drawingContext.shadowOffsetY = 1;

    this.cvPage.applyColor(this.cvPage.COLORS.BACKGROUND);
    graphic.noStroke();
    graphic.rect(tagX, tagY, tagWidth, tagHeight, 6);

    graphic.drawingContext.restore();

    // Tag text - perfectly centered en gras avec taille scalée
    const scaledSize = this.cvPage.getScaledSize(14);
    graphic.textAlign(graphic.LEFT, graphic.CENTER);
    this.cvPage.applyColor(this.cvPage.theme.colors.accent); // Texte en couleur accent comme les boutons actifs
    graphic.textSize(scaledSize);
    this.cvPage.applyFont();
    graphic.drawingContext.font = `bold ${scaledSize}px "Segoe UI"`; // Texte en gras avec taille scalée
    const textWidth = graphic.textWidth(text);
    const textX = tagX + (tagWidth - textWidth) / 2;
    const textY = tagY + tagHeight/2 - 1;
    this.renderTextWithGlitch(text, textX, textY, 14);
  }

  // === SECTION RENDERERS ===

  renderHeader(x, startY, width) {
    let y = startY;
    const personal = this.cvPage.content.personal;
    const theme = this.cvPage.theme;

    // Calculate text positions first to determine photo position
    const totalTextHeight = theme.typography.nameSize + theme.typography.titleSize + theme.typography.contactSize;
    const photoSize = this.cvPage.getScaledPhotoSize(theme.dimensions.photoSize);
    const remainingSpace = photoSize - totalTextHeight;
    const gapBetweenLines = remainingSpace / 3;

    // Calculate where contact line baseline is (avec BASELINE, le texte est AU-DESSUS de y)
    const contactBaselineY = startY + gapBetweenLines * 0.5 + theme.typography.nameSize + gapBetweenLines +
                             theme.typography.titleSize + gapBetweenLines;

    // Position photo so its bottom aligns with contact baseline
    const photoY = contactBaselineY - photoSize;
    const photoX = x + width - photoSize;

    // Render profile photo
    if (this.cvPage.assets.profileImage) {
      const restoreClipping = this.cvPage.createClippingMask(
        photoX, photoY, photoSize, photoSize, this.cvPage.getScaledPhotoSize(theme.dimensions.photoRadius)
      );
      graphic.image(this.cvPage.assets.profileImage, photoX, photoY, photoSize, photoSize);
      restoreClipping();
    }

    // Name
    y += gapBetweenLines * 0.5;
    this.cvPage.setTextStyle(theme.typography.nameSize, theme.colors.textPrimary);
    this.renderTextWithGlitch(personal.name, x, y, theme.typography.nameSize);
    y += theme.typography.nameSize + gapBetweenLines;

    // Job title
    this.cvPage.setTextStyle(theme.typography.titleSize, theme.colors.accent);
    this.renderTextWithGlitch(personal.jobTitle, x, y, theme.typography.titleSize, true); // bold
    y += theme.typography.titleSize + gapBetweenLines;

    // Contact info
    this.cvPage.setTextStyle(theme.typography.contactSize, theme.colors.textSecondary);
    const contact = `${personal.location}  |  ${personal.email}  |  ${personal.phone}  |  ${personal.website}`;
    this.renderTextWithGlitch(contact, x, y, theme.typography.contactSize, true); // bold
    y += theme.typography.contactSize;

    // Description below photo - même espacement qu'après la description
    const descriptionY = Math.max(y, photoY + photoSize) + this.cvPage.getScaledSpacing(40); // 40px après contact OU photo
    this.cvPage.setTextStyle(theme.typography.descriptionSize, theme.colors.textPrimary);
    const lines = this.cvPage.wrapText(this.cvPage.content.description, width, theme.typography.descriptionSize);
    let currentDescY = descriptionY;
    for (let i = 0; i < lines.length; i++) {
      const isLastLine = i === lines.length - 1;
      if (!isLastLine) {
        this.renderJustifiedText(lines[i], x, currentDescY, width, theme.typography.descriptionSize);
      } else {
        // Dernière ligne : alignement à gauche
        this.renderTextWithGlitch(lines[i], x, currentDescY, theme.typography.descriptionSize);
      }
      currentDescY += this.cvPage.getScaledSpacing(theme.dimensions.lineSpacing);
    }

    return currentDescY; // Fin de la description (headerSpacing sera ajouté après)
  }

  renderExperiences(x, startY, width) {
    let y = this.renderSectionTitle("Expérience professionnelle", x, startY, width);
    y += this.cvPage.getScaledSpacing(40); // Espacement uniforme titre → contenu
    y += this.cvPage.getScaledSpacing(16); // Offset supplémentaire pour compenser BASELINE des expériences

    const experiences = this.cvPage.content.experiences;
    for (let i = 0; i < experiences.length; i++) {
      y = this.renderExperienceItem(experiences[i], x, y, width);
      if (i < experiences.length - 1) { // Ne pas ajouter d'espace après la dernière
        y += this.cvPage.getScaledSpacing(40);
      }
    }

    return y;
  }

  renderSkills(x, startY, width) {
    let y = this.renderSectionTitle("Compétences", x, startY, width);
    y += this.cvPage.getScaledSpacing(30); // Espacement réduit titre → contenu
    // Calculate uniform offset for both skills and interests
    const uniformOffset = this.calculateUniformTagOffset();
    y = this.renderSkillsGrid(x, y, width, uniformOffset);
    return y;
  }

  renderEducation(x, startY, width) {
    let y = this.renderSectionTitle("Formation", x, startY, width);
    y += this.cvPage.getScaledSpacing(40); // Espacement uniforme titre → contenu

    const educations = this.cvPage.content.education;
    for (let i = 0; i < educations.length; i++) {
      y = this.renderEducationItem(educations[i], x, y, width);
      if (i < educations.length - 1) { // Ne pas ajouter d'espace après la dernière
        y += this.cvPage.getScaledSpacing(40);
      }
    }

    return y;
  }

  renderInterests(x, startY, width) {
    let y = this.renderSectionTitle("Centres d'intérêt", x, startY, width);
    y += this.cvPage.getScaledSpacing(30); // Espacement réduit titre → contenu
    // Use same uniform offset as skills
    const uniformOffset = this.calculateUniformTagOffset();
    y = this.renderInterestsGrid(x, y, width, uniformOffset);
    return y;
  }

  // === COMPONENT RENDERERS ===

  renderJustifiedText(text, x, y, width, fontSize) {
    const words = text.split(' ');
    if (words.length === 1) {
      this.renderTextWithGlitch(text, x, y, fontSize);
      return;
    }

    // Calculer la largeur totale des mots
    let totalWordsWidth = 0;
    for (const word of words) {
      totalWordsWidth += graphic.textWidth(word);
    }

    // Calculer l'espace à distribuer entre les mots
    const totalSpaceWidth = width - totalWordsWidth;
    const spacePerGap = totalSpaceWidth / (words.length - 1);

    // Rendre chaque mot avec l'espacement calculé
    let currentX = x;
    for (let i = 0; i < words.length; i++) {
      this.renderTextWithGlitch(words[i], currentX, y, fontSize);
      currentX += graphic.textWidth(words[i]) + spacePerGap;
    }
  }

  calculateUniformTagOffset() {
    // Find the longest category across both skills and interests
    this.cvPage.setTextStyle(14, this.cvPage.theme.colors.textSecondary);
    let maxCategoryWidth = 0;

    // Check all skills categories
    for (const group of this.cvPage.content.skills) {
      const categoryWidth = graphic.textWidth(group.category.toUpperCase());
      maxCategoryWidth = Math.max(maxCategoryWidth, categoryWidth);
    }

    // Check all interests categories
    for (const group of this.cvPage.content.interests) {
      const categoryWidth = graphic.textWidth(group.category.toUpperCase());
      maxCategoryWidth = Math.max(maxCategoryWidth, categoryWidth);
    }

    // Calculate uniform offset
    const baseMargin = 50;
    const pdfExtraMargin = this.cvPage.isPdfExport ? 20 : 0;
    return maxCategoryWidth + baseMargin + pdfExtraMargin;
  }

  renderTaskWithBoldTech(task, x, y, size) {
    // task est maintenant un tableau de segments {text, bold}
    graphic.textAlign(graphic.LEFT, graphic.BASELINE);
    this.cvPage.applyColor(this.cvPage.theme.colors.textMedium);

    const scaledSize = this.cvPage.getScaledSize(size);
    let currentX = x;

    for (const segment of task) {
      graphic.drawingContext.save();

      // Appliquer le style bold directement sur le context
      if (segment.bold) {
        graphic.drawingContext.font = `bold ${scaledSize}px "Segoe UI", sans-serif`;
      } else {
        graphic.drawingContext.font = `${scaledSize}px "Segoe UI", sans-serif`;
      }

      graphic.drawingContext.textAlign = 'left';
      graphic.drawingContext.textBaseline = 'alphabetic';

      // Rendre avec fillText
      graphic.drawingContext.fillText(segment.text, currentX, y);

      // Mesurer pour avancer
      currentX += graphic.drawingContext.measureText(segment.text).width;

      graphic.drawingContext.restore();
    }
  }

  renderSectionTitle(title, x, y, width) {
    this.cvPage.setTextStyle(this.cvPage.theme.typography.sectionTitleSize, this.cvPage.theme.colors.accent);
    this.renderTextWithGlitch(title, x, y, this.cvPage.theme.typography.sectionTitleSize, true); // bold = true
    const titleWidth = graphic.textWidth(title);

    // Decorative line avec shadow néomorphique (ajusté pour BASELINE)
    const lineY = y - this.cvPage.theme.typography.sectionTitleSize / 2 + 4;
    this.cvPage.animator.applyShadow(() => {
      graphic.stroke(...this.cvPage.theme.colors.accentLight);
      graphic.strokeWeight(1);
      graphic.line(x + titleWidth + 16, lineY, x + width, lineY);
      graphic.noStroke();
    });

    return y; // uniformSpacing de 40px sera ajouté après par l'appelant
  }

  renderExperienceItem(experience, x, y, width) {
    const theme = this.cvPage.theme;

    // Calculate the height of this experience item to size the side bar appropriately
    const itemHeight = this.cvPage.getScaledSpacing(30) + (experience.tasks.length * this.cvPage.getScaledSpacing(25));

    // Side bar avec shadow néomorphique - aligned with content (ajusté pour BASELINE)
    const barY = y - theme.typography.experienceMetaSize + 4; // Remonter pour aligner avec le haut du texte
    this.cvPage.animator.applyShadow(() => {
      this.cvPage.applyColor(this.cvPage.theme.colors.accentLight);
      graphic.noStroke();
      graphic.rect(x, barY, 2, itemHeight);
    });

    // Period and duration - offset to accommodate bar
    this.cvPage.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent);
    this.renderTextWithGlitch(experience.period, x + this.cvPage.getScaledSpacing(16), y, theme.typography.experienceMetaSize);

    graphic.textSize(this.cvPage.getScaledSize(12));
    this.cvPage.applyColor([...theme.colors.accent, 180]);
    this.renderTextWithGlitch(experience.duration, x + this.cvPage.getScaledSpacing(16), y + this.cvPage.getScaledSpacing(20), 12);

    // Title - shifted right
    this.cvPage.setTextStyle(theme.typography.experienceTitleSize, theme.colors.textPrimary);
    const titleText = experience.title + (experience.isFreelance ? " (freelance)" : "");
    this.renderTextWithGlitch(titleText, x + this.cvPage.LAYOUT_CONSTANTS.TITLE_OFFSET, y, theme.typography.experienceTitleSize);

    // Company - aligned right
    this.cvPage.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent, graphic.RIGHT);
    this.renderTextWithGlitch(experience.company, x + width, y, theme.typography.experienceMetaSize);

    // Tasks - shifted right avec technologies en gras
    this.cvPage.setTextStyle(theme.typography.experienceTaskSize, theme.colors.textMedium, graphic.LEFT);
    let taskY = y + this.cvPage.getScaledSpacing(30);
    for (const task of experience.tasks) {
      this.renderTaskWithBoldTech(task, x + this.cvPage.LAYOUT_CONSTANTS.TASK_OFFSET, taskY, theme.typography.experienceTaskSize);
      taskY += this.cvPage.getScaledSpacing(25); // Plus d'interligne entre les tâches
    }

    return taskY; // Remove extra spacing
  }

  renderEducationItem(education, x, y, width) {
    const theme = this.cvPage.theme;

    // Period (sans durée)
    this.cvPage.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent);
    this.renderTextWithGlitch(education.period, x, y, theme.typography.experienceMetaSize);

    // Title
    this.cvPage.setTextStyle(theme.typography.experienceTitleSize, theme.colors.textPrimary);
    this.renderTextWithGlitch(education.title, x + this.cvPage.LAYOUT_CONSTANTS.EDUCATION_TITLE_OFFSET, y, theme.typography.experienceTitleSize);

    // Institution - aligned right
    this.cvPage.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent, graphic.RIGHT);
    this.renderTextWithGlitch(education.institution, x + width, y, theme.typography.experienceMetaSize);

    // Detail if present (même x que le titre)
    let entryHeight = this.cvPage.getScaledSpacing(30);
    if (education.detail) {
      this.cvPage.setTextStyle(theme.typography.experienceTaskSize, theme.colors.textMedium, graphic.LEFT);
      this.renderTextWithGlitch(education.detail, x + this.cvPage.LAYOUT_CONSTANTS.EDUCATION_TITLE_OFFSET, y + this.cvPage.getScaledSpacing(25), theme.typography.experienceTaskSize);
      entryHeight = this.cvPage.getScaledSpacing(50);
    }

    return y + entryHeight;
  }

  renderSkillsGrid(x, y, width, uniformOffset) {
    return this.renderTagGrid(this.cvPage.content.skills, x, y, width, false, uniformOffset);
  }

  renderInterestsGrid(x, y, width, uniformOffset) {
    return this.renderTagGrid(this.cvPage.content.interests, x, y, width, false, uniformOffset);
  }

  renderTagGrid(groups, x, y, width, withShadow = false, uniformOffset = null) {
    // If no uniform offset provided, calculate it for this grid only
    if (uniformOffset === null) {
      this.cvPage.setTextStyle(14, this.cvPage.theme.colors.textSecondary);
      let maxCategoryWidth = 0;
      for (const group of groups) {
        const categoryWidth = graphic.textWidth(group.category.toUpperCase());
        maxCategoryWidth = Math.max(maxCategoryWidth, categoryWidth);
      }
      const baseMargin = 30;
      const pdfExtraMargin = this.cvPage.isPdfExport ? 20 : 0;
      uniformOffset = maxCategoryWidth + baseMargin + pdfExtraMargin;
    }

    for (const group of groups) {
      // Category - centrée verticalement avec les tags
      const tagHeight = this.cvPage.LAYOUT_CONSTANTS.TAG_HEIGHT;
      const baselineOffset = this.cvPage.isPdfExport ? 6 : 4; // Ajuster offset pour PDF
      const categoryY = y + tagHeight / 2 + baselineOffset; // Centrer visuellement (baseline + offset)
      this.cvPage.setTextStyle(14, this.cvPage.theme.colors.textSecondary);
      this.renderTextWithGlitch(group.category.toUpperCase(), x, categoryY, 14);

      let tagX = x + uniformOffset;
      let tagY = y;
      let lastTagY = tagY; // Tracker pour la dernière ligne de tags

      for (const item of group.items) {
        // Calculate exact text width with consistent font size (déjà scalé par setTextStyle)
        this.cvPage.setTextStyle(14, this.cvPage.theme.colors.textMedium);
        const textWidth = graphic.textWidth(item);
        const tagWidth = textWidth + this.cvPage.LAYOUT_CONSTANTS.TAG_PADDING;
        const tagHeight = this.cvPage.LAYOUT_CONSTANTS.TAG_HEIGHT;

        // Check if tag fits on current line BEFORE drawing
        if (tagX + tagWidth > x + width) {
          tagX = x + uniformOffset;
          tagY += this.cvPage.LAYOUT_CONSTANTS.TAG_LINE_SPACING;
        }

        // Render tag with or without shadow
        if (withShadow) {
          this.drawTag(item, tagX, tagY, tagWidth, tagHeight);
        } else {
          this.drawTagNoShadow(item, tagX, tagY, tagWidth, tagHeight);
        }

        tagX += tagWidth + 12;
        lastTagY = tagY; // Mettre à jour la dernière position
      }

      // Use the last tagY position + tag height + margin entre catégories
      y = lastTagY + this.cvPage.LAYOUT_CONSTANTS.TAG_HEIGHT + 25;
    }
    return y;
  }

  // === UI RENDERERS ===

  renderScrollIndicator({ x, y, width, height }) {
    if (this.cvPage.scrollState.max <= 0) return;

    // Track positioning
    const trackX = x + width - 12;
    const trackY = y + 20;
    const trackHeight = height - 40;
    const trackWidth = 2;

    // Background track avec shadow renforcé
    this.cvPage.animator.applyShadow(() => {
      this.cvPage.applyColor([...this.cvPage.theme.colors.accentLight, 26]);
      graphic.noStroke();
      graphic.rect(trackX, trackY, trackWidth, trackHeight, 2);
    });

    // Calculate scroll progress
    const scrollProgress = constrain(this.cvPage.scrollState.current / this.cvPage.scrollState.max, 0, 1);

    // Thumb positioning - rectangle vertical avec bords très arrondis
    const thumbWidth = 8;
    const thumbHeight = 22;
    const thumbTravel = trackHeight - thumbHeight;
    const thumbY = trackY + (scrollProgress * thumbTravel);
    const thumbX = trackX - 3; // Centré sur le track (trackWidth=2, thumbWidth=8)

    // Main thumb avec shadow renforcé et couleur plus pale
    this.cvPage.animator.applyShadow(() => {
      this.cvPage.applyColor([...this.cvPage.theme.colors.accent, 128]); // Alpha 0.5 pour plus pale
      graphic.rect(thumbX, thumbY, thumbWidth, thumbHeight, 20); // Border radius très arrondi
    });

    // Store bounds for interaction
    this.cvPage.ui.scrollbarBounds = {
      trackX, trackY, trackWidth, trackHeight,
      thumbX, thumbY, thumbWidth, thumbHeight
    };
  }

  renderExportButton({ x, y, width, height }) {
    const buttonWidth = 100;
    const buttonHeight = 30;
    const buttonX = x + width - buttonWidth - 60;
    const buttonY = y + height - buttonHeight - 15; // Bottom right position

    // Store bounds for interaction (ajustés pour le système WEBGL)
    // Les coordonnées de rendu sont déjà dans le bon système après translate()
    this.cvPage.ui.exportButtonBounds = {
      x: buttonX, y: buttonY,
      width: buttonWidth, height: buttonHeight
    };

    // Button background avec shadow léger
    this.cvPage.animator.applyLightShadow(() => {
      this.cvPage.applyColor(this.cvPage.COLORS.BACKGROUND); // Couleur background
      graphic.noStroke();
      graphic.rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
    });

    // Button text
    this.cvPage.applyColor(this.cvPage.theme.colors.accent); // Texte en couleur accent (vert)
    graphic.textAlign(graphic.CENTER, graphic.CENTER);
    this.cvPage.applyFont();
    graphic.textSize(12);
    this.renderTextWithGlitch("Export PDF", buttonX + buttonWidth/2, buttonY + buttonHeight/2, 12);
  }

  renderLanguageButtons({ x, y, width, height }) {
    const buttonSize = 32; // Boutons carrés
    const buttonSpacing = 6; // Espacement entre les boutons
    const buttonX = x - buttonSize - 15; // À l'extérieur, à gauche du container
    const buttonYFr = y; // Aligné avec le haut du container
    const buttonYEn = buttonYFr + buttonSize + buttonSpacing; // En dessous pour En

    // Render Fr button
    this.renderLanguageButton('Fr', buttonX, buttonYFr, buttonSize, this.cvPage.currentLanguage === 'fr');

    // Store bounds for Fr
    this.cvPage.ui.languageButtonBounds.fr = {
      x: buttonX, y: buttonYFr,
      width: buttonSize, height: buttonSize
    };

    // Render En button
    this.renderLanguageButton('En', buttonX, buttonYEn, buttonSize, this.cvPage.currentLanguage === 'en');

    // Store bounds for En
    this.cvPage.ui.languageButtonBounds.en = {
      x: buttonX, y: buttonYEn,
      width: buttonSize, height: buttonSize
    };
  }

  renderLanguageButton(label, x, y, size, isActive) {
    // Button background - même couleur que le CV
    this.cvPage.applyColor(this.cvPage.COLORS.BACKGROUND);
    graphic.noStroke();

    if (isActive) {
      // Active button avec ombre légère
      this.cvPage.animator.applyLightShadow(() => {
        graphic.rect(x, y, size, size, 6);
      });
    } else {
      // Inactive button sans ombre
      graphic.rect(x, y, size, size, 6);
    }

    // Button text
    graphic.textAlign(graphic.CENTER, graphic.CENTER);
    this.cvPage.applyFont();
    graphic.textSize(14);

    if (isActive) {
      // Active: couleur accent (vert)
      this.cvPage.applyColor(this.cvPage.theme.colors.accent);
      graphic.drawingContext.font = `bold 14px "Segoe UI"`;
    } else {
      // Inactive: couleur grise
      this.cvPage.applyColor(this.cvPage.theme.colors.textSecondary);
    }

    this.renderTextWithGlitch(label, x + size/2, y + size/2, 14);
  }

  renderDownloadButton({ x, y, width, height }) {
    const buttonSize = 32; // Même taille que les boutons de langue
    const buttonX = x - buttonSize - 15; // Même x que les boutons de langue
    const buttonY = y + height - buttonSize; // Aligné avec le bas du container

    // Store bounds for interaction
    this.cvPage.ui.downloadButtonBounds = {
      x: buttonX, y: buttonY,
      width: buttonSize, height: buttonSize
    };

    // Button background avec ombre légère
    this.cvPage.animator.applyLightShadow(() => {
      this.cvPage.applyColor(this.cvPage.COLORS.BACKGROUND);
      graphic.noStroke();
      graphic.rect(buttonX, buttonY, buttonSize, buttonSize, 6);
    });

    // Download icon (flèche dessinée comme Chrome)
    const centerX = buttonX + buttonSize/2;
    const centerY = buttonY + buttonSize/2;
    const iconSize = 14; // Taille de l'icône

    // Couleur accent avec opacité réduite (50%)
    this.cvPage.applyColor([...this.cvPage.theme.colors.accent, 128]);
    graphic.noStroke();

    // Tige verticale de la flèche
    const stemWidth = 1.5;
    const stemHeight = iconSize * 0.6;
    graphic.rect(centerX - stemWidth/2, centerY - iconSize/2, stemWidth, stemHeight);

    // Triangle pointant vers le bas
    graphic.beginShape();
    graphic.vertex(centerX, centerY + iconSize/2 - 2); // Pointe
    graphic.vertex(centerX - iconSize/3, centerY - 2); // Gauche
    graphic.vertex(centerX + iconSize/3, centerY - 2); // Droite
    graphic.endShape(graphic.CLOSE);

    // Ligne horizontale en bas (la "surface")
    graphic.strokeWeight(1.5);
    graphic.stroke(...this.cvPage.theme.colors.accent, 128);
    graphic.line(centerX - iconSize/2.5, centerY + iconSize/2 + 2,
                 centerX + iconSize/2.5, centerY + iconSize/2 + 2);
    graphic.noStroke();
  }
}