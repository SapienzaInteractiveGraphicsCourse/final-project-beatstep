import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import fire from '../../asset/textures/fire.png';

const loader = DefaultGeneralLoadingManager.getHandler("texture");

const _PS_fire = loader.load(fire);

const _PS_VS = `
uniform float pointMultiplier;
attribute float size;
attribute float angle;
attribute vec4 colour;
varying vec4 vColour;
varying vec2 vAngle;
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = size * pointMultiplier / gl_Position.w;
    vAngle = vec2(cos(angle), sin(angle));
    vColour = colour;
}`;

const _PS_FS = `
uniform sampler2D diffuseTexture;
varying vec4 vColour;
varying vec2 vAngle;
void main() {
    vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
    gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`;

// Spline to change color in point life
class LinearSpline {
    constructor(lerp) {
        this._points = [];
        this._lerp = lerp;
    }

    addPoint(t, d) {
        this._points.push([t, d]);
    }

    get(t) {
        let p1 = 0;

        for (let i = 0; i < this._points.length; i++) {
            if (this._points[i][0] >= t) {
                break;
            }
            p1 = i;
        }

        const p2 = Math.min(this._points.length - 1, p1 + 1);

        if (p1 == p2) {
            return this._points[p1][1];
        }

        return this._lerp(
            (t - this._points[p1][0]) / (
                this._points[p2][0] - this._points[p1][0]),
            this._points[p1][1], this._points[p2][1]);
    }
}


