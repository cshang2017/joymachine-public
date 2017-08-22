const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE)
import Stats from 'stats-js'
import DAT from 'dat-gui'

function init(callback, update) {
    var container = document.createElement("div");
    document.body.appendChild(container);

    // Stats.
    var stats1, stats2, stats3;
    stats1 = new Stats();
    stats1.showPanel(0); // Panel 0 = fps
    stats1.domElement.style.cssText = "position:absolute;top:0px;left:0px;";
    container.appendChild(stats1.dom);
    stats2 = new Stats();
    stats2.showPanel(1); // Panel 0 = fps
    stats2.domElement.style.cssText = "position:absolute;top:0px;left:80px;";
    container.appendChild(stats2.dom);
    stats3 = new Stats();
    stats3.showPanel(2); // Panel 0 = fps
    stats3.domElement.style.cssText = "position:absolute;top:0px;left:160px;";
    container.appendChild(stats3.dom);

    var gui = new DAT.GUI();

    var sim = {
        container: container,

        gui: gui,
        stats1: stats1,
        stats2: stats2,
        stats3: stats3
    };

    ipcRenderer.on('load-mesh', function(event, meshPath) {
        meshDirectory = path.dirname(meshPath) + "/" // HACK, probably should write a better function here
        meshFileName = path.basename(meshPath)
        BABYLON.SceneLoader.Load(meshDirectory, meshFileName, engine, function(newScene) {
            var camera = getDefaultCamera(newScene);
            newScene.render()
        })
    })

    // run this function after the window loads
    window.addEventListener('load', function() {
        var scene = new THREE.Scene();
        scene.background = new THREE.Color(0x101010);

        var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2000);

        renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setFaceCulling(THREE.CullFaceNone);
        renderer.gammaInput = true;
        renderer.gammaOutput = false;
        renderer.shadowMap.enabled = true;

        var controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enableZoom = true;
        controls.target.set(0, 0, 0);
        controls.rotateSpeed = 0.3;
        controls.zoomSpeed = 1.0;
        controls.panSpeed = 2.0;

        sim.container.appendChild(renderer.domElement);

        // resize the canvas when the window changes
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);

        // assign THREE.js objects to the object we will return
        sim.scene = scene;
        sim.camera = camera;
        sim.renderer = renderer;

        // begin the animation loop
        (function tick() {
            stats1.begin();
            stats2.begin();
            stats3.begin();

            update(sim);
            renderer.render(scene, camera);

            stats1.end();
            stats2.end();
            stats3.end();
            requestAnimationFrame(tick);
        })();

        // Pass all of the necessary renderer/scene/gui references to the callback for this.
        return callback(sim);
    });
}

export default {
    init: init
}