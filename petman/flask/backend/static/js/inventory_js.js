// static/js/inventory.js
let currentProductId = null; // 用于规格管理的商品ID

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    setupEventListeners();
    
    // 设置标签页切换事件
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            showTab(tabId);
        });
    });
});

// 设置事件监听器
function setupEventListeners() {
    // 表单提交事件
    document.getElementById('product-form').addEventListener('submit', handleProductFormSubmit);
    document.getElementById('classify-form').addEventListener('submit', handleClassifyFormSubmit);
    document.getElementById('brand-form').addEventListener('submit', handleBrandFormSubmit);
    document.getElementById('spec-form').addEventListener('submit', handleSpecFormSubmit);
    document.getElementById('dealer-form').addEventListener('submit', handleDealerFormSubmit);
    document.getElementById('stock-in-form').addEventListener('submit', handleStockInFormSubmit);
    
    // 规格模态框打开事件
    document.getElementById('add-spec-btn').addEventListener('click', function() {
        if (currentProductId) {
            const productName = document.querySelector(`#product-table tr[data-id="${currentProductId}"] td:nth-child(2)`).textContent;
            openSpecModal(currentProductId, productName);
        }
    });
}

// 加载所有数据
function loadAllData() {
    loadProducts();
    loadClassify();
    loadBrands();
    loadDealers();
    loadStockInRecords();
}

// 切换标签页
function showTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有标签按钮的活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示当前标签内容
    document.getElementById(tabName).classList.add('active');
    
    // 设置当前标签按钮为活动状态
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
}

// 打开模态框
function openModal(modalId) {
    // 重置表单
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    // 清空隐藏字段
    const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
    hiddenInputs.forEach(input => input.value = '');
    
    // 显示模态框
    document.getElementById(modalId).style.display = 'block';
    
    // 根据模态框类型加载相关数据
    if (modalId === 'classifyModal') {
        loadClassifyOptions();
    } else if (modalId === 'productModal') {
        loadClassifyOptions();
        loadBrandOptions();
    } else if (modalId === 'stockInModal') {
        loadDealerOptions();
        loadProductSpecOptions();
    }
}

// 关闭模态框
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 点击模态框外部关闭
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// ==================== 商品管理 ====================
function loadProducts() {
    fetch('/api/inventory/products')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.querySelector('#product-table tbody');
                tbody.innerHTML = '';
                
                data.data.forEach(product => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', product.productID);
                    row.innerHTML = `
                        <td>${product.productID}</td>
                        <td>${product.product_name}</td>
                        <td>${product.classify_name}</td>
                        <td>${product.brandname}</td>
                        <td>${product.product_baozhiqi}</td>
                        <td>${product.local}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editProduct(${product.productID})">
                                <i class="fas fa-edit"></i> 编辑
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.productID})">
                                <i class="fas fa-trash"></i> 删除
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="showProductSpecs(${product.productID}, '${product.product_name}')">
                                <i class="fas fa-list"></i> 规格
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                alert('加载商品数据失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载商品数据时发生错误');
        });
}

function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
        product_name: document.getElementById('product-name').value,
        classify_level1_classify1_ID: document.getElementById('product-classify').value,
        brand_brandID: document.getElementById('product-brand').value,
        product_baozhiqi: document.getElementById('product-baozhiqi').value,
        local: document.getElementById('product-local').value
    };
    
    const url = productId ? `/api/inventory/products/${productId}` : '/api/inventory/products';
    const method = productId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(productId ? '商品更新成功' : '商品添加成功');
            closeModal('productModal');
            loadProducts();
        } else {
            alert('操作失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('操作失败');
    });
}

function editProduct(productId) {
    fetch(`/api/inventory/products`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const product = data.data.find(p => p.productID == productId);
                if (product) {
                    document.getElementById('product-id').value = product.productID;
                    document.getElementById('product-name').value = product.product_name;
                    document.getElementById('product-classify').value = product.classify_level1_classify1_ID;
                    document.getElementById('product-brand').value = product.brand_brandID;
                    document.getElementById('product-baozhiqi').value = product.product_baozhiqi;
                    document.getElementById('product-local').value = product.local;
                    
                    openModal('productModal');
                }
            } else {
                alert('获取商品信息失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('获取商品信息时发生错误');
        });
}

function deleteProduct(productId) {
    if (confirm('确定要删除这个商品吗？')) {
        fetch(`/api/inventory/products/${productId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('商品删除成功');
                loadProducts();
            } else {
                alert('删除失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('删除失败');
        });
    }
}

