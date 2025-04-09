function BakeControls({ onBake, onQualityChange }) {
    try {
        const [quality, setQuality] = React.useState('medium');
        
        const handleQualityChange = (e) => {
            setQuality(e.target.value);
            onQualityChange(e.target.value);
        };

        return (
            <div className="controls-panel mt-4" data-name="bake-controls">
                <div className="control-group">
                    <label className="control-label">Bake Quality</label>
                    <select 
                        value={quality} 
                        onChange={handleQualityChange}
                        className="w-full p-2 bg-gray-700 rounded"
                        data-name="quality-select"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <button 
                    onClick={onBake}
                    className="button-primary w-full"
                    data-name="bake-button"
                >
                    Bake Lightmap
                </button>
            </div>
        );
    } catch (error) {
        console.error('BakeControls error:', error);
        reportError(error);
        return null;
    }
}
