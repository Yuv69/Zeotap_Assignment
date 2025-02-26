import React from "react";
import "./Toolbar.css";

const Toolbar = ({ 
  onBold, onItalic, onColorChange, 
  onTrim, onUpper, onLower, onRemoveDuplicates, onFindReplace, 
  onExport, onSaveToCloud, onLoadFromCloud 
}) => {
  return (
    <div className="toolbar">
      {/* Text Formatting */}
      <button onClick={onBold}><b>B</b></button>
      <button onClick={onItalic}><i>I</i></button>
      <input type="color" onChange={(e) => onColorChange(e.target.value)} />

      {/* Data Quality Functions */}
      <button onClick={onTrim}>TRIM</button>
      <button onClick={onUpper}>UPPER</button>
      <button onClick={onLower}>LOWER</button>
      <button onClick={onRemoveDuplicates}>Remove Duplicates</button>
      <button onClick={onFindReplace}>Find & Replace</button>

      {/* Export & Cloud Save Buttons */}
      <button onClick={onExport}>Export to CSV</button>
      <button onClick={onSaveToCloud}>Save to Cloud</button>
      <button onClick={onLoadFromCloud}>Load from Cloud</button>
    </div>
  );
};

export default Toolbar;


