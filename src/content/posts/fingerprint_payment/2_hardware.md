---
title: "지문결제 ep.2 - 보드설계"
description: "센서 구하기, nRF54L15 보드 설계, Failed to power up DAP"
published: 2026-09-02
tags: [embedded, nRF54L15]
category: developing
draft: false
locales:
  en:
    title: "Fingerprint Payment ep.2 - board design"
    description: "Sourcing a sensor, designing an nRF54L15 board, Failed to power up DAP"
---

:::::locale{lang=ko}
[이전 글](/posts/fingerprint_payment/1_v1/)에서 V1이 UART 때문에 5.8초에 처박힌 얘기를 했다. 이번엔 그걸 갈아엎는 얘기다.
:::::

:::::locale{lang=en}
In the [previous post](/en/posts/fingerprint_payment/1_v1/) I talked about how V1 got stuck at 5.8 seconds because of UART. This time it's about tearing that down.
:::::

:::::locale{lang=ko}
# 요구조건 한 줄 추가
:::::

:::::locale{lang=en}
# One more line added to the requirements
:::::

:::::locale{lang=ko}
V1 요구조건에 딱 한 줄이 붙었다.
:::::

:::::locale{lang=en}
Exactly one line was appended to the V1 requirements.
:::::

:::::locale{lang=ko}
> 12MHz 이상의 SPI 통신을 지원하는 지문센서
:::::

:::::locale{lang=en}
> A fingerprint sensor supporting SPI communication at 12MHz or above
:::::

:::::locale{lang=ko}
3.8초짜리 UART는 두 번 다시 안 쓴다.
:::::

:::::locale{lang=en}
Never again am I using a 3.8-second UART.
:::::

:::::locale{lang=ko}
# 센서 구하기
:::::

:::::locale{lang=en}
# Sourcing a sensor
:::::

:::::locale{lang=ko}
시중에서 살 수 있는 지문센서로는 한계가 명확하다는 걸 확인하고 제조업체를 직접 찾기 시작했다.
:::::

:::::locale{lang=en}
Having confirmed that off-the-shelf fingerprint sensors have clear limits, I started contacting manufacturers directly.
:::::

:::::locale{lang=ko}
| 제조사 / 모델 | 인터페이스 | 이미지 | 결과 |
|---|---|---|---|
| CAMABIO | UART, USB (프로토콜 비공개) | - | 센서 자체는 이상적이었는데 SPI 미지원 + USB 프로토콜 비공개로 탈락 |
| Midas Touch MFC-1208GD | - | HF302GD보다 적음 | 픽셀수 부족으로 탈락 |
| Aratek A400-M | - | - | 동작 전압이 MCU랑 안 맞음. 레벨 변환 추가 설계 필요해서 탈락 |
| ADH-TECH HF302GD | SPI 16MHz | 256×360, 508dpi, 최대 9fps | 채택 |
:::::

:::::locale{lang=en}
| Manufacturer / model | Interface | Image | Verdict |
|---|---|---|---|
| CAMABIO | UART, USB (protocol undisclosed) | - | The sensor itself was ideal, but out due to no SPI support + undisclosed USB protocol |
| Midas Touch MFC-1208GD | - | Fewer pixels than the HF302GD | Out due to insufficient pixel count |
| Aratek A400-M | - | - | Operating voltage doesn't match the MCU. Out because it would need extra level-shifting design |
| ADH-TECH HF302GD | SPI 16MHz | 256×360, 508dpi, up to 9fps | Selected |
:::::

:::::locale{lang=ko}
최종적으로 ADH-TECH의 HF302GD로 갔다. SPI 16MHz로 이미지를 받을 수 있고 256×360에 508dpi면 면적도 해상도도 충분하다. 캡쳐도 최대 9fps로 빠르다.
:::::

:::::locale{lang=en}
In the end I went with ADH-TECH's HF302GD. It can deliver images over SPI at 16MHz, and 256×360 at 508dpi gives plenty of both area and resolution. Capture is fast too, up to 9fps.
:::::

