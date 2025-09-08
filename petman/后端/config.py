#! /usr/bin/env python
#-*- coding:utf8 -*-

import mysql.connector

def get_db():
    try:
        db = mysql.connector.connect(
            host='192.168.1.15',
            port=3306,
            user="root",
            passwd="Fw181219.",
            database='mydatabase')
        print('数据库连接成功')
        return db 
        
    except Exception as e:
        print('数据库连接失败')

