#! /usr/bin/env python
#-*- coding:utf8 -*-

from flask import Blueprint, jsonify, request, render_template
import pymysql
from pymysql.cursors import DictCursor
from datetime import datetime

pets_bp = Blueprint('pets', __name__, url_prefix='/api/pets')

# 数据库配置 (与客户管理系统相同)
MYSQL_CONFIG = {
    'host': '192.168.1.15',
    'port': 3306,
    'user': 'FANG',
    'password': 'Fang11243.',
    'database': 'mydb',
    'charset': 'utf8mb4',
    'cursorclass': DictCursor,
    'client_flag': pymysql.constants.CLIENT.MULTI_STATEMENTS,
}

@pets_bp.route('/view')
def pets():
    return render_template('pets.html')  

@pets_bp.route('/', methods=['GET'])
def get_all_pets():
    """获取所有宠物信息"""
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            SELECT p.*, c.customername as owner_name 
            FROM pets p
            JOIN customers c ON p.customers_customerID = c.customerID
            """
            cursor.execute(sql)
            pets = cursor.fetchall()
            return jsonify({
                'status': 'success',
                'data': pets,
                'count': len(pets)
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@pets_bp.route('/getbyid/<int:pet_id>', methods=['GET'])
def get_pet(pet_id):
    """获取单个宠物详细信息"""
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            SELECT p.*, c.customername as owner_name, c.telphone as owner_phone
            FROM pets p
            JOIN customers c ON p.customers_customerID = c.customerID
            WHERE p.petID = %s
            """
            cursor.execute(sql, (pet_id,))
            pet = cursor.fetchone()
            if not pet:
                return jsonify({
                    'status': 'error',
                    'message': 'Pet not found'
                }), 404
            return jsonify({
                'status': 'success',
                'data': pet
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@pets_bp.route('/post', methods=['POST'])
def add_pet():
    """添加新宠物"""
    connection = None
    try:
        data = request.get_json()
        required_fields = ['petname', 'pet_species', 'pet_breeds', 'pet_gender', 'pet_age', 'customers_customerID']
        if not all(field in data for field in required_fields):
            return jsonify({
                'status': 'error',
                'message': 'Missing required fields',
                'required_fields': required_fields
            }), 400

        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = """
            INSERT INTO pets 
            (petname, pet_species, pet_breeds, pet_gender, pet_age, neuter, pet_character, customers_customerID)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                data['petname'],
                data['pet_species'],
                data['pet_breeds'],
                data['pet_gender'],
                data['pet_age'],
                data.get('neuter'),
                data.get('pet_character'),
                data['customers_customerID']
            ))
            connection.commit()
            new_id = cursor.lastrowid
            return jsonify({
                'status': 'success',
                'message': 'Pet added successfully',
                'petID': new_id
            }), 201
    except pymysql.Error as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Database error',
            'error_code': e.args[0] if e.args else None,
            'detail': str(e)
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@pets_bp.route('/put/<int:pet_id>', methods=['PUT'])
def update_pet(pet_id):
    """更新宠物信息"""
    connection = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400

        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            # 构建动态更新SQL
            set_clause = []
            params = []
            for field in ['petname', 'pet_species', 'pet_breeds', 'pet_gender', 'pet_age', 'neuter', 'pet_character', 'customers_customerID']:
                if field in data:
                    set_clause.append(f"{field} = %s")
                    params.append(data[field])
            
            if not set_clause:
                return jsonify({
                    'status': 'error',
                    'message': 'No fields to update'
                }), 400

            params.append(pet_id)
            sql = f"UPDATE pets SET {', '.join(set_clause)} WHERE petID = %s"
            cursor.execute(sql, params)
            connection.commit()
            
            if cursor.rowcount == 0:
                return jsonify({
                    'status': 'error',
                    'message': 'Pet not found or no changes made'
                }), 404
            
            return jsonify({
                'status': 'success',
                'message': 'Pet updated successfully'
            })
    except pymysql.Error as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Database error',
            'error_code': e.args[0] if e.args else None,
            'detail': str(e)
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()

@pets_bp.route('/delete/<int:pet_id>', methods=['DELETE'])
def delete_pet(pet_id):
    """删除宠物记录"""
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        with connection.cursor() as cursor:
            sql = "DELETE FROM pets WHERE petID = %s"
            cursor.execute(sql, (pet_id,))
            connection.commit()
            
            if cursor.rowcount == 0:
                return jsonify({
                    'status': 'error',
                    'message': 'Pet not found'
                }), 404
            
            return jsonify({
                'status': 'success',
                'message': 'Pet deleted successfully'
            })
    except pymysql.Error as e:
        if connection:
            connection.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Database error',
            'error_code': e.args[0] if e.args else None,
            'detail': str(e)
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        if connection:
            connection.close()
