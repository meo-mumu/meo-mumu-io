/**
 * Méthodes de rendu pour CvPageP5
 */
class CvPageRenderers {
  constructor(cvPage) {
    this.cvPage = cvPage;
  }

  // === CORE RENDERING ===

  render() {
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

    const sectionSpacing = this.cvPage.theme.dimensions.sectionSpacing;
    const headerSpacing = sectionSpacing * 1.5;
    let currentY = layout.content.startY;

    currentY = this.renderHeader(layout.content.x, currentY, layout.content.width);
    currentY += headerSpacing;

    currentY = this.renderExperiences(layout.content.x, currentY, layout.content.width);
    currentY += sectionSpacing;

    currentY = this.renderSkills(layout.content.x, currentY, layout.content.width);
    currentY += sectionSpacing;

    currentY = this.renderEducation(layout.content.x, currentY, layout.content.width);
    currentY += sectionSpacing;

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
    this.renderExportButton(layout.container);
  }

  // === CONTAINER AND BASIC DRAWING ===

  drawContainer({ x, y, width, height }) {
    // Utiliser l'intensité de shadow animée
    if (this.cvPage.emergenceState.isAnimating) {
      this.cvPage.animator.applyAnimatedShadow(() => {
        graphic.fill(...this.cvPage.COLORS.BACKGROUND);
        graphic.noStroke();
        graphic.rect(x, y, width, height, 12);
      });
    } else {
      this.cvPage.animator.applyShadow(() => {
        graphic.fill(...this.cvPage.COLORS.BACKGROUND);
        graphic.noStroke();
        graphic.rect(x, y, width, height, 12);
      });
    }
  }

  drawTag(text, tagX, tagY, tagWidth, tagHeight) {
    this.drawTagBase(text, tagX, tagY, tagWidth, tagHeight, true);
  }

  drawTagNoShadow(text, tagX, tagY, tagWidth, tagHeight) {
    this.drawTagBase(text, tagX, tagY, tagWidth, tagHeight, false);
  }

  drawTagBase(text, tagX, tagY, tagWidth, tagHeight, withShadow = false) {
    // Tag background
    const drawTag = () => {
      this.cvPage.applyColor(this.cvPage.theme.colors.accentBackground);
      graphic.stroke(...this.cvPage.theme.colors.accentLight);
      graphic.strokeWeight(1);
      graphic.rect(tagX, tagY, tagWidth, tagHeight, 8);
      if (!withShadow) graphic.noStroke();
    };

    if (withShadow) {
      this.cvPage.animator.applyShadow(drawTag);
    } else {
      drawTag();
    }

    // Tag text - perfectly centered
    graphic.textAlign(graphic.LEFT, graphic.CENTER);
    this.cvPage.applyColor(this.cvPage.theme.colors.textMedium);
    graphic.textSize(14);
    this.cvPage.applyFont();
    const textWidth = graphic.textWidth(text);
    const textX = tagX + (tagWidth - textWidth) / 2;
    const textY = tagY + tagHeight/2 - 1;
    graphic.text(text, textX, textY);
  }

  // === SECTION RENDERERS ===

