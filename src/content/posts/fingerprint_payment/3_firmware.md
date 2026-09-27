---
title: "지문결제 ep.3 - 이진화가 간단한게 아니었다고? 내가 할 수 있을리가 없잖아! 무리무리!"
description: "데이터시트를 쓸거면 좀 그걸 읽고 알아 쳐먹을 수 있게 써주세요. 그리고 8bpp를 1bpp로 만들기"
published: 2026-09-02
tags: [embedded, nRF54L15, BLE, image processing]
category: developing
draft: false
locales:
  en:
    title: "Fingerprint Payment ep.3 - binarization isn't simple? There's no way I can do this! No way!"
    description: "If you're going to write a datasheet, please write one people can actually read and understand. Plus turning 8bpp into 1bpp"
---

:::::locale{lang=ko}
[이전 글](/posts/fingerprint_payment/2_hardware/)에서 보드를 살렸으니 이제 펌웨어다.
:::::

:::::locale{lang=en}
The board was rescued in the [previous post](/en/posts/fingerprint_payment/2_hardware/), so now it's firmware time.
:::::

:::::locale{lang=ko}
# 데이터시트에 설명이 없다
:::::

:::::locale{lang=en}
# The datasheet has no explanations
:::::

:::::locale{lang=ko}
HF302GD 데이터시트를 폈는데 레지스터 테이블에 ~~5글자짜리 줄임말~~레지스터 이름만 있고 설명이 없다. 각 레지스터가 뭘 하는지, 라이프사이클이 어떻게 되는지가 안 나와있다.
:::::

:::::locale{lang=en}
I opened the HF302GD datasheet and the register table has only ~~five-letter abbreviations~~ register names, with no descriptions. What each register does, what its lifecycle is — none of that is there.
:::::

:::::locale{lang=ko}
처음엔 이름만 보고 유추하면서 짰는데 당연히 잘 안 됐다. ~~진짜 제발 좀 알아들을 수 있게좀 제발~~
:::::

:::::locale{lang=en}
At first I wrote code inferring from the names alone, and naturally it didn't go well. ~~Seriously, please, just make it understandable, please~~
:::::

:::::locale{lang=ko}
그래서 제조사가 제공한 AS608 칩이 올라간 테스트보드 소스를 보고 프로토콜을 유추/복구해서 펌웨어를 설계했다.
남의 레퍼런스 구현을 읽어서 스펙을 역으로 복원하는 작업이었는데, 이런 건 처음이라 꽤 오래 걸렸다.
:::::

:::::locale{lang=en}
So I designed the firmware by inferring and reconstructing the protocol from the source for the manufacturer-provided test board carrying an AS608 chip.
It was a matter of reading someone else's reference implementation to reverse-reconstruct the spec, and since it was my first time doing that, it took quite a while.
:::::

:::::locale{lang=ko}
# 통신 인터페이스
:::::

:::::locale{lang=en}
# Communication interface
:::::

:::::locale{lang=ko}
BLE 쪽은 NUS 위에 소규모 커스텀 바이너리 프로토콜을 얹었다. 대략 이런 모양이다.
:::::

:::::locale{lang=en}
On the BLE side I layered a small custom binary protocol on top of NUS. It looks roughly like this.
:::::

:::::locale{lang=ko}
```text title="대략적인 구조"
     Host (iPad)                      Sensor (nRF54L15)
         │                                   │
         │◀──────── 상태 / 이벤트 ───────────│   손가락 감지 등
         │                                   │
         │──────── 캡쳐 요청 ───────────────▶│
         │                                   │
         │◀──────── 이미지 헤더 ─────────────│   차원 / bpp
         │◀──────── 이미지 데이터 ───────────│   (분할 전송)
         │◀──────── 종료 플래그 ─────────────│
         │                                   │
         │◀──────── 에러 ───────────────────│   (실패 시)
```
:::::

:::::locale{lang=en}
```text title="Rough structure"
     Host (iPad)                      Sensor (nRF54L15)
         │                                   │
         │◀──────── status / event ─────────│   finger detected, etc.
         │                                   │
         │──────── capture request ────────▶│
         │                                   │
         │◀──────── image header ───────────│   dimensions / bpp
         │◀──────── image data ─────────────│   (chunked)
         │◀──────── end flag ───────────────│
         │                                   │
         │◀──────── error ──────────────────│   (on failure)
```
:::::

:::::locale{lang=ko}
설계하면서 챙긴 것 몇 가지만 적어두면,
:::::

:::::locale{lang=en}
A few things I made sure to handle while designing it:
:::::

:::::locale{lang=ko}
우선 보안연결이 성립되지 않은 상태에서 들어온 캡쳐 요청은 그냥 거부한다.
:::::

:::::locale{lang=en}
First, any capture request arriving without an established secure connection is simply rejected.
:::::

