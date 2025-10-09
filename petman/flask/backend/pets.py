#! /usr/bin/env python
#-*- coding:utf8 -*-

from flask import Blueprint, jsonify, request, render_template
import pymysql
from datetime import datetime
from db_config import MYSQL_CONFIG

pets_bp = Blueprint('pets', __name__, url_prefix='/api/pets')

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
            JOIN customers c ON p.customer_id = c.customer_id
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
            JOIN customers c ON p.customer_id = c.customer_id
            WHERE p.pet_id = %s
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
        required_fields = ['petname', 'pet_species', 'pet_breeds', 'pet_gender', 'pet_age', 'customer_id']
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
            (petname, pet_species, pet_breeds, pet_gender, pet_age, neuter, pet_character, customer_id, pet_image)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                data['petname'],
                data['pet_species'],
                data['pet_breeds'],
                data['pet_gender'],
                data['pet_age'],
                bool(data.get('neuter', False)),
                data.get('pet_character'),
                data['customer_id'],
                data.get('pet_image', '')
            ))
            connection.commit()
            new_id = cursor.lastrowid
            return jsonify({
                'status': 'success',
                'message': 'Pet added successfully',
                'pet_id': new_id
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
            # 首先获取当前宠物信息
            check_sql = "SELECT * FROM pets WHERE pet_id = %s"
            cursor.execute(check_sql, (pet_id,))
            current_pet = cursor.fetchone()
            
            if not current_pet:
                return jsonify({
                    'status': 'error',
                    'message': 'Pet not found'
                }), 404
            
            # 检查是否有实际变更
            has_changes = False
            for field in ['petname', 'pet_species', 'pet_breeds', 'pet_gender', 'pet_age', 'neuter', 'pet_character', 'customer_id', 'pet_image']:
                if field in data and str(data[field]) != str(current_pet.get(field, '')):
                    has_changes = True
                    break
            
            if not has_changes:
                return jsonify({
                    'status': 'info',
                    'message': 'No changes detected, pet information remains the same'
                }), 200
            
            # 构建动态更新SQL
            set_clause = []
            params = []
            for field in ['petname', 'pet_species', 'pet_breeds', 'pet_gender', 'pet_age', 'neuter', 'pet_character', 'customer_id', 'pet_image']:
                if field in data:
                    set_clause.append(f"{field} = %s")
                    params.append(data[field])
            
            params.append(pet_id)
            sql = f"UPDATE pets SET {', '.join(set_clause)} WHERE pet_id = %s"
            cursor.execute(sql, params)
            connection.commit()
            
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
            sql = "DELETE FROM pets WHERE pet_id = %s"
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

# 获取客户的所有宠物
@pets_bp.route('/customer/<int:customer_id>', methods=['GET'])
def get_pets_by_customer(customer_id):
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        
        with connection.cursor() as cursor:
            sql = """
            SELECT p.* 
            FROM pets p
            WHERE p.customer_id = %s
            """
            cursor.execute(sql, (customer_id,))
            pets = cursor.fetchall()
            
            return jsonify({
                'status': 'success',
                'data': pets
            })
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
        
    finally:
        if 'connection' in locals():
            connection.close()