  renderHeader(x, startY, width) {
    let y = startY;
    const personal = this.cvPage.content.personal;
    const theme = this.cvPage.theme;

    // Photo positioning
    const photoSize = theme.dimensions.photoSize;
    const photoX = x + width - photoSize;

    // Render profile photo avec shadow néomorphique
    if (this.cvPage.assets.profileImage) {
      // Shadow background d'abord
      this.cvPage.animator.applyShadow(() => {
        this.cvPage.applyColor([255, 255, 255]); // Couleur blanche pour créer le shadow
        graphic.noStroke();
        graphic.rect(photoX, startY, photoSize, photoSize, theme.dimensions.photoRadius);
      });

      // Puis l'image par-dessus
      const restoreClipping = this.cvPage.createClippingMask(
        photoX, startY, photoSize, photoSize, theme.dimensions.photoRadius
      );
      graphic.image(this.cvPage.assets.profileImage, photoX, startY, photoSize, photoSize);
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
    this.cvPage.applyColor(theme.colors.textPrimary);
    graphic.text(personal.name, x, y);
    y += theme.typography.nameSize + gapBetweenLines;

    // Job title - use Courier font
    if (fonts.courier) graphic.textFont(fonts.courier);
    graphic.textSize(theme.typography.titleSize);
    this.cvPage.applyColor(theme.colors.accent);
    graphic.text(personal.jobTitle, x, y);
    y += theme.typography.titleSize + gapBetweenLines;

    // Contact info
    this.cvPage.setTextStyle(theme.typography.contactSize, theme.colors.textSecondary);
    const contact = `${personal.location}  |  ${personal.email}  |  ${personal.phone}  |  ${personal.website}`;
    graphic.text(contact, x, y);
    y += theme.typography.contactSize;

    // Description below photo with reduced spacing
    const descriptionY = startY + photoSize + 20; // Reduced spacing
    this.cvPage.setTextStyle(theme.typography.descriptionSize, theme.colors.textPrimary);
    const lines = this.cvPage.wrapText(this.cvPage.content.description, width, theme.typography.descriptionSize);
    let currentDescY = descriptionY;
    for (const line of lines) {
      graphic.text(line, x, currentDescY);
      currentDescY += theme.dimensions.lineSpacing;
    }

    return Math.max(y + gapBetweenLines * 0.5, currentDescY); // Clean end, no extra spacing
  }

  renderExperiences(x, startY, width) {
    let y = this.renderSectionTitle("Expérience professionnelle", x, startY, width);
    y += this.cvPage.LAYOUT_CONSTANTS.SECTION_SPACING;

    for (const experience of this.cvPage.content.experiences) {
      y = this.renderExperienceItem(experience, x, y, width);
      y += this.cvPage.LAYOUT_CONSTANTS.SECTION_SPACING;
    }

    return y;
  }

  renderSkills(x, startY, width) {
    let y = this.renderSectionTitle("Compétences", x, startY, width);
    y += this.cvPage.LAYOUT_CONSTANTS.SECTION_SPACING;
    y = this.renderSkillsGrid(x, y, width);
    return y;
  }

  renderEducation(x, startY, width) {
    let y = this.renderSectionTitle("Formation", x, startY, width);
    y += this.cvPage.LAYOUT_CONSTANTS.SECTION_SPACING;

    for (const education of this.cvPage.content.education) {
      y = this.renderEducationItem(education, x, y, width);
      y += this.cvPage.LAYOUT_CONSTANTS.SECTION_SPACING;
    }

    return y;
  }

  renderInterests(x, startY, width) {
    let y = this.renderSectionTitle("Centres d'intérêt", x, startY, width);
    y += this.cvPage.LAYOUT_CONSTANTS.SECTION_SPACING;
    y = this.renderInterestsGrid(x, y, width);
    return y;
  }

  // === COMPONENT RENDERERS ===

  renderSectionTitle(title, x, y, width) {
    // Use Courier font for section titles
    if (fonts.courier) graphic.textFont(fonts.courier);
    graphic.textSize(this.cvPage.theme.typography.sectionTitleSize);
    graphic.textAlign(graphic.LEFT, graphic.TOP);
    this.cvPage.applyColor(this.cvPage.theme.colors.accent);

    graphic.text(title, x, y);
    const titleWidth = graphic.textWidth(title);

    // Decorative line avec shadow néomorphique
    this.cvPage.animator.applyShadow(() => {
      graphic.stroke(...this.cvPage.theme.colors.accentLight);
      graphic.strokeWeight(1);
      graphic.line(x + titleWidth + 16, y + 12, x + width, y + 12);
      graphic.noStroke();
    });

    return y + 30;
  }

  renderExperienceItem(experience, x, y, width) {
    const theme = this.cvPage.theme;

    // Calculate the height of this experience item to size the side bar appropriately
    const itemHeight = 30 + (experience.tasks.length * 20);

    // Side bar avec shadow néomorphique - aligned with content
    this.cvPage.animator.applyShadow(() => {
      this.cvPage.applyColor(this.cvPage.theme.colors.accentLight);
      graphic.noStroke();
      graphic.rect(x, y, 2, itemHeight);
    });

    // Period and duration - offset to accommodate bar
    this.cvPage.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent);
    graphic.text(experience.period, x + 10, y);

    graphic.textSize(12);
    this.cvPage.applyColor([...theme.colors.accent, 180]);
    graphic.text(experience.duration, x + 10, y + 20);

    // Title - shifted right
    this.cvPage.setTextStyle(theme.typography.experienceTitleSize, theme.colors.textPrimary);
    const titleText = experience.title + (experience.isFreelance ? " (freelance)" : "");
    graphic.text(titleText, x + this.cvPage.LAYOUT_CONSTANTS.TITLE_OFFSET, y);

    // Company - aligned right
    this.cvPage.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent, graphic.RIGHT);
    graphic.text(experience.company, x + width, y);

    // Tasks - shifted right
    this.cvPage.setTextStyle(theme.typography.experienceTaskSize, theme.colors.textMedium, graphic.LEFT);
    let taskY = y + 30;
    for (const task of experience.tasks) {
      graphic.text(task, x + this.cvPage.LAYOUT_CONSTANTS.TASK_OFFSET, taskY);
      taskY += this.cvPage.LAYOUT_CONSTANTS.SECTION_SPACING;
    }

    return taskY; // Remove extra spacing
  }

  renderEducationItem(education, x, y, width) {
    const theme = this.cvPage.theme;

    // Period and duration
    this.cvPage.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent);
    graphic.text(education.period, x, y);

    graphic.textSize(12);
    this.cvPage.applyColor([...theme.colors.accent, 180]);
    graphic.text(education.duration, x, y + 20);

    // Title
    this.cvPage.setTextStyle(theme.typography.experienceTitleSize, theme.colors.textPrimary);
    graphic.text(education.title, x + this.cvPage.LAYOUT_CONSTANTS.EDUCATION_TITLE_OFFSET, y);

    // Institution - aligned right
    this.cvPage.setTextStyle(theme.typography.experienceMetaSize, theme.colors.accent, graphic.RIGHT);
    graphic.text(education.institution, x + width, y);

    // Detail if present
    let entryHeight = 30;
    if (education.detail) {
      this.cvPage.setTextStyle(theme.typography.experienceTaskSize, theme.colors.textMedium, graphic.LEFT);
      graphic.text("• " + education.detail, x + this.cvPage.LAYOUT_CONSTANTS.EDUCATION_DETAIL_OFFSET, y + 25);
      entryHeight = 50;
    }

    return y + entryHeight; // Remove extra spacing
  }

  renderSkillsGrid(x, y, width) {
    return this.renderTagGrid(this.cvPage.content.skills, x, y, width, false);
  }

  renderInterestsGrid(x, y, width) {
    return this.renderTagGrid(this.cvPage.content.interests, x, y, width, false);
  }

  renderTagGrid(groups, x, y, width, withShadow = false) {
    for (const group of groups) {
      // Category - use Courier font
      if (fonts.courier) graphic.textFont(fonts.courier);
      graphic.textSize(14);
      graphic.textAlign(graphic.LEFT, graphic.TOP);
      this.cvPage.applyColor(this.cvPage.theme.colors.textSecondary);
      graphic.text(group.category.toUpperCase(), x, y);

      // Tags
      let tagX = x + this.cvPage.LAYOUT_CONSTANTS.TAG_OFFSET;
      let tagY = y - 5;

      for (const item of group.items) {
        // Calculate exact text width with consistent font size
        this.cvPage.setTextStyle(14, this.cvPage.theme.colors.textMedium);
        const textWidth = graphic.textWidth(item);
        const tagWidth = textWidth + this.cvPage.LAYOUT_CONSTANTS.TAG_PADDING;
        const tagHeight = this.cvPage.LAYOUT_CONSTANTS.TAG_HEIGHT;

        // Check if tag fits on current line BEFORE drawing
        if (tagX + tagWidth > x + width) {
          tagX = x + this.cvPage.LAYOUT_CONSTANTS.TAG_OFFSET;
          tagY += this.cvPage.LAYOUT_CONSTANTS.TAG_LINE_SPACING;
        }

        // Render tag with or without shadow
        if (withShadow) {
          this.drawTag(item, tagX, tagY, tagWidth, tagHeight);
        } else {
          this.drawTagNoShadow(item, tagX, tagY, tagWidth, tagHeight);
        }

        tagX += tagWidth + 10;
      }

      // Use the last tagY position + tag height + small margin
      y = tagY + this.cvPage.LAYOUT_CONSTANTS.TAG_HEIGHT + 15;
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
    const trackWidth = 4;

    // Background track avec shadow renforcé
    this.cvPage.animator.applyShadow(() => {
      this.cvPage.applyColor([...this.cvPage.theme.colors.accentLight, 26]);
      graphic.noStroke();
      graphic.rect(trackX, trackY, trackWidth, trackHeight, 2);
    });

    // Calculate scroll progress
    const scrollProgress = constrain(this.cvPage.scrollState.current / this.cvPage.scrollState.max, 0, 1);

    // Thumb positioning
    const thumbSize = 8;
    const thumbTravel = trackHeight - thumbSize;
    const thumbY = trackY + (scrollProgress * thumbTravel);
    const thumbX = trackX - 2;

    // Main thumb avec shadow renforcé
    this.cvPage.animator.applyShadow(() => {
      this.cvPage.applyColor(this.cvPage.theme.colors.accent);
      graphic.rect(thumbX, thumbY, thumbSize, thumbSize);
    });

    // Store bounds for interaction
    this.cvPage.ui.scrollbarBounds = {
      trackX, trackY, trackWidth, trackHeight,
      thumbX, thumbY, thumbSize
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
    graphic.text("Export PDF", buttonX + buttonWidth/2, buttonY + buttonHeight/2);
  }
}