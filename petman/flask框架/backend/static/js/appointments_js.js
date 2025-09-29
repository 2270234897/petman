document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const dateFilter = document.getElementById('dateFilter');
    const statusFilter = document.getElementById('statusFilter');
    const addAppointmentBtn = document.getElementById('addAppointmentBtn');
    const appointmentModal = document.getElementById('appointmentModal');
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentTableBody = document.getElementById('appointmentTableBody');
    const prevDayBtn = document.getElementById('prevDay');
    const nextDayBtn = document.getElementById('nextDay');
    const currentDateDisplay = document.getElementById('currentDate');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const customerSelect = document.getElementById('customerSelect');
    const petSelect = document.getElementById('petSelect');
    const serviceSelect = document.getElementById('serviceSelect');
    
    // API调用函数
    const appointmentsAPI = {
        getAll: function(params) {
            const queryString = new URLSearchParams(params).toString();
            return fetch(`/api/appointments/get?${queryString}`)
                .then(response => response.json());
        },
        
        create: function(data) {
            return fetch('/api/appointments/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => response.json());
        },
        
        update: function(id, data) {
            return fetch(`/api/appointments/put/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => response.json());
        },
        
        delete: function(id) {
            return fetch(`/api/appointments/delete/${id}`, {
                method: 'DELETE'
            }).then(response => response.json());
        },
        
        updateStatus: function(id, status) {
            return fetch(`/api/appointments/status/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: status })
            }).then(response => response.json());
        }
    };
    
    const servicesAPI = {
        getAll: function() {
            return fetch('/api/appointments/services/get')
                .then(response => response.json());
        }
    };
    
    const customersAPI = {
        getAll: function() {
            return fetch('/api/customers/get')
                .then(response => response.json());
        }
    };
    
    const petsAPI = {
        getByCustomerId: function(customerId) {
            return fetch(`/api/pets/customer/${customerId}`)
                .then(response => response.json());
        }
    };
    
    // 当前日期
    let currentDate = new Date();
    let selectedAppointmentId = null;
    
    // 初始化
    initDatePicker();
    loadAppointments();
    loadCustomers();
    loadServices();
    updateCurrentDateDisplay();
    generateTimeSlots();
    
    // 事件监听
    dateFilter.addEventListener('change', loadAppointments);
    statusFilter.addEventListener('change', loadAppointments);
    addAppointmentBtn.addEventListener('click', showAddAppointmentModal);
    prevDayBtn.addEventListener('click', goToPrevDay);
    nextDayBtn.addEventListener('click', goToNextDay);
    appointmentForm.addEventListener('submit', handleFormSubmit);
    
    // 关闭模态框按钮事件
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            closeModal(appointmentModal);
        });
    }
    
    // 取消按钮事件
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeModal(appointmentModal);
        });
    }
    
    // 客户选择变化时加载宠物
