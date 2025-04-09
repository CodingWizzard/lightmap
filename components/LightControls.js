function LightControls({ onLightUpdate }) {
    try {
        const [intensity, setIntensity] = React.useState(1);
        const [position, setPosition] = React.useState({ x: 0, y: 5, z: 0 });

        const handleIntensityChange = (e) => {
            const value = parseFloat(e.target.value);
            setIntensity(value);
            onLightUpdate({ intensity: value, position });
        };

        const handlePositionChange = (axis, value) => {
            const newPosition = { ...position, [axis]: parseFloat(value) };
            setPosition(newPosition);
            onLightUpdate({ intensity, position: newPosition });
        };

        return (
            <div className="controls-panel" data-name="light-controls">
                <div className="control-group">
                    <label className="control-label">Light Intensity</label>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={intensity}
                        onChange={handleIntensityChange}
                        className="slider-control"
                        data-name="intensity-slider"
                    />
                </div>
                <div className="control-group">
                    <label className="control-label">Position X</label>
                    <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.5"
                        value={position.x}
                        onChange={(e) => handlePositionChange('x', e.target.value)}
                        className="slider-control"
                        data-name="position-x-slider"
                    />
                </div>
                <div className="control-group">
                    <label className="control-label">Position Y</label>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={position.y}
                        onChange={(e) => handlePositionChange('y', e.target.value)}
                        className="slider-control"
                        data-name="position-y-slider"
                    />
                </div>
                <div className="control-group">
                    <label className="control-label">Position Z</label>
                    <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.5"
                        value={position.z}
                        onChange={(e) => handlePositionChange('z', e.target.value)}
                        className="slider-control"
                        data-name="position-z-slider"
                    />
                </div>
            </div>
        );
    } catch (error) {
        console.error('LightControls error:', error);
        reportError(error);
        return null;
    }
}
