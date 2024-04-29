from time import sleep
import sys

for i in range(10):
    print(i)
    if i==5:
        sys.stdout.flush()
    sleep(1)