function showProductSpecs(productId, productName) {
    currentProductId = productId;
    document.getElementById('add-spec-btn').disabled = false;
    loadSpecsByProduct(productId, productName);
    
    // 切换到规格标签页
    showTab('products');
}

// ==================== 分类管理 ====================
function loadClassify() {
    fetch('/api/inventory/classify')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.querySelector('#classify-table tbody');
                tbody.innerHTML = '';
                
                data.data.forEach(classify => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', classify.classify1_ID);
                    row.innerHTML = `
                        <td>${classify.classify1_ID}</td>
                        <td>${classify.name}</td>
                        <td>${classify.parent_name || '-'}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editClassify(${classify.classify1_ID})">
                                <i class="fas fa-edit"></i> 编辑
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteClassify(${classify.classify1_ID})">
                                <i class="fas fa-trash"></i> 删除
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                alert('加载分类数据失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载分类数据时发生错误');
        });
}

function loadClassifyOptions() {
    fetch('/api/inventory/classify')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const select = document.getElementById('classify-parent');
                const productSelect = document.getElementById('product-classify');
                
                // 保存当前选中值
                const selectedValue = select.value;
                const productSelectedValue = productSelect ? productSelect.value : null;
                
                // 清空选项
                select.innerHTML = '<option value="">无</option>';
                if (productSelect) {
                    productSelect.innerHTML = '';
                }
                
                // 添加选项
                data.data.forEach(classify => {
                    const option = document.createElement('option');
                    option.value = classify.classify1_ID;
                    option.textContent = classify.name;
                    
                    select.appendChild(option.cloneNode(true));
                    if (productSelect) {
                        productSelect.appendChild(option.cloneNode(true));
                    }
                });
                
                // 恢复选中值
                if (selectedValue) {
                    select.value = selectedValue;
                }
                if (productSelectedValue && productSelect) {
                    productSelect.value = productSelectedValue;
                }
            } else {
                alert('加载分类选项失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载分类选项时发生错误');
        });
}

function handleClassifyFormSubmit(e) {
    e.preventDefault();
    
    const classifyId = document.getElementById('classify-id').value;
    const classifyData = {
        name: document.getElementById('classify-name').value,
        parentID: document.getElementById('classify-parent').value || null
    };
    
    const url = classifyId ? `/api/inventory/classify/${classifyId}` : '/api/inventory/classify';
    const method = classifyId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(classifyData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(classifyId ? '分类更新成功' : '分类添加成功');
            closeModal('classifyModal');
            loadClassify();
        } else {
            alert('操作失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('操作失败');
    });
}

function editClassify(classifyId) {
    fetch(`/api/inventory/classify`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const classify = data.data.find(c => c.classify1_ID == classifyId);
                if (classify) {
                    document.getElementById('classify-id').value = classify.classify1_ID;
                    document.getElementById('classify-name').value = classify.name;
                    document.getElementById('classify-parent').value = classify.parentID || '';
                    
                    openModal('classifyModal');
                }
            } else {
                alert('获取分类信息失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('获取分类信息时发生错误');
        });
}

function deleteClassify(classifyId) {
    if (confirm('确定要删除这个分类吗？')) {
        fetch(`/api/inventory/classify/${classifyId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('分类删除成功');
                loadClassify();
            } else {
                alert('删除失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('删除失败');
        });
    }
}

