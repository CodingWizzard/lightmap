function App() {
    try {
        const [sceneData, setSceneData] = React.useState(null);
        const [quality, setQuality] = React.useState('medium');

        const handleSceneReady = (scene) => {
            const data = createDefaultScene(scene);
            setSceneData(data);
        };

        const handleLightUpdate = ({ intensity, position }) => {
            if (sceneData && sceneData.light) {
                updateLight(sceneData.light, intensity, position);
            }
        };

        const handleBake = async () => {
            if (sceneData && sceneData.meshes) {
                try {
                    await bakeLightmap(sceneData.meshes[0].getScene(), sceneData.meshes, quality);
                } catch (error) {
                    console.error('Error during lightmap baking:', error);
                }
            }
        };

        return (
            <div className="relative h-screen" data-name="app-container">
                <SceneCanvas onSceneReady={handleSceneReady} />
                <div className="absolute top-4 right-4 w-64" data-name="controls-container">
                    <LightControls onLightUpdate={handleLightUpdate} />
                    <BakeControls 
                        onBake={handleBake}
                        onQualityChange={setQuality}
                    />
                </div>
            </div>
        );
    } catch (error) {
        console.error('App error:', error);
        reportError(error);
        return null;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
