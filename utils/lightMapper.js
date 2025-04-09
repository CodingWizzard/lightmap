// Lightmap function that creates actual lightmap textures
async function createLightmapTexture(scene, meshes, quality) {
    console.log("Starting lightmap process");

    // Quality settings for the lightmap resolution
    const qualitySettings = {
        low: 256,
        medium: 512,
        high: 1024
    };

    const textureSize = qualitySettings[quality] || qualitySettings.medium;
    console.log(`Using texture size: ${textureSize}`);

    // Create a simple ambient light to ensure scene is visible
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.3;
    ambientLight.diffuse = new BABYLON.Color3(1, 1, 1);

    // Create a render target texture to capture the scene lighting
    const renderTarget = new BABYLON.RenderTargetTexture("lightmapRenderTarget", textureSize, scene);
    scene.customRenderTargets.push(renderTarget);

    // Add all meshes to the render target
    meshes.forEach(mesh => renderTarget.renderList.push(mesh));

    // Process each mesh
    meshes.forEach((mesh, index) => {
        console.log(`Processing mesh: ${mesh.name || 'Mesh ' + index}`);

        // Make sure mesh is visible
        mesh.isVisible = true;

        // Ensure the mesh has a material
        if (!mesh.material) {
            console.log(`Creating new material for mesh: ${mesh.name || 'Mesh ' + index}`);
            mesh.material = new BABYLON.StandardMaterial(mesh.name + "_material", scene);
            mesh.material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        }

        // Create a lightmap texture for this mesh
        mesh.lightmapTexture = new BABYLON.Texture(null, scene, false, false);
        mesh.lightmapTexture._texture = renderTarget._texture;

        // Store a reference to the mesh's material for the lightmap effect
        mesh.lightmapApplied = true;
    });

    // Render the scene to the render target
    renderTarget.render();
    renderTarget.refreshRate = 0; // Only render once

    // Store the render target for later export
    scene.lightmapRenderTarget = renderTarget;

    return new Promise((resolve) => {
        console.log("Lightmap generation complete");
        resolve();
    });
}

async function bakeLightmap(scene, meshes, quality) {
    console.log('Starting lightmap baking process');

    // Basic validation
    if (!scene || !meshes || !Array.isArray(meshes) || meshes.length === 0) {
        console.error('Invalid scene or meshes for lightmap baking');
        alert('Error: Could not bake lightmap. Check console for details.');
        return;
    }

    let loadingDiv = null;

    try {
        // Show loading indicator
        loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = 'Baking lightmap...';
        loadingDiv.style.position = 'absolute';
        loadingDiv.style.top = '50%';
        loadingDiv.style.left = '50%';
        loadingDiv.style.transform = 'translate(-50%, -50%)';
        loadingDiv.style.color = 'white';
        loadingDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
        loadingDiv.style.padding = '1rem';
        loadingDiv.style.borderRadius = '0.5rem';
        loadingDiv.style.zIndex = '1000';
        document.body.appendChild(loadingDiv);

        // Process the meshes with our simplified function
        await createLightmapTexture(scene, meshes, quality);

        // Remove loading indicator
        if (loadingDiv && loadingDiv.parentNode) {
            document.body.removeChild(loadingDiv);
        }

        console.log('Lightmap process completed');

        // Show success message
        showLightmapStatus(meshes);

        // Force a render to ensure everything is visible
        scene.render();
    } catch (error) {
        console.error('Error during lightmap process:', error);

        // Clean up loading indicator
        if (loadingDiv && loadingDiv.parentNode) {
            document.body.removeChild(loadingDiv);
        }

        // Show error message to user
        alert(`Error during lightmap baking: ${error.message}`);
    }
}