// ==================== 品牌管理 ====================
function loadBrands() {
    fetch('/api/inventory/brands')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.querySelector('#brand-table tbody');
                tbody.innerHTML = '';
                
                data.data.forEach(brand => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', brand.brandID);
                    row.innerHTML = `
                        <td>${brand.brandID}</td>
                        <td>${brand.brandname}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editBrand(${brand.brandID})">
                                <i class="fas fa-edit"></i> 编辑
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteBrand(${brand.brandID})">
                                <i class="fas fa-trash"></i> 删除
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                alert('加载品牌数据失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载品牌数据时发生错误');
        });
}

function loadBrandOptions() {
    fetch('/api/inventory/brands')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const select = document.getElementById('product-brand');
                const selectedValue = select.value;
                select.innerHTML = '';
                
                data.data.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand.brandID;
                    option.textContent = brand.brandname;
                    select.appendChild(option);
                });
                
                if (selectedValue) {
                    select.value = selectedValue;
                }
            } else {
                alert('加载品牌选项失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载品牌选项时发生错误');
        });
}

function handleBrandFormSubmit(e) {
    e.preventDefault();
    
    const brandId = document.getElementById('brand-id').value;
    const brandData = {
        brandname: document.getElementById('brand-name').value
    };
    
    const url = brandId ? `/api/inventory/brands/${brandId}` : '/api/inventory/brands';
    const method = brandId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(brandId ? '品牌更新成功' : '品牌添加成功');
            closeModal('brandModal');
            loadBrands();
            loadBrandOptions(); // 更新商品表单中的品牌选项
        } else {
            alert('操作失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('操作失败');
    });
}

function editBrand(brandId) {
    fetch(`/api/inventory/brands`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const brand = data.data.find(b => b.brandID == brandId);
                if (brand) {
                    document.getElementById('brand-id').value = brand.brandID;
                    document.getElementById('brand-name').value = brand.brandname;
                    
                    openModal('brandModal');
                }
            } else {
                alert('获取品牌信息失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('获取品牌信息时发生错误');
        });
}

function deleteBrand(brandId) {
    if (confirm('确定要删除这个品牌吗？')) {
        fetch(`/api/inventory/brands/${brandId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('品牌删除成功');
                loadBrands();
                loadBrandOptions(); // 更新商品表单中的品牌选项
            } else {
                alert('删除失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('删除失败');
        });
    }
}

// ==================== 规格管理 ====================
function loadSpecsByProduct(productId, productName) {
    fetch('/api/inventory/specs')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.querySelector('#spec-table tbody');
                tbody.innerHTML = '';
                
                const specs = data.data.filter(spec => spec.productID == productId);
                
                specs.forEach(spec => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', spec.specID);
                    row.innerHTML = `
                        <td>${spec.specID}</td>
                        <td>${spec.product_name}</td>
                        <td>${spec.spec_name}</td>
                        <td>${spec.spec_value}</td>
                        <td>${spec.barcode || '-'}</td>
                        <td>${spec.总库存}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editSpec(${spec.specID})">
                                <i class="fas fa-edit"></i> 编辑
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteSpec(${spec.specID})">
                                <i class="fas fa-trash"></i> 删除
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                
                // 更新规格列表标题
                document.querySelector('#spec-table thead th:first-child').textContent = `规格列表 (${productName})`;
            } else {
                alert('加载规格数据失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载规格数据时发生错误');
        });
}

function openSpecModal(productId, productName, specId = null) {
    document.getElementById('spec-product-id').value = productId;
    document.getElementById('spec-product-name').textContent = productName;
    
    // 清空表单
    document.getElementById('spec-form').reset();
    document.getElementById('spec-id').value = '';
    
    if (specId) {
        // 编辑模式
        fetch(`/api/inventory/specs`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const spec = data.data.find(s => s.specID == specId);
                    if (spec) {
                        document.getElementById('spec-id').value = spec.specID;
                        document.getElementById('spec-name').value = spec.spec_name;
                        document.getElementById('spec-value').value = spec.spec_value;
                        document.getElementById('spec-barcode').value = spec.barcode || '';
                        document.getElementById('spec-stock').value = spec.总库存;
                        document.getElementById('spec-picture').value = spec.picture || '';
                    }
                    document.getElementById('specModal').style.display = 'block';
                }
            });
    } else {
        // 添加模式
        document.getElementById('specModal').style.display = 'block';
    }
}

function handleSpecFormSubmit(e) {
    e.preventDefault();
    
    const specId = document.getElementById('spec-id').value;
    const specData = {
        spec_name: document.getElementById('spec-name').value,
        spec_value: document.getElementById('spec-value').value,
        barcode: document.getElementById('spec-barcode').value,
        总库存: document.getElementById('spec-stock').value,
        picture: document.getElementById('spec-picture').value,
        product_productID: document.getElementById('spec-product-id').value
    };
    
    const url = specId ? `/api/inventory/specs/${specId}` : '/api/inventory/specs';
    const method = specId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(specData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(specId ? '规格更新成功' : '规格添加成功');
            closeModal('specModal');
            if (currentProductId) {
                const productName = document.querySelector(`#product-table tr[data-id="${currentProductId}"] td:nth-child(2)`).textContent;
                loadSpecsByProduct(currentProductId, productName);
            }
        } else {
            alert('操作失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('操作失败');
    });
}

