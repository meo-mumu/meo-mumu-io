const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const eases = require('eases');
const colormap = require('colormap');
const interpolate = require('color-interpolate');


const colors = colormap({
	colormap: 'salinity',
	nshades: 1000,
});


export default class Particle {
	constructor({ width, height, frotFactor }) {
		this.width = width;
		this.height = height;

		// aspect
		this.radius = 2;
		// this.color = colors[0]
		this.color = random.pick(colors);
		// this.color = "white"
		this.colorsIndex = 0;

		// position
		this.x = random.range(0, width);
		this.y = random.range(0, height);

		// acceleration
		this.ax = 0;
		this.ay = 0;

		// velocity
		this.vx = 0;
		this.vy = 0;

		// frottement
		this.frotFactor = 1 - frotFactor;
	}

	edge() {
		if (this.x > this.width) {
			this.x = 0;
		}
		if (this.x < 0) {
			this.x = this.width;
		}
		if (this.y > this.height) {
			this.y = 0;
		}
		if (this.y < 0) {
			this.y = this.height;
		}
	}


	follow(perlinGrid, scl) {
		const x = Math.floor(this.x / scl);
		const y = Math.floor(this.y / scl);
		// si le vecteur de force existe
		if (perlinGrid[x] && perlinGrid[x][y]) {
		const force = perlinGrid[x][y];
		this.ax = force.x;
		this.ay = force.y;
		}

	}

	update() {
		this.vx += this.ax;
		this.vy += this.ay;
		this.x += this.vx;
		this.y += this.vy;
		this.vx *= this.frotFactor;
		this.vy *= this.frotFactor;
		this.ax = 0;
		this.ay = 0;
		// parcours les couleurs au fur et a mesures
		// this.colorsIndex += 1;
		// if (this.colorsIndex >= colors.length) {
		// 	this.colorsIndex = 0;
		// }
		// this.color = colors[this.colorsIndex];

	}

	drawParticles(context) {
		context.save();
		context.translate(this.x, this.y);
		// context.fillStyle = random.pick(colors);
		context.fillStyle = this.color;
		// ajout effet de flou
		context.globalAlpha = 0.3;

		context.beginPath();
		context.arc(0, 0, this.radius, 0, Math.PI * 2);
		context.fill();
		context.restore();
		this.edge();
	}

}