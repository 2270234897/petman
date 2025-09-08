#! /usr/bin/env python
#-*- coding:utf8 -*-

import sys
from PyQt5.QtWidgets import (QApplication, QMainWindow, QTabWidget, QWidget, QVBoxLayout, 
                            QHBoxLayout, QTableWidget, QTableWidgetItem, QPushButton, 
                            QDialog, QFormLayout, QLineEdit, QComboBox, QSpinBox, 
                            QDateTimeEdit, QMessageBox, QLabel, QFrame)
from PyQt5.QtCore import Qt, QDateTime, QSize
from PyQt5.QtGui import QFont, QIcon, QPalette, QColor

# 全局样式表
STYLESHEET = """
/* 主窗口样式 */
QMainWindow {
    background-color: #f5f7fa;
}

/* 标签页样式 */
QTabWidget::pane {
    border: none;
    background-color: #ffffff;
    border-radius: 8px;
    margin: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

QTabBar::tab {
    background-color: #f5f7fa;
    color: #666666;
    padding: 10px 20px;
    margin-right: 2px;
    border-radius: 6px 6px 0 0;
    font-size: 14px;
    font-weight: 500;
}

QTabBar::tab:selected {
    background-color: #ffffff;
    color: #2c3e50;
    border-top: 2px solid #3498db;
}

QTabBar::tab:hover:!selected {
    background-color: #eaecee;
}

/* 按钮样式 */
QPushButton {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
}

QPushButton:hover {
    background-color: #2980b9;
}

QPushButton:pressed {
    background-color: #2471a3;
}

QPushButton:disabled {
    background-color: #bdc3c7;
}

/* 表格样式 */
QTableWidget {
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    gridline-color: #e1e4e8;
    font-size: 13px;
}

QTableWidget::item {
    padding: 8px;
    border: none;
}

QTableWidget::item:selected {
    background-color: #ebf5fb;
    color: #2c3e50;
}

QHeaderView::section {
    background-color: #f8f9fa;
    color: #666666;
    padding: 10px;
    border: 1px solid #e1e4e8;
    text-align: center;
    font-weight: 500;
}

/* 对话框样式 */
QDialog {
    background-color: #ffffff;
    border-radius: 8px;
}

QDialog QLabel {
    color: #333333;
    font-size: 13px;
}

/* 输入控件样式 */
QLineEdit, QSpinBox, QDateTimeEdit {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
}

QLineEdit:focus, QSpinBox:focus, QDateTimeEdit:focus {
    border-color: #3498db;
    outline: none;
}

/* 下拉框样式 */
QComboBox {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    background-color: white;
}

QComboBox:focus {
    border-color: #3498db;
}

QComboBox::drop-down {
    border-left: 1px solid #ddd;
}

/* 消息框样式 */
QMessageBox {
    background-color: #ffffff;
    border-radius: 8px;
}
"""

