/**
 * Quick Entry Component - Simplified version for quick product entry
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { extractFromText, type ProductData } from '@/lib/agent-api';

interface QuickEntryProps {
  onProductExtracted?: (productData: ProductData) => void;
}

export function QuickEntry({ onProductExtracted }: QuickEntryProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickExtract = async () => {
    if (!input.trim()) {
      setError('请输入商品信息');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await extractFromText(input);
      
      if (result.success && result.product_data) {
        onProductExtracted?.(result.product_data);
        setInput('');
      } else {
        setError(result.error || '提取失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">AI 快速录入</h3>
          <p className="text-xs text-gray-500 mb-3">
            直接描述商品信息，AI 会自动提取结构化数据
          </p>
        </div>
      </div>

      <Textarea
        placeholder="例如：皇家猫粮，成猫专用，2kg装，供应商是宠物乐园，单价85元"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        className="mb-3"
        disabled={loading}
      />

      {error && (
        <div className="text-sm text-red-600 mb-2 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      <Button
        onClick={handleQuickExtract}
        disabled={loading || !input.trim()}
        size="sm"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            提取中...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            AI 提取
          </>
        )}
      </Button>
    </Card>
  );
}

