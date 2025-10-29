import { createWorker } from 'tesseract.js';
import { ExpenseCategory } from '../types';

/**
 * Extract text from receipt image using OCR
 */
export async function extractReceiptText(imageDataUrl: string): Promise<string> {
  const worker = await createWorker('eng');
  const { data: { text } } = await worker.recognize(imageDataUrl);
  await worker.terminate();
  return text;
}

/**
 * Parse receipt text to extract expense details
 * This is a simple parser - can be enhanced with more sophisticated NLP
 */
export function parseReceiptText(text: string): {
  amount: number | null;
  merchant: string;
  date: string | null;
} {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let amount: number | null = null;
  let merchant = '';
  let date: string | null = null;
  
  // Try to find total amount (usually contains "total", "amount", or is the largest number)
  const currencyPattern = /[\$€£¥₹]?\s*(\d+[.,]\d{2})/g;
  const numbers: number[] = [];
  
  for (const line of lines) {
    const matches = Array.from(line.matchAll(currencyPattern));
    for (const match of matches) {
      const numStr = match[1].replace(',', '.');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) {
        numbers.push(num);
      }
    }
    
    // Look for total label
    if (line.toLowerCase().includes('total') || line.toLowerCase().includes('amount')) {
      const match = line.match(currencyPattern);
      if (match) {
        const numStr = match[0].replace(/[\$€£¥₹,\s]/g, '').replace(',', '.');
        const num = parseFloat(numStr);
        if (!isNaN(num) && num > 0) {
          amount = num;
        }
      }
    }
  }
  
  // Use the largest number as amount if no total found
  if (amount === null && numbers.length > 0) {
    amount = Math.max(...numbers);
  }
  
  // Merchant name is usually in the first few lines
  if (lines.length > 0) {
    merchant = lines[0].substring(0, 50); // Limit to 50 chars
  }
  
  // Try to find date (common formats)
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
  ];
  
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        // Try to parse and format date
        try {
          const dateStr = match[1];
          const parsed = new Date(dateStr.replace(/-/g, '/'));
          if (!isNaN(parsed.getTime())) {
            date = parsed.toISOString().split('T')[0];
            break;
          }
        } catch {
          // Ignore parsing errors
        }
      }
    }
    if (date) break;
  }
  
  // Default to today if no date found
  if (!date) {
    date = new Date().toISOString().split('T')[0];
  }
  
  return {
    amount,
    merchant: merchant || 'Unknown Merchant',
    date,
  };
}

/**
 * Process receipt image and extract expense details
 */
export async function processReceipt(imageDataUrl: string): Promise<{
  amount: number | null;
  merchant: string;
  date: string;
}> {
  try {
    const text = await extractReceiptText(imageDataUrl);
    const parsed = parseReceiptText(text);
    // Ensure date is never null (shouldn't happen, but TypeScript safety)
    return {
      amount: parsed.amount,
      merchant: parsed.merchant,
      date: parsed.date || new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Error processing receipt:', error);
    // Return default values on error
    return {
      amount: null,
      merchant: '',
      date: new Date().toISOString().split('T')[0],
    };
  }
}

