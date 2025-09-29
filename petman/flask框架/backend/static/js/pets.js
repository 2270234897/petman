document.addEventListener('DOMContentLoaded', function() {
    petsAPI.getAll().then(response => {
        if(response.status === 'success') {
            renderPets(response.data);
        } else {
            console.error('获取宠物数据失败:', response.message);
        }
    })
});

// DOM元素
const petTableBody = document.getElementById('petTableBody');
const petForm = document.getElementById('petForm');
const petModal = document.getElementById('petModal');
const modalTitle = document.getElementById('modalTitle');
const addPetBtn = document.getElementById('addPetBtn');
const searchInput = document.getElementById('searchInput');

// 当前操作模式
let currentMode = 'add';

// 初始化页面
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadPets();
        await loadCustomersForSelect();
        
        // 事件监听
        addPetBtn.addEventListener('click', showAddPetModal);
        searchInput.addEventListener('input', filterPets);
        petForm.addEventListener('submit', handleFormSubmit);
        
    } catch (error) {
        showAlert(`初始化失败: ${error.message}`, 'error');
        console.error('初始化失败:', error);
    }
});

// 加载宠物数据
async function loadPets() {
    try {
        showLoading(true);
        const response = await petsAPI.getAll();
        renderPets(response.data);
    } catch (error) {
        showAlert(`加载宠物失败: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// 加载客户数据用于下拉选择
async function loadCustomersForSelect() {
    try {
        const response = await customersAPI.getAll();
        const select = document.getElementById('customers_customerID');
        
        // 清空现有选项（保留第一个"请选择"选项）
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // 添加客户选项
        response.data.forEach(customer => {
            const option = new Option(
                `${customer.customername} (${customer.telphone})`,
                customer.customerID
            );
            select.add(option);
        });
    } catch (error) {
        showAlert(`加载客户数据失败: ${error.message}`, 'error');
    }
}

// 渲染宠物列表
function renderPets(pets) {
    petTableBody.innerHTML = '';
    
    pets.forEach(pet => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pet.petID}</td>
            <td>${pet.petname}</td>
            <td>${pet.pet_species}</td>
            <td>${pet.pet_breeds}</td>
            <td>${pet.pet_gender}</td>
            <td>${pet.pet_age}</td>
            <td>${pet.owner_name || '未知'}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" onclick="editPet(${pet.petID})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deletePet(${pet.petID})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        petTableBody.appendChild(row);
    });
}

// 显示添加宠物模态框
function showAddPetModal() {
    currentMode = 'add';
    modalTitle.textContent = '添加新宠物';
    petForm.reset();
    petModal.style.display = 'flex';
}

// 编辑宠物
window.editPet = async function(petId) {
    try {
        showLoading(true);
        const response = await petsAPI.getById(petId);
        
        currentMode = 'edit';
        modalTitle.textContent = '编辑宠物信息';
        
        // 填充表单
        document.getElementById('petId').value = petId;
        document.getElementById('petname').value = response.data.petname;
        document.getElementById('pet_species').value = response.data.pet_species;
        document.getElementById('pet_breeds').value = response.data.pet_breeds;
        document.getElementById('pet_gender').value = response.data.pet_gender;
        document.getElementById('pet_age').value = response.data.pet_age;
        document.getElementById('neuter').value = response.data.neuter || '';
        document.getElementById('pet_character').value = response.data.pet_character || '';
        document.getElementById('customers_customerID').value = response.data.customers_customerID;
        
        petModal.style.display = 'flex';
    } catch (error) {
        showAlert(`获取宠物信息失败: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
};

// 删除宠物
window.deletePet = async function(petId) {
    if (confirm('确定要删除这个宠物吗？此操作不可撤销。')) {
        try {
            showLoading(true);
            await petsAPI.delete(petId);
            showAlert('宠物删除成功', 'success');
            await loadPets();
        } catch (error) {
            showAlert(`删除失败: ${error.message}`, 'error');
        } finally {
            showLoading(false);
        }
    }
};

// 处理表单提交
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
        
        const formData = {
            petname: document.getElementById('petname').value.trim(),
            pet_species: document.getElementById('pet_species').value,
            pet_breeds: document.getElementById('pet_breeds').value.trim(),
            pet_gender: document.getElementById('pet_gender').value,
            pet_age: parseInt(document.getElementById('pet_age').value),
            neuter: document.getElementById('neuter').value || null,
            pet_character: document.getElementById('pet_character').value.trim() || null,
            customers_customerID: parseInt(document.getElementById('customers_customerID').value)
        };
        
        // 验证表单数据
        validatePetForm(formData);
        
        let response;
        if (currentMode === 'add') {
            response = await petsAPI.create(formData);
            showAlert('宠物添加成功', 'success');
        } else {
            const petId = document.getElementById('petId').value;
            formData.petID = petId;
            response = await petsAPI.update(formData);
            showAlert('宠物信息更新成功', 'success');
        }
        
        petModal.style.display = 'none';
        await loadPets();
        
    } catch (error) {
        showAlert(`提交失败: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// 表单验证
function validatePetForm(data) {
    const errors = [];
    
    if (!data.petname) errors.push('宠物名称不能为空');
    if (!data.pet_species) errors.push('请选择宠物种类');
    if (!data.pet_breeds) errors.push('宠物品种不能为空');
    if (!data.pet_gender) errors.push('请选择宠物性别');
    if (isNaN(data.pet_age) || data.pet_age < 0 || data.pet_age > 30) {
        errors.push('请输入有效的年龄(0-30)');
    }
    if (isNaN(data.customers_customerID)) errors.push('请选择主人');
    
    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }
}

// 过滤宠物
function filterPets() {
    const searchTerm = searchInput.value.toLowerCase();
    const rows = petTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const species = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const visible = name.includes(searchTerm) || species.includes(searchTerm);
        row.style.display = visible ? '' : 'none';
    });
}

// 显示加载状态
function showLoading(show) {
    const loader = document.getElementById('loadingOverlay');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

// 显示提示消息
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        ${message}
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => alertDiv.remove(), 3000);
}