function editSpec(specId) {
    if (currentProductId) {
        const productName = document.querySelector(`#product-table tr[data-id="${currentProductId}"] td:nth-child(2)`).textContent;
        openSpecModal(currentProductId, productName, specId);
    }
}

function deleteSpec(specId) {
    if (confirm('确定要删除这个规格吗？')) {
        fetch(`/api/inventory/specs/${specId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('规格删除成功');
                if (currentProductId) {
                    const productName = document.querySelector(`#product-table tr[data-id="${currentProductId}"] td:nth-child(2)`).textContent;
                    loadSpecsByProduct(currentProductId, productName);
                }
            } else {
                alert('删除失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('删除失败');
        });
    }
}

// ==================== 经销商管理 ====================
function loadDealers() {
    fetch('/api/inventory/dealers')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.querySelector('#dealer-table tbody');
                tbody.innerHTML = '';
                
                data.data.forEach(dealer => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', dealer.dealerID);
                    row.innerHTML = `
                        <td>${dealer.dealerID}</td>
                        <td>${dealer.dealer_name}</td>
                        <td>${dealer.dealer_tel}</td>
                        <td>${dealer.dealer_address}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="editDealer(${dealer.dealerID})">
                                <i class="fas fa-edit"></i> 编辑
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteDealer(${dealer.dealerID})">
                                <i class="fas fa-trash"></i> 删除
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                alert('加载经销商数据失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载经销商数据时发生错误');
        });
}

function loadDealerOptions() {
    fetch('/api/inventory/dealers')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const select = document.getElementById('stock-in-dealer');
                const selectedValue = select.value;
                select.innerHTML = '';
                
                data.data.forEach(dealer => {
                    const option = document.createElement('option');
                    option.value = dealer.dealerID;
                    option.textContent = dealer.dealer_name;
                    select.appendChild(option);
                });
                
                if (selectedValue) {
                    select.value = selectedValue;
                }
            } else {
                alert('加载经销商选项失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载经销商选项时发生错误');
        });
}

function handleDealerFormSubmit(e) {
    e.preventDefault();
    
    const dealerId = document.getElementById('dealer-id').value;
    const dealerData = {
        dealer_name: document.getElementById('dealer-name').value,
        dealer_tel: document.getElementById('dealer-tel').value,
        dealer_address: document.getElementById('dealer-address').value
    };
    
    const url = dealerId ? `/api/inventory/dealers/${dealerId}` : '/api/inventory/dealers';
    const method = dealerId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealerData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(dealerId ? '经销商更新成功' : '经销商添加成功');
            closeModal('dealerModal');
            loadDealers();
            loadDealerOptions(); // 更新入库表单中的经销商选项
        } else {
            alert('操作失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('操作失败');
    });
}

function editDealer(dealerId) {
    fetch(`/api/inventory/dealers`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const dealer = data.data.find(d => d.dealerID == dealerId);
                if (dealer) {
                    document.getElementById('dealer-id').value = dealer.dealerID;
                    document.getElementById('dealer-name').value = dealer.dealer_name;
                    document.getElementById('dealer-tel').value = dealer.dealer_tel;
                    document.getElementById('dealer-address').value = dealer.dealer_address;
                    
                    openModal('dealerModal');
                }
            } else {
                alert('获取经销商信息失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('获取经销商信息时发生错误');
        });
}

function deleteDealer(dealerId) {
    if (confirm('确定要删除这个经销商吗？')) {
        fetch(`/api/inventory/dealers/${dealerId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('经销商删除成功');
                loadDealers();
                loadDealerOptions(); // 更新入库表单中的经销商选项
            } else {
                alert('删除失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('删除失败');
        });
    }
}

