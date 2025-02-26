import React from "react";
import "./FormulaBar.css";

const FormulaBar = ({ formula, onFormulaChange }) => {
  return (
    <div className="formula-bar">
      <span>fx</span>
      <input
        type="text"
        value={formula}
        onChange={(e) => onFormulaChange(e.target.value)}
        placeholder="Enter formula here..."
      />
    </div>
  );
};

export default FormulaBar;
