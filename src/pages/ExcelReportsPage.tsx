import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/layouts/Sidebar';
import { useTheme } from '../context/ThemeContext';

interface CellData {
  value: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    backgroundColor?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    border?: boolean;
  };
  rowSpan?: number;
  colSpan?: number;
  merged?: boolean;
  isMergeStart?: boolean;
}

interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

type CellPos = { row: number; col: number };
type ColorPickerPos = { top: number; left: number };

type StyleKey = 'bold' | 'italic' | 'underline' | 'border';
type StyleState = 'on' | 'off' | 'mixed';

type ModalVariant = 'info' | 'warning' | 'error' | 'success';
type ModalState = {
  open: boolean;
  title: string;
  message: string;
  variant?: ModalVariant;
};

const toSansSerifItalic = (text: string) => {
  return String(text).replace(/[A-Za-z]/g, (ch) => {
    const code = ch.charCodeAt(0);

    // A-Z
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D608 + (code - 65));
    // a-z
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D622 + (code - 97));

    return ch;
  });
};

// Display-only: value'yu bozma, sadece görünümü dönüştür
const getDisplayValue = (raw: string, style?: CellData['style']) => {
  if (style?.italic) return toSansSerifItalic(raw);
  return raw;
};

const AppModal: React.FC<{
  isDarkMode: boolean;
  state: ModalState;
  onClose: () => void;
  primaryText?: string;
}> = ({ isDarkMode, state, onClose, primaryText = 'OK' }) => {
  if (!state.open) return null;

  const iconByVariant: Record<ModalVariant, React.ReactNode> = {
    info: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86l-8.02 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3.14l-8.02-14a2 2 0 0 0-3.42 0z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6" />
        <path d="M9 9l6 6" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2.5 2.5L16 9" />
      </svg>
    ),
  };

  const variant: ModalVariant = state.variant ?? 'info';

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-full max-w-md rounded-xl shadow-2xl border ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg ${
                  isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {iconByVariant[variant]}
              </div>

              <div className="flex-1">
                <div className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {state.title}
                </div>
                <div className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {state.message}
                </div>
              </div>

              <button
                onClick={onClose}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                aria-label="Close"
                title="Close (Esc)"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                    : 'bg-gray-900 border-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {primaryText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const THEME_COLORS: string[][] = [
  // Beyaz,  Siyah-Gri,  Koyu Yeşil,  Yeşil,    Lacivert,   Mavi,     Mor,      Pembe,      Kırmızı,   Turuncu,    Sarı
  ['#FFFFFF', '#000000', '#008000', '#9EF01A', '#0466C8', '#7BDFF2', '#9D4EDD', '#E27396', '#D00000', '#FAA307', '#FFFF3F'],
  ['#F2F2F2', '#7F7F7F', '#007200', '#16DB65', '#0353A4', '#48CAE4', '#7B2CBF', '#FF4D6D', '#D90429', '#F48C06', '#FCF300'],
  ['#D9D9D9', '#595959', '#006400', '#34D399', '#023E7D', '#00B4D8', '#5A189A', '#F72585', '#C1121F', '#F3722C', '#FFEA00'],
  ['#BFBFBF', '#3F3F3F', '#004B23', '#10B981', '#002855', '#0096C7', '#7209B7', '#F20089', '#9D0208', '#FB5607', '#FFD000'],
  ['#A6A6A6', '#262626', '#007F5F', '#059669', '#001845', '#023E8A', '#b5179e', '#DD2D4D', '#780000', '#E36414', '#F4E409'],
];

const STANDARD_COLORS: string[] = [
  '#FFFF00', '#F48C06', '#FF0000', '#F72585', '#C00000', '#92D050', '#00B050', '#007F5F',
  '#277DA1', '#00B0F0', '#0070C0', '#002060', '#6930C3', '#5A189A', '#774936', '#161a1d'
];

const ExcelReportsPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const [modal, setModal] = useState<ModalState>({ open: false, title: '', message: '', variant: 'info' });
  const openModal = (title: string, message: string, variant: ModalVariant = 'info') =>
    setModal({ open: true, title, message, variant });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const [selectedCell, setSelectedCell] = useState<CellPos | null>(null);
  const [editingCell, setEditingCell] = useState<CellPos | null>(null);
  const [selectedRange, setSelectedRange] = useState<CellRange | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const [cellData, setCellData] = useState<Record<string, CellData>>({});
  const [formulaBarValue, setFormulaBarValue] = useState('');

  const [history, setHistory] = useState<Record<string, CellData>[]>([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState<ColorPickerPos | null>(null);

  const formulaInputRef = useRef<HTMLInputElement>(null);
  const editingInputRef = useRef<HTMLInputElement>(null);
  const fillButtonRef = useRef<HTMLButtonElement>(null);

  const columns = useMemo(() => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], []);
  const rows = useMemo(() => Array.from({ length: 101 }, (_, i) => i + 1), []);

  const getCellKey = (row: number, col: string) => `${col}${row}`;

  const clampRange = (range: CellRange): CellRange => {
    return {
      startRow: Math.min(range.startRow, range.endRow),
      endRow: Math.max(range.startRow, range.endRow),
      startCol: Math.min(range.startCol, range.endCol),
      endCol: Math.max(range.startCol, range.endCol),
    };
  };

  const isCellInRange = (row: number, colIndex: number): boolean => {
    if (!selectedRange) return false;
    const r = clampRange(selectedRange);
    return row >= r.startRow && row <= r.endRow && colIndex >= r.startCol && colIndex <= r.endCol;
  };

  const saveToHistory = (newData: Record<string, CellData>) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const commitData = (newData: Record<string, CellData>) => {
    setCellData(newData);
    saveToHistory(newData);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setCellData(history[nextIndex]);
      setEditingCell(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCellData(history[nextIndex]);
      setEditingCell(null);
    }
  };

  const getCellValue = (row: number, col: string) => {
    const cellKey = getCellKey(row, col);
    return cellData[cellKey]?.value || '';
  };

  const getCellStyle = (row: number, col: string) => {
    const cellKey = getCellKey(row, col);
    return cellData[cellKey]?.style || {};
  };

  const isCellMergedHidden = (row: number, col: string) => {
    const cellKey = getCellKey(row, col);
    const info = cellData[cellKey];
    return info?.merged && !info?.isMergeStart;
  };

  const setSelectionToCell = (row: number, colIndex: number) => {
    setSelectedCell({ row, col: colIndex });
    setSelectedRange(null);
    setEditingCell(null);
    const cellKey = getCellKey(row, columns[colIndex]);
    setFormulaBarValue(cellData[cellKey]?.value || '');
  };

  const startEditing = (row: number, colIndex: number) => {
    setEditingCell({ row, col: colIndex });
    setSelectedCell({ row, col: colIndex });
    setSelectedRange(null);
    const cellKey = getCellKey(row, columns[colIndex]);
    setFormulaBarValue(cellData[cellKey]?.value || '');
    setTimeout(() => editingInputRef.current?.focus(), 0);
  };

  const commitCellValue = (row: number, colIndex: number, value: string) => {
    const col = columns[colIndex];
    const cellKey = getCellKey(row, col);
    const currentCell = cellData[cellKey] || { value: '' };
    const newData: Record<string, CellData> = {
      ...cellData,
      [cellKey]: { ...currentCell, value },
    };
    commitData(newData);
    setFormulaBarValue(value);
  };

  const handleCopy = () => {
    if (!selectedCell && !selectedRange) return;
    const r = selectedRange ? clampRange(selectedRange) : null;

    if (r) {
      let copyText = '';
      for (let rr = r.startRow; rr <= r.endRow; rr++) {
        const rowData: string[] = [];
        for (let cc = r.startCol; cc <= r.endCol; cc++) {
          const cellKey = getCellKey(rr, columns[cc]);
          rowData.push(cellData[cellKey]?.value || '');
        }
        copyText += rowData.join('\t') + '\n';
      }
      navigator.clipboard.writeText(copyText);
      return;
    }

    if (selectedCell) {
      const cellKey = getCellKey(selectedCell.row, columns[selectedCell.col]);
      navigator.clipboard.writeText(cellData[cellKey]?.value || '');
    }
  };

  const handlePaste = async () => {
    if (!selectedCell) return;
    const text = await navigator.clipboard.readText();
    commitCellValue(selectedCell.row, selectedCell.col, text);
    setEditingCell(null);
  };

  const handleCut = () => {
    if (!selectedCell && !selectedRange) return;
    handleCopy();

    if (selectedRange) {
      const r = clampRange(selectedRange);
      const newData = { ...cellData };

      for (let rr = r.startRow; rr <= r.endRow; rr++) {
        for (let cc = r.startCol; cc <= r.endCol; cc++) {
          const cellKey = getCellKey(rr, columns[cc]);
          if (newData[cellKey]) newData[cellKey] = { ...newData[cellKey], value: '' };
        }
      }

      commitData(newData);
      setEditingCell(null);
      return;
    }

    if (selectedCell) {
      commitCellValue(selectedCell.row, selectedCell.col, '');
      setEditingCell(null);
    }
  };

  const toggleCellStyle = (styleKey: 'bold' | 'italic' | 'underline' | 'border') => {
    if (!selectedCell && !selectedRange) return;

    const newData = { ...cellData };
    const applyTo = selectedRange ? clampRange(selectedRange) : null;

    const applyToOne = (row: number, colIndex: number) => {
      const cellKey = getCellKey(row, columns[colIndex]);
      const currentCell = newData[cellKey] || { value: '' };
      newData[cellKey] = {
        ...currentCell,
        style: {
          ...currentCell.style,
          [styleKey]: !currentCell.style?.[styleKey],
        },
      };
    };

    if (applyTo) {
      for (let rr = applyTo.startRow; rr <= applyTo.endRow; rr++) {
        for (let cc = applyTo.startCol; cc <= applyTo.endCol; cc++) applyToOne(rr, cc);
      }
    } else if (selectedCell) {
      applyToOne(selectedCell.row, selectedCell.col);
    }

    commitData(newData);
  };

  const setCellAlignment = (align: 'left' | 'center' | 'right') => {
    if (!selectedCell && !selectedRange) return;

    const newData = { ...cellData };
    const applyTo = selectedRange ? clampRange(selectedRange) : null;

    const applyToOne = (row: number, colIndex: number) => {
      const cellKey = getCellKey(row, columns[colIndex]);
      const currentCell = newData[cellKey] || { value: '' };
      newData[cellKey] = {
        ...currentCell,
        style: {
          ...currentCell.style,
          textAlign: align,
        },
      };
    };

    if (applyTo) {
      for (let rr = applyTo.startRow; rr <= applyTo.endRow; rr++) {
        for (let cc = applyTo.startCol; cc <= applyTo.endCol; cc++) applyToOne(rr, cc);
      }
    } else if (selectedCell) {
      applyToOne(selectedCell.row, selectedCell.col);
    }

    commitData(newData);
  };

  const setCellBackground = (color: string | null) => {
    if (!selectedCell && !selectedRange) return;

    const newData = { ...cellData };
    const applyTo = selectedRange ? clampRange(selectedRange) : null;

    const applyToOne = (row: number, colIndex: number) => {
      const cellKey = getCellKey(row, columns[colIndex]);
      const currentCell = newData[cellKey] || { value: '' };
      newData[cellKey] = {
        ...currentCell,
        style: {
          ...currentCell.style,
          backgroundColor: color ?? undefined,
        },
      };
    };

    if (applyTo) {
      for (let rr = applyTo.startRow; rr <= applyTo.endRow; rr++) {
        for (let cc = applyTo.startCol; cc <= applyTo.endCol; cc++) applyToOne(rr, cc);
      }
    } else if (selectedCell) {
      applyToOne(selectedCell.row, selectedCell.col);
    }

    commitData(newData);
    setShowColorPicker(false);
  };

  const openColorPicker = () => {
    if (!fillButtonRef.current) {
      setShowColorPicker((v) => !v);
      return;
    }
    const rect = fillButtonRef.current.getBoundingClientRect();
    setColorPickerPos({
      top: rect.bottom + 8,
      left: rect.left,
    });
    setShowColorPicker((v) => !v);
  };

  const mergeCells = () => {
    if (!selectedRange) {
      openModal('Merge Cells', 'Please select a range of cells to merge (click and drag).', 'warning');
      return;
    }
    const r = clampRange(selectedRange);
    if (r.startRow === r.endRow && r.startCol === r.endCol) {
      openModal('Merge Cells', 'Please select at least two cells to merge.', 'warning');
      return;
    }

    const newData = { ...cellData };

    // Get the top-left cell value
    const topLeftKey = getCellKey(r.startRow, columns[r.startCol]);
    const topLeftCell = newData[topLeftKey] || { value: '' };

    // Mark all cells in range as merged
    for (let rr = r.startRow; rr <= r.endRow; rr++) {
      for (let cc = r.startCol; cc <= r.endCol; cc++) {
        const key = getCellKey(rr, columns[cc]);
        if (rr === r.startRow && cc === r.startCol) {
          // Top-left cell becomes merge start
          newData[key] = {
            ...topLeftCell,
            isMergeStart: true,
            rowSpan: r.endRow - r.startRow + 1,
            colSpan: r.endCol - r.startCol + 1,
          };
        } else {
          // Other cells marked as merged
          newData[key] = {
            ...newData[key],
            merged: true,
            value: '',
          };
        }
      }
    }

    commitData(newData);
    setSelectedRange(null);
    setEditingCell(null);
  };

  const handlePrint = () => window.print();

  const handleFormulaBarChange = (value: string) => {
    setFormulaBarValue(value);
    if (selectedCell) {
      const col = columns[selectedCell.col];
      const cellKey = getCellKey(selectedCell.row, col);
      const currentCell = cellData[cellKey] || { value: '' };
      setCellData({
        ...cellData,
        [cellKey]: { ...currentCell, value },
      });
    }
  };

  const handleFormulaBarCommit = () => {
    commitData({ ...cellData });
  };

  const handleCellMouseDown = (row: number, colIndex: number) => {
    setIsSelecting(true);
    setEditingCell(null);
    setSelectedCell({ row, col: colIndex });
    setSelectedRange({
      startRow: row,
      startCol: colIndex,
      endRow: row,
      endCol: colIndex,
    });
    const cellKey = getCellKey(row, columns[colIndex]);
    setFormulaBarValue(cellData[cellKey]?.value || '');
  };

  const handleCellMouseEnter = (row: number, colIndex: number) => {
    if (!isSelecting || !selectedRange) return;
    setSelectedRange({
      ...selectedRange,
      endRow: row,
      endCol: colIndex,
    });
  };

  const handleCellMouseUp = () => {
    setIsSelecting(false);
  };

  const exportToExcel = () => {
    let csvContent = '';
    rows.forEach((row) => {
      const rowData: string[] = [];
      columns.forEach((col) => {
        const key = getCellKey(row, col);
        const value = cellData[key]?.value || '';
        rowData.push(`"${value.replace(/"/g, '""')}"`);
      });
      csvContent += rowData.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'excel_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseNumber = (v: string) => {
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const statusStats = useMemo(() => {
    const range = selectedRange ? clampRange(selectedRange) : null;
    const values: number[] = [];

    if (range) {
      for (let rr = range.startRow; rr <= range.endRow; rr++) {
        for (let cc = range.startCol; cc <= range.endCol; cc++) {
          const key = getCellKey(rr, columns[cc]);
          const raw = cellData[key]?.value ?? '';
          const n = parseNumber(raw);
          if (n !== null) values.push(n);
        }
      }
    } else if (selectedCell) {
      const key = getCellKey(selectedCell.row, columns[selectedCell.col]);
      const raw = cellData[key]?.value ?? '';
      const n = parseNumber(raw);
      if (n !== null) values.push(n);
    }

    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = count > 0 ? sum / count : 0;

    return { count, sum, avg };
  }, [selectedCell, selectedRange, cellData, columns]);

  // Toolvar active/mixed state hesaplama
  const getStyleStateForSelection = useMemo(() => {
    const getCellStyleValue = (row: number, colIndex: number, key: StyleKey): boolean => {
      const cellKey = getCellKey(row, columns[colIndex]);
      return Boolean(cellData[cellKey]?.style?.[key]);
    };

    const computeState = (key: StyleKey): StyleState => {
      // hiçbir seçim yoksa: off
      if (!selectedCell && !selectedRange) return 'off';

      // tek hücre seçiliyse
      if (selectedCell && !selectedRange) {
        const v = getCellStyleValue(selectedCell.row, selectedCell.col, key);
        return v ? 'on' : 'off';
      }

      // range seçiliyse
      if (selectedRange) {
        const r = clampRange(selectedRange);
        let anyOn = false;
        let anyOff = false;

        for (let rr = r.startRow; rr <= r.endRow; rr++) {
          for (let cc = r.startCol; cc <= r.endCol; cc++) {
            const v = getCellStyleValue(rr, cc, key);
            if (v) anyOn = true;
            else anyOff = true;

            if (anyOn && anyOff) return 'mixed';
          }
        }

        if (anyOn && !anyOff) return 'on';
        if (!anyOn && anyOff) return 'off';
        return 'off';
      }

      return 'off';
    };

    return {
      bold: computeState('bold'),
      italic: computeState('italic'),
      underline: computeState('underline'),
      border: computeState('border'),
    };
  }, [selectedCell, selectedRange, cellData, columns]);

  const toolbarBtnClass = (state: StyleState) => {
    const base = `p-2 rounded transition-colors relative`;
    const idle = isDarkMode
      ? 'text-gray-300 hover:bg-gray-700'
      : 'text-gray-600 hover:bg-gray-200';

    const active = isDarkMode
      ? 'bg-gray-700 text-gray-200 ring-1 ring-emerald-500'
      : 'bg-gray-100 text-gray-700 ring-1 ring-emerald-400';

    return `${base} ${state === 'on' ? active : idle}`;
  };

  const MixedDot = () => (
    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-800" />
  );

  useEffect(() => {
    const onUp = () => setIsSelecting(false);
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowColorPicker(false);
        setEditingCell(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePaste();
      } else if (e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleCut();
      } else if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCellStyle('bold');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        toggleCellStyle('italic');
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        toggleCellStyle('underline');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCell, selectedRange, cellData, historyIndex, history]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      if (editingCell) return;

      const blocked = [
        'Shift', 'Control', 'Alt', 'Meta', 'CapsLock',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Tab', 'Enter', 'Escape',
      ];
      if (blocked.includes(e.key)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key.length === 1) {
        startEditing(selectedCell.row, selectedCell.col);
        commitCellValue(selectedCell.row, selectedCell.col, e.key);
        setTimeout(() => {
          const el = editingInputRef.current;
          if (el) el.setSelectionRange(el.value.length, el.value.length);
        }, 0);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCell, editingCell, cellData]);

  const handleCellKeyDown = (e: React.KeyboardEvent, row: number, colIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEditingCell(null);
      commitData({ ...cellData });
      if (row < rows.length) setSelectionToCell(row + 1, colIndex);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingCell(null);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      setEditingCell(null);
      commitData({ ...cellData });
      if (colIndex < columns.length - 1) setSelectionToCell(row, colIndex + 1);
      return;
    }
  };

  const handleNavigateKeys = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    if (editingCell) return;

    const { row, col } = selectedCell;

    if (e.key === 'Enter') {
      e.preventDefault();
      startEditing(row, col);
      return;
    }

    if (e.key === 'ArrowUp' && row > 1) {
      e.preventDefault();
      setSelectionToCell(row - 1, col);
    } else if (e.key === 'ArrowDown' && row < rows.length) {
      e.preventDefault();
      setSelectionToCell(row + 1, col);
    } else if (e.key === 'ArrowLeft' && col > 0) {
      e.preventDefault();
      setSelectionToCell(row, col - 1);
    } else if (e.key === 'ArrowRight' && col < columns.length - 1) {
      e.preventDefault();
      setSelectionToCell(row, col + 1);
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} onKeyDown={handleNavigateKeys}tabIndex={-1}>
      {/* Sidebar */}
      <Sidebar isDarkMode={isDarkMode} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`h-16 px-8 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-zinc-200'}`}>
          <h1 className="text-cyan-800 text-xl font-semibold font-['Inter']">Excel Reports</h1>

          {/* Dark/Light Mode Toggle */}
          <div className="absolute top-6 right-8 flex items-center gap-2">
            {/* Sun Icon */}
              <div className="relative">
              <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
              {!isDarkMode && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
        
            {/* Switch Toggle */}
            <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors duration-300 bg-cyan-500" aria-label="Toggle theme">
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
        
            {/* Moon Icon */}
            <div className="relative">
              <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              {isDarkMode && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Excel Toolbar */}
        <div className={`h-12 px-4 border-b flex items-center gap-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          {/* Copy, Paste, Cut */}
          <button onClick={handleCopy} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title="Copy (Ctrl+C)">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button onClick={handlePaste} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title="Paste (Ctrl+V)">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>

          {/* Undo, Redo */}
          <button onClick={handleCut} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title="Cut (Ctrl+X)">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          </button>

          <div className={`h-6 w-px mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

          <button onClick={handleUndo} disabled={historyIndex === 0} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${historyIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title="Undo (Ctrl+Z)">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${historyIndex === history.length - 1 ? 'opacity-40 cursor-not-allowed' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title="Redo (Ctrl+Y)">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>

          <div className={`h-6 w-px mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

          {/* Bold, Italic, Underline */}
          <button
            onClick={() => toggleCellStyle('bold')}
            className={toolbarBtnClass(getStyleStateForSelection.bold)}
            title="Bold (Ctrl+B)"
            aria-pressed={getStyleStateForSelection.bold === 'on'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
            </svg>
            {getStyleStateForSelection.bold === 'mixed' && <MixedDot />}
          </button>

          <button
            onClick={() => toggleCellStyle('italic')}
            className={toolbarBtnClass(getStyleStateForSelection.italic)}
            title="Italic (Ctrl+I)"
            aria-pressed={getStyleStateForSelection.italic === 'on'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
            </svg>
            {getStyleStateForSelection.italic === 'mixed' && <MixedDot />}
          </button>

          <button
            onClick={() => toggleCellStyle('underline')}
            className={toolbarBtnClass(getStyleStateForSelection.underline)}
            title="Underline (Ctrl+U)"
            aria-pressed={getStyleStateForSelection.underline === 'on'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
            </svg>
            {getStyleStateForSelection.underline === 'mixed' && <MixedDot />}
          </button>

          {/* Fill Color */}
          <button
            ref={fillButtonRef}
            onClick={openColorPicker}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} relative`}
            title="Fill Color"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z" />
            </svg>
            <svg className="w-3 h-3 absolute bottom-0.5 right-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </button>

          {/* Borders */}
          <button
            onClick={() => toggleCellStyle('border')}
            className={toolbarBtnClass(getStyleStateForSelection.border)}
            title="Borders"
            aria-pressed={getStyleStateForSelection.border === 'on'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16M12 4v16" />
            </svg>
            {getStyleStateForSelection.border === 'mixed' && <MixedDot />}
          </button>

          {/* Merge Cells */}
          <button
            onClick={mergeCells}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
            title="Merge Cells"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Corners */}
              <path d="M3 8V5a2 2 0 0 1 2-2h3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M21 16v3a2 2 0 0 1-2 2h-3" />

              {/* Arrows */}
              <path d="M8 12h8" />
              <path d="M10 10l-2 2 2 2" />
              <path d="M14 10l2 2-2 2" />
              </svg>
            </button>
          <div className={`h-6 w-px mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

          {/* Align Left, Center, Right */}
          <button onClick={() => setCellAlignment('left')} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title="Align Left">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>

          <button onClick={() => setCellAlignment('center')} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title="Align Center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h8M4 18h16" />
            </svg>
          </button>

          <button onClick={() => setCellAlignment('right')} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title="Align Right">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M12 12h8M4 18h16" />
            </svg>
          </button>

          <div className={`h-6 w-px mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

          {/* Print */}
          <button onClick={handlePrint} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title="Print">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>

          {/* Export Excel Button */}
          <div className="ml-auto">
            <button
              onClick={exportToExcel}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-2
                ${
                  isDarkMode
                    ? 'bg-gray-800 hover:bg-green-600 text-gray-200 hover:text-white border border-gray-600'
                    : 'bg-white hover:bg-green-600 text-green-600 hover:text-white border border-white'
                }
              `}
            >
                <span
                className={`w-7 h-7 rounded flex items-center justify-center transition-colors
                  ${
                    isDarkMode
                      ? 'bg-gray-700 border border-gray-600'
                      : 'bg-white border border-white'
                  }
                `}
              >
                <img
                  src={require('../assets/excel.png')}
                  alt="Excel"
                  className="w-5 h-5 object-contain"
                />
              </span>
              Export
            </button>
          </div>
        </div>
        

        {/* Formula Bar */}
        <div className={`h-10 px-4 border-b flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`px-3 py-1 rounded border text-sm font-mono min-w-[60px] text-center ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
            {selectedCell
              ? `${columns[selectedCell.col]}${selectedCell.row}`
              : selectedRange
              ? `${columns[clampRange(selectedRange).startCol]}${clampRange(selectedRange).startRow}:${columns[clampRange(selectedRange).endCol]}${clampRange(selectedRange).endRow}`
              : ''}
          </div>
          <div className={`px-2 text-semibold font-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ƒx</div>
          <input
            ref={formulaInputRef}
            type="text"
            value={formulaBarValue}
            onChange={(e) => handleFormulaBarChange(e.target.value)}
            onBlur={handleFormulaBarCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleFormulaBarCommit();
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="Enter formula or value..."
            className={`flex-1 px-3 py-1 text-sm focus:outline-none ${isDarkMode ? 'bg-gray-700 text-gray-200 placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
          />
        </div>
        
        {/* Spreadsheet Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={`sticky top-0 left-0 z-20 w-12 h-8 border text-xs font-semibold ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'}`} />
                {columns.map((col) => (
                  <th key={col} className={`sticky top-0 z-10 min-w-[100px] h-8 border text-xs font-semibold ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row}>
                  <td className={`sticky left-0 z-10 w-12 h-8 border text-xs font-semibold text-center ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'}`}>
                    {row}
                  </td>

                  {columns.map((col, colIndex) => {
                    if (isCellMergedHidden(row, col)) return null;

                    const cellKey = getCellKey(row, col);
                    const info = cellData[cellKey];

                    const isSelected = selectedCell?.row === row && selectedCell?.col === colIndex;
                    const isInRange = isCellInRange(row, colIndex);
                    const isEditing = editingCell?.row === row && editingCell?.col === colIndex;

                    const cellValue = getCellValue(row, col);
                    const cellStyle = getCellStyle(row, col);

                    return (
                      <td
                        key={col}
                        rowSpan={info?.rowSpan}
                        colSpan={info?.colSpan}
                        onMouseDown={() => handleCellMouseDown(row, colIndex)}
                        onMouseEnter={() => handleCellMouseEnter(row, colIndex)}
                        onMouseUp={handleCellMouseUp}
                        onClick={() => setSelectionToCell(row, colIndex)}
                        onDoubleClick={() => startEditing(row, colIndex)}
                        style={{
                          backgroundColor: cellStyle.backgroundColor,
                          color: cellStyle.color,
                          textAlign: cellStyle.textAlign || 'left',
                          fontWeight: cellStyle.bold ? 'bold' : 'normal',
                          fontStyle: cellStyle.italic ? 'normal' : 'normal',
                          textDecoration: cellStyle.underline ? 'underline' : 'none',
                          borderWidth: cellStyle.border ? '2px' : '1px',
                          borderColor: cellStyle.border ? (isDarkMode ? '#4b5563' : '#9ca3af') : undefined,
                        }}
                        className={`min-w-[100px] h-8 border text-sm px-2 cursor-cell select-none ${
                          isSelected ? 'ring-2 ring-gray-300 ring-inset' : isInRange ? 'bg-gray-100 dark:bg-gray-900/30' : ''
                        } ${isDarkMode ? 'border-gray-700 text-gray-200 bg-gray-900' : 'border-gray-300 text-gray-900 bg-white'}`}
                      >
                        {isEditing ? (
                          <input
                            ref={editingInputRef}
                            type="text"
                            value={cellValue}
                            onChange={(e) => {
                              const key = getCellKey(row, columns[colIndex]);
                              const current = cellData[key] || { value: '' };
                              setCellData({
                                ...cellData,
                                [key]: { ...current, value: e.target.value },
                              });
                              setFormulaBarValue(e.target.value);
                            }}
                            onKeyDown={(e) => handleCellKeyDown(e, row, colIndex)}
                            onBlur={() => {
                              setEditingCell(null);
                              commitData({ ...cellData });
                            }}
                            className={`w-full h-full bg-transparent outline-none ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                            style={{
                              fontWeight: cellStyle.bold ? 'bold' : 'normal',
                              fontStyle: cellStyle.italic ? 'italic' : 'normal',
                              textDecoration: cellStyle.underline ? 'underline' : 'none',
                              textAlign: cellStyle.textAlign || 'left',
                            }}
                          />
                        ) : (
                          <div className="truncate" style={{ textAlign: cellStyle.textAlign || 'left' }}>
                            {getDisplayValue(cellValue, cellStyle)}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status Bar */}        
        <div className={`h-8 px-4 border-t flex items-center justify-between text-xs ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
          <div className="flex items-center gap-4">
            <span>Ready</span>
            <span>Sheet 1</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Average: {statusStats.avg.toFixed(2)}</span>
            <span>Count: {statusStats.count}</span>
            <span>Sum: {statusStats.sum.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {showColorPicker && colorPickerPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />
          <div
            className={`fixed z-50 w-64 rounded-lg shadow-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
            style={{ top: `${colorPickerPos.top}px`, left: `${colorPickerPos.left}px` }}
          >
            <div className="p-3">
              <div className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Theme Colors
              </div>

              {THEME_COLORS.map((row, idx) => (
                <div key={idx} className="flex gap-1 mb-1">
                  {row.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCellBackground(color)}
                      className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          color === '#FFFFFF'
                            ? isDarkMode
                              ? '#9ca3af'
                              : '#d1d5db'
                            : isDarkMode
                            ? '#4b5563'
                            : '#e5e7eb',
                      }}
                      title={color}
                    />
                  ))}
                </div>
              ))}

              <div className={`text-xs font-semibold mt-3 mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Standard Colors
              </div>

              <div className="flex gap-1 flex-wrap">
                {STANDARD_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCellBackground(color)}
                    className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                    }}
                    title={color}
                  />
                ))}
              </div>

              <button
                onClick={() => setCellBackground(null)}
                className={`w-full px-3 py-2 text-sm flex items-center justify-between mt-3 rounded ${
                  isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="No Fill"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0112 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 00-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 012.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z" />
                  <circle cx="6.5" cy="11.5" r="1.5" />
                  <circle cx="9.5" cy="7.5" r="1.5" />
                  <circle cx="14.5" cy="7.5" r="1.5" />
                  <circle cx="17.5" cy="11.5" r="1.5" />
                </svg>
                  <span>No Fill</span>
                <span className="text-xs text-gray-500">Esc</span>
              </button>
            </div>
          </div>
        </>
      )}
      <AppModal isDarkMode={isDarkMode} state={modal} onClose={closeModal} />
    </div>
  );
};

export default ExcelReportsPage;