:::::locale{lang=ko}
에러도 몇 종류로 나눠놨다. 이미 캡쳐 중인데 또 요청이 온 경우, 정의되지 않은 명령이 온 경우, 호스트가 캡쳐를 끊은 경우, 데이터라인이 불안정해서 이미지가 깨진 경우 같은 것들이다.
매점에 나가있는 기기라 현장에서 원인을 좁힐 수 있어야 했다. 이 에러 코드는 OLED에도 같이 띄운다.
:::::

:::::locale{lang=en}
I also split errors into several kinds: another request arriving while a capture is already in progress, an undefined command, the host aborting the capture, a corrupted image due to an unstable data line, and so on.
Since the device sits out in the store, it had to be possible to narrow down causes on site. These error codes are also shown on the OLED.
:::::

:::::locale{lang=ko}
등록용으로는 별도의 캡쳐 모드를 하나 더 뒀다. 센서에서 3장을 연속으로 읽어와서 픽셀값을 평균낸 이미지를 만들어 반환한다.
이 센서가 방전용량 방식이라 노이즈에 민감한데, 평균만 내줘도 노이즈가 꽤 효과적으로 감쇄됐다.
:::::

:::::locale{lang=en}
For enrollment I added a separate capture mode. It reads three frames back to back from the sensor and returns an image averaged pixel-wise.
This sensor is capacitive-discharge based and therefore noise-sensitive, but simply averaging attenuated the noise quite effectively.
:::::

:::::locale{lang=ko}
# 8bpp를 1bpp로
:::::

:::::locale{lang=en}
# From 8bpp to 1bpp
:::::

:::::locale{lang=ko}
센서는 8bpp 이미지를 준다. 그런데 실제로 BLE로 보내는 건 260×320 1bpp다.
:::::

:::::locale{lang=en}
The sensor gives an 8bpp image. But what actually goes out over BLE is 260×320 at 1bpp.
:::::

:::::locale{lang=ko}
이유는 하나다. 전송속도. 8bpp를 그대로 보내면 데이터가 8배고, BLE 대역폭에서 그건 다시 V1 꼴이 난다.
:::::

:::::locale{lang=en}
There's one reason: transfer speed. Sending 8bpp as-is means 8× the data, and at BLE bandwidth that puts us right back in V1 territory.
:::::

:::::locale{lang=ko}
문제는 8bpp에서 1bpp로 가는 게 곧 이진화라는 거고, 지문 이진화는 생각보다 훨씬 까다로웠다. 이 파이프라인은 한번에 나온 게 아니라 세 번에 걸쳐 개선된 결과다.
:::::

:::::locale{lang=en}
The catch is that going from 8bpp to 1bpp *is* binarization, and fingerprint binarization was far trickier than expected. This pipeline didn't come out in one shot — it's the result of three rounds of refinement.
:::::

:::::locale{lang=ko}
## 1세대 - 고정 Threshold
:::::

:::::locale{lang=en}
## Gen 1 - fixed threshold
:::::

:::::locale{lang=ko}
가장 단순하게, 어떤 값보다 어두우면 1 밝으면 0.
:::::

:::::locale{lang=en}
The simplest thing possible: darker than some value → 1, brighter → 0.
:::::

:::::locale{lang=ko}
망했다. 지문 융선의 생김새는 사람마다 다르다. 융선이 얕고 평평한 지문을 가진 사람은 패킹 과정에서 융선이 통째로 소실됐다. 이미지에 아무것도 안 남는다.
:::::

:::::locale{lang=en}
It failed. Fingerprint ridges look different from person to person. For people with shallow, flat ridges, the ridges vanished entirely during packing. Nothing was left in the image.
:::::

:::::locale{lang=ko}
## 2세대 - 전역 동적 Threshold
:::::

:::::locale{lang=en}
## Gen 2 - global dynamic threshold
:::::

:::::locale{lang=ko}
그럼 사람마다 기준을 다르게 잡으면 되지 않나. 그래서 융선이 전체 이미지의 40%를 차지하게 Threshold를 유동적으로 조절하는 알고리즘을 적용했다.
:::::

:::::locale{lang=en}
So why not set the threshold differently per person? I applied an algorithm that adjusts the threshold dynamically so ridges occupy 40% of the whole image.
:::::

:::::locale{lang=ko}
전체적으로 어두운 지문이든 밝은 지문이든 결과물의 융선 비율은 비슷하게 나온다. 1세대보단 훨씬 나았다.
:::::

:::::locale{lang=en}
Whether the print is overall dark or light, the ridge ratio in the output comes out similar. Much better than gen 1.
:::::

:::::locale{lang=ko}
근데 또 막혔다. 손가락을 완전히 접촉시키지 않아서 이미지 프레임 안에 지문이 꽉 차지 않는 사용자가 있었고,
애초에 지문을 찍으면 주로 가운데 부분은 강하게 접촉되고 테두리 부분은 약하게 접촉된다.
:::::

:::::locale{lang=en}
But it got stuck again. Some users don't press their finger fully, so the print doesn't fill the image frame;
and fundamentally, when you press a finger down, the center contacts strongly while the edges contact weakly.
:::::