// Function to show lightmap status and provide download option
function showLightmapStatus(meshes) {
    if (!meshes || !Array.isArray(meshes)) return;

    console.log('Showing lightmap status dialog');

    // Get the scene from the first mesh
    const scene = meshes[0].getScene();

    // Create a container for the status message
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.left = '10px';
    container.style.backgroundColor = 'rgba(0,0,0,0.7)';
    container.style.padding = '15px';
    container.style.borderRadius = '5px';
    container.style.zIndex = '1000';
    container.style.maxWidth = '300px';
    container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

    // Add a title
    const title = document.createElement('div');
    title.textContent = 'Lightmap Process Complete';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '16px';
    title.style.marginBottom = '10px';
    title.style.color = 'white';
    container.appendChild(title);

    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '8px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.lineHeight = '1';
    closeButton.onclick = () => {
        if (container.parentNode) {
            document.body.removeChild(container);
        }
    };
    container.appendChild(closeButton);

    // Add a success message
    const message = document.createElement('div');
    message.textContent = `Successfully processed ${meshes.length} objects in the scene.`;
    message.style.color = 'white';
    message.style.marginBottom = '15px';
    container.appendChild(message);

    // Add download button for the lightmap
    if (scene) {
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Generate Lightmaps';
        downloadButton.style.backgroundColor = '#4CAF50';
        downloadButton.style.color = 'white';
        downloadButton.style.border = 'none';
        downloadButton.style.padding = '8px 12px';
        downloadButton.style.borderRadius = '4px';
        downloadButton.style.cursor = 'pointer';
        downloadButton.style.marginBottom = '15px';
        downloadButton.style.width = '100%';
        downloadButton.style.fontWeight = 'bold';
        downloadButton.onclick = () => {
            downloadLightmapAsPNG(scene);
        };
        container.appendChild(downloadButton);
    }

    // Add instructions
    const instructions = document.createElement('div');
    instructions.innerHTML = 'You can now adjust the light position using the sliders on the right side of the screen.';
    instructions.style.color = '#aaa';
    instructions.style.fontSize = '14px';
    instructions.style.lineHeight = '1.4';
    container.appendChild(instructions);

    // Add the container to the document
    document.body.appendChild(container);

    // Auto-remove after 60 seconds (longer to give time to download)
    setTimeout(() => {
        if (container.parentNode) {
            document.body.removeChild(container);
        }
    }, 60000);
}

