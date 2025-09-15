const API_CONFIG = {
    baseURL: 'http://localhost:5000/api',
    endpoints: {
        customers: '/customers',
        pets: '/pets',
        pets_post: '/pets/post',
        pets_put: '/pets/put/',
        pets_delete: '/pets/delete/',
        pets_getbyid: '/pets/getbyid/'
    }
};



// 使用函数表达式而不是箭头函数确保兼容性
function apiRequest(method, endpoint, data) {
    const url = API_CONFIG.baseURL + endpoint;
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
    getAll: function() {
        return apiRequest('GET', API_CONFIG.endpoints.customers);
    }
};