# 基础数据编辑对话框
class DataEditDialog(QDialog):
    def __init__(self, parent=None, table_name=None, data=None, is_new=True):
        super().__init__(parent)
        self.table_name = table_name
        self.data = data or {}
        self.is_new = is_new
        self.setWindowModality(Qt.ApplicationModal)  # 模态对话框
        self.init_ui()
        
    def init_ui(self):
        self.setWindowTitle(f"{'添加' if self.is_new else '编辑'}{self.get_table_title()}")
        self.layout = QFormLayout()
        self.layout.setRowWrapPolicy(QFormLayout.DontWrapRows)
        self.layout.setSpacing(12)
        self.layout.setContentsMargins(20, 20, 20, 10)
        self.fields = {}
        
        # 添加标题分隔线
        title_label = QLabel(f"<h3>{'添加' if self.is_new else '编辑'}{self.get_table_title()}信息</h3>")
        title_label.setStyleSheet("color: #2c3e50; margin-bottom: 10px;")
        self.layout.addRow(title_label)
        
        line = QFrame()
        line.setFrameShape(QFrame.HLine)
        line.setFrameShadow(QFrame.Sunken)
        line.setStyleSheet("background-color: #eee; margin-bottom: 15px;")
        self.layout.addRow(line)
        
        # 根据不同表显示不同字段
        if self.table_name == 'user':
            self.fields['username'] = QLineEdit(self.data.get('username', ''))
            self.fields['username'].setPlaceholderText("请输入用户名")
            
            self.fields['gender'] = QComboBox()
            self.fields['gender'].addItems(['男', '女', '其他'])
            if 'gender' in self.data:
                self.fields['gender'].setCurrentText(self.data['gender'])
            
            self.fields['address'] = QLineEdit(self.data.get('address', ''))
            self.fields['address'].setPlaceholderText("请输入地址")
            
            self.fields['telphone'] = QLineEdit(str(self.data.get('telphone', '')))
            self.fields['telphone'].setPlaceholderText("请输入电话号码")
            
            self.fields['Membership level'] = QSpinBox()
            self.fields['Membership level'].setRange(1, 10)
            if 'Membership level' in self.data:
                self.fields['Membership level'].setValue(self.data['Membership level'])
            
            for field, widget in self.fields.items():
                label = QLabel(field)
                label.setStyleSheet("font-weight: 500;")
                self.layout.addRow(label, widget)
                
        elif self.table_name == 'pet':
            # 模拟用户数据
            mock_users = [
                {'userID': 1, 'username': '张三'},
                {'userID': 2, 'username': '李四'},
                {'userID': 3, 'username': '王五'}
            ]
            
            self.fields['user_userID'] = QComboBox()
            for user in mock_users:
                self.fields['user_userID'].addItem(f"{user['username']} (ID:{user['userID']})", user['userID'])
            
            self.fields['petname'] = QLineEdit(self.data.get('petname', ''))
            self.fields['petname'].setPlaceholderText("请输入宠物名称")
            
            self.fields['pet_species'] = QLineEdit(self.data.get('pet_species', ''))
            self.fields['pet_species'].setPlaceholderText("请输入宠物种类")
            
            self.fields['pet_breeds'] = QLineEdit(self.data.get('pet_breeds', ''))
            self.fields['pet_breeds'].setPlaceholderText("请输入宠物品种")
            
            self.fields['pet_gender'] = QComboBox()
            self.fields['pet_gender'].addItems(['公', '母', '未知'])
            
            self.fields['pet_age'] = QSpinBox()
            self.fields['pet_age'].setRange(0, 30)
            
            self.fields['neuter'] = QComboBox()
            self.fields['neuter'].addItems(['是', '否', '未知'])
            
            self.fields['pet_character'] = QLineEdit(self.data.get('pet_character', ''))
            self.fields['pet_character'].setPlaceholderText("请输入宠物性格")
            
            if self.data:
                if 'user_userID' in self.data:
                    index = self.fields['user_userID'].findData(self.data['user_userID'])
                    if index >= 0:
                        self.fields['user_userID'].setCurrentIndex(index)
                if 'pet_gender' in self.data:
                    self.fields['pet_gender'].setCurrentText(self.data['pet_gender'])
                if 'pet_age' in self.data:
                    self.fields['pet_age'].setValue(self.data['pet_age'])
                if 'neuter' in self.data:
                    self.fields['neuter'].setCurrentText(self.data['neuter'])
            
            for field, widget in self.fields.items():
                label = QLabel(field.replace('pet_', '').replace('_', ' '))
                label.setStyleSheet("font-weight: 500;")
                self.layout.addRow(label, widget)
                
        elif self.table_name == 'product':
            # 模拟品牌和分类数据
            mock_brands = [
                {'brandID': 1, 'brand_name': '品牌A'},
                {'brandID': 2, 'brand_name': '品牌B'},
                {'brandID': 3, 'brand_name': '品牌C'}
            ]
            
            mock_categories = [
                {'classify1_ID': 1, 'classify_name': '食品'},
                {'classify1_ID': 2, 'classify_name': '玩具'},
                {'classify1_ID': 3, 'classify_name': '用品'}
            ]
            
            self.fields['brand_brandID'] = QComboBox()
            for brand in mock_brands:
                self.fields['brand_brandID'].addItem(f"{brand['brand_name']}", brand['brandID'])
                
            self.fields['classify_level1_classify1_ID'] = QComboBox()
            for category in mock_categories:
                self.fields['classify_level1_classify1_ID'].addItem(f"{category['classify_name']}", category['classify1_ID'])
                
            self.fields['product_name'] = QLineEdit(self.data.get('product_name', ''))
            self.fields['product_name'].setPlaceholderText("请输入商品名称")
            
            self.fields['product_baozhiqi'] = QLineEdit(self.data.get('product_baozhiqi', ''))
            self.fields['product_baozhiqi'].setPlaceholderText("请输入保质期")
            
            self.fields['local'] = QLineEdit(self.data.get('local', ''))
            self.fields['local'].setPlaceholderText("请输入产地")
            
            self.fields['quantity'] = QSpinBox()
            self.fields['quantity'].setRange(0, 9999)
            
            for field, widget in self.fields.items():
                label_text = field.replace('product_', '').replace('brand_brandID', '品牌').replace('classify_level1_classify1_ID', '分类')
                label = QLabel(label_text)
                label.setStyleSheet("font-weight: 500;")
                self.layout.addRow(label, widget)
                
        elif self.table_name == 'order':
            # 模拟用户数据
            mock_users = [
                {'userID': 1, 'username': '张三'},
                {'userID': 2, 'username': '李四'},
                {'userID': 3, 'username': '王五'}
            ]
            
            self.fields['user_userID'] = QComboBox()
            for user in mock_users:
                self.fields['user_userID'].addItem(f"{user['username']}", user['userID'])
            
            self.fields['price'] = QLineEdit(self.data.get('price', ''))
            self.fields['price'].setPlaceholderText("请输入价格")
            
            self.fields['discount'] = QLineEdit(self.data.get('discount', ''))
            self.fields['discount'].setPlaceholderText("请输入折扣")
            
            self.fields['sale_time'] = QDateTimeEdit(QDateTime.currentDateTime())
            self.fields['sale_time'].setDisplayFormat("yyyy-MM-dd HH:mm:ss")
            
            self.fields['pay_way'] = QComboBox()
            self.fields['pay_way'].addItems(['微信支付', '支付宝', '现金', '其他'])
            
            for field, widget in self.fields.items():
                label_text = field.replace('sale_', '').replace('pay_way', '支付方式').replace('user_userID', '用户')
                label = QLabel(label_text)
                label.setStyleSheet("font-weight: 500;")
                self.layout.addRow(label, widget)
        
        # 确认和取消按钮
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(10)
        btn_layout.setContentsMargins(0, 15, 0, 0)
        
        self.ok_btn = QPushButton("确认")
        self.ok_btn.setMinimumHeight(32)
        self.cancel_btn = QPushButton("取消")
        self.cancel_btn.setMinimumHeight(32)
        self.cancel_btn.setStyleSheet("background-color: #95a5a6;")
        
        self.ok_btn.clicked.connect(self.accept)
        self.cancel_btn.clicked.connect(self.reject)
        
        btn_layout.addStretch()
        btn_layout.addWidget(self.ok_btn)
        btn_layout.addWidget(self.cancel_btn)
        
        main_layout = QVBoxLayout()
        main_layout.addLayout(self.layout)
        main_layout.addLayout(btn_layout)
        self.setLayout(main_layout)
        self.resize(450, 400)
    
    def get_table_title(self):
        titles = {
            'user': '用户',
            'pet': '宠物',
            'product': '商品',
            'order': '订单'
        }
        return titles.get(self.table_name, '')
    
    def get_data(self):
        data = {}
        for field, widget in self.fields.items():
            if isinstance(widget, QComboBox):
                data[field] = widget.currentData() if widget.currentData() is not None else widget.currentText()
            elif isinstance(widget, QSpinBox):
                data[field] = widget.value()
            elif isinstance(widget, QDateTimeEdit):
                data[field] = widget.dateTime().toString("yyyy-MM-dd HH:mm:ss")
            else:
                data[field] = widget.text()
        return data

