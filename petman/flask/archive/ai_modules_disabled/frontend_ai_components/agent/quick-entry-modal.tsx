import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Send, Loader2, X, CheckCircle, AlertCircle, Sparkles, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

interface QuickEntryModalProps {
  onDataExtracted: (data: any) => void;
  onClose: () => void;
  availableBrands?: any[];
  availableCategories?: any[];
}

export function QuickEntryModal({ 
  onDataExtracted, 
  onClose,
  availableBrands = [],
  availableCategories = []
}: QuickEntryModalProps) {
  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);

    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(imagePreviews[index]);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  // 清理录音定时器
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // 开始计时
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('开始录音，请描述商品信息...');
    } catch (error) {
      console.error('录音失败:', error);
      toast.error('无法访问麦克风，请检查权限设置');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      toast.info('录音已停止，正在处理...');
    }
  };

  // 清除录音
  const clearAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  // 格式化录音时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExtract = async () => {
    if (!inputText.trim() && selectedImages.length === 0 && !audioBlob) {
      toast.error('请输入商品描述、上传图片或录制语音');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('text', inputText);
      
      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      // 如果有音频，添加到表单
      if (audioBlob) {
        formData.append('audio', audioBlob, 'voice.webm');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch('http://localhost:5000/api/agent/extract-mixed', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `请求失败 (${response.status})`);
      }

      const result = await response.json();

      if (!result.success || !result.product_data) {
        throw new Error(result.error || 'AI 未能提取有效信息');
      }

      // 转换AI数据为表单格式
      const productData = result.product_data;
      
      // 匹配品牌
      let brand_id = undefined;
      if (productData.brand) {
        const matchedBrand = availableBrands.find((b: any) => 
          b.brandname?.toLowerCase() === productData.brand?.toLowerCase() ||
          b.brandname?.includes(productData.brand) ||
          productData.brand?.includes(b.brandname)
        );
        brand_id = matchedBrand?.brandID;
      }

      // 匹配分类
      let classify_id = undefined;
      if (productData.category) {
        const matchedCategory = availableCategories.find((c: any) => 
          c.classify1_name?.includes(productData.category) || 
          productData.category?.includes(c.classify1_name)
        );
        classify_id = matchedCategory?.classify1_ID;
      }

      // 构建表单数据
      const extractedData = {
        product_name: productData.product_name || '',
        brand_id: brand_id,
        classify_id: classify_id,
        product_baozhiqi: productData.shelf_life,
        product_details: productData.features || '',
        local: productData.origin || '',
        specs: [{
          id: Date.now(),
          spec_type_id: undefined,
          name: '',
          value: productData.specification || '',
          stock: productData.quantity || 1,
          barcode: productData.barcode || '',
          picture: '',
          unit: ''
        }],
        // 保留原始数据
        _aiExtracted: {
          brand: productData.brand,
          category: productData.category,
          raw: productData
        }
      };

      toast.success('AI 识别成功！数据已填充到表单');
      onDataExtracted(extractedData);

    } catch (error: any) {
      console.error('AI extraction error:', error);
      if (error.name === 'AbortError') {
        toast.error('请求超时，请检查网络或稍后重试');
      } else {
        toast.error(`提取失败：${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">AI 智能识别</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 使用提示：</strong> 上传商品图片或输入商品描述，AI 将自动识别商品名称、品牌、规格、分类、条形码等信息，并填充到表单中。
        </p>
      </Card>

      <div className="space-y-4">
        {/* 文字输入 */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            商品描述（可选）
          </label>
          <Textarea
            placeholder="例如：皇家猫粮500g，适合成猫，鸡肉味..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
          />
        </div>

        {/* 图片上传 */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            商品图片（可选）
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="ai-image-upload"
            />
            <label
              htmlFor="ai-image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                点击上传图片
              </span>
              <span className="text-xs text-gray-400 mt-1">
                支持 JPG、PNG、WEBP 格式
              </span>
            </label>
          </div>

          {/* 图片预览 */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`预览 ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 语音录制 */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            语音录入（可选）
          </label>
          
          {!audioBlob ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {isRecording ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                      <div className="relative bg-red-500 rounded-full p-4">
                        <Mic className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-red-600">
                    录音中... {formatTime(recordingTime)}
                  </div>
                  <p className="text-sm text-gray-600">
                    请清晰地描述商品信息，包括名称、品牌、规格等
                  </p>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                  >
                    <MicOff className="mr-2 h-4 w-4" />
                    停止录音
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Phone className="h-10 w-10 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    点击开始录音，用语音描述商品
                  </p>
                  <Button
                    onClick={startRecording}
                    className="bg-green-500 hover:bg-green-600"
                    size="lg"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    开始录音
                  </Button>
                  <p className="text-xs text-gray-400">
                    支持实时语音识别，自动转换为文字
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">录音完成</p>
                    <p className="text-sm text-green-600">时长: {formatTime(recordingTime)}</p>
                  </div>
                </div>
                <Button
                  onClick={clearAudio}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <X className="h-4 w-4 mr-1" />
                  删除
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 提取按钮 */}
        <Button
          onClick={handleExtract}
          disabled={loading || (!inputText.trim() && selectedImages.length === 0 && !audioBlob)}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI 识别中...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              开始识别
            </>
          )}
        </Button>
      </div>

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• AI 会自动识别商品信息并填充到表单中</p>
        <p>• 识别后您可以手动调整和补充信息</p>
        <p>• 支持同时使用图片、文字和语音以提高准确度</p>
        <p>• 🎙️ 语音录入：直接用自然语言描述商品，如"这是一袋皇家猫粮，500克装的"</p>
      </div>
    </div>
  );
}

