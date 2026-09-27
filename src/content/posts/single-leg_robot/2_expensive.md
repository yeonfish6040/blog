---
title: "발하나 - ep.1"
description: "구동계. 어떻게 설계하는게 좋을 것인가."
published: 2026-03-10
tags: [robotic, conception, 발하나]
category: robotic
draft: false
locales:
  en:
    title: "One Leg - ep.1"
    description: "The drivetrain. What's the best way to design it?"
---

:::::locale{lang=ko}
# 4다리 로봇?
:::::

:::::locale{lang=en}
# A four-legged robot?
:::::

:::::locale{lang=ko}
고려할게 너무 많다. \
안정적으로 운행하려면 각 다리의 반응성이 좋아야할 것 같고... \
4개의 다리를 각각 모든 상황에 각자 어떻게 구동해야하는지 정해주는게 너무 품이 많이드는 작업이라는 생각이 들었다. \
노면별로 고려할게 너무 많아보였다. \
대신 자세제어만 잘되면 날라다닐텐데...
:::::

:::::locale{lang=en}
Too many things to consider. \
For stable locomotion each leg would need great responsiveness... \
Deciding how each of the four legs should move in every possible situation felt like far too much work. \
And there seemed to be far too much to account for across different terrain. \
Then again, if attitude control worked well it would practically fly...
:::::

:::::locale{lang=ko}
~~다 떠나서 모터가 너무 비싸진다~~
:::::

:::::locale{lang=en}
~~Setting all that aside, the motors just get way too expensive~~
:::::

:::::locale{lang=ko}
# 그러면?
:::::

:::::locale{lang=en}
# So then?
:::::

:::::locale{lang=ko}
2다리 로봇도 비슷하다고 생각했다. 심지어 여기서는 균형에 대해서 생각해야하는 것들이 4다리랑 남다르게 많아졌는데
- 다리가 미끌어졌을때
- 점프를 진행하였고 착지자세를 취하였을때 변수가 발생하여 안정적인 자세로 착지가 불가능할때
- 그냥 서있을때...
- etc
:::::

:::::locale{lang=en}
I figured a two-legged robot would be much the same. If anything, there was far more to think about regarding balance than with four legs:
- When a leg slips
- When it jumps and assumes a landing posture, but some variable makes a stable landing impossible
- When it's just standing there...
- etc.
:::::

:::::locale{lang=ko}
어려운거 투성이다.
:::::

:::::locale{lang=en}
Nothing but hard problems.
:::::

:::::locale{lang=ko}
# 1다리..?
:::::

:::::locale{lang=en}
# One leg..?
:::::

:::::locale{lang=ko}
오...? 생각할게 줄어들었다. 획기적으로.\
우선 다리가 하나면 그 하나가지고 이동할 수 있는 방법이 많이 없다. 내가 가장 먼저 생각해낸건 통통뛰기. 어? 최고다.
:::::

:::::locale{lang=en}
Oh...? The number of things to think about dropped. Dramatically.\
With only one leg there aren't many ways to move at all. The first thing that came to mind was hopping. Huh? That's perfect.
:::::

:::::locale{lang=ko}
# 1다리!
:::::

:::::locale{lang=en}
# One leg it is!
:::::

:::::locale{lang=ko}
1다리를 이용한 로봇을 구상하면서 가장 설계가 쉬워진 부분은 **다리** 와 **몸체**였다. 통통 튀어서 이동한다면
다리는 복잡한 유압, 관절 필요없이 스프링이랑 리니어 베어링정도만 있으면 바로 로봇의 동력부분이 해결되었다.
또한 자세제어도 마찬가지다. 다리를 일사분란하게 움직여서 조정할 필요 없이 몸체를 바로 돌려며리면 되는거 아닌가.
:::::

:::::locale{lang=en}
While designing a one-legged robot, the parts that got dramatically easier were the **leg** and the **body**. If it moves by hopping,
the leg needs no complicated hydraulics or joints — a spring and a linear bearing are enough to solve the robot's propulsion outright.
The same goes for attitude control. Instead of choreographing legs in perfect sync, you just spin the body directly, right?
:::::

:::::locale{lang=ko}
# 자세제어
:::::

:::::locale{lang=en}
# Attitude control
:::::

:::::locale{lang=ko}
크게 2가지 방법으로 자세를 제어한다.
- 다리를 펼쳐 각속도를 줄이기
- reaction wheel을 이용하여 몸체를 돌리기
:::::

:::::locale{lang=en}
Attitude is controlled in two main ways:
- Extending the leg to reduce angular velocity
- Rotating the body with a reaction wheel
:::::

:::::locale{lang=ko}
이렇게 몸체를 내가 원하는 각도로 세팅한 후에 점프를 하면 원하는 방향으로 진행할 수 있고, 착지를 하면 스프링을 충전하며 충격이 덜어지고 안정적으로 착지가 가능할 것이다.
:::::

:::::locale{lang=en}
If you set the body to the angle you want and then jump, you can travel in the intended direction; and on landing, the spring recharges while absorbing the impact, making a stable landing possible.
:::::