# POC

![poc.jpeg](poc.jpeg)

:::::locale{lang=ko}
ADH-TECH에 이메일로 컨택해서 하드웨어 샘플이랑 테스트보드를 사서 받았다.
:::::

:::::locale{lang=en}
I contacted ADH-TECH by email and bought a hardware sample and a test board.
:::::

:::::locale{lang=ko}
받자마자 테스트보드에서 FPC 커넥터를 뽑아다가 만능기판에 납땜하고, 전원이랑 SPI 데이터라인을 구성해서 nRF54L15-DK에 물렸다.
이게 하드웨어 POC다. 동작이 확인되니 이제 보드를 설계할 차례다.
:::::

:::::locale{lang=en}
The moment it arrived I pulled the FPC connector off the test board, soldered it to perfboard, wired up power and the SPI data lines, and hooked it to the nRF54L15-DK.
That's the hardware POC. With operation confirmed, it was time to design the board.
:::::

:::::locale{lang=ko}
# 보드 설계
:::::

:::::locale{lang=en}
# Board design
:::::

![schematic.png](schematic.png)

:::::locale{lang=ko}
이번엔 시간이랑 예산이 충분해서 nRF54L15를 직접 올린 보드를 설계해서 PCBA를 맡기기로 했다.
원래 KiCad를 쓰는데 EasyEDA로 그리면 주문할 때 할인이 되길래 EasyEDA로 갈아탔다. KiCad랑 다르게 JLCPCB Components Lib에서 부품을 바로 검색해서 넣을 수 있어서 BOM을 따로 안 써도 되는 건 확실히 편했다.
:::::

:::::locale{lang=en}
This time I had enough time and budget, so I decided to design a board with the nRF54L15 mounted directly and have it assembled (PCBA).
I normally use KiCad, but drawing it in EasyEDA came with an ordering discount, so I switched. Unlike KiCad, you can search the JLCPCB Components Lib and drop parts straight in, and not having to write a separate BOM was definitely convenient.
:::::