# 数据管理面板
class DataManagementPanel(QWidget):
    def __init__(self, table_name, parent=None):
        super().__init__(parent)
        self.table_name = table_name
        self.init_ui()
        self.load_mock_data()  # 加载模拟数据代替数据库数据
    
    def init_ui(self):
        self.layout = QVBoxLayout()
        self.layout.setContentsMargins(20, 20, 20, 20)
        self.layout.setSpacing(15)
        
        # 标题
        title_label = QLabel(f"<h2>{self.get_table_title()}管理</h2>")
        title_label.setStyleSheet("color: #2c3e50; font-weight: 600;")
        
        # 按钮区域
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(10)
        
        self.add_btn = QPushButton("添加")
        self.add_btn.setMinimumHeight(36)
        self.add_btn.setIcon(QIcon.fromTheme("list-add", QIcon()))  # 图标
        
        self.edit_btn = QPushButton("编辑")
        self.edit_btn.setMinimumHeight(36)
        self.edit_btn.setIcon(QIcon.fromTheme("document-properties", QIcon()))
        
        self.delete_btn = QPushButton("删除")
        self.delete_btn.setMinimumHeight(36)
        self.delete_btn.setIcon(QIcon.fromTheme("edit-delete", QIcon()))
        self.delete_btn.setStyleSheet("background-color: #e74c3c;")
        
        self.add_btn.clicked.connect(self.add_data)
        self.edit_btn.clicked.connect(self.edit_data)
        self.delete_btn.clicked.connect(self.delete_data)
        
        btn_layout.addWidget(self.add_btn)
        btn_layout.addWidget(self.edit_btn)
        btn_layout.addWidget(self.delete_btn)
        btn_layout.addStretch()
        
        # 表格区域
        self.table_widget = QTableWidget()
        self.table_widget.horizontalHeader().setStretchLastSection(True)
        self.table_widget.setSelectionBehavior(QTableWidget.SelectRows)
        self.table_widget.setAlternatingRowColors(True)  # 交替行颜色
        self.table_widget.setStyleSheet("""
            QTableWidget {
                alternate-background-color: #f9f9f9;
            }
            QTableWidget::item:hover {
                background-color: #f0f7ff;
            }
        """)
        
        # 添加所有组件到布局
        self.layout.addWidget(title_label)
        self.layout.addLayout(btn_layout)
        self.layout.addWidget(self.table_widget)
        
        self.setLayout(self.layout)
    
    def get_table_title(self):
        titles = {
            'user': '用户',
            'pet': '宠物',
            'product': '商品',
            'order': '订单'
        }
        return titles.get(self.table_name, '')
    
    def load_mock_data(self):
        # 根据不同表加载不同的模拟数据
        if self.table_name == 'user':
            self.columns = ['userID', '用户名', '性别', '地址', '电话', '会员等级', '创建时间']
            self.data = [
                {'userID': 1, 'username': '张三', 'gender': '男', 'address': '北京市朝阳区', 'telphone': '13800138000', 'Membership level': 3, 'create_time': '2023-01-15 09:30:00'},
                {'userID': 2, 'username': '李四', 'gender': '女', 'address': '上海市静安区', 'telphone': '13900139000', 'Membership level': 5, 'create_time': '2023-02-20 14:20:00'},
                {'userID': 3, 'username': '王五', 'gender': '男', 'address': '广州市天河区', 'telphone': '13700137000', 'Membership level': 2, 'create_time': '2023-03-10 11:10:00'}
            ]
        elif self.table_name == 'pet':
            self.columns = ['petID', '用户ID', '宠物名称', '种类', '品种', '性别', '年龄', '是否绝育', '性格']
            self.data = [
                {'petID': 1, 'user_userID': 1, 'petname': '小白', 'pet_species': '狗', 'pet_breeds': '萨摩耶', 'pet_gender': '公', 'pet_age': 2, 'neuter': '是', 'pet_character': '活泼'},
                {'petID': 2, 'user_userID': 2, 'petname': '咪咪', 'pet_species': '猫', 'pet_breeds': '英短', 'pet_gender': '母', 'pet_age': 3, 'neuter': '是', 'pet_character': '温顺'},
                {'petID': 3, 'user_userID': 3, 'petname': '旺财', 'pet_species': '狗', 'pet_breeds': '金毛', 'pet_gender': '公', 'pet_age': 1, 'neuter': '否', 'pet_character': '友善'}
            ]
        elif self.table_name == 'product':
            self.columns = ['productID', '品牌', '分类', '商品名称', '保质期', '产地', '库存数量']
            self.data = [
                {'productID': 1, 'brand_brandID': 1, 'classify_level1_classify1_ID': 1, 'product_name': '狗粮A', 'product_baozhiqi': '12个月', 'local': '国产', 'quantity': 100},
                {'productID': 2, 'brand_brandID': 2, 'classify_level1_classify1_ID': 2, 'product_name': '猫玩具B', 'product_baozhiqi': '24个月', 'local': '进口', 'quantity': 50},
                {'productID': 3, 'brand_brandID': 3, 'classify_level1_classify1_ID': 3, 'product_name': '宠物梳C', 'product_baozhiqi': '36个月', 'local': '国产', 'quantity': 80}
            ]
        elif self.table_name == 'order':
            self.columns = ['orderID', '用户ID', '价格', '折扣', '销售时间', '支付方式']
            self.data = [
                {'orderID': 1, 'user_userID': 1, 'price': 199.99, 'discount': 0.9, 'sale_time': '2023-04-01 10:30:00', 'pay_way': '微信支付'},
                {'orderID': 2, 'user_userID': 2, 'price': 89.50, 'discount': 1.0, 'sale_time': '2023-04-05 16:45:00', 'pay_way': '支付宝'},
                {'orderID': 3, 'user_userID': 3, 'price': 299.00, 'discount': 0.85, 'sale_time': '2023-04-10 09:15:00', 'pay_way': '微信支付'}
            ]
        else:
            self.columns = []
            self.data = []
        
        # 设置表格数据
        self.table_widget.setColumnCount(len(self.columns))
        self.table_widget.setHorizontalHeaderLabels(self.columns)
        self.table_widget.setRowCount(len(self.data))
        
        for row, item in enumerate(self.data):
            for col, key in enumerate(self.columns):
                # 处理原始数据键名与显示列名的映射
                data_key = key
                if self.table_name == 'user':
                    key_mapping = {
                        '用户名': 'username', '性别': 'gender', '地址': 'address',
                        '电话': 'telphone', '会员等级': 'Membership level', '创建时间': 'create_time'
                    }
                    data_key = key_mapping.get(key, key)
                
                cell_item = QTableWidgetItem(str(item.get(data_key, '')))
                cell_item.setTextAlignment(Qt.AlignCenter)
                cell_item.setFlags(cell_item.flags() & ~Qt.ItemIsEditable)  # 禁止直接编辑
                self.table_widget.setItem(row, col, cell_item)
        
        self.table_widget.resizeColumnsToContents()
        # 设置表格最小高度
        self.table_widget.setMinimumHeight(400)
    
    def add_data(self):
        dialog = DataEditDialog(self, self.table_name, is_new=True)
        if dialog.exec_():
            QMessageBox.information(self, "成功", "数据添加成功（模拟）", QMessageBox.Ok)
            self.load_mock_data()
    
    def edit_data(self):
        selected_rows = self.table_widget.selectionModel().selectedRows()
        if not selected_rows:
            QMessageBox.warning(self, "警告", "请先选择一行数据", QMessageBox.Ok)
            return
        
        row = selected_rows[0].row()
        selected_data = self.data[row]
        
        dialog = DataEditDialog(self, self.table_name, selected_data, is_new=False)
        if dialog.exec_():
            QMessageBox.information(self, "成功", "数据更新成功（模拟）", QMessageBox.Ok)
            self.load_mock_data()
    
    def delete_data(self):
        selected_rows = self.table_widget.selectionModel().selectedRows()
        if not selected_rows:
            QMessageBox.warning(self, "警告", "请先选择一行数据", QMessageBox.Ok)
            return
        
        row = selected_rows[0].row()
        id_value = self.data[row][self.columns[0].lower()]
        
        reply = QMessageBox.question(
            self, "确认", f"确定要删除ID为{id_value}的数据吗？",
            QMessageBox.Yes | QMessageBox.No, QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            QMessageBox.information(self, "成功", "数据删除成功（模拟）", QMessageBox.Ok)
            self.load_mock_data()

# 主窗口
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.init_ui()
        
    def init_ui(self):
        self.setWindowTitle("宠物用品管理系统")
        self.setGeometry(100, 100, 1200, 800)
        
        # 设置中文字体
        font = QFont("SimHei")
        self.setFont(font)
        
        # 创建中心部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        main_layout = QVBoxLayout(central_widget)
        
        # 添加系统标题
        title_label = QLabel("<h1>宠物用品管理系统</h1>")
        title_label.setStyleSheet("color: #2c3e50; margin: 15px 20px; font-weight: 700;")
        title_label.setAlignment(Qt.AlignCenter)
        
        # 创建标签页
        self.tabs = QTabWidget()
        self.tabs.setStyleSheet("QTabBar::tab { height: 40px; }")  # 增大标签高度
        
        # 添加各个功能模块
        self.tabs.addTab(DataManagementPanel('user'), "用户管理")
        self.tabs.addTab(DataManagementPanel('pet'), "宠物管理")
        self.tabs.addTab(DataManagementPanel('product'), "商品管理")
        self.tabs.addTab(DataManagementPanel('order'), "订单管理")
        
        main_layout.addWidget(title_label)
        main_layout.addWidget(self.tabs)
        
        self.show()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    # 应用全局样式表
    app.setStyleSheet(STYLESHEET)
    # 确保中文显示正常
    font = QFont("SimHei")
    app.setFont(font)
    window = MainWindow()
    sys.exit(app.exec_())
    