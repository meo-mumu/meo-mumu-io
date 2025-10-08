const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const colormap = require('colormap');
const interpolate = require('color-interpolate');
const Tweakpane = require('tweakpane');
import Particle from './Particle.js'

const settings = {
	// dimensions: [window.innerWidth, window.innerHeight],
	dimensions: [1080, 1080],
	animate: true,
};

const params = {
	scl: 20,
	inc_x: 0.03,
	inc_y: 0.03,
	inc_z: 0.005,
	numParticles: 1000,
	frotFactor: 0.1
};


// init parameters particles
const particles = [];
let particle;

// init parameters perlinGrid
let perlinGrid = [];
let zoff = 0;

// init parameters cursor
const cursor = { x: 0, y: 0 };
let elCanvas;
const factor = 1000;

const sketch = ({ context, width, height, canvas }) => {

	// interaction with mouse
	elCanvas = canvas;
	canvas.addEventListener('mousemove', onMouseMove);

	// push particles
	for (let i = 0; i < params.numParticles; i++) {
		particle = new Particle({ width, height, frotFactor: params.frotFactor });

		particles.push(particle);
	}

	// background
	context.fillStyle = 'rgba(30, 30, 30)';
	context.fillRect(0, 0, width, height);

	return ({ context, width, height, frame }) => {

		// background
		// context.fillStyle = 'rgba(30, 30, 30)';
		// context.fillRect(0, 0, width, height);

		// init perlinGrid
		const cols = Math.floor(width / params.scl);
		const rows = Math.floor(height / params.scl);
		initPerlinGrid(cols, rows);

		// draw perlinGrid
		//  drawPerlinGrid(context, perlinGrid, rows, cols);

		console.log(particles.length);
		particles.forEach(particle => {
			// particle.ax = factor * (cursor.x - particle.x);
			// particle.ay = factor * (cursor.y - particle.y);
			particle.follow(perlinGrid, params.scl);
			particle.update();
			particle.drawParticles(context);
		});

	};
};


const initPerlinGrid = (cols, rows) => {
	let yoff = 0;
	for (let y = 0; y < rows; y++) {
		let xoff = 0;
		for (let x = 0; x < cols; x++) {
			let n = random.noise3D(xoff, yoff, zoff);
			// create a vector from noise
			const angle = n * 2 * Math.PI;
			let v = { x: Math.cos(angle), y: Math.sin(angle) }
			// save vector in perlinGrid
			if (!perlinGrid[x]) {
				perlinGrid[x] = [];
			}
			perlinGrid[x][y] = v;
			xoff += params.inc_x;
		}
		yoff += params.inc_y;
	}
	zoff += params.inc_z;
};

const drawPerlinGrid = (context, grid, rows, cols) => {
	context.strokeStyle = 'white';
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			const v = grid[x][y];
			context.beginPath();
			context.moveTo(x * params.scl, y * params.scl);
			context.lineTo(x * params.scl + v.x * params.scl, y * params.scl + v.y * params.scl);
			context.stroke();
		}
	}

};

const onMouseMove = (e) => {
	const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
	const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;
	cursor.x = x;
	cursor.y = y;
};



const createPane = () => {
	const pane = new Tweakpane.Pane();
	let folder;

	folder = pane.addFolder({ title: 'Lourdeur '});
	folder.addInput(params, 'numParticles', { min: 1, max: 10000, step: 50 });
	folder.addInput(params, 'scl', { min: 10, max: 100, step : 1 });
	folder.addInput(params, 'frotFactor', { min: 0.01, max: 1 });
	folder.addInput(params, 'inc_x', { min: 0.01, max: 0.5 });
	folder.addInput(params, 'inc_y', { min: 0.01, max: 0.5 });
	folder.addInput(params, 'inc_z', { min: 0.001, max: 0.01 });
	

};

createPane();
canvasSketch(sketch, settings);