:::::locale{lang=ko}
즉 한 장의 이미지 안에서 영역별로 적정 Threshold가 다르다. 이건 하나의 Global Threshold를 아무리 잘 잡아도 못 푼다. 가운데에 맞추면 테두리가 날아가고 테두리에 맞추면 가운데가 뭉갠다.
:::::

:::::locale{lang=en}
In other words, the appropriate threshold differs by region within a single image. No single global threshold, however well chosen, can solve this. Tune for the center and the edges vanish; tune for the edges and the center smears.
:::::

:::::locale{lang=ko}
## 3세대 - Local window 표준편차
:::::

:::::locale{lang=en}
## Gen 3 - local window standard deviation
:::::

:::::locale{lang=ko}
그래서 전역 기준을 버렸다.
:::::

:::::locale{lang=en}
So I abandoned the global criterion.
:::::

:::::locale{lang=ko}
각 픽셀에 대해 local window를 만들어서 그 window 안에서 표준편차를 구하고, 표준편차의 3배 이상 차이가 나는 픽셀을 ridge로 판별하는 알고리즘을 작성했다.
:::::

:::::locale{lang=en}
I wrote an algorithm that builds a local window around each pixel, computes the standard deviation within that window, and classifies pixels deviating by more than 3× the standard deviation as ridges.
:::::

:::::locale{lang=ko}
이러면 "절대적으로 어두운가"가 아니라 "주변에 비해 튀는가"를 보게 된다.
접촉이 약해서 전체적으로 흐릿한 테두리 영역에서도 그 안에서의 상대적 대비만 살아있으면 융선이 검출된다. 접촉 강도 편차가 자동으로 흡수되는 거다.
:::::

:::::locale{lang=en}
Now the question isn't "is it absolutely dark?" but "does it stand out relative to its surroundings?"
Even in edge regions that are faint overall due to weak contact, ridges are detected as long as relative contrast survives locally. Variation in contact pressure is absorbed automatically.
:::::

:::::locale{lang=ko}
근데 이게 또 부작용이 있었다. 지문이 아예 닿지 않은 흰 영역에서는 신호가 없으니 표준편차 자체가 매우 작고, 그러면 아주 작은 노이즈도 표준편차의 3배를 가볍게 넘어버린다. 흰 영역이 노이즈로 도배됐다.
:::::

:::::locale{lang=en}
But this had a side effect too. In white regions the finger never touched there's no signal, so the standard deviation itself is tiny — and then even minuscule noise sails past 3× that deviation. The white regions were plastered with noise.
:::::

:::::locale{lang=ko}
해결은 단순했다. 전역 평균에 bias를 더한 값보다 밝은 픽셀은 그냥 죽였다. 상대적 기준으로 융선을 찾되, 절대적으로 너무 밝은 픽셀은 애초에 후보에서 빼는 노이즈 컷이다.
:::::

:::::locale{lang=en}
The fix was simple. Any pixel brighter than the global mean plus a bias was just killed. Find ridges by a relative criterion, but cut out pixels that are absolutely too bright from the candidate set in the first place — a noise cut.
:::::

:::::locale{lang=ko}
## 최종 파이프라인
:::::

:::::locale{lang=en}
## Final pipeline
:::::

:::::locale{lang=ko}
```text title="이미지 변환"
센서 8bpp 캡쳐 (256×320)
        │
        ▼
픽셀별 local window 표준편차 계산
        │
        ▼
표준편차 3배 초과 픽셀을 ridge로 판별
        │
        ▼
전역평균 + bias 보다 밝은 픽셀 제거
        │
        ▼
1bpp 패킹 후 BLE 전송
```
:::::

:::::locale{lang=en}
```text title="Image conversion"
Sensor 8bpp capture (256×320)
        │
        ▼
Per-pixel local window std. deviation
        │
        ▼
Pixels beyond 3× std. deviation → ridge
        │
        ▼
Drop pixels brighter than global mean + bias
        │
        ▼
Pack to 1bpp, send over BLE
```
:::::

:::::locale{lang=ko}
상대 기준으로 융선을 찾고 절대 기준으로 노이즈를 거른다. 결국 두 개를 같이 써야 했다.
:::::

:::::locale{lang=en}
Find ridges by a relative criterion, filter noise by an absolute one. In the end both were needed together.
:::::

:::::locale{lang=ko}
참고로 이 이미지 처리가 최종 성능에서 630ms를 먹는다. 전체 1.38초 중에 제일 큰 조각이다.
그래도 BLE 전송이 150ms로 줄어든 걸 생각하면 남는 장사다. V1은 BLE에만 1초를 썼다.
:::::

:::::locale{lang=en}
For reference, this image processing eats 630ms in the final performance figures. It's the largest single slice of the 1.38 seconds total.
Still, considering BLE transfer dropped to 150ms, it's a net win. V1 spent a full second on BLE alone.
:::::

:::::locale{lang=ko}
다음 글에서는 [인프라랑 DFU, 그리고 결과](/posts/fingerprint_payment/4_infra/)를 다룬다.
:::::

:::::locale{lang=en}
The next post covers [infrastructure, DFU, and the results](/en/posts/fingerprint_payment/4_infra/).
:::::
