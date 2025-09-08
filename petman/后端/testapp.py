#! /usr/bin/env python
#-*- coding:utf8 -*-

import fastapi
import config

app = fastapi.FastAPI()

@app.get("/users")
def get_user(name:str):
    db = None
    try:
        db = config.get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("select * from users where username=%s", (name,))
        user = cursor.fetchone()
        db.close()
        if not user:
            raise fastapi.HTTPException(404, "用户不存在")
        print(user)
        return user
    except fastapi.HTTPException:
        raise
    except Exception as e:
        raise fastapi.HTTPException(500, "服务器内部错误")
    finally:
        if db:
            db.close()

