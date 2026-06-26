import { OCRResult } from '@/types';

/**
 * Receipt OCR service.
 *
 * In production, this would call a vision model (Google ML Kit, on-device Tesseract
 * via native module, or a remote Vision API). For an Expo-managed app we expose a
 * minimal API that:
 *   1. Validates the image.
 *   2. Returns a structured result.
 *   3. Allows plugging in a real implementation.
 *
 * The web version used Tesseract.js. On mobile, we recommend @react-native-ml-kit/text-recognition
 * or a Vision-LLM provider (Claude / OpenAI Vision).
 */
export const ocrService = {
  async scanReceipt(imageUri?: string): Promise<OCRResult> {
    // Stubbed result. A real implementation would:
    //   const text = await TextRecognition.recognize(imageUri);
    //   return parseReceiptText(text);
    return {
      amount: null,
      date: null,
      description: null,
    };
  },

  parseReceiptText(text: string): OCRResult {
    const out: OCRResult = { amount: null, date: null, description: null };
    if (!text) return out;

    // Amount — prefer a "total" line, fallback to largest decimal
    const totalRe = /(?:^|\b)(?:grand\s*total|total\s*due|total|amount\s*due|balance\s*due|amt|to\s*pay)[^\d\-]*([0-9]{1,6}[.,][0-9]{2})/i;
    const totalMatch = text.match(totalRe);
    if (totalMatch) {
      out.amount = parseFloat(totalMatch[1].replace(',', '.'));
    } else {
      const allDecimals = [...text.matchAll(/([0-9]{1,6}[.,][0-9]{2})\b/g)].map((m) =>
        parseFloat(m[1].replace(',', '.')),
      );
      if (allDecimals.length) out.amount = Math.max(...allDecimals);
    }

    // Date — common formats
    const dateRe = /(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[0-2])[\/\-\.](\d{2}|\d{4})/;
    const dateMatch = text.match(dateRe);
    if (dateMatch) {
      let [, d, m, y] = dateMatch;
      if (y.length === 2) y = (parseInt(y, 10) > 50 ? '19' : '20') + y;
      out.date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // Description — first non-empty, non-numeric line near the top
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const top = lines.slice(0, Math.max(3, Math.floor(lines.length / 3)));
    for (const line of top) {
      if (line.length >= 3 && !/^[\d\W_]+$/.test(line)) {
        out.description = line.replace(/[^A-Za-z0-9 &'.\-]/g, '').slice(0, 40);
        break;
      }
    }
    return out;
  },
};