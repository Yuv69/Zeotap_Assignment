import React, { useState, useEffect } from "react";
import Toolbar from "./Toolbar";
import FormulaBar from "./FormulaBar";
import ChartComponent from "./ChartComponent";
import { db, ref, set, get } from "../firebaseConfig"; // ✅ Corrected Import Path
import "./Sheet.css";

const ROWS = 10;
const COLS = 5;

const Sheet = () => {
  const loadData = () => {
    const savedData = localStorage.getItem("spreadsheetData");
    return savedData
      ? JSON.parse(savedData)
      : Array.from({ length: ROWS }, () =>
          Array(COLS).fill({ value: "", formula: "", style: { color: "#000000" } })
        );
  };

  const [data, setData] = useState(loadData());
  const [selectedCell, setSelectedCell] = useState(null);
  const [formula, setFormula] = useState("");

  useEffect(() => {
    localStorage.setItem("spreadsheetData", JSON.stringify(data));
  }, [data]);

  const evaluateFormula = (formula) => {
    try {
      if (typeof formula !== "string" || !formula.startsWith("=")) return formula;

      let expression = formula.substring(1);

      if (/SUM|AVERAGE|MAX|MIN|COUNT/.test(expression)) {
        const match = expression.match(/(SUM|AVERAGE|MAX|MIN|COUNT)\((\w\d+):(\w\d+)\)/);
        if (!match) return "ERROR";

        const [, func, startRef, endRef] = match;
        const startCol = startRef[0].charCodeAt(0) - 65;
        const endCol = endRef[0].charCodeAt(0) - 65;
        const startRow = parseInt(startRef.slice(1)) - 1;
        const endRow = parseInt(endRef.slice(1)) - 1;

        let values = [];
        if (startCol === endCol) {
          for (let r = startRow; r <= endRow; r++) {
            values.push(parseFloat(data[r]?.[startCol]?.value) || 0);
          }
        } else if (startRow === endRow) {
          for (let c = startCol; c <= endCol; c++) {
            values.push(parseFloat(data[startRow]?.[c]?.value) || 0);
          }
        } else {
          return "ERROR";
        }

        switch (func) {
          case "SUM": return values.reduce((a, b) => a + b, 0);
          case "AVERAGE": return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          case "MAX": return Math.max(...values);
          case "MIN": return Math.min(...values);
          case "COUNT": return values.filter((v) => v !== 0).length;
          default: return "ERROR";
        }
      }

      return new Function(`return ${expression}`)();
    } catch {
      return "ERROR";
    }
  };

  const handleChange = (row, col, inputValue) => {
    const value = String(inputValue);
    const isFormula = value.startsWith("=");

    const newData = data.map((r, rowIndex) =>
      rowIndex === row
        ? r.map((cell, colIndex) =>
            colIndex === col ? { ...cell, value: isFormula ? evaluateFormula(value) : value, formula: isFormula ? value : "" } : cell
          )
        : r
    );
    setData(newData);
  };

  const handleFormulaChange = (newFormula) => {
    if (!selectedCell) return;
    setFormula(newFormula);

    const [row, col] = selectedCell;
    const result = evaluateFormula(newFormula);

    handleChange(row, col, result);
  };

  const applyStyle = (style) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    const newData = data.map((r, rowIndex) =>
      rowIndex === row
        ? r.map((cell, colIndex) =>
            colIndex === col ? { ...cell, style: { ...cell.style, ...style } } : cell
          )
        : r
    );
    setData(newData);
  };

  const handleDrag = (row, col) => {
    if (!selectedCell) return;
    const [startRow, startCol] = selectedCell;
    const copiedCell = data[startRow][startCol];

    const newData = data.map((r, rowIndex) =>
      rowIndex >= startRow && rowIndex <= row
        ? r.map((cell, colIndex) =>
            colIndex >= startCol && colIndex <= col
              ? { ...cell, value: copiedCell.value, style: copiedCell.style }
              : cell
          )
        : r
    );

    setData(newData);
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(row => {
      let rowData = row.map(cell => `"${cell.value}"`).join(",");
      csvContent += rowData + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "spreadsheet_data.csv");
    document.body.appendChild(link);
    link.click();
  };

  const saveToFirebase = () => {
    set(ref(db, "spreadsheetData"), data);
  };

  const loadFromFirebase = async () => {
    const snapshot = await get(ref(db, "spreadsheetData"));
    if (snapshot.exists()) {
      setData(snapshot.val());
    }
  };

  return (
    <div>
      <Toolbar
        onBold={() => applyStyle({ fontWeight: "bold" })}
        onItalic={() => applyStyle({ fontStyle: "italic" })}
        onColorChange={(color) => applyStyle({ color })}
        onExport={exportToCSV}
        onSaveToCloud={saveToFirebase}
        onLoadFromCloud={loadFromFirebase}
      />
      <FormulaBar formula={formula} onFormulaChange={handleFormulaChange} />
      <div className="sheet-container">
        <table>
          <thead>
            <tr>
              <th></th>
              {[...Array(COLS)].map((_, col) => (
                <th key={col}>{String.fromCharCode(65 + col)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{rowIndex + 1}</td>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={cell.formula || cell.value}
                      style={{ ...cell.style }}
                      onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                      onMouseDown={() => setSelectedCell([rowIndex, colIndex])}
                      onMouseEnter={() => handleDrag(rowIndex, colIndex)}
                      onFocus={() => {
                        setSelectedCell([rowIndex, colIndex]);
                        setFormula(cell.formula || cell.value);
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ChartComponent data={data} />
    </div>
  );
};

export default Sheet;

















