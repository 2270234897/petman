#! /usr/bin/env python
#-*- coding:utf8 -*-

from flask import Flask, jsonify, request, render_template, Blueprint
import pymysql
from pymysql.cursors import DictCursor
from pymysql.constants import CLIENT

customers_bp = Blueprint('customers', __name__, url_prefix='/api/customers')

# MySQL 数据库配置
MYSQL_CONFIG = {
    'host': '192.168.1.15',
    'port': 3306,
    'user': 'FANG',          # 替换为你的MySQL用户名
    'password': 'Fang11243.',  # 替换为你的MySQL密码
    'database': 'mydb',
    'charset': 'utf8mb4',
    'cursorclass': DictCursor,
    'client_flag': CLIENT.MULTI_STATEMENTS,
}

@customers_bp.route('/view')
def customers():
    return render_template('customers_html.html')  


@customers_bp.route('/get', methods=['GET'])
def get_customers():
    try:
        # 创建数据库连接
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            # 执行SQL查询
            sql = "SELECT * FROM customers"
            cursor.execute(sql)
            
            # 获取所有结果
            customers = cursor.fetchall()
            
            # 返回JSON格式的数据
            return jsonify({
                'status': 'success',
                'data': customers
            })
            
    except Exception as e:
        # 如果出现错误，返回错误信息
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
        
    finally:
        # 确保连接被关闭
        if 'connection' in locals():
            connection.close()

@customers_bp.route('/post', methods=['POST'])
def add_customers():
    # 获取JSON数据
    if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must be JSON'
            }), 400
    data = request.get_json()
    
    # 验证必需字段
    required_fields = ['customername', 'gender', 'address', 'telphone', 'Membershiplevel']
    if not all(field in data for field in required_fields):
        return jsonify({
            'status': 'error',
            'message': 'Missing required fields',
            'required_fields': required_fields
        }), 400
    
    try:
        # 创建数据库连接
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            # 准备SQL语句
            sql = """
            INSERT INTO customers 
            (customername, gender, address, telphone, Membershiplevel) 
            VALUES (%s, %s, %s, %s, %s)
            """
            
            # 执行插入操作
            cursor.execute(sql, (
                data['customername'],
                data['gender'],
                data['address'],
                data['telphone'],
                data['Membershiplevel']
            ))
            
            # 提交事务
            connection.commit()
            
            # 获取新插入的用户ID
            new_customer_id = cursor.lastrowid
            
            return jsonify({
                'status': 'success',
                'message': 'Customer created successfully',
                'userID': new_customer_id
            }), 201
            
    except pymysql.Error as e:
        # 回滚事务
        if 'connection' in locals():
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e),
            'detail': str(e)
        }), 500
        
    finally:
        # 关闭连接
        if 'connection' in locals():
            connection.close()


@customers_bp.route('/delete/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    try:
        # 建立数据库连接
        connection = pymysql.connect(**MYSQL_CONFIG)

        with connection.cursor() as cursor:
            # 删除指定客户的SQL语句
            sql = f"DELETE FROM customers WHERE customerID = {customer_id}"
            cursor.execute(sql)

            # 提交更改
            connection.commit()

            return jsonify({
                'status': 'success',
                'message': 'Customer deleted successfully'
            }), 200

    except pymysql.Error as e:
        # 处理异常情况
        return jsonify({
            'status': 'error',
            'message': 'Failed to delete customer',
            'details': str(e)
        }), 500

    finally:
        # 关闭数据库连接
        if 'connection' in locals():
            connection.close()

@customers_bp.route('/put/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    try:
        # 从请求中获取更新后的客户信息
        updated_info = request.get_json()

        # 建立数据库连接
        connection = pymysql.connect(**MYSQL_CONFIG)

        with connection.cursor() as cursor:
            # 生成更新客户信息的SQL语句
            columns = ', '.join([f"{key} = %s" for key in updated_info])
            values = tuple(updated_info.values()) + (customer_id,)
            sql = f"UPDATE customers SET {columns} WHERE customerID = %s"

            # 执行更新操作
            cursor.execute(sql, values)

            # 提交更改
            connection.commit()

            return jsonify({
                'status': 'success',
                'message': 'Customer information updated successfully'
            }), 200

    except pymysql.Error as e:
        # 处理异常情况
        return jsonify({
            'status': 'error',
            'message': 'Failed to update customer information',
            'details': str(e)
        }), 500

    finally:
        # 关闭数据库连接
        if 'connection' in locals():
            connection.close()