// ==================== 入库管理 ====================
function loadStockInRecords() {
    fetch('/api/inventory/stock_in_records')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.querySelector('#stock-in-table tbody');
                tbody.innerHTML = '';
                
                data.data.forEach(record => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${record.stock_inID}</td>
                        <td>${record.dealer_name}</td>
                        <td>${new Date(record.stock_in_date).toLocaleDateString()}</td>
                        <td>${record.total_amount}</td>
                        <td>${record.product_name}</td>
                        <td>${record.spec_name} ${record.spec_value}</td>
                        <td>${record.quantity}</td>
                        <td>${record.price_in}</td>
                        <td>${record.product_date}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                alert('加载入库记录失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载入库记录时发生错误');
        });
}

function loadProductSpecOptions() {
    // 加载商品和规格选项到入库表单
    Promise.all([
        fetch('/api/inventory/products').then(response => response.json()),
        fetch('/api/inventory/specs').then(response => response.json())
    ])
    .then(([productsData, specsData]) => {
        if (productsData.status === 'success' && specsData.status === 'success') {
            const tableBody = document.querySelector('#stock-in-detail-table tbody');
            const firstRow = tableBody.querySelector('tr');
            
            if (firstRow) {
                const productNameCell = firstRow.querySelector('.product-name');
                const specSelect = firstRow.querySelector('select[name="spec_id"]');
                
                // 清空选项
                specSelect.innerHTML = '';
                
                // 添加规格选项
                specsData.data.forEach(spec => {
                    const option = document.createElement('option');
                    option.value = spec.specID;
                    option.textContent = `${spec.product_name} - ${spec.spec_name} ${spec.spec_value}`;
                    specSelect.appendChild(option);
                });
                
                // 设置商品名称（第一个商品）
                if (productsData.data.length > 0) {
                    productNameCell.textContent = productsData.data[0].product_name;
                }
            }
        } else {
            alert('加载商品或规格数据失败');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载商品或规格数据时发生错误');
    });
}

function addDetailRow() {
    const tbody = document.querySelector('#stock-in-detail-table tbody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td class="product-name">-</td>
        <td><select name="spec_id"></select></td>
        <td><input type="number" name="quantity" min="1" value="1" required></td>
        <td><input type="number" name="price_in" step="0.01" value="0.00" required></td>
        <td><input type="date" name="product_date" required></td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeDetailRow(this)">
            <i class="fas fa-trash"></i> 删除
        </button></td>
    `;
    
    tbody.appendChild(newRow);
    loadProductSpecOptions(); // 重新加载选项
}

function removeDetailRow(button) {
    if (document.querySelectorAll('#stock-in-detail-table tbody tr').length > 1) {
        button.closest('tr').remove();
    } else {
        alert('至少需要保留一行');
    }
}

function handleStockInFormSubmit(e) {
    e.preventDefault();
    
    const dealerId = document.getElementById('stock-in-dealer').value;
    if (!dealerId) {
        alert('请选择经销商');
        return;
    }
    
    const rows = document.querySelectorAll('#stock-in-detail-table tbody tr');
    const items = [];
    let totalAmount = 0;
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const specId = row.querySelector('select[name="spec_id"]').value;
        const quantity = row.querySelector('input[name="quantity"]').value;
        const priceIn = row.querySelector('input[name="price_in"]').value;
        const productDate = row.querySelector('input[name="product_date"]').value;
        
        if (!specId || !quantity || !priceIn || !productDate) {
            alert(`第${i+1}行数据不完整`);
            return;
        }
        
        const itemTotal = parseFloat(quantity) * parseFloat(priceIn);
        totalAmount += itemTotal;
        
        items.push({
            spec_id: specId,
            quantity: quantity,
            price_in: priceIn,
            product_date: productDate
        });
    }
    
    const stockInData = {
        dealer_id: dealerId,
        total_amount: totalAmount.toFixed(2),
        items: items
    };
    
    fetch('/api/inventory/stock_in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockInData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('入库成功');
            closeModal('stockInModal');
            loadStockInRecords();
        } else {
            alert('入库失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('入库失败');
    });
}