document.getElementById('customerSelect').addEventListener('change', function() {
    if (this.value) {
        loadPetsByCustomer(this.value);
    } else {
        document.getElementById('petSelect').innerHTML = '<option value="">请选择宠物</option>';
    }
});
    
    // 点击模态框外部关闭
    if (appointmentModal) {
        appointmentModal.addEventListener('click', function(e) {
            if (e.target === appointmentModal) {
                closeModal(appointmentModal);
            }
        });
    }
    
    // 初始化日期选择器
    function initDatePicker() {
        const today = new Date().toISOString().split('T')[0];
        dateFilter.value = today;
    }
    
    // 加载预约数据
    function loadAppointments() {
        showLoading();
        
        const params = {
            date: dateFilter.value,
            status: statusFilter.value
        };
        
        appointmentsAPI.getAll(params)
            .then(response => {
                if (response.status === 'success') {
                    renderAppointments(response.data);
                    updateTimeSlots(response.data);
                } else {
                    throw new Error(response.message || '获取预约数据失败');
                }
            })
            .catch(error => {
                showAlert('加载预约失败: ' + error.message, 'error');
                console.error('加载预约失败:', error);
            })
            .finally(() => {
                hideLoading();
            });
    }
    
    // 渲染预约表格
    function renderAppointments(appointments) {
        appointmentTableBody.innerHTML = '';
        
        if (appointments.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" class="text-center">没有找到预约记录</td>';
            appointmentTableBody.appendChild(row);
            return;
        }
        
        appointments.forEach(appt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appt.appointment_id}</td>
                <td>${appt.customername}</td>
                <td>${appt.petname}</td>
                <td>${appt.service_name}</td>
                <td>${appt.appointment_date}</td>
                <td>${appt.appointment_time}</td>
                <td><span class="status-badge ${getStatusClass(appt.status)}">${appt.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${appt.appointment_id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${appt.appointment_id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary status-btn" data-id="${appt.appointment_id}">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </td>
            `;
            
            appointmentTableBody.appendChild(row);
        });
        
        // 添加按钮事件
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                showEditAppointmentModal(this.dataset.id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteAppointment(this.dataset.id);
            });
        });
        
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                showStatusModal(this.dataset.id);
            });
        });
    }
    
    // 加载客户数据
    function loadCustomers() {
        customersAPI.getAll()
            .then(response => {
                if (response.status === 'success') {
                    customerSelect.innerHTML = '<option value="">请选择客户</option>';
                    
                    response.data.forEach(customer => {
                        const option = document.createElement('option');
                        option.value = customer.customerID;
                        option.textContent = `${customer.customername} (${customer.telphone})`;
                        customerSelect.appendChild(option);
                    });
                } else {
                    throw new Error(response.message || '获取客户数据失败');
                }
            })
            .catch(error => {
                showAlert('加载客户数据失败: ' + error.message, 'error');
            });
    }
    
    // 根据客户ID加载宠物
function loadPetsByCustomer(customerId) {
    if (!customerId) {
        console.error('无效的客户ID:', customerId);
        document.getElementById('petSelect').innerHTML = '<option value="">请先选择客户</option>';
        return;
    }

    showLoading();
    
    petsAPI.getByCustomerId(customerId)
        .then(response => {
            if (response.status === 'success') {
                const petSelect = document.getElementById('petSelect');
                petSelect.innerHTML = '<option value="">请选择宠物</option>';
                
                response.data.forEach(pet => {
                    const option = document.createElement('option');
                    option.value = pet.petID;
                    option.textContent = `${pet.petname} (${pet.pet_species})`;
                    petSelect.appendChild(option);
                });
            } else {
                throw new Error(response.message || '获取宠物数据失败');
            }
        })
        .catch(error => {
            console.error('加载宠物失败:', error);
            showAlert('加载宠物数据失败: ' + error.message, 'error');
        })
        .finally(() => {
            hideLoading();
        });
}
    
    // 加载服务项目
    function loadServices() {
        servicesAPI.getAll()
            .then(response => {
                if (response.status === 'success') {
                    serviceSelect.innerHTML = '<option value="">请选择服务项目</option>';
                    
                    response.data.forEach(service => {
                        const option = document.createElement('option');
                        option.value = service.service_id;
                        option.textContent = `${service.service_name} - ¥${service.price}`;
                        serviceSelect.appendChild(option);
                    });
                } else {
                    throw new Error(response.message || '获取服务项目失败');
                }
            })
            .catch(error => {
                showAlert('加载服务项目失败: ' + error.message, 'error');
            });
    }
    
    // 显示添加预约模态框
    function showAddAppointmentModal() {
        document.getElementById('modalTitle').textContent = '添加新预约';
        document.getElementById('appointmentId').value = '';
        customerSelect.value = '';
        petSelect.innerHTML = '<option value="">请选择宠物</option>';
        serviceSelect.value = '';
        document.getElementById('appointmentDate').value = dateFilter.value;
        document.getElementById('appointmentTime').value = '';
        document.getElementById('appointmentNotes').value = '';
        
        appointmentModal.style.display = 'block';
    }
    
    // 显示编辑预约模态框
    function showEditAppointmentModal(appointmentId) {
    showLoading();
    
    // 先获取预约详情
    appointmentsAPI.getAll({})
        .then(response => {
            if (response.status === 'success') {
                const appointment = response.data.find(a => a.appointment_id == appointmentId);
                if (appointment) {
                    document.getElementById('modalTitle').textContent = '编辑预约';
                    document.getElementById('appointmentId').value = appointment.appointment_id;
                    
                    // 确保客户下拉菜单已加载
                    if (document.getElementById('customerSelect').options.length <= 1) {
                        return loadCustomers().then(() => {
                            document.getElementById('customerSelect').value = appointment.customerID;
                            return loadPetsByCustomer(appointment.customerID);
                        }).then(() => {
                            document.getElementById('petSelect').value = appointment.petID;
                            document.getElementById('serviceSelect').value = appointment.service_id;
                            document.getElementById('appointmentDate').value = appointment.appointment_date;
                            document.getElementById('appointmentTime').value = appointment.appointment_time;
                            document.getElementById('appointmentNotes').value = appointment.notes || '';
                            
                            appointmentModal.style.display = 'block';
                        });
                    } else {
                        document.getElementById('customerSelect').value = appointment.customerID;
                        loadPetsByCustomer(appointment.customerID).then(() => {
                            document.getElementById('petSelect').value = appointment.petID;
                            document.getElementById('serviceSelect').value = appointment.service_id;
                            document.getElementById('appointmentDate').value = appointment.appointment_date;
                            document.getElementById('appointmentTime').value = appointment.appointment_time;
                            document.getElementById('appointmentNotes').value = appointment.notes || '';
                            
                            appointmentModal.style.display = 'block';
                        });
                    }
                } else {
                    throw new Error('未找到预约信息');
                }
            } else {
                throw new Error(response.message || '获取预约详情失败');
            }
        })
        .catch(error => {
            showAlert('加载预约详情失败: ' + error.message, 'error');
        })
        .finally(() => {
            hideLoading();
        });
}

    
    // 处理表单提交
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const appointmentId = document.getElementById('appointmentId').value;
        const isEdit = !!appointmentId;
        
        const data = {
            customerID: customerSelect.value,
            petID: petSelect.value,
            service_id: serviceSelect.value,
            appointment_date: document.getElementById('appointmentDate').value,
            appointment_time: document.getElementById('appointmentTime').value,
            notes: document.getElementById('appointmentNotes').value
        };
        
        // 验证必填字段
        if (!data.customerID || !data.petID || !data.service_id || !data.appointment_date || !data.appointment_time) {
            showAlert('请填写所有必填字段', 'error');
            return;
        }
        
        showLoading();
        
        const promise = isEdit 
            ? appointmentsAPI.update(appointmentId, data)
            : appointmentsAPI.create(data);
            
        promise.then(response => {
                if (response.status === 'success') {
                    showAlert(`预约${isEdit ? '更新' : '创建'}成功`, 'success');
                    closeModal(appointmentModal);
                    loadAppointments();
                } else {
                    throw new Error(response.message || '操作失败');
                }
            })
            .catch(error => {
                showAlert(`预约${isEdit ? '更新' : '创建'}失败: ${error.message}`, 'error');
            })
            .finally(() => {
                hideLoading();
            });
    }
    
    // 删除预约
    function deleteAppointment(id) {
        if (confirm('确定要删除这个预约吗？此操作不可撤销。')) {
            showLoading();
            
            appointmentsAPI.delete(id)
                .then(response => {
                    if (response.status === 'success') {
                        showAlert('预约删除成功', 'success');
                        loadAppointments();
                    } else {
                        throw new Error(response.message || '删除失败');
                    }
                })
                .catch(error => {
                    showAlert('删除预约失败: ' + error.message, 'error');
                })
                .finally(() => {
                    hideLoading();
                });
        }
    }
    
    // 显示状态变更模态框
    function showStatusModal(appointmentId) {
        const statusModal = document.getElementById('statusModal');
        const saveStatusBtn = document.getElementById('saveStatusBtn');
        
        selectedAppointmentId = appointmentId;
        
        // 清除之前的事件监听器
        saveStatusBtn.replaceWith(saveStatusBtn.cloneNode(true));
        
        document.getElementById('saveStatusBtn').addEventListener('click', function() {
            const newStatus = document.getElementById('newStatus').value;
            
            if (!newStatus) {
                showAlert('请选择状态', 'error');
                return;
            }
            
            showLoading();
            
            appointmentsAPI.updateStatus(appointmentId, newStatus)
                .极速响应
                .then(response => {
                    if (response.status === 'success') {
                        showAlert('状态更新成功', 'success');
                        closeModal(statusModal);
                        loadAppointments();
                    } else {
                        throw new Error(response.message || '更新状态失败');
                    }
                })
                .catch(error => {
                    showAlert('更新状态失败: ' + error.message, 'error');
                })
                .finally(() => {
                    hideLoading();
                });
        });
        
        statusModal.style.display = 'block';
    }
    
    // 生成时间槽
    function generateTimeSlots() {
        timeSlotsContainer.innerHTML = '';
        
        const startHour = 9; // 9:00 AM
        const endHour = 18;   // 6:00 PM
        const interval = 30;  // 30分钟间隔
        
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                const slot = document.createElement('div');
                slot.className = 'time-slot';
                slot.dataset.time = timeStr;
                slot.innerHTML = `
                    <div class="time">${timeStr}</div>
                    <div class="status">空闲</div>
                `;
                
                slot.addEventListener('click', function() {
                    if (!this.classList.contains('booked')) {
                        document.getElementById('appointmentTime').value = this.dataset.time;
                        document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
                        this.classList.add('selected');
                    }
                });
                
                timeSlotsContainer.appendChild(slot);
            }
        }
    }
    
    // 更新时间槽状态
    function updateTimeSlots(appointments) {
        const slots = document.querySelectorAll('.time-slot');
        const selectedDate = dateFilter.value;
        
        slots.forEach(slot => {
            slot.classList.remove('booked', 'selected');
            slot.querySelector('.status').textContent = '空闲';
            
            const time = slot.dataset.time;
            const isBooked = appointments.some(appt => 
                appt.appointment_date === selectedDate && appt.appointment_time === time
            );
            
            if (isBooked) {
                slot.classList.add('booked');
                slot.querySelector('.status').textContent = '已预约';
            }
        });
    }
    
    // 辅助函数
    function getStatusClass(status) {
        const classes = {
            '待确认': 'status-pending',
            '已确认': 'status-confirmed',
            '已完成': 'status-completed',
            '已取消': 'status-cancelled'
        };
        return classes[status] || '';
    }
    
    function updateCurrentDateDisplay() {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        currentDateDisplay.textContent = currentDate.toLocaleDateString('zh-CN', options);
        dateFilter.value = formatDate(currentDate);
    }
    
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    function goToPrevDay() {
        currentDate.setDate(currentDate.getDate() - 1);
        updateCurrentDateDisplay();
        loadAppointments();
    }
    
    function goToNextDay() {
        currentDate.setDate(currentDate.getDate() + 1);
        updateCurrentDateDisplay();
        loadAppointments();
    }
    
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    function showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }
    
    function hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.color = 'black';
        alertDiv.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
        
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            ${message}
        `;
        document.body.appendChild(alertDiv);
        
        // 点击任意位置关闭
        alertDiv.addEventListener('click', function() {
            this.remove();
        });
        
        // 3秒后自动关闭
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }
});