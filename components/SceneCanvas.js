function SceneCanvas({ onSceneReady }) {
    try {
        const canvasRef = React.useRef(null);

        React.useEffect(() => {
            if (canvasRef.current) {
                const engine = new BABYLON.Engine(canvasRef.current, true);
                const scene = new BABYLON.Scene(engine);

                if (onSceneReady) {
                    onSceneReady(scene);
                }

                engine.runRenderLoop(() => {
                    scene.render();
                });

                window.addEventListener('resize', () => {
                    engine.resize();
                });

                return () => {
                    scene.dispose();
                    engine.dispose();
                };
            }
        }, []);

        return (
            <canvas 
                ref={canvasRef} 
                className="canvas-container" 
                data-name="scene-canvas"
            />
        );
    } catch (error) {
        console.error('SceneCanvas error:', error);
        reportError(error);
        return null;
    }
}
