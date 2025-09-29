const API_CONFIG = {
    baseURL: 'http://localhost:5000/api',
    endpoints: {
        customers: '/customers',
        customers_get: '/customers/get',
        pets: '/pets',
        pets_post: '/pets/post',
        pets_put: '/pets/put/',
        pets_delete: '/pets/delete/',
        pets_getbyid: '/pets/getbyid/'
    }
};

// 使用函数表达式而不是箭头函数确保兼容性
function apiRequest(method, endpoint, data = null, params = {}) {
    let url = API_CONFIG.baseURL + endpoint;
    
    // 处理查询参数
    if (params && Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += '?' + queryString;
    }
    
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: data ? JSON.stringify(data) : null
    })
    .then(response => {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return response.text().then(text => {
                throw new Error(`服务器返回了非JSON响应: ${text.substring(0, 100)}`);
            });
        }
        return response.json();
    });
}

window.petsAPI = {
    getAll: function() {
        return apiRequest('GET', API_CONFIG.endpoints.pets);
    },
    getById: function(id) {
        return apiRequest('GET', `${API_CONFIG.endpoints.pets_getbyid}/${id}`);
    },
    create: function(pet) {
        return apiRequest('POST', API_CONFIG.endpoints.pets_post, pet);
    },
    update: function(pet) {
        return apiRequest('PUT', `${API_CONFIG.endpoints.pets_put}/${pet.petID}`, pet);
    },
    delete: function(id) {
        return apiRequest('DELETE', `${API_CONFIG.endpoints.pets_delete}/${id}`);
    }
};

window.customersAPI = {
    // 获取所有客户
    getAll: function() {
        return apiRequest('GET', API_CONFIG.endpoints.customers_get);
    },
    
    // 创建新客户
    create: function(customerData) {
        return apiRequest('POST', API_CONFIG.endpoints.customers, customerData);
    },
    
    // 更新客户信息
    update: function(id, updateData) {
        return apiRequest('PUT', `${API_CONFIG.endpoints.customers}/${id}`, updateData);
    },
    
    // 删除客户
    delete: function(id) {
        return apiRequest('DELETE', `${API_CONFIG.endpoints.customers}/${id}`);
    }
};

// 在api-client.js中添加预约API模块
window.appointmentsAPI = {
    // 获取所有预约（可筛选）
    getAll: function(params = {}) {
        return apiRequest('GET', '/appointments/get', null, params);
    },
    
    // 创建新预约
    create: function(appointmentData) {
        return apiRequest('POST', '/appointments/post', appointmentData);
    },
    
    // 更新预约信息
    update: function(id, updateData) {
        return apiRequest('PUT', `/appointments/put/${id}`, updateData);
    },
    
    // 删除预约
    delete: function(id) {
        return apiRequest('DELETE', `/appointments/delete/${id}`);
    },
    
    // 变更预约状态
    updateStatus: function(id, newStatus) {
        return apiRequest('PUT', `/appointments/status/${id}`, { status: newStatus });
    }
};

window.servicesAPI = {
    // 获取所有服务项目
    getAll: function() {
        return apiRequest('GET', '/appointments/services/get');
    },
    
    // 创建新服务
    create: function(serviceData) {
        return apiRequest('POST', '/appointments/services/post', serviceData);
    },
    
    // 更新服务信息
    update: function(id, updateData) {
        return apiRequest('PUT', `/appointments/services/put/${id}`, updateData);
    },
    
    // 删除服务
    delete: function(id) {
        return apiRequest('DELETE', `/appointments/services/delete/${id}`);
    }
};