class ParticleSystem extends THREE.Points {
    /**
     * https://www.youtube.com/watch?v=YwfAAv3aIB8 - Cuz everything is better with 
     * particles, duh.
     * @param {Number} duration If null, the duration is infinite, else is in seconds
     * @param {Function} onFinish The callback function when the effect finishes
     */
    constructor(scene,camera,duration = null, particleImage = null, onFinish = ()=>{}) {
        // Adding uniforms values to Vertex/Fragment shaders
        const uniforms = {
            diffuseTexture: {
                value: particleImage || _PS_fire
            },
            pointMultiplier: { // TODO: check here
                value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
            },
        }

        let material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: _PS_VS,
            fragmentShader: _PS_FS,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });

        // Points system (creating buffer)
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
        geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
        geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

        super(geometry, material);
        this._scene = scene;
        this._scene.add(this);
        this._camera = camera;

        this.frustumCulled = false;

        this._particles = [];
        this._duration = duration;
        this._durationStart = duration;
        this._onFinish = onFinish;

        this._isStopped = false;

        this._alphaSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a);
        });
        this._alphaSpline.addPoint(0.0, 0.0);
        this._alphaSpline.addPoint(0.1, 1.0);
        this._alphaSpline.addPoint(0.6, 1.0);
        this._alphaSpline.addPoint(1.0, 0.0);
        this._colourSpline = new LinearSpline((t, a, b) => {
            const c = a.clone();
            return c.lerp(b, t);
        });
        this._colourSpline.addPoint(0.0, new THREE.Color(0xFFFF80));
        this._colourSpline.addPoint(1.0, new THREE.Color(0xFF8080));
        this._sizeSpline = new LinearSpline((t, a, b) => {
            return a + t * (b - a);
        });
        this._sizeSpline.addPoint(0.0, 1.0);
        this._sizeSpline.addPoint(0.5, 5.0);
        this._sizeSpline.addPoint(1.0, 1.0);

        this._generalPosition = [0,0,0];
        this._generalVelocity = [0,2,0];
        this._generalRadius = [3,3,3];
        this._generalLife = 0.6;
        this._particleSize = 4.0;

        this.updateGeometry();
    }

    updateGeometry() {
        const positions = [];
        const sizes = [];
        const colours = [];
        const angles = [];

        for (let p of this._particles) {
            positions.push(p.position.x, p.position.y, p.position.z);
            colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
            sizes.push(p.currentSize);
            angles.push(p.rotation);
        }

        this.geometry.setAttribute(
            'position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute(
            'size', new THREE.Float32BufferAttribute(sizes, 1));
        this.geometry.setAttribute(
            'colour', new THREE.Float32BufferAttribute(colours, 4));
        this.geometry.setAttribute(
            'angle', new THREE.Float32BufferAttribute(angles, 1));

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.colour.needsUpdate = true;
        this.geometry.attributes.angle.needsUpdate = true;
    }

    updateParticles(timeElapsed) {

        // Subtract life time
        for (let p of this._particles) {
            p.life -= timeElapsed;
        }

        // Filter only points that are alive
        this._particles = this._particles.filter(p => {
            return p.life > 0.0;
        });

        // Get effect
        for (let p of this._particles) {
            const t = 1.0 - p.life / p.maxLife;

            p.rotation += timeElapsed * 0.5;
            p.alpha = this._alphaSpline.get(t);
            p.currentSize = p.size * this._sizeSpline.get(t);
            p.colour.copy(this._colourSpline.get(t));

            p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));

            const drag = p.velocity.clone();
            drag.multiplyScalar(timeElapsed * 0.1);
            drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
            drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
            drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
            p.velocity.sub(drag);
        }

        // Sort to make them appear in order of distance
        this._particles.sort((a, b) => {
            const d1 = this._camera.position.distanceTo(a.position);
            const d2 = this._camera.position.distanceTo(b.position);

            if (d1 > d2) {
                return -1;
            }

            if (d1 < d2) {
                return 1;
            }

            return 0;
        });

    }

    addParticles(timeElapsed) {
        if (!this.gdfsghk) {
            this.gdfsghk = 0.0;
        }
        this.gdfsghk += timeElapsed;
        const n = Math.floor(this.gdfsghk * 75.0);
        this.gdfsghk -= n / 75.0;

        for (let i = 0; i < n; i++) {
            const life = (Math.random() * 0.75 + 0.25) * this._generalLife;
            const initPos = this._generalPosition;
            this._particles.push({
                position: new THREE.Vector3(
                    initPos[0] + (Math.random() * this._generalRadius[0] - 1) * 1.0,
                    initPos[1] + (Math.random() * this._generalRadius[1] - 1) * 1.0,
                    initPos[2] + (Math.random() * this._generalRadius[2] - 1) * 1.0),
                size: (Math.random() * 0.5 + 0.5) * this._particleSize,
                colour: new THREE.Color(),
                alpha: 1.0,
                life: life,
                maxLife: life,
                rotation: Math.random() * 2.0 * Math.PI,
                velocity: new THREE.Vector3(...this._generalVelocity),
            });
        }
    }

    update(timeElapsed) {
        if(this._isStopped) return;
        if(this._duration !== null){
            if(this._duration > 0){ 
                this._duration -= timeElapsed;
                this.addParticles(timeElapsed);
            }
            else{
                if(this._particles.length === 0){
                    this.removeFromParent();
                    this._onFinish();
                }
            }
            this.updateParticles(timeElapsed);
            this.updateGeometry();
        }
        else{
            this.addParticles(timeElapsed);
            this.updateParticles(timeElapsed);
            this.updateGeometry();
        }
        
    }

    setGeneralPosition(x,y,z){
        this._generalPosition = [x,y,z];
    }

    setGeneralVelocity(x,y,z){
        this._generalVelocity = [x,y,z];
    }

    setGeneralRadius(x,y,z){
        this._generalRadius = [x,y,z];
    }

    setParticleSize(size){
        this._particleSize = size;
    }

    setGeneralLife(t = 0.6){
        this._generalLife = t;
    }

    setDuration(seconds = null){
        this._durationStart = seconds;
    }

    reset(){
        if(this.parent == null) this._scene.add(this);
        this._duration = this._durationStart;
        this._isStopped = true;
    }

    start(){
        if(this.parent == null) this._scene.add(this);
        this._isStopped = false;
    }

    restart(){
        this.reset();
        this.start();
    }

}

export default ParticleSystem;