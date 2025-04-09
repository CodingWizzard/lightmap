function createDefaultScene(scene) {
    console.log('Creating default scene');

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 4,
        Math.PI / 4,
        30,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
    camera.minZ = 0.1; // Ensure near clipping plane is close enough

    // Default light
    const light = new BABYLON.PointLight(
        "light",
        new BABYLON.Vector3(0, 5, 0),
        scene
    );
    light.intensity = 1.0;

    // Add ambient light to ensure scene is visible
    const ambientLight = new BABYLON.HemisphericLight(
        "ambientLight",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    ambientLight.intensity = 0.2;

    // Create materials
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.9);

    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
    boxMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.9);

    const sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene);
    sphereMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.4, 0.4);

    // Create a sample room
    const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 10, height: 10 },
        scene
    );
    ground.material = groundMaterial;

    const wall1 = BABYLON.MeshBuilder.CreateBox(
        "wall1",
        { height: 5, width: 10, depth: 0.3 },
        scene
    );
    wall1.position = new BABYLON.Vector3(0, 2.5, 5);
    wall1.material = wallMaterial;

    const wall2 = BABYLON.MeshBuilder.CreateBox(
        "wall2",
        { height: 5, width: 10, depth: 0.3 },
        scene
    );
    wall2.position = new BABYLON.Vector3(0, 2.5, -5);
    wall2.material = wallMaterial;

    const wall3 = BABYLON.MeshBuilder.CreateBox(
        "wall3",
        { height: 5, width: 0.3, depth: 10 },
        scene
    );
    wall3.position = new BABYLON.Vector3(5, 2.5, 0);
    wall3.material = wallMaterial;

    const wall4 = BABYLON.MeshBuilder.CreateBox(
        "wall4",
        { height: 5, width: 0.3, depth: 10 },
        scene
    );
    wall4.position = new BABYLON.Vector3(-5, 2.5, 0);
    wall4.material = wallMaterial;

    // Create some objects in the room
    const box = BABYLON.MeshBuilder.CreateBox(
        "box",
        { size: 1 },
        scene
    );
    box.position = new BABYLON.Vector3(2, 0.5, 2);
    box.material = boxMaterial;

    const sphere = BABYLON.MeshBuilder.CreateSphere(
        "sphere",
        { diameter: 1 },
        scene
    );
    sphere.position = new BABYLON.Vector3(-2, 0.5, -2);
    sphere.material = sphereMaterial;

    // Force a render to ensure everything is visible
    scene.render();

    return {
        light,
        meshes: [ground, wall1, wall2, wall3, wall4, box, sphere]
    };
}

function updateLight(light, intensity, position) {
    if (light) {
        light.intensity = intensity;
        light.position = new BABYLON.Vector3(position.x, position.y, position.z);
    }
}
