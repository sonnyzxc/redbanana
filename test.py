import sqlite3
import os.path

con = sqlite3.connect("trial.sqlite")

cur = con.cursor()

print(cur.execute("SELECT username FROM loginpage").fetchone())

# res = cur.execute('''SELECT username FROM loginpage''')
# print(res.fetchone())
# print(res)