:::::locale{lang=ko}
Nordic의 nRF54L15 데이터시트에 있는 [Reference Circuitry](https://docs.nordicsemi.com/bundle/ps_nrf54L15/page/chapters/ref_circuitry.html)를 참고해서 디자인했고,
전원부랑 필터, RF 서킷은 신뢰성 있는 동작을 보장하려고 데이터시트의 BOM 스펙을 그대로 차용했다. 여기서 창의력을 발휘할 이유가 없다.
:::::

:::::locale{lang=en}
I designed it with reference to the [Reference Circuitry](https://docs.nordicsemi.com/bundle/ps_nrf54L15/page/chapters/ref_circuitry.html) in Nordic's nRF54L15 datasheet,
and for the power section, filters, and RF circuit I adopted the datasheet's BOM spec verbatim to guarantee reliable operation. There's no reason to get creative here.
:::::

:::::locale{lang=ko}
2.4GHz 안테나는 간단하게 해결하려고 TI의 [AN043 Application Note](https://www.ti.com/lit/an/swra117d/swra117d.pdf)를 보고 IFA를 서킷에 그대로 옮긴 다음, Nordic Q&A를 통해서 설계를 검증받았다.
지문센서랑 MCU 사이 SPI 라인에는 센서 제조사 데이터시트에 적힌 링잉 억제용 200Ω 저항을 넣었다.
:::::

:::::locale{lang=en}
To keep the 2.4GHz antenna simple, I copied the IFA straight into the circuit from TI's [AN043 Application Note](https://www.ti.com/lit/an/swra117d/swra117d.pdf), then had the design verified through Nordic Q&A.
On the SPI lines between the fingerprint sensor and the MCU I added the 200Ω ringing-suppression resistors specified in the sensor manufacturer's datasheet.
:::::

![layout.png](layout.png)

:::::locale{lang=ko}
그리고 OLED를 하나 달았다.
:::::

:::::locale{lang=en}
I also added an OLED.
:::::

:::::locale{lang=ko}
개발 인원이 매번 SWD로 붙어서 BLE 인증번호를 확인해 페어링할 수도 없고, 매점에 상주하면서 기기를 관리할 수도 없다.
그래서 매점 상주 인원이 보드만 보고 페어링이랑 상태확인, 트러블슈팅, 개발팀을 위한 오류보고까지 할 수 있게 OLED 모듈을 추가했다.
:::::

:::::locale{lang=en}
The dev team can't attach via SWD every time just to read the BLE passkey and pair, nor can they camp at the store managing the device.
So I added an OLED module, letting the store staff handle pairing, status checks, troubleshooting, and even error reports for the dev team just by looking at the board.
:::::

:::::locale{lang=ko}
전원은 보드 상단의 USB-C로 받는다. CC핀에 5.1k를 달아서 USB 2.0 스펙으로 5V를 VBUS에 받고, 이걸 LDO로 3.3V로 내려서 VDD에 공급한다.
LDO 전후단에는 벌크 커패시터를 둬서 공통 전원라인에 버퍼를 만들어줬다.
:::::

:::::locale{lang=en}
Power comes in through the USB-C at the top of the board. With 5.1k on the CC pins, it takes 5V into VBUS per the USB 2.0 spec, and an LDO steps that down to 3.3V for VDD.
Bulk capacitors before and after the LDO create a buffer on the common power rail.
:::::

![pcba.jpeg](pcba.jpeg)

:::::locale{lang=ko}
PCBA로 받은 보드다.
:::::

:::::locale{lang=en}
This is the assembled board as received.
:::::

:::::locale{lang=ko}
Via도 용도별로 나눴다. 그라운드랑 파워 Plane을 이어주는 Suture Via는 via pad가 노출되지 않게 했고, 디커플링이랑 데이터 라인의 Via는 패드를 노출해서 Test Point 대신 쓸 수 있게 했다.
이게 바로 다음 챕터에서 목숨을 구한다.
:::::

:::::locale{lang=en}
I split the vias by purpose too. Suture vias tying the ground and power planes together have no exposed via pad, while vias on decoupling and data lines expose their pads so they can double as test points.
That is exactly what saves my life in the next chapter.
:::::

# Failed to power up DAP

:::::locale{lang=ko}
보드를 받고 전원을 연결한 다음 DAP에 붙어보려는데,
:::::

:::::locale{lang=en}
I got the board, connected power, and tried to attach to the DAP:
:::::

```
TF9FD58C0 005:626.736 Found SW-DP with ID 0x6BA02477
TF9FD58C0 005:628.365 Failed to power up DAP
TF9FD58C0 005:680.817 ConfigTargetSettings() start
TF9FD58C0 005:681.040 InitTarget() start
TF9FD58C0 005:682.630 InitTarget() end - Took 1.53ms
TF9FD58C0 005:788.991 Failed to attach to CPU. Trying connect under reset.
TF9FD58C0 005:790.139 Found SW-DP with ID 0x6BA02477
TF9FD58C0 005:790.720 SWD speed too high. Reduced from 4000 kHz to 2700 kHz for stability
TF9FD58C0 005:791.796 Failed to power up DAP
TF9FD58C0 005:791.837 - 169.767ms returns 0xFFFFFEFB
```

:::::locale{lang=ko}
SW-DP는 찾는데 파워업이 안 된다. 그리고 리턴받은 값이 랜덤성을 띄었다. 정상적으로 결과값을 못 돌려주고 있다는 뜻이다. DAP 자체가 응답을 못 하는 상황으로 판단했다.
:::::

:::::locale{lang=en}
It finds SW-DP but can't power up. And the returned values looked random — meaning it can't return proper results. I judged that the DAP itself was unable to respond.
:::::

:::::locale{lang=ko}
## 1차 용의자는 당연히 전원
:::::

:::::locale{lang=en}
## The prime suspect is obviously power
:::::

:::::locale{lang=ko}
에러에 Power가 있으니까 제일 먼저 전원을 의심했다.
:::::

:::::locale{lang=en}
Since the error says "power," power was the first thing I suspected.
:::::

:::::locale{lang=ko}
찾아보니 실제로 10번핀에 매핑한 100nF 디커플링에 3.3V 전원라인 연결을 실수로 빼먹었더라. 아 이거구나 싶었는데,
오실로스코프로 찍어보니 전압은 안정적이었고 연결을 해줘도 결과가 다르지 않았다.
:::::

:::::locale{lang=en}
Looking into it, I had indeed forgotten to connect the 3.3V rail to the 100nF decoupling cap mapped to pin 10. "Ah, this is it," I thought — but
probing with a scope showed the voltage was stable, and connecting it changed nothing.
:::::

:::::locale{lang=ko}
원인이 아니었다.
:::::

:::::locale{lang=en}
That wasn't the cause.
:::::

:::::locale{lang=ko}
## DECA가 발진한다
:::::

:::::locale{lang=en}
## DECA is oscillating
:::::

:::::locale{lang=ko}
프로브를 여기저기 옮겨 찍어가며 디버깅을 이어가다가 (아까 만든 Test Point가 여기서 빛을 발했다) 발견했다.
:::::

:::::locale{lang=en}
While continuing to debug by moving the probe around (those test points I made earlier really shone here), I found it.
:::::

![scope1.jpeg](scope1.jpeg)
![scope2.jpeg](scope2.jpeg)

:::::locale{lang=ko}
DECA 라인이 8MHz로 발진하고 있었다.
:::::

:::::locale{lang=en}
The DECA line was oscillating at 8MHz.
:::::

:::::locale{lang=ko}
이후 여러 부품들을 리솔더링 해가며 원인규명을 시작했고,
:::::

:::::locale{lang=en}
I then started tracking down the cause, resoldering various components,
:::::

![deca_circuit.png](deca_circuit.png)

:::::locale{lang=ko}
위 회로의 C21을 제거하니까 발진이 사라지는 걸 발견했다. C32는 원인규명이랑 문제해결 이후에 생산에서 문제를 없애려고 추가한 컴포넌트다. 실제 PCB에는 없다.
:::::

:::::locale{lang=en}
and found that removing C21 in the circuit above made the oscillation disappear. C32 is a component added after root-causing and fixing the issue, to eliminate the problem in production. It isn't on the actual PCB.
:::::

![c21.png](c21.png)

:::::locale{lang=ko}
보드 뒷면에 애매하게 붙어있던 그 10nF이다.
:::::

:::::locale{lang=en}
It's that 10nF sitting awkwardly on the back of the board.
:::::

:::::locale{lang=ko}
## 첫 번째 가설,
:::::

:::::locale{lang=en}
## First hypothesis,
:::::

:::::locale{lang=ko}
여기서 이렇게 생각했다.
:::::

:::::locale{lang=en}
Here's what I thought at this point.
:::::

:::::locale{lang=ko}
주파수가 8MHz면 LC 공진으로 보기는 좀 어렵다. 그보다는 벅컨버터 출력이 C21에 의해 아주 조금 스무딩된 거라고 봤다.
:::::

:::::locale{lang=en}
At 8MHz it's hard to call it LC resonance. I figured it was more likely the buck converter output being very slightly smoothed by C21.
:::::

:::::locale{lang=ko}
nRF54L15는 내부 전원단에 LDO랑 벅컨버터가 둘 다 있다. 스타트업할 때 LDO로 전원을 받으면서 벅컨버터 출력단에 LC 회로가 있는지를 감지하고, 감지가 안 되면 LDO로 계속 동작한다.
근데 이 인덕터 감지 회로는 인덕터 자체를 보는 게 아니라 LC 회로가 발생시키는 발진을 감지하는 쪽에 가깝다.
그럼 보드 뒷면에 애매하게 붙은 10nF 때문에 감지가 된 상태가 돼버렸고, 벅컨버터가 동작하면서 저 주파수로 발진이 일어나는 건가?
:::::

:::::locale{lang=en}
The nRF54L15 has both an LDO and a buck converter in its internal power stage. At startup it draws power through the LDO while detecting whether an LC circuit is present at the buck converter output, and if nothing is detected it keeps running on the LDO.
But this inductor-detection circuit doesn't really look at the inductor itself — it's closer to detecting the oscillation an LC circuit produces.
So did that awkwardly placed 10nF on the back of the board put it into a "detected" state, causing the buck converter to run and oscillate at that frequency?
:::::

:::::locale{lang=ko}
그래서 ref circuitry랑 내 회로를 한 줄씩 비교해봤고, 2.2uF(C31)이 빠진 걸 확인하고 추가한 이후 문제가 해결됐다.
[Nordic DevZone에 올린 질문](https://devzone.nordicsemi.com/f/nordic-q-a/127910/nRF54L15-cannot-use-swd-interface)에도 C31이 빠졌다는 답변을 받아서 회로 자체는 확인받았다.
:::::

:::::locale{lang=en}
So I compared the reference circuitry against mine line by line, confirmed that the 2.2uF (C31) was missing, and the problem was solved once I added it.
My [question on Nordic DevZone](https://devzone.nordicsemi.com/f/nordic-q-a/127910/nRF54L15-cannot-use-swd-interface) also got the reply that C31 was missing, so the circuit itself was confirmed.
:::::

:::::locale{lang=ko}
근데 문제 해결 이후에 이걸 돌아보다가, 내 판단에 문제가 있었다는 걸 발견했다.
:::::

:::::locale{lang=en}
But revisiting this after the fix, I realized my reasoning had been flawed.
:::::

:::::locale{lang=ko}
[regulator 다이어그램](https://docs.nordicsemi.com/r/bundle/ps_nrf54l15/page/regulators.html)을 다시 보면 벅컨버터 스위치 출력은 DCC핀이고 거기엔 이미 커패시터랑 인덕터가 연결되어 있다.
그리고 DECA는 LDO에 직결된 라인이다. 즉 DECA에서 발진이 보였다는 건 벅컨버터가 아니라 스타트업 과정이나 아날로그 Peripheral 초기화 단계에서 문제가 났다는 뜻이다.
:::::

:::::locale{lang=en}
Looking again at the [regulator diagram](https://docs.nordicsemi.com/r/bundle/ps_nrf54l15/page/regulators.html), the buck converter switch output is the DCC pin, and a capacitor and inductor are already connected there.
DECA, meanwhile, is a line tied directly to the LDO. In other words, seeing oscillation on DECA means the problem was in startup or in analog peripheral initialization — not the buck converter.
:::::

:::::locale{lang=ko}
RF 쪽도 배제했다. 원인규명 단계에서 DECRF 연결부 트레이스를 끊고 테스트했을 때 DECRF 라인은 안정적이었고 DECA만 여전히 불안정했다.
:::::

:::::locale{lang=en}
I ruled out the RF side too. During root-causing, when I cut the DECRF connection trace and tested, the DECRF line was stable and only DECA remained unstable.
:::::

:::::locale{lang=ko}
여기서 논리가 꼬인다. 전원 안정화 실패가 원인이라면 10nF(C21)을 제거했을 때 오히려 동작을 안 하는 게 이상적이다. 근데 빼니까 발진이 멈췄다. 왜?
:::::

:::::locale{lang=en}
And here the logic tangles. If failed power stabilization were the cause, then removing the 10nF (C21) should, if anything, make it stop working. But removing it stopped the oscillation. Why?
:::::

:::::locale{lang=ko}
## 답은 한참 뒤에 나왔다
:::::

:::::locale{lang=en}
## The answer came much later
:::::

:::::locale{lang=ko}
이걸 의문으로 남겨둔 채 다른 프로젝트를 하다가, 문득 "LDO에 디커플링 커패시터가 왜 있어야 하는가"에 대한 의문이 생겨서 조금 파고들어봤다.
:::::

:::::locale{lang=en}
I left it as an open question and moved on to other projects, until one day I suddenly wondered "why does an LDO need a decoupling capacitor at all?" and dug in a little.
:::::

:::::locale{lang=ko}
그동안 나는 LDO를 그냥 수동적인 소자로 생각했다. 5V 넣으면 3.3V 나오는 상자. 그래서 여기에 의문을 품지 않았다.
:::::

:::::locale{lang=en}
Until then I'd thought of an LDO as just a passive component. A box where you put in 5V and 3.3V comes out. So I'd never questioned it.
:::::

:::::locale{lang=ko}
근데 아니었다. LDO는 피드백 루프를 이용해서 내부 P-MOS 게이트를 조절해 저항을 만들어내고, 그 분압으로 타깃 전압을 만들어내는 구조다. 능동 소자다.
그리고 이걸 알고 나니까 출력단 커패시터의 정체도 보였다. 부하의 증감으로 인해 LDO의 피드백 루프가 적용되기 전, 저항값이 변하고 있을 때의 전압 상승/하강을 억제하기 위한 소자다.
:::::

:::::locale{lang=en}
But that was wrong. An LDO uses a feedback loop to modulate an internal P-MOS gate, producing a resistance, and creates the target voltage from that divider. It's an active device.
Once I understood that, the identity of the output capacitor became clear too: it exists to suppress voltage rise/fall during the window when the resistance is still changing — before the LDO's feedback loop catches up with an increase or decrease in load.
:::::

:::::locale{lang=ko}
여기까지 오니까 8MHz가 설명됐다. 10nF은 너무 작아서 그 구간의 변동을 못 잡아준다.
그래서 출력 전압의 변화와 피드백 루프로 인해 변하는 저항값의 변화가 서로 반전되면서 발진을 일으켰고, 이걸 억제해줄 2.2uF이 부재해서 나타난 현상이었다.
:::::

:::::locale{lang=en}
At that point the 8MHz was explained. 10nF is far too small to absorb the variation in that window.
So the change in output voltage and the change in resistance driven by the feedback loop kept inverting against each other, producing oscillation — a phenomenon that showed up precisely because the 2.2uF that would have damped it was missing.
:::::

:::::locale{lang=ko}
C21만 빼도 발진이 멈춘 것도 같은 이유다. 발진 루프에 참여하던 소자가 사라졌으니까. 정답은 C21을 빼는 게 아니라 C31을 넣는 거였고, 결과적으로 그렇게 고쳤다.
:::::

:::::locale{lang=en}
Removing just C21 stopping the oscillation has the same explanation: a component participating in the oscillation loop disappeared. The right answer was not to remove C21 but to add C31, and that is how it was ultimately fixed.
:::::

:::::locale{lang=ko}
교훈이라면 Reference Circuitry의 BOM은 그대로 따르라고 있는 거라는 것. 커패시터 하나 빠뜨렸다고 SWD가 안 붙는다. ~~ㅈㄹ맞네~~
:::::

:::::locale{lang=en}
If there's a lesson, it's that the reference circuitry's BOM exists to be followed exactly. Drop a single capacitor and SWD won't attach. ~~What a pain~~
:::::

:::::locale{lang=ko}
다음 글에서는 [펌웨어랑 지문 이진화](/posts/fingerprint_payment/3_firmware/) 얘기를 한다.
:::::

:::::locale{lang=en}
The next post covers [the firmware and fingerprint binarization](/en/posts/fingerprint_payment/3_firmware/).
:::::
