/**
 * Analisa um arquivo CSV e retorna os dados como um array de objetos
 * @param {File} file - O arquivo CSV a ser analisado
 * @returns {Promise<Array>} Um array de objetos com os dados do CSV
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        const result = parseCSVText(csvText);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * Analisa um texto CSV e retorna os dados como um array de objetos
 * @param {string} csvText - O texto CSV a ser analisado
 * @returns {Array} Um array de objetos com os dados do CSV
 */
export const parseCSVText = (csvText) => {
  const lines = csvText.split(/\r\n|\n/);
  
  if (lines.length < 2) {
    throw new Error('O arquivo CSV deve conter um cabeçalho e pelo menos uma linha de dados.');
  }
  
  const headers = parseCSVLine(lines[0]);
  
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const data = parseCSVLine(lines[i]);
    const item = {};
    
    for (let j = 0; j < headers.length; j++) {
      if (j < data.length) {
        item[headers[j]] = data[j];
      } else {
        item[headers[j]] = '';
      }
    }
    
    result.push(item);
  }
  
  return result;
};

/**
 * Analisa uma linha CSV respeitando aspas
 * @param {string} line - A linha CSV a ser analisada
 * @returns {Array} Um array de valores da linha
 */
const parseCSVLine = (line) => {
  const result = [];
  let cell = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  
  result.push(cell.trim());
  
  return result;
}; 