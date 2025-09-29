#! /usr/bin/env python
#-*- coding:utf8 -*-

from flask import Blueprint, jsonify, request, render_template
import pymysql
from pymysql.cursors import DictCursor
from pymysql.constants import CLIENT
from datetime import datetime, timedelta
import json

appointments_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')

# MySQL 数据库配置
MYSQL_CONFIG = {
    'host': '192.168.1.15',
    'port': 3306,
    'user': 'FANG',
    'password': 'Fang11243.',
    'database': 'mydb',
    'charset': 'utf8mb4',
    'cursorclass': DictCursor,
    'client_flag': CLIENT.MULTI_STATEMENTS,
}

# 自定义JSON编码器，处理timedelta等不可序列化的对象
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, timedelta):
            return str(obj)
        return super().default(obj)

@appointments_bp.route('/view')
def appointments():
    return render_template('appointments_html.html')

@appointments_bp.route('/get', methods=['GET'])
def get_appointments():
    try:
        # 获取查询参数
        date = request.args.get('date')
        status = request.args.get('status')
        
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            sql = """
            SELECT a.*, c.customername, p.petname, s.service_name 
            FROM appointments a
            JOIN customers c ON a.customer_id = c.customer_id
            JOIN pets p ON a.pet_id = p.pet_id
            JOIN services s ON a.service_id = s.service_id
            """
            
            conditions = []
            params = []
            
            if date:
                conditions.append("a.appointment_date = %s")
                params.append(date)
            if status:
                conditions.append("a.status = %s")
                params.append(status)
            
            if conditions:
                sql += " WHERE " + " AND ".join(conditions)
            
            cursor.execute(sql, params)
            appointments = cursor.fetchall()
            
            # 手动处理结果，确保所有数据都可序列化
            serializable_appointments = []
            for appt in appointments:
                serializable_appt = {}
                for key, value in appt.items():
                    if isinstance(value, timedelta):
                        serializable_appt[key] = str(value)
                    elif isinstance(value, datetime):
                        serializable_appt[key] = value.isoformat()
                    else:
                        serializable_appt[key] = value
                serializable_appointments.append(serializable_appt)
            
            return jsonify({
                'status': 'success',
                'data': serializable_appointments
            })
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
        
    finally:
        if 'connection' in locals():
            connection.close()

@appointments_bp.route('/post', methods=['POST'])
def add_appointment():
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': 'Request must be JSON'
        }), 400
    
    data = request.get_json()
    required_fields = ['customer_id', 'pet_id', 'service_id', 'appointment_date', 'appointment_time']
    
    if not all(field in data for field in required_fields):
        return jsonify({
            'status': 'error',
            'message': 'Missing required fields',
            'required_fields': required_fields
        }), 400
    
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            sql = """
            INSERT INTO appointments 
            (customer_id, pet_id, service_id, appointment_date, appointment_time, status, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(sql, (
                data['customer_id'],
                data['pet_id'],
                data['service_id'],
                data['appointment_date'],
                data['appointment_time'],
                data.get('status', '待确认'),
                data.get('notes', '')
            ))
            
            connection.commit()
            new_id = cursor.lastrowid
            
            return jsonify({
                'status': 'success',
                'message': 'Appointment created successfully',
                'appointment_id': new_id
            }), 201
            
    except pymysql.Error as e:
        if 'connection' in locals():
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e),
            'detail': str(e)
        }), 500
        
    finally:
        if 'connection' in locals():
            connection.close()

@appointments_bp.route('/put/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': 'Request must be JSON'
        }), 400
    
    data = request.get_json()
    
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            set_clause = []
            params = []
            
            for field in ['customer_id', 'pet_id', 'service_id', 'appointment_date', 
                         'appointment_time', 'status', 'notes']:
                if field in data:
                    set_clause.append(f"{field} = %s")
                    params.append(data[field])
            
            if not set_clause:
                return jsonify({
                    'status': 'error',
                    'message': 'No fields to update'
                }), 400
                
            params.append(appointment_id)
            sql = f"UPDATE appointments SET {', '.join(set_clause)} WHERE appointment_id = %s"
            
            cursor.execute(sql, params)
            connection.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Appointment updated successfully'
            })
            
    except pymysql.Error as e:
        if 'connection' in locals():
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e),
            'detail': str(e)
        }), 500
        
    finally:
        if 'connection' in locals():
            connection.close()

@appointments_bp.route('/delete/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            sql = "DELETE FROM appointments WHERE appointment_id = %s"
            cursor.execute(sql, (appointment_id,))
            connection.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Appointment deleted successfully'
            })
            
    except pymysql.Error as e:
        if 'connection' in locals():
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e),
            'detail': str(e)
        }), 500
        
    finally:
        if 'connection' in locals():
            connection.close()

@appointments_bp.route('/status/<int:appointment_id>', methods=['PUT'])
def update_status(appointment_id):
    if not request.is_json or 'status' not in request.json:
        return jsonify({
            'status': 'error',
            'message': 'Status field is required'
        }), 400
    
    new_status = request.json['status']
    valid_statuses = ['待确认', '已确认', '已完成', '已取消']
    
    if new_status not in valid_statuses:
        return jsonify({
            'status': 'error',
            'message': 'Invalid status',
            'valid_statuses': valid_statuses
        }), 400
    
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            sql = "UPDATE appointments SET status = %s WHERE appointment_id = %s"
            cursor.execute(sql, (new_status, appointment_id))
            connection.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Appointment status updated successfully'
            })
            
    except pymysql.Error as e:
        if 'connection' in locals():
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e),
            'detail': str(e)
        }), 500
        
    finally:
        if 'connection' in locals():
            connection.close()

# 服务项目路由
@appointments_bp.route('/services/get', methods=['GET'])
def get_services():
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            sql = "SELECT * FROM services WHERE is_active = 1 ORDER BY service_name"
            cursor.execute(sql)
            services = cursor.fetchall()
            
            # 手动处理结果，确保所有数据都可序列化
            serializable_services = []
            for service in services:
                serializable_service = {}
                for key, value in service.items():
                    if isinstance(value, timedelta):
                        serializable_service[key] = str(value)
                    elif isinstance(value, datetime):
                        serializable_service[key] = value.isoformat()
                    else:
                        serializable_service[key] = value
                serializable_services.append(serializable_service)
            
            return jsonify({
                'status': 'success',
                'data': serializable_services
            })
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
        
    finally:
        if 'connection' in locals():
            connection.close()

@appointments_bp.route('/services/post', methods=['POST'])
def add_service():
    if not request.is_json:
        return jsonify({
            'status': 'error',
            'message': 'Request must be JSON'
        }), 400
        
    data = request.get_json()
    
    required_fields = ['service_name', 'price', 'duration']
    if not all(field in data for field in required_fields):
        return jsonify({
            'status': 'error',
            'message': 'Missing required fields',
            'required_fields': required_fields
        }), 400
    
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            sql = """
            INSERT INTO services 
            (service_name, description, price, duration, is_active) 
            VALUES (%s, %s, %s, %s, %s)
            """
            
            cursor.execute(sql, (
                data['service_name'],
                data.get('description', ''),
                data['price'],
                data['duration'],
                data.get('is_active', 1)
            ))
            
            connection.commit()
            new_id = cursor.lastrowid
            
            return jsonify({
                'status': 'success',
                'message': 'Service created successfully',
                'service_id': new_id
            }), 201
            
    except pymysql.Error as e:
        if 'connection' in locals():
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
        
    finally:
        if 'connection' in locals():
            connection.close()

@appointments_bp.route('/services/put/<int:service_id>', methods=['PUT'])
def update_service(service_id):
    try:
        data = request.get_json()
        
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            set_clause = []
            params = []
            
            for key in ['service_name', 'description', 'price', 'duration', 'is_active']:
                if key in data:
                    set_clause.append(f"{key} = %s")
                    params.append(data[key])
            
            if not set_clause:
                return jsonify({
                    'status': 'error',
                    'message': 'No fields to update'
                }), 400
                
            params.append(service_id)
            sql = f"UPDATE services SET {', '.join(set_clause)} WHERE service_id = %s"
            
            cursor.execute(sql, params)
            connection.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Service updated successfully'
            })
            
    except pymysql.Error as e:
        if 'connection' in locals():
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
        
    finally:
        if 'connection' in locals():
            connection.close()

@appointments_bp.route('/services/delete/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            # 软删除，将is_active设为0
            sql = "UPDATE services SET is_active = 0 WHERE service_id = %s"
            cursor.execute(sql, (service_id,))
            connection.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Service deleted successfully'
            })
            
    except pymysql.Error as e:
        if 'connection' in locals():
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
        
    finally:
        if 'connection' in locals():
            connection.close()