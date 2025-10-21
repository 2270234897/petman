import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Send, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, Edit } from 'lucide-react';
import { ProductForm } from '@/components/inventory/product-form';
import { useBrands, useClassify } from '@/hooks/useApi';
import { toast } from 'sonner';

interface ProductData {
  product_name?: string;
  brand?: string;
  brand_id?: number; // AI匹配的品牌ID
  specification?: string;
  category?: string;
  classify_id?: number; // AI匹配的分类ID
  quantity?: number;
  unit_price?: number;
  supplier?: string;
  target_animal?: string;
  features?: string;
  barcode?: string;
  notes?: string;
  shelf_life?: number | string; // 保质期（月数）
  origin?: string; // 产地
}

interface ExtractionResult {
  success: boolean;
  product_data?: ProductData;
  is_valid?: boolean;
  messages?: string[];
  error?: string;
  raw_response?: string;
}

export default function AgentAssistant() {
  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'mixed'>('mixed');
  const [showForm, setShowForm] = useState(false);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string>(''); // 保存图片的base64
  
  // 获取品牌和分类数据
  const { data: brandsData } = useBrands();
  const { data: classifyData } = useClassify();

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
    
    // Revoke old preview URL
    URL.revokeObjectURL(imagePreviews[index]);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    
    // 如果删除的是第一张图片，清除base64
    if (index === 0) {
      setUploadedImageBase64('');
    }
  };

  // 压缩图片函数
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // 限制最大尺寸
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // 压缩为JPEG，质量0.7
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!inputText.trim() && selectedImages.length === 0) {
      alert('请输入商品描述或上传图片');
      return;
    }

    setLoading(true);
    setResult(null);
    
    // 如果有图片，压缩并转换第一张为base64用于规格图片
    if (selectedImages.length > 0) {
      try {
        const compressedBase64 = await compressImage(selectedImages[0]);
        setUploadedImageBase64(compressedBase64);
        console.log('[AI助手] ✅ 图片已压缩，原始大小:', selectedImages[0].size, 'bytes');
      } catch (error) {
        console.error('[AI助手] 图片压缩失败:', error);
        toast.error('图片压缩失败');
      }
    }

    try {
      let endpoint = '/api/agent/extract-mixed';
      const formData = new FormData();

      if (activeTab === 'text') {
        endpoint = '/api/agent/extract-from-text';
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: inputText }),
        });
        const data = await response.json();
        setResult(data);
      } else if (activeTab === 'image') {
        endpoint = '/api/agent/extract-from-image';
        if (selectedImages.length === 0) {
          alert('请上传图片');
          return;
        }
        formData.append('image', selectedImages[0]);
        if (inputText.trim()) {
          formData.append('context', inputText);
        }
        
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 503 && errorData.message?.includes('GEMINI_API_KEY')) {
            setResult({
              status: 'error',
              message: 'AI Agent服务未配置',
              details: '请设置GEMINI_API_KEY环境变量。查看 GEMINI_API_SETUP.md 了解详细设置步骤。'
            });
            return;
          }
          throw new Error(`HTTP ${response.status}: ${errorData.message || '请求失败'}`);
        }
        
        const data = await response.json();
        setResult(data);
      } else {
        // Mixed mode
        formData.append('text', inputText);
        selectedImages.forEach(image => {
          formData.append('images', image);
        });
        
        // 创建超时控制器
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90秒超时（Gemini API 可能需要较长时间）
        
        try {
          const response = await fetch(`http://localhost:5000${endpoint}`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `请求失败 (${response.status})`);
          }
          
          const data = await response.json();
          setResult(data);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接或稍后重试');
          }
          throw fetchError;
        }
      }
    } catch (error) {
      console.error('Agent request error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '请求失败',
      });
    } finally {
      setLoading(false);
    }
  };

  // 准备表单初始数据（使用useMemo缓存，避免重复计算和toast提示）
  const formDataCache = useMemo(() => {
    if (!result?.product_data) return null;
    
    const productData = result.product_data;
    const brands = brandsData?.data || [];
    const categories = classifyData?.data || [];
    
    console.log('[AI助手] AI返回的数据:', productData);
    
    // 优先使用AI返回的品牌ID（使用 ?? 而不是 || 以支持ID为0的情况）
    let brand_id = productData.brand_id ?? undefined;
    let brandMatchStatus = '';
    
    if (brand_id !== undefined && brand_id !== null) {
      // 验证AI返回的ID是否有效
      const matchedBrand = brands.find((b: any) => b.brandID === brand_id);
      if (matchedBrand) {
        console.log('[AI助手] ✅ AI已匹配品牌:', matchedBrand.brandname, 'ID:', brand_id);
        brandMatchStatus = `matched:${matchedBrand.brandname}`;
      } else {
        console.log('[AI助手] ⚠️ AI返回的品牌ID无效:', brand_id);
        brand_id = undefined;
        brandMatchStatus = 'invalid';
      }
    } else if (productData.brand && productData.brand !== '未知品牌') {
      brandMatchStatus = `unmatched:${productData.brand}`;
    }
    
    // 优先使用AI返回的分类ID（使用 ?? 而不是 || 以支持ID为0的情况）
    let classify_id = productData.classify_id ?? undefined;
    let classifyMatchStatus = '';
    
    if (classify_id !== undefined && classify_id !== null) {
      // 验证AI返回的ID是否有效
      const matchedCategory = categories.find((c: any) => c.classify1_ID === classify_id);
      if (matchedCategory) {
        console.log('[AI助手] ✅ AI已匹配分类:', matchedCategory.classify1_name, 'ID:', classify_id);
        classifyMatchStatus = `matched:${matchedCategory.classify1_name}`;
      } else {
        console.log('[AI助手] ⚠️ AI返回的分类ID无效:', classify_id);
        classify_id = undefined;
        classifyMatchStatus = 'invalid';
      }
    } else if (productData.category) {
      classifyMatchStatus = `unmatched:${productData.category}`;
    }
    
    // 处理保质期
    let shelfLife = undefined;
    if (productData.shelf_life !== null && productData.shelf_life !== undefined) {
      shelfLife = typeof productData.shelf_life === 'number' 
        ? productData.shelf_life 
        : parseInt(productData.shelf_life);
      
      if (isNaN(shelfLife)) {
        shelfLife = undefined;
        console.log('[AI助手] ⚠️ 保质期解析失败:', productData.shelf_life);
      } else {
        console.log('[AI助手] ✅ 保质期已识别:', shelfLife, '个月');
      }
    }
    
    const formData = {
      product_name: productData.product_name || '',
      brand_id,
      classify_id,
      product_baozhiqi: shelfLife,
      product_details: productData.features || '',
      local: productData.origin || '',
      specs: [{
        id: Date.now(),
        spec_type_id: undefined,
        name: '规格',
        value: productData.specification || '',
        stock: productData.quantity || 1,
        barcode: productData.barcode || '',
        picture: uploadedImageBase64, // 自动填充上传的图片
        unit: ''
      }],
      // 保留原始AI数据用于调试和提示
      _aiData: {
        ...productData,
        matched_brand_id: brand_id,
        matched_classify_id: classify_id,
        brandMatchStatus,
        classifyMatchStatus
      }
    };
    
    console.log('[AI助手] 准备的表单数据:', formData);
    if (uploadedImageBase64) {
      console.log('[AI助手] ✅ 已自动填充商品图片到规格');
    }
    
    return formData;
  }, [result?.product_data, brandsData?.data, classifyData?.data, uploadedImageBase64]);
  
  // 在formDataCache改变时显示一次性的toast提示
  useEffect(() => {
    if (!formDataCache?._aiData) return;
    
    const { brandMatchStatus, classifyMatchStatus } = formDataCache._aiData;
    
    // 品牌匹配提示
    if (brandMatchStatus.startsWith('matched:')) {
      const brandName = brandMatchStatus.split(':')[1];
      toast.success(`✅ AI已自动匹配品牌: ${brandName}`);
    } else if (brandMatchStatus.startsWith('unmatched:')) {
      const brandName = brandMatchStatus.split(':')[1];
      toast.warning(`⚠️ 品牌"${brandName}"未自动匹配，请手动选择`);
    }
    
    // 分类匹配提示
    if (classifyMatchStatus.startsWith('matched:')) {
      const categoryName = classifyMatchStatus.split(':')[1];
      toast.success(`✅ AI已自动匹配分类: ${categoryName}`);
    } else if (classifyMatchStatus.startsWith('unmatched:')) {
      const categoryName = classifyMatchStatus.split(':')[1];
      toast.warning(`⚠️ 分类"${categoryName}"未自动匹配，请手动选择`);
    }
    
    // 图片填充提示
    if (uploadedImageBase64 && formDataCache.specs?.[0]?.picture) {
      toast.success(`📸 商品图片已自动填充到规格中`);
    }
  }, [formDataCache, uploadedImageBase64]);
  
  // 处理表单提交
  const handleFormSubmit = async (formData: any) => {
    try {
      // 先检查条形码是否已存在
      const barcode = formData.specs?.[0]?.barcode;
      if (barcode && barcode !== '0' && barcode.trim() !== '') {
        const checkResponse = await fetch(`http://localhost:5000/api/inventory/check-barcode/${barcode}`);
        const checkData = await checkResponse.json();
        
        if (checkData.exists && checkData.product) {
          const existingProduct = checkData.product;
          const confirmMessage = `条形码 ${barcode} 已被商品"${existingProduct.product_name}"使用。\n\n` +
            `选项：\n` +
            `- 点击"确定"：清空条形码并创建新商品\n` +
            `- 点击"取消"：返回修改条形码`;
          
          if (!confirm(confirmMessage)) {
            toast.info('请修改条形码后重试');
            return;
          }
          
          // 用户选择清空条形码
          formData.specs[0].barcode = '';
          toast.info('已清空条形码，将创建新商品');
        }
      }
      
      const response = await fetch('http://localhost:5000/api/inventory/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.status === 'success' || response.ok) {
        toast.success('商品添加成功！');
        // 重置所有状态
        setInputText('');
        setSelectedImages([]);
        setImagePreviews([]);
        setResult(null);
        setShowForm(false);
        setUploadedImageBase64(''); // 清除图片base64
      } else {
        toast.error(`保存失败：${data.message || '未知错误'}`);
      }
    } catch (error) {
      toast.error('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI 商品助手</h1>
        <p className="text-gray-600">通过自然语言和图片快速录入商品信息</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">输入商品信息</h2>
            
            {/* Tab Selector */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeTab === 'mixed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('mixed')}
              >
                图文混合
              </Button>
              <Button
                variant={activeTab === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('text')}
              >
                仅文字
              </Button>
              <Button
                variant={activeTab === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('image')}
              >
                仅图片
              </Button>
            </div>

            {/* Text Input */}
            {(activeTab === 'text' || activeTab === 'mixed') && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">商品描述</label>
                <Textarea
                  placeholder="例如：皇家猫粮，成猫专用，2kg装，现在特价85元..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                  className="w-full"
                />
              </div>
            )}

            {/* Image Upload */}
            {(activeTab === 'image' || activeTab === 'mixed') && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">商品图片</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple={activeTab === 'mixed'}
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      点击上传图片 (支持 JPG, PNG, WEBP)
                    </span>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
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
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在分析...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  提取商品信息
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Result Section */}
        <div className="space-y-4">
          {result && (
            <>
              {result.error ? (
                <Card className="p-6 border-red-200 bg-red-50">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-1">提取失败</h3>
                      <p className="text-red-600 text-sm">{result.error}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">提取结果</h2>
                      {result.is_valid ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          验证通过
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          需要补充
                        </Badge>
                      )}
                    </div>

                    {result.product_data && (
                      <div className="space-y-3">
                        {result.product_data.product_name && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">商品名称</span>
                            <p className="font-medium">{result.product_data.product_name}</p>
                          </div>
                        )}
                        
                        {result.product_data.brand && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">品牌</span>
                            <p className="font-medium">{result.product_data.brand}</p>
                          </div>
                        )}
                        
                        {result.product_data.specification && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">规格</span>
                            <p className="font-medium">{result.product_data.specification}</p>
                          </div>
                        )}
                        
                        {result.product_data.category && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">类别</span>
                            <p className="font-medium">{result.product_data.category}</p>
                          </div>
                        )}
                        
                        {result.product_data.unit_price !== undefined && result.product_data.unit_price !== null && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">单价</span>
                            <p className="font-medium text-green-600">
                              ¥{result.product_data.unit_price.toFixed(2)}
                            </p>
                          </div>
                        )}
                        
                        {result.product_data.supplier && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">供应商</span>
                            <p className="font-medium">{result.product_data.supplier}</p>
                          </div>
                        )}
                        
                        {result.product_data.target_animal && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">适用动物</span>
                            <p className="font-medium">{result.product_data.target_animal}</p>
                          </div>
                        )}
                        
                        {result.product_data.features && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">产品特点</span>
                            <p className="font-medium text-sm">{result.product_data.features}</p>
                          </div>
                        )}
                        
                        {result.product_data.barcode && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">条形码</span>
                            <p className="font-medium font-mono">{result.product_data.barcode}</p>
                          </div>
                        )}
                        
                        {result.product_data.shelf_life !== undefined && result.product_data.shelf_life !== null && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">保质期</span>
                            <p className="font-medium">{result.product_data.shelf_life} 个月</p>
                          </div>
                        )}
                        
                        {result.product_data.origin && (
                          <div className="border-b pb-2">
                            <span className="text-sm text-gray-500">产地</span>
                            <p className="font-medium">{result.product_data.origin}</p>
                          </div>
                        )}
                        
                        {result.product_data.notes && (
                          <div className="pb-2">
                            <span className="text-sm text-gray-500">备注</span>
                            <p className="font-medium text-sm">{result.product_data.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {result.messages && result.messages.length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-800 mb-1">提示：</p>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {result.messages.map((msg, idx) => (
                            <li key={idx}>• {msg}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-6 flex gap-2">
                      <Button
                        onClick={() => setShowForm(true)}
                        className="flex-1"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        编辑并保存到数据库
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setResult(null)}
                      >
                        重新提取
                      </Button>
                    </div>
                  </Card>

                  {/* Raw Response (Debug) */}
                  {result.raw_response && (
                    <Card className="p-4">
                      <details>
                        <summary className="cursor-pointer text-sm font-medium text-gray-700">
                          查看原始响应
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto">
                          {result.raw_response}
                        </pre>
                      </details>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {!result && !loading && (
            <Card className="p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">在左侧输入商品信息后，AI 将帮您提取结构化数据</p>
            </Card>
          )}
        </div>
      </div>

      {/* 编辑表单弹窗 */}
      {showForm && result?.product_data && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">编辑商品信息</h2>
              <div className="mb-4 space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>✨ AI 识别结果：</strong> AI已自动填充以下信息，请检查并补充完整后保存。
                  </p>
                </div>
                
                {/* AI识别成功的字段提示 */}
                {formDataCache?._aiData && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs font-semibold text-green-800 mb-2">✅ 已自动填充的字段：</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {formDataCache?.product_name && (
                        <div className="text-green-700">✓ 商品名称</div>
                      )}
                      {formDataCache?.brand_id && (
                        <div className="text-green-700">✓ 品牌（已匹配）</div>
                      )}
                      {formDataCache?.classify_id && (
                        <div className="text-green-700">✓ 分类（已匹配）</div>
                      )}
                      {formDataCache?.product_baozhiqi && (
                        <div className="text-green-700">✓ 保质期</div>
                      )}
                      {formDataCache?.local && (
                        <div className="text-green-700">✓ 产地</div>
                      )}
                      {formDataCache?.specs?.[0]?.value && (
                        <div className="text-green-700">✓ 规格</div>
                      )}
                      {formDataCache?.specs?.[0]?.barcode && (
                        <div className="text-green-700">✓ 条形码</div>
                      )}
                      {formDataCache?.specs?.[0]?.picture && (
                        <div className="text-green-700">✓ 规格图片</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* AI识别但未匹配的字段提示 */}
                {formDataCache?._aiData && (
                  (!formDataCache?.brand_id && formDataCache?._aiData.brand) ||
                  (!formDataCache?.classify_id && formDataCache?._aiData.category)
                ) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs font-semibold text-yellow-800 mb-2">⚠️ 需要手动选择：</p>
                    <div className="space-y-1 text-xs text-yellow-700">
                      {!formDataCache?.brand_id && formDataCache?._aiData.brand && (
                        <div>• 品牌：AI识别为"{formDataCache?._aiData.brand}"，请在下方下拉框中选择或创建</div>
                      )}
                      {!formDataCache?.classify_id && formDataCache?._aiData.category && (
                        <div>• 分类：AI识别为"{formDataCache?._aiData.category}"，请在下方下拉框中选择或创建</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <ProductForm
                initialData={formDataCache}
                brands={brandsData?.data}
                categories={classifyData?.data}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

