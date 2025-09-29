
// API基础URL
const API_BASE_URL = 'http://localhost:5000/api/customers';

// DOM元素
const customerTableBody = document.getElementById('customerTableBody');
const customerForm = document.getElementById('customerForm');
const customerModal = document.getElementById('customerModal');
const modalTitle = document.getElementById('modalTitle');
const addCustomerBtn = document.getElementById('addCustomerBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');

// 当前操作模式（add/edit）
let currentMode = 'add';

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    
    // 事件监听
    addCustomerBtn.addEventListener('click', () => {
        currentMode = 'add';
        modalTitle.textContent = '添加新客户';
        customerForm.reset();
        customerModal.style.display = 'flex';
    });
    
    closeModalBtn.addEventListener('click', () => {
        customerModal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        customerModal.style.display = 'none';
    });
    
    customerForm.addEventListener('submit', handleFormSubmit);
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = customerTableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const phone = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || phone.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});

// 加载客户数据
async function loadCustomers() {
    try {
        const response = await fetch(`${API_BASE_URL}/get`);
        const result = await response.json();
        
        if (result.status === 'success') {
            renderCustomers(result.data);
        } else {
            console.error('加载客户数据失败:', result.message);
        }
    } catch (error) {
        console.error('请求失败:', error);
    }
}

// 渲染客户列表
function renderCustomers(customers) {
    customerTableBody.innerHTML = '';
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${customer.customerID}</td>
            <td>${customer.customername}</td>
            <td>${customer.gender}</td>
            <td>${customer.telphone}</td>
            <td>${customer.address}</td>
            <td>${customer.Membershiplevel}</td>
            <td><span class="status-badge status-active">活跃</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" onclick="editCustomer(${customer.customerID})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteCustomer(${customer.customerID})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        customerTableBody.appendChild(row);
    });
}

// 编辑客户
window.editCustomer = async function(customerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/get`);
        const result = await response.json();
        
        if (result.status === 'success') {
            const customer = result.data.find(c => c.customerID == customerId);
            
            if (customer) {
                currentMode = 'edit';
                modalTitle.textContent = '编辑客户信息';
                
                // 填充表单
                document.getElementById('customerId').value = customer.customerID;
                document.getElementById('customername').value = customer.customername;
                document.getElementById('gender').value = customer.gender;
                document.getElementById('address').value = customer.address;
                document.getElementById('telphone').value = customer.telphone;
                document.getElementById('Membershiplevel').value = customer.Membershiplevel;
                
                customerModal.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('获取客户信息失败:', error);
    }
};

// 删除客户
window.deleteCustomer = async function(customerId) {
    if (confirm('确定要删除这个客户吗？此操作不可撤销。')) {
        try {
            const response = await fetch(`${API_BASE_URL}/delete/${customerId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                alert('客户删除成功');
                loadCustomers();
            } else {
                alert('删除失败: ' + result.message);
            }
        } catch (error) {
            console.error('删除客户失败:', error);
            alert('删除客户时出错');
        }
    }
};

// 处理表单提交
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const customerData = {
        customername: document.getElementById('customername').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value,
        telphone: document.getElementById('telphone').value,
        Membershiplevel: document.getElementById('Membershiplevel').value
    };
    
    try {
        let response, result;
        
        if (currentMode === 'add') {
            // 添加新客户
            response = await fetch(`${API_BASE_URL}/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(customerData),           
            });
            
            // 检查响应内容类型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`服务器返回了非JSON响应: ${text.substring(0, 100)}...`);
            }
            result = await response.json();
            
            if (result.status === 'success') {
                alert('客户添加成功');
                customerModal.style.display = 'none';
                loadCustomers();
            } else {
                alert('添加失败: ' + result.message);
            }
        } else {
            // 更新客户信息
            const customerId = document.getElementById('customerId').value;
            response = await fetch(`${API_BASE_URL}/put/${customerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });
            
            result = await response.json();
            
            if (result.status === 'success') {
                alert('客户信息更新成功');
                customerModal.style.display = 'none';
                loadCustomers();
            } else {
                alert('更新失败: ' + result.message);
            }
        }
    } catch (error) {
        console.error('表单提交失败:', error);
        alert('操作失败，请检查控制台');
    }
}
