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
    required_fields = ['customername', 'gender', 'telphone', 'Membershiplevel']
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
            (customername, gender, address, telphone, Membershiplevel, membership_balance) 
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            
            # 执行插入操作
            cursor.execute(sql, (
                data['customername'],
                data['gender'],
                data.get('address', '未知地址'),
                data['telphone'],
                data['Membershiplevel'],
                data.get('membership_balance', 0)
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
        error_message = "数据库操作失败"
        if e.args[0] == 1062:  # 重复键错误
            error_message = "数据重复，请检查输入信息"
        elif e.args[0] == 1452:  # 外键约束错误
            error_message = "关联数据不存在，请检查关联ID"
        elif e.args[0] == 1406:  # 数据太长
            error_message = "输入数据过长，请缩短输入内容"
        elif e.args[0] == 1048:  # 不能为空
            error_message = "必填字段不能为空"
        
        return jsonify({
            'status': 'error',
            'message': error_message,
            'error_code': e.args[0] if e.args else None,
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
            sql = f"DELETE FROM customers WHERE customer_id = {customer_id}"
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
            sql = f"UPDATE customers SET {columns} WHERE customer_id = %s"

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

# 会员充值记录管理接口
@customers_bp.route('/recharge', methods=['POST'])
def add_recharge_record():
    """添加会员充值记录"""
    data = request.get_json()
    required_fields = ['customer_id', 'recharge_amount', 'bonus_amount']
    if not all(field in data for field in required_fields):
        return jsonify({
            'status': 'error',
            'message': 'Missing required fields',
            'required_fields': required_fields
        }), 400
    
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 开始事务
            connection.begin()
            
            # 添加充值记录
            sql = """
            INSERT INTO membership_recharge 
            (customer_id, recharge_amount, bonus_amount, recharge_time) 
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (
                data['customer_id'],
                data['recharge_amount'],
                data.get('bonus_amount', 0),
                datetime.now()
            ))
            
            # 更新客户余额
            update_sql = """
            UPDATE customers 
            SET membership_balance = membership_balance + %s + %s 
            WHERE customer_id = %s
            """
            cursor.execute(update_sql, (
                data['recharge_amount'],
                data.get('bonus_amount', 0),
                data['customer_id']
            ))
            
            connection.commit()
            return jsonify({
                'status': 'success',
                'message': '充值成功'
            }), 201
            
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if 'connection' in locals():
            connection.close()

@customers_bp.route('/recharge/<int:customer_id>', methods=['GET'])
def get_recharge_records(customer_id):
    """获取客户充值记录"""
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            SELECT * FROM membership_recharge 
            WHERE customer_id = %s 
            ORDER BY recharge_time DESC
            """
            cursor.execute(sql, (customer_id,))
            records = cursor.fetchall()
            return jsonify({
                'status': 'success',
                'data': records
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if 'connection' in locals():
            connection.close()

@customers_bp.route('/membership-info/<int:customer_id>', methods=['GET'])
def get_membership_info(customer_id):
    """获取客户会员信息"""
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            SELECT customer_id, customername, Membershiplevel, membership_balance 
            FROM customers 
            WHERE customer_id = %s
            """
            cursor.execute(sql, (customer_id,))
            customer = cursor.fetchone()
            if not customer:
                return jsonify({
                    'status': 'error',
                    'message': 'Customer not found'
                }), 404
            return jsonify({
                'status': 'success',
                'data': customer
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if 'connection' in locals():
            connection.close()

