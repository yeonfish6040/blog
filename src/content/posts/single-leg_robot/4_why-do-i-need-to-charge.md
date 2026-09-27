---
title: "발하나 - ep.3"
description: "꼭 스프링을 충전해서 써야 할까? - 구동계 구상 수정"
published: 2026-03-12
tags: [robotic, conception, 발하나]
category: robotic
draft: false
locales:
  en:
    title: "One Leg - ep.3"
    description: "Do we really have to recharge the spring? - revising the drivetrain concept"
---

:::::locale{lang=ko}
# 와이어 충전의 문제점
:::::

:::::locale{lang=en}
# Problems with wire-based recharging
:::::

:::::locale{lang=ko}
계속해서 높은 힘을 가진 스프링 충전을 모터로 끌어당겨서 수행하는 것은 안정적이지도 못하고 비효율적이라고 생각했다.  
가장 큰 이유로는 큰 토크를 가질수록 충전 속도가 느려질 수 있다는 것과, 나에게는 많은 모터와 기어들을 가지고 테스트해볼 환경과 시간이 주어지지 않았다.  
소소하게는 충전할때 스프링을 잡아당길 와이어가 꼬일 수 있다는 그런 문제도 있었고 말이다.
:::::

:::::locale{lang=en}
Repeatedly recharging a high-force spring by pulling it with a motor struck me as neither stable nor efficient.  
The biggest reasons: the more torque required, the slower recharging can get, and I simply wasn't given the environment or the time to test with a pile of different motors and gears.  
On a smaller note, there was also the problem that the wire pulling the spring could get tangled during recharge.
:::::

:::::locale{lang=ko}
# 힘을 더하는 루프를 만들자
:::::

:::::locale{lang=en}
# Let's build a loop that adds force
:::::

:::::locale{lang=ko}
그렇다면 방법이 있다. 우리가 사용하는 스프링을 이용하면 이론상 아무 저항이 없을때 계속해서 튀어오를 수 있을 것이다.
만약에 여기서 점점 튀어오르는 힘이 증가될 수 있도록 **튀어오르는 시점에 스프링을 살짝 밀어준다면** 어떨까. 반복해서 튀어오를수록 점점 더 높이 튀어오를 수 있을 것이다.
현실의 공기저항이나 스프링이 압축되며 손실되는 에너지들을 감안하더라고 해당 방식이 지속적으로 스프링을 충전하는 것보다 즉발적이고 효율적일 수 있을거라는 생각이 들었다.
:::::

:::::locale{lang=en}
There is another way. With the spring we're using, in theory — absent any resistance — it could keep bouncing forever.
So what if we **give the spring a slight push at the moment it launches**, so that the bounce force grows over time? With each repeated bounce it could go higher and higher.
Even accounting for real-world air resistance and the energy lost as the spring compresses, I figured this approach could be more instantaneous and more efficient than continuously recharging the spring.
:::::

:::::locale{lang=ko}
# 밀어내는 방법
:::::

:::::locale{lang=en}
# How to do the pushing
:::::

:::::locale{lang=ko}
가장 먼저 생각했던 방법은 솔레노이드같이 비금속 로드 위에 금속 코어를 달아놓은 봉을 스프링 하단 바닥에 연결시켜놓고 비금속 경계에 코일을 감아 강한 전류를 밀어넣어 힘을 더해주는 방법이다.
가변적으로 힘을 조절하는 것이 가능하고 상대적으로 즉발적이라는 장점이 있지만 높은 힘를 내기 위해서는 스트로크가 짧아져야하기에 설계가 어렵다
:::::

:::::locale{lang=en}
The first idea was solenoid-like: attach a rod carrying a metal core on a non-metallic shaft to the bottom of the spring, wind a coil around the non-metallic section, and push a strong current through it to add force.
It has the advantages of variable force control and being relatively instantaneous, but producing high force requires a shorter stroke, which makes the design difficult.
:::::

:::::locale{lang=ko}
그래서 다시 고민해서 나온 방식은 모터가 높은 기어 감속비를 가지고 스프링이 자연적으로 충전될 수 있는 최대지점에 도달했을때 지긋이 눌러주는 방식이다.
스프링이 어느정도 지면을 밀어주는 시간동안 모터가 같이 움직이면서 밀어주면 되기 때문에 기어 감속비가 높아도 어느정도 커버가 될 수 있을 것이라고 생각헀다.
:::::

:::::locale{lang=en}
So after more thought, what came out was this: give the motor a high gear reduction ratio and have it press down firmly once the spring reaches the maximum point it can naturally charge to.
Since the motor can move and push along during the window in which the spring is pushing against the ground, I figured a high gear ratio could still be covered well enough.
:::::

:::::locale{lang=ko}
# 스프링
:::::

:::::locale{lang=en}
# The spring
:::::

:::::locale{lang=ko}
스프링은 [SF60X500](https://kr.misumi-ec.com/vona2/detail/221004961713/?list=PageCategory)사용을 고려중이다
:::::

:::::locale{lang=en}
For the spring I'm considering the [SF60X500](https://kr.misumi-ec.com/vona2/detail/221004961713/?list=PageCategory).
:::::
