class ShaderLandControls {
  constructor(shaderland) {
    this.shaderland = shaderland;
    this.pane = new Tweakpane.Pane();
    this.pane.element.style.display = 'none'; // caché par défaut

    // Agrandir et repositionner le panneau
    this.pane.element.style.width = '400px';
    this.pane.element.style.fontSize = '14px';
    this.pane.element.style.setProperty('right', 'auto', 'important');
    this.pane.element.style.setProperty('left', 'auto', 'important');
    this.pane.element.style.setProperty('transform', 'translateX(-150px)', 'important');

    // Store references to controls for dynamic visibility
    this.creatureControls = {};
    this.countControl = null;
    this.sizeControl = null;
    this.creaturesFolder = null;

    this._createPane();
  }

  _createPane() {
    // Navigation button
    this.pane.addButton({ title: 'Back to the main page' }).on('click', () => {
      switchTo('mainPage');
    });

    // FPS Monitor
    // this.pane.addMonitor(this.shaderland, 'fps', { label: 'FPS' });

    // Visual folder
    let visualFolder = this.pane.addFolder({ title: 'Visual' });
    visualFolder.addInput(this.shaderland, 'backgroundMode', {
      options: {
        Light: 'light',
        Dark: 'dark'
      },
      label: 'background'
    }).on('change', () => {
      // Redraw background when mode changes
      const bgColor = this.shaderland.backgroundMode === 'light'
        ? [244, 243, 241]
        : [0, 0, 0];
      graphic.background(...bgColor);
    });
    visualFolder.addInput(this.shaderland, 'clearScreen', { label: 'clear screen' });

    // Creatures folder
    this.creaturesFolder = this.pane.addFolder({ title: 'Creatures' });
    this.creaturesFolder.addInput(this.shaderland, 'creatureType', {
      options: {
        Pokemon: CreatureType.POKEMON,
        Particle: CreatureType.PARTICLE
      },
      label: 'type'
    }).on('change', () => {
      this._updateCreatureType();
    });

    // Create livestock size control with initial settings
    this._createLiveStockSizeControl();

    // Create size control with initial settings
    this._createSizeControl();

    // Dynamic creature controls (repel force, rotation, speed, size_amplitude, etc.)
    // Exclude 'size' as it needs dispose/recreate pattern like countControl
    const allCreatureControls = this._getAllPossibleControls('creatures');
    for (const [paramName, params] of Object.entries(allCreatureControls)) {
      if (paramName === 'size') continue; // Skip size, handled separately
      const input = this.creaturesFolder.addInput(this.shaderland, paramName, params);
      this.creatureControls[paramName] = input;
    }

    // Creature color Control folder
    let creaturesColorFolder = this.pane.addFolder({ title: 'Creatures colors' });
    creaturesColorFolder.addInput(this.shaderland, 'colorMode', {
      options: {
        Static: 'static',
        Rainbow: 'rainbow',
        Psychedelic: 'psychedelic'
      },
      label: 'mode'
    });
    creaturesColorFolder.addInput(this.shaderland, 'colorSpeed', {
      min: 0.1,
      max: 10,
      step: 0.1,
      label: 'speed shift'
    });
    creaturesColorFolder.addInput(this.shaderland, 'hueShift', {
      min: 0,
      max: 360,
      step: 1,
      label: 'hue shift'
    });
    creaturesColorFolder.addInput(this.shaderland, 'colorSaturation', {
      min: 0,
      max: 200,
      step: 1,
      label: 'saturation'
    });
    creaturesColorFolder.addInput(this.shaderland, 'colorBrightness', {
      min: 0,
      max: 200,
      step: 1,
      label: 'brightness'
    });

    // Movements folder - static ShaderLand environment controls
    let movementsFolder = this.pane.addFolder({ title: 'Movements' });
    movementsFolder.addInput(this.shaderland, 'wave_repel_force', {
      min: 0,
      max: 20,
      step: 0.1,
      label: 'wave repel force'
    });
    movementsFolder.addInput(this.shaderland, 'global_rotation', {
      min: 0,
      max: Math.PI * 2,
      step: 0.01,
      label: 'global rotation'
    });
    movementsFolder.addInput(this.shaderland, 'inc_x', {
      min: 0.01,
      max: 1,
      label: 'x oscillation'
    });
    movementsFolder.addInput(this.shaderland, 'inc_y', {
      min: 0.01,
      max: 1,
      label: 'y oscillation'
    });
    movementsFolder.addInput(this.shaderland, 'inc_z', {
      min: 0.001,
      max: 0.1,
      label: 'z oscillation'
    });

    // Initialize visibility based on current type
    this._updateControlsVisibility();
  }

  _getAllPossibleControls(section) {
    // Get union of all possible controls for all creature types for a given section
    const pokemonConfig = Pokemon.getControlsConfig()[section] || {};
    const particleConfig = Particle.getControlsConfig()[section] || {};

    // Merge configs (Pokemon has all Particle controls + its own)
    return { ...particleConfig, ...pokemonConfig };
  }

  _createLiveStockSizeControl() {
    // Get creature class settings
    const CreatureClass = Creatures.getClassForType(this.shaderland.creatureType);
    const settings = CreatureClass.getCreatureSettings();

    // Create count control with proper limits
    this.countControl = this.creaturesFolder.addInput(this.shaderland, 'num_creatures', {
      min: settings.countMin,
      max: settings.countMax,
      step: settings.countStep,
      label: 'livestock size'
    }).on('change', () => {
      this.shaderland._build_creatures();
    });
  }

  _createSizeControl() {
    // Get creature class config
    const CreatureClass = Creatures.getClassForType(this.shaderland.creatureType);
    const config = CreatureClass.getControlsConfig();
    const sizeParams = config.creatures.size;

    // Create size control with proper limits
    this.sizeControl = this.creaturesFolder.addInput(this.shaderland, 'size', sizeParams);
  }

  _updateCreatureType() {
    // Get new creature class settings
    const CreatureClass = Creatures.getClassForType(this.shaderland.creatureType);
    const settings = CreatureClass.getCreatureSettings();

    // Update creature count and size to defaults for this type
    this.shaderland.num_creatures = settings.defaultCount;
    this.shaderland.size = settings.defaultSize;

    // Dispose old count control and recreate with new limits
    if (this.countControl) {
      this.countControl.dispose();
    }
    this._createLiveStockSizeControl();

    // Dispose old size control and recreate with new limits
    if (this.sizeControl) {
      this.sizeControl.dispose();
    }
    this._createSizeControl();

    // Rebuild creatures and update visibility
    this.shaderland._build_creatures();
    this._updateControlsVisibility();
  }

  _updateControlsVisibility() {
    // Get class corresponding to current type
    const CreatureClass = Creatures.getClassForType(this.shaderland.creatureType);
    const config = CreatureClass.getControlsConfig();

    // Show/hide creature controls
    const availableCreatureControls = config.creatures || {};
    for (const [paramName, input] of Object.entries(this.creatureControls)) {
      input.hidden = !(paramName in availableCreatureControls);
    }
  }

  show() {
    if (this.pane) {
      this.pane.element.style.display = 'block';
    }
  }

  hide() {
    if (this.pane) {
      this.pane.element.style.display = 'none';
    }
  }
}