// Function to create and download lightmap textures for meshes
function downloadLightmapAsPNG(scene) {
    if (!scene) {
        console.error('No scene available');
        alert('Error: Cannot generate lightmaps');
        return;
    }

    try {
        console.log('Generating lightmap textures...');

        // Show a loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.textContent = 'Generating lightmaps...';
        loadingMessage.style.position = 'fixed';
        loadingMessage.style.top = '50%';
        loadingMessage.style.left = '50%';
        loadingMessage.style.transform = 'translate(-50%, -50%)';
        loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingMessage.style.color = 'white';
        loadingMessage.style.padding = '20px';
        loadingMessage.style.borderRadius = '5px';
        loadingMessage.style.zIndex = '1000';
        document.body.appendChild(loadingMessage);

        // Get all meshes that we want to create lightmaps for
        const meshesToProcess = scene.meshes.filter(mesh => {
            // Filter out helper objects, cameras, etc.
            return mesh.isVisible &&
                !mesh.name.includes('helper') &&
                !mesh.name.includes('Helper') &&
                mesh.getIndices() &&
                mesh.getIndices().length > 0;
        });

        console.log(`Found ${meshesToProcess.length} meshes to process`);

        // Create lightmaps for each mesh
        setTimeout(() => {
            try {
                // Create a container for the lightmap selection
                const container = document.createElement('div');
                container.style.position = 'fixed';
                container.style.top = '50%';
                container.style.left = '50%';
                container.style.transform = 'translate(-50%, -50%)';
                container.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                container.style.color = 'white';
                container.style.padding = '20px';
                container.style.borderRadius = '5px';
                container.style.zIndex = '1000';
                container.style.maxWidth = '80%';
                container.style.maxHeight = '80vh';
                container.style.overflowY = 'auto';
                container.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';

                // Add a title
                const title = document.createElement('h2');
                title.textContent = 'Download Lightmaps';
                title.style.textAlign = 'center';
                title.style.marginBottom = '20px';
                container.appendChild(title);

                // Add a close button
                const closeButton = document.createElement('button');
                closeButton.textContent = 'X';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.backgroundColor = 'transparent';
                closeButton.style.border = 'none';
                closeButton.style.color = 'white';
                closeButton.style.fontSize = '20px';
                closeButton.style.cursor = 'pointer';
                closeButton.onclick = () => document.body.removeChild(container);
                container.appendChild(closeButton);

                // Add instructions
                const instructions = document.createElement('p');
                instructions.textContent = 'Select a mesh to download its lightmap:';
                instructions.style.marginBottom = '15px';
                container.appendChild(instructions);

                // Create a grid for the lightmap previews
                const grid = document.createElement('div');
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
                grid.style.gap = '15px';
                container.appendChild(grid);

                // Process each mesh
                meshesToProcess.forEach((mesh, index) => {
                    // Create a lightmap for this mesh
                    const lightmapCanvas = createLightmapForMesh(mesh, scene, 256);

                    // Create a card for this mesh
                    const card = document.createElement('div');
                    card.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    card.style.borderRadius = '5px';
                    card.style.padding = '10px';
                    card.style.display = 'flex';
                    card.style.flexDirection = 'column';
                    card.style.alignItems = 'center';
                    card.style.cursor = 'pointer';
                    card.style.transition = 'background-color 0.2s';
                    card.onmouseover = () => card.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    card.onmouseout = () => card.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';

                    // Add the mesh name
                    const meshName = document.createElement('div');
                    meshName.textContent = mesh.name || `Mesh ${index + 1}`;
                    meshName.style.fontWeight = 'bold';
                    meshName.style.marginBottom = '10px';
                    meshName.style.textAlign = 'center';
                    card.appendChild(meshName);

                    // Add the lightmap preview
                    const preview = document.createElement('img');
                    preview.src = lightmapCanvas.toDataURL('image/png');
                    preview.style.width = '100%';
                    preview.style.height = 'auto';
                    preview.style.borderRadius = '3px';
                    preview.style.marginBottom = '10px';
                    card.appendChild(preview);

                    // Add download button
                    const downloadBtn = document.createElement('button');
                    downloadBtn.textContent = 'Download Lightmap';
                    downloadBtn.style.backgroundColor = '#4CAF50';
                    downloadBtn.style.color = 'white';
                    downloadBtn.style.border = 'none';
                    downloadBtn.style.padding = '8px 12px';
                    downloadBtn.style.borderRadius = '4px';
                    downloadBtn.style.cursor = 'pointer';
                    downloadBtn.style.width = '100%';
                    downloadBtn.onclick = (e) => {
                        e.stopPropagation(); // Prevent card click
                        // Download the lightmap
                        const link = document.createElement('a');
                        link.download = `lightmap-${mesh.name || 'mesh-' + index}-${new Date().getTime()}.png`;
                        link.href = lightmapCanvas.toDataURL('image/png');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                    card.appendChild(downloadBtn);

                    // Add the card to the grid
                    grid.appendChild(card);
                });

                // Remove the loading message
                document.body.removeChild(loadingMessage);

                // Add the container to the document
                document.body.appendChild(container);

            } catch (error) {
                console.error('Error generating lightmaps:', error);
                alert(`Error: ${error.message}`);
                // Remove the loading message
                if (loadingMessage.parentNode) {
                    document.body.removeChild(loadingMessage);
                }
            }
        }, 100);

    } catch (error) {
        console.error('Error setting up lightmap generation:', error);
        alert(`Error: ${error.message}`);
    }
}

// Function to create a lightmap for a mesh
function createLightmapForMesh(mesh, scene, size = 256) {
    // Create a canvas for the lightmap
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Fill with a dark background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, size, size);

    try {
        // Get mesh information
        const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
        const indices = mesh.getIndices();
        const uvs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);

        if (!positions || !normals || !indices) {
            console.warn(`Mesh ${mesh.name} is missing required vertex data`);
            return canvas;
        }

        // Get all lights in the scene
        const lights = scene.lights;

        // Create a grid to represent our lightmap
        const gridSize = size / 2; // Higher resolution for better quality
        const lightmapData = new Array(gridSize * gridSize * 3).fill(0); // RGB values

        // Determine mesh type for better UV mapping
        const isWall = mesh.name.toLowerCase().includes('wall');
        const isGround = mesh.name.toLowerCase().includes('ground') || mesh.name.toLowerCase().includes('floor');
        const isBox = mesh.name.toLowerCase().includes('box');
        const isSphere = mesh.name.toLowerCase().includes('sphere');

        // For each triangle in the mesh
        for (let i = 0; i < indices.length; i += 3) {
            const idx1 = indices[i] * 3;
            const idx2 = indices[i + 1] * 3;
            const idx3 = indices[i + 2] * 3;

            // Get the vertices of the triangle
            const v1 = new BABYLON.Vector3(positions[idx1], positions[idx1 + 1], positions[idx1 + 2]);
            const v2 = new BABYLON.Vector3(positions[idx2], positions[idx2 + 1], positions[idx2 + 2]);
            const v3 = new BABYLON.Vector3(positions[idx3], positions[idx3 + 1], positions[idx3 + 2]);

            // Get the normals of the triangle
            const n1 = new BABYLON.Vector3(normals[idx1], normals[idx1 + 1], normals[idx1 + 2]);
            const n2 = new BABYLON.Vector3(normals[idx2], normals[idx2 + 1], normals[idx2 + 2]);
            const n3 = new BABYLON.Vector3(normals[idx3], normals[idx3 + 1], normals[idx3 + 2]);

            // Get UVs if available
            let uv1, uv2, uv3;
            if (uvs && uvs.length >= indices[i] * 2 + 2) {
                const uvIdx1 = indices[i] * 2;
                const uvIdx2 = indices[i + 1] * 2;
                const uvIdx3 = indices[i + 2] * 2;
                uv1 = new BABYLON.Vector2(uvs[uvIdx1], uvs[uvIdx1 + 1]);
                uv2 = new BABYLON.Vector2(uvs[uvIdx2], uvs[uvIdx2 + 1]);
                uv3 = new BABYLON.Vector2(uvs[uvIdx3], uvs[uvIdx3 + 1]);
            } else {
                // Generate UVs based on mesh type
                if (isWall) {
                    // For walls, use height (y) and width (x or z)
                    const useX = Math.abs(n1.z) > Math.abs(n1.x); // Determine wall orientation
                    uv1 = new BABYLON.Vector2(useX ? (v1.x + 5) / 10 : (v1.z + 5) / 10, (v1.y + 2.5) / 5);
                    uv2 = new BABYLON.Vector2(useX ? (v2.x + 5) / 10 : (v2.z + 5) / 10, (v2.y + 2.5) / 5);
                    uv3 = new BABYLON.Vector2(useX ? (v3.x + 5) / 10 : (v3.z + 5) / 10, (v3.y + 2.5) / 5);
                } else if (isGround) {
                    // For ground, use x and z
                    uv1 = new BABYLON.Vector2((v1.x + 5) / 10, (v1.z + 5) / 10);
                    uv2 = new BABYLON.Vector2((v2.x + 5) / 10, (v2.z + 5) / 10);
                    uv3 = new BABYLON.Vector2((v3.x + 5) / 10, (v3.z + 5) / 10);
                } else if (isBox) {
                    // For boxes, use a simple planar mapping based on normal
                    if (Math.abs(n1.y) > Math.abs(n1.x) && Math.abs(n1.y) > Math.abs(n1.z)) {
                        // Top/bottom face
                        uv1 = new BABYLON.Vector2((v1.x + 0.5) / 1, (v1.z + 0.5) / 1);
                        uv2 = new BABYLON.Vector2((v2.x + 0.5) / 1, (v2.z + 0.5) / 1);
                        uv3 = new BABYLON.Vector2((v3.x + 0.5) / 1, (v3.z + 0.5) / 1);
                    } else if (Math.abs(n1.x) > Math.abs(n1.z)) {
                        // Side face (x)
                        uv1 = new BABYLON.Vector2((v1.z + 0.5) / 1, (v1.y + 0.5) / 1);
                        uv2 = new BABYLON.Vector2((v2.z + 0.5) / 1, (v2.y + 0.5) / 1);
                        uv3 = new BABYLON.Vector2((v3.z + 0.5) / 1, (v3.y + 0.5) / 1);
                    } else {
                        // Side face (z)
                        uv1 = new BABYLON.Vector2((v1.x + 0.5) / 1, (v1.y + 0.5) / 1);
                        uv2 = new BABYLON.Vector2((v2.x + 0.5) / 1, (v2.y + 0.5) / 1);
                        uv3 = new BABYLON.Vector2((v3.x + 0.5) / 1, (v3.y + 0.5) / 1);
                    }
                } else if (isSphere) {
                    // For spheres, use spherical mapping
                    const mapToUV = (vertex) => {
                        const dir = vertex.normalize();
                        const u = 0.5 + Math.atan2(dir.z, dir.x) / (2 * Math.PI);
                        const v_coord = 0.5 - Math.asin(dir.y) / Math.PI;
                        return new BABYLON.Vector2(u, v_coord);
                    };
                    uv1 = mapToUV(v1);
                    uv2 = mapToUV(v2);
                    uv3 = mapToUV(v3);
                } else {
                    // Default planar mapping
                    uv1 = new BABYLON.Vector2(0.5 + v1.x / 10, 0.5 + v1.z / 10);
                    uv2 = new BABYLON.Vector2(0.5 + v2.x / 10, 0.5 + v2.z / 10);
                    uv3 = new BABYLON.Vector2(0.5 + v3.x / 10, 0.5 + v3.z / 10);
                }
            }

            // Calculate the center of the triangle
            const center = v1.add(v2).add(v3).scale(1 / 3);

            // Calculate the average normal of the triangle
            const normal = n1.add(n2).add(n3).normalize();

            // Apply world matrix to get world position and normal
            const worldCenter = BABYLON.Vector3.TransformCoordinates(center, mesh.getWorldMatrix());
            const worldNormal = BABYLON.Vector3.TransformNormal(normal, mesh.getWorldMatrix()).normalize();

            // Calculate lighting for this triangle
            let lightR = 0.1; // Ambient light
            let lightG = 0.1;
            let lightB = 0.1;

            // Add contribution from each light
            for (const light of lights) {
                if (!light.isEnabled()) continue;

                let contributionR = 0;
                let contributionG = 0;
                let contributionB = 0;

                // Get light color
                const lightColor = light.diffuse || new BABYLON.Color3(1, 1, 1);

                if (light instanceof BABYLON.PointLight) {
                    // Direction from point to surface
                    const lightDir = light.position.subtract(worldCenter).normalize();
                    // Diffuse lighting
                    const dot = BABYLON.Vector3.Dot(worldNormal, lightDir);
                    if (dot > 0) {
                        // Calculate distance attenuation
                        const distance = BABYLON.Vector3.Distance(light.position, worldCenter);
                        const attenuation = 1.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);
                        const intensity = dot * light.intensity * attenuation;

                        // Add colored light contribution
                        contributionR = intensity * lightColor.r;
                        contributionG = intensity * lightColor.g;
                        contributionB = intensity * lightColor.b;

                        // Add shadow effect for walls
                        if (isWall || isBox) {
                            // Simple shadow calculation - check if light is above or below
                            const verticalFactor = Math.max(0, lightDir.y * 0.5 + 0.5);
                            contributionR *= verticalFactor;
                            contributionG *= verticalFactor;
                            contributionB *= verticalFactor;

                            // Add shadow gradient based on distance from light
                            const shadowFactor = Math.max(0, 1 - distance / 15);
                            contributionR *= shadowFactor;
                            contributionG *= shadowFactor;
                            contributionB *= shadowFactor;
                        }
                    }
                } else if (light instanceof BABYLON.DirectionalLight) {
                    // Diffuse lighting with directional light
                    const dot = BABYLON.Vector3.Dot(worldNormal, light.direction.scale(-1));
                    if (dot > 0) {
                        const intensity = dot * light.intensity;
                        contributionR = intensity * lightColor.r;
                        contributionG = intensity * lightColor.g;
                        contributionB = intensity * lightColor.b;
                    }
                } else if (light instanceof BABYLON.HemisphericLight) {
                    // Hemispheric lighting
                    const dot = BABYLON.Vector3.Dot(worldNormal, light.direction);
                    const intensity = (dot * 0.5 + 0.5) * light.intensity;
                    contributionR = intensity * lightColor.r;
                    contributionG = intensity * lightColor.g;
                    contributionB = intensity * lightColor.b;
                }

                lightR += contributionR;
                lightG += contributionG;
                lightB += contributionB;
            }

            // Clamp the light intensity
            lightR = Math.max(0.1, Math.min(1.0, lightR));
            lightG = Math.max(0.1, Math.min(1.0, lightG));
            lightB = Math.max(0.1, Math.min(1.0, lightB));

            // Map UVs to grid coordinates
            const mapUVToGrid = (uv) => {
                const x = Math.floor(uv.x * gridSize);
                const y = Math.floor(uv.y * gridSize);
                return {
                    x: Math.max(0, Math.min(gridSize - 1, x)),
                    y: Math.max(0, Math.min(gridSize - 1, y))
                };
            };

            const g1 = mapUVToGrid(uv1);
            const g2 = mapUVToGrid(uv2);
            const g3 = mapUVToGrid(uv3);

            // Triangle rasterization using barycentric coordinates
            const minX = Math.max(0, Math.min(gridSize - 1, Math.min(g1.x, g2.x, g3.x)));
            const maxX = Math.max(0, Math.min(gridSize - 1, Math.max(g1.x, g2.x, g3.x)));
            const minY = Math.max(0, Math.min(gridSize - 1, Math.min(g1.y, g2.y, g3.y)));
            const maxY = Math.max(0, Math.min(gridSize - 1, Math.max(g1.y, g2.y, g3.y)));

            // Function to check if a point is inside a triangle using barycentric coordinates
            const pointInTriangle = (px, py, v1x, v1y, v2x, v2y, v3x, v3y) => {
                const area = 0.5 * (-v2y * v3x + v1y * (-v2x + v3x) + v1x * (v2y - v3y) + v2x * v3y);
                const s = 1 / (2 * area) * (v1y * v3x - v1x * v3y + (v3y - v1y) * px + (v1x - v3x) * py);
                const t = 1 / (2 * area) * (v1x * v2y - v1y * v2x + (v1y - v2y) * px + (v2x - v1x) * py);
                return s >= 0 && t >= 0 && (s + t) <= 1;
            };

            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    // Check if point is inside triangle
                    if (pointInTriangle(x, y, g1.x, g1.y, g2.x, g2.y, g3.x, g3.y)) {
                        const idx = (y * gridSize + x) * 3;
                        // Use maximum value to avoid overwriting brighter areas
                        lightmapData[idx] = Math.max(lightmapData[idx], lightR * 255);
                        lightmapData[idx + 1] = Math.max(lightmapData[idx + 1], lightG * 255);
                        lightmapData[idx + 2] = Math.max(lightmapData[idx + 2], lightB * 255);
                    }
                }
            }
        }

        // Create an ImageData object to draw the lightmap
        const imageData = ctx.createImageData(gridSize, gridSize);
        for (let i = 0; i < lightmapData.length; i += 3) {
            const idx = (i / 3) * 4;
            imageData.data[idx] = lightmapData[i]; // R
            imageData.data[idx + 1] = lightmapData[i + 1]; // G
            imageData.data[idx + 2] = lightmapData[i + 2]; // B
            imageData.data[idx + 3] = 255; // Alpha
        }

        // Create a temporary canvas to upscale the lightmap
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = gridSize;
        tempCanvas.height = gridSize;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);

        // Draw the upscaled lightmap to the main canvas
        ctx.drawImage(tempCanvas, 0, 0, size, size);

        // Apply blur to smooth the lightmap
        ctx.filter = 'blur(4px)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';

        // Add a subtle grid pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= size; i += size / 16) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();
        }

        // Add mesh name as a watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(mesh.name || 'Unnamed Mesh', size / 2, size - 10);

    } catch (error) {
        console.error(`Error creating lightmap for mesh ${mesh.name}:`, error);
        // Draw an error message on the canvas
        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Error', size / 2, size / 2);
    }

    return canvas;
}