---
title: "딤 - 새로운 연구를 해보고있었다."
description: "구상-연결-익스?"
published: 2026-08-24
tags: [embedded, research]
category: hacking
draft: false
---

# DRAM Interposer - Dram Page Cache Manipulate
사실 DIMM과 mem controller 사이에서 버스의 write act를 감시하며 page cache와 같은 패턴의 데이터가 버스에 보이면 해당 주소를 기억해놨다가
그 버스 주소의 read act가 감지되면 DIMM 모듈과 버스의 연결을 끊고 내가 대신 응답하는 그런 구조를 구상했었고 연구를 조금 해보고있었다.

애초에 시작이 좀 삐딱한 질문이었다. 컴퓨터에서 RAM은 아무도 의심을 안 한다. 쓰면 저장되고, 읽으면 그대로 나온다고 그냥 믿는다.
CPU도 OS도 애플리케이션도 서로를 그렇게 열심히 검증하면서 정작 메모리 모듈이 거짓말을 할 수도 있다는 가정은 위협 모델 밖에 있다.
그럼 공급망 어딘가에서 손을 탄 DIMM이 애초에 공격자면? 지금 컴퓨터는 어디까지 안전한가? 라는게 출발점이었다.

여기서 말하는 악성 DRAM은 그냥 불량 램이 아니다. DIMM 안에 버스 트래픽을 보고 있다가 필요할 때 응답을 골라서 내보낼 수 있는 능동 회로가 들어있다는 가정이다.

```text title="Threat model"
CPU
 │
 ▼
Memory Controller
 │
 │  DDR Memory Bus
 ▼
┌──────────────────────────────┐
│       Malicious DIMM         │
│                              │
│  Traffic observation         │
│  Pattern / address learning  │
│  Response selection          │
└──────────────┬───────────────┘
               │
               ▼
          DRAM chips
```

위의 두 단계다. 버스에 지나가는 명령이랑 데이터를 보는 sniffing, 그리고 특정 조건에서 실제 메모리 응답 대신 다른 값을 내는 substitution.
드라이버를 심을 필요도 없고 PCIe 장치로 자기를 드러낼 필요도 없다는게 이 모델이 매력적인 이유다. 시스템 입장에선 최대한 평범한 램이어야 한다.


# Linux
해당 아이디어를 떠올리고 제일 먼저 알아본건 리눅스의 메모리 구조였다. 메모리 버스는 변조할 수 있다 쳐, 변조할 데이터가 있어야 할 것 아닌가.

일단은 각 프로세스의 변수나 코드 영역같은 메모리를 변조하는 방안을 생각해봤는데 거의 메모리 전역을 주물러야하고 복잡도가 high level에서 너무 높아지기에 반려,

그 이후에 생각했던게 page cache 변조였다. 상대적으로 간단하게? 변조 가능한 벡터였기 때문이다.

이후 리눅스 커널 mm을 조금 뜯어보며 페이지 캐시의 구조를 확인하고 Folio 구조체를 감지하고 변조하는 방법을 떠올렸다.

리눅스에서 일반적인 파일 read/write랑 mmap은 결국 page cache를 거친다. 커널 문서도 page cache를 유저랑 파일시스템이 만나는 주요 계층으로 설명하고 있다.

```text title="A normal file read"
File
 │
 ▼
Linux Page Cache
 │
 ▼
Folio / physical memory
 │
 ▼
Memory Controller
 │
 ▼
DRAM
```

그래서 page cache가 꽤 재밌는 관찰 대상이었다. 파일 내용이 반복적으로 메모리에 올라오게만 만들 수 있으면 버스에서 그 데이터의 패턴이랑 위치 관계를 볼 수 있지 않을까 싶었다. 파일 내용 말고 파일시스템 메타데이터처럼 구조가 뚜렷한 바이트 패턴도 후보였다

근데 여기서 걸린게, 패턴을 찾아 봤자 객체 식별이 어렵기에... 벽에 부딧쳤다
다음을 봐라

- 같은 바이트열이 전혀 다른 데이터에서 또 나올 수 있다.
- 여러 코어 요청이 섞여서 지나가거나 스크램블링때문에 주소를 기준으로 버스를 연속된 파일 스트림처럼 볼 수가 없다.
- `O_DIRECT`처럼 page cache를 우회하는 경로도 있다.

그러니까 page cache는 파일 데이터가 메모리에 나타나는 유력한 경로지, 모든 파일 접근을 설명하는 만능 창구는 아니다. 캐시에 있다고 그 데이터가 바로 DRAM 버스에 보인다는 뜻도 아니고.

질문이 여기서 "헤더 찾고 뒤 바이트 읽으면 되지 않나?"에서 "관찰한 데이터랑 시스템의 메모리 객체 관계를 어떻게 검증할 건가?"로 바뀌었다.

# cache
버스를 보고 싶으면 요청이 실제로 DIMM까지 내려와야 한다. 데이터가 CPU 캐시에 남아있으면 같은 값을 아무리 다시 읽어도 메모리 컨트롤러랑 DRAM은 아예 호출이 안 된다.

```text title="A request may stop before DRAM"
CPU
 │
 ├─ L1 hit  ───────────────┐
 ├─ L2 hit  ───────────────┤ CPU 내부에서 처리
 ├─ LLC hit ───────────────┘
 │
 └─ LLC miss
        │
        ▼
   Memory Controller
        │
        ▼
       DRAM
```

즉 인터포저를 아무리 잘 만들어도 요청이 DIMM에 안 오면 보지도 못하고 바꾸지도 못한다. 이건 메모리 버스 off-chip 공격 연구인 [Membuster](https://www.usenix.org/conference/usenixsecurity20/presentation/lee-dayeol)에서도 핵심 전제로 깔고 가는 부분이다. DRAM 요청은 LLC miss가 나야 버스에 보인다.

그래서 cache eviction 문제가 따라온다. 큰 메모리 접근으로 LLC에 압력을 주고 그 뒤에 목표 데이터에서 LLC miss가 늘어나는지 재는 건 된다. 근데 이 둘은 확실히 구분해야 한다.

| 볼 수 있는 것 | 주장하면 안 되는 것 |
| --- | --- |
| LLC miss 비율이 변한다 | 특정 cache line을 원하는 시점에 정확히 내보냈다 |
| DRAM 요청이 더 자주 발생한다 | 그 요청이 원하는 파일의 요청이다 |
| 버스 트래픽이 늘어난다 | 그 트래픽의 의미를 안정적으로 복원했다 |

캐시 전체에 압력 주는 거랑 특정 데이터를 정확히 DRAM까지 밀어내는 건 난이도가 아예 다른 문제다.

# Physical address != DRAM address
그리고 OS가 쓰는 물리 주소가 DIMM에서 그대로 한 위치로 보이는 것도 아니다. 메모리 컨트롤러가 성능이랑 병렬성 때문에 주소를 잘게 쪼개서 뿌린다.

```text title="Address translation at a high level"
Physical address
       │
       ▼
Memory Controller
       │
       ├─ Channel
       ├─ DIMM / rank
       ├─ Bank
       ├─ Row
       └─ Column
       │
       ▼
Actual DRAM location
```

실제 매핑엔 interleaving이나 주소 비트 조합이 들어가고 플랫폼마다 다르다. [DRAMA](https://www.usenix.org/conference/usenixsecurity16/technical-sessions/presentation/pessl)가 이 매핑이 channel/rank/bank 수준에서 어떤 의미인지 분석한 대표적인 선행 연구다.

그러니까 이런 순진한 가정은 그냥 안 된다.

```text
physical address 0x1234
        ==
DRAM location 0x1234
```

인터포저가 관찰 결과를 특정 데이터랑 이으려면 CPU가 보는 주소랑 DRAM 명령의 관계까지 같이 알아야 한다. 바이트 검색 문제가 아니라 캐시 계층 + 메모리 컨트롤러 + 주소 매핑을 전부 엮는 시스템 문제가 된다.

# 왜 굳이 구형 DDR3부터 봤냐면
초기엔 구형 Xeon E5 계열 + DDR3 환경을 봤다. 최신 플랫폼부터 시작하면 "버스에 평문이 보이긴 하나?"랑 "메모리 암호화를 넘을 수 있나?"가 한번에 섞여버리기 때문이다.

암호화 없는 단순한 기준선을 먼저 잡고 그 위에 방어 기술을 하나씩 얹는 편이 질문 분리가 훨씬 쉽다. 구형을 골랐다고 최신 시스템을 털겠다는 얘기가 아니고, 위협 모델의 기본 성립 조건이랑 암호화가 붙었을 때 달라지는 걸 따로 보려는 실험 설계다.

당연히 이 기준선은 실제 제품 환경 보안 수준이랑 같지 않다. 여기 결과를 현대 서버로 일반화하려면 세대별 메모리 컨트롤러, 암호화 기능, 부팅 설정, DIMM 구조를 전부 따로 봐야 한다.

# 메모리 암호화가 들어오면 게임이 바뀐다
메모리 암호화가 켜지면 CPU 밖으로 나가는 데이터는 평문이 아니다. Intel TME 문서도 외부 메모리 버스랑 DRAM엔 암호문만 있고 평문은 프로세서 안에만 있다고 못 박아뒀다.

```text title="Without memory encryption"
CPU ───── meaningful plaintext ─────> DRAM
```

```text title="With memory encryption"
CPU ─────────── ciphertext ──────────> DRAM
```

이러면 앞에서 얘기한 내용 기반 탐지가 거의 다 죽는다. 파일 문자열이나 커널 구조체 패턴 보고 의미를 알아내는 모델은 같은 방식으론 안 돌아간다.

근데 여기서 암호화랑 무결성을 헷갈리면 안 된다. 같은 Intel 문서에 TME는 메모리 수정 자체를 막아주지 않는다고 적혀있다. 못 읽게 만드는 거랑, 못 바꾸게 / 예전 값 다시 못 내놓게 만드는 건 별개의 보안 속성이다.

| 보호 | 버스 평문 관찰 | 임의 수정 | replay/치환 |
| --- | :---: | :---: | :---: |
| 평문 DRAM | 가능 | 취약할 수 있음 | 취약할 수 있음 |
| 메모리 암호화 | 크게 제한 | 별도 검토 필요 | 별도 검토 필요 |
| 암호화 + 무결성 + freshness | 크게 제한 | 탐지/거부 가능 | 강하게 제한 |

여기서 freshness는 그냥 "형식이 유효한가" 보다 한 단계 위다. 예전에 유효했던 블록을 그대로 돌려주는 replay를 막으려면 버전이나 카운터 같은 상태를 무결성 검증이랑 같이 설계해야 한다.

# Hash tree가 그려주는 신뢰 경계
메모리 블록 무결성 검증 구조를 아주 단순하게 그리면 이런 모양이다.

```text title="A simplified integrity tree"
                 Trusted root
                 /           \
              Hash           Hash
             /   \          /   \
          Block  Block    Block  Block
```

root랑 검증 상태가 CPU 안 신뢰 영역에 있고, 외부 메모리에서 읽은 블록이 그 관계를 못 만족하면 시스템은 그 값을 정상 데이터로 받아들이면 안 된다. 실제 설계는 해시 트리로 안 끝나고 저장 위치, 캐시, 카운터, 부팅 시 키랑 상태까지 다 같이 봐야 한다.

정리하면 방어는 이 세 축이다.

```text
Memory confidentiality
          +
Memory integrity and freshness
          +
Trusted boot-time enforcement
```

CPU 밖 DRAM을 안 믿기로 했으면 기밀성이랑 무결성을 같이 가져가야 한다. 메모리 암호화만으로 변조 문제까지 다 풀린다고 말할 순 없다.

# 하드웨어로 만들면 또 다른 얘기
개념만 보면 DIMM 중간에 회로 하나 끼우면 될 것 같다. 근데 DDR 인터페이스는 정해진 응답 지연이랑 burst 동작을 지켜야 하고, 중간에 뭘 끼우는 순간 신호 무결성이랑 추가 지연이 생긴다.

```text title="The response deadline"
Read command
     │
     │  fixed protocol timing
     ▼
Data burst
```

중간 회로가 매번 해야 하는 일이 만만치 않다.

1. 명령이랑 주소를 해석한다.
2. 지금까지 관찰한 상태랑 비교한다.
3. 실제 DRAM 응답을 통과시킬지 판단한다.
4. 필요하면 정해진 시간 안에 다른 응답을 만들어낸다.

이 글에서 신호 수준 구현 절차까지 풀 생각은 없다. 그리고 연구적으로 더 중요한 질문은 "DDR 전체를 실시간으로 통제할 수 있나"보다 "이 위협 모델에 진짜 필요한 최소한의 관찰/개입 기능이 뭐냐"에 가깝다고 본다.

대부분 트래픽은 그냥 정상 경로로 흘려보내고 제한된 조건에서만 판단하는 구조가 현실성 면에선 더 유력한 후보일 것 같다. 물론 이것도 실제 하드웨어로 검증해봐야 하는 가설이다.

# 참고로
DRAM 주소 매핑이랑 메모리 공격 배경이 더 궁금하면 [DRAMA](https://www.usenix.org/conference/usenixsecurity16/technical-sessions/presentation/pessl)랑 [Membuster](https://www.usenix.org/conference/usenixsecurity20/presentation/lee-dayeol) 논문부터 보면 된다.

아래 저장소는 이 연구를 구현한 게 아니라 DRAM 오류랑 Rowhammer 계열 실험용 공개 도구다. 메모리 시스템을 실험적으로 이해하는 참고용으로만 걸어둔다.

::github{repo="google/rowhammer-test"}

같은 DRAM을 건드린다고 같은 공격 모델인 건 아니다. Rowhammer는 셀에 물리적 오류를 유도하는 쪽이고, 내가 보던 건 공급망에 들어간 능동 하드웨어가 트래픽을 보거나 응답에 끼어드는 쪽이다.

# 확인한 것

확인한 구조적 사실:

- page cache는 일반적인 파일 접근이 물리 메모리로 이어지는 중요한 경로다.
- CPU 캐시에 데이터가 남아있으면 DRAM 버스에서 그 접근을 못 본다.
- physical address랑 실제 DRAM 위치 사이엔 플랫폼별 매핑이 있다.
- 메모리 암호화는 버스 평문 관찰을 크게 어렵게 만든다.
- 암호화, 무결성, replay 방지는 서로 다른 목표다.


# 결국 Trust Boundary 문제
보통은 CPU, OS, 펌웨어, 메모리를 한 덩어리 신뢰 영역으로 취급한다. 근데 DRAM을 안 믿기로 하는 순간 경계가 다시 그려진다.

```text title="A revised trust boundary"
┌────────────── TRUSTED ──────────────┐
│ CPU                                 │
│ Memory controller                   │
│ Key / integrity state               │
└────────────────────────────────────┘
                 │
                 │ encrypted + authenticated
                 ▼
┌───────────── UNTRUSTED ─────────────┐
│ Mainboard traces                    │
│ DIMM                                │
│ DRAM chips                          │
└────────────────────────────────────┘
```

실제로 방어를 점검한다면 이런 질문이 더 중요하다.

- [ ] 메모리 암호화를 지원하는가?
- [ ] 그게 실제로 켜져 있는가?
- [ ] 무결성이랑 freshness 검증이 있는가?
- [ ] 부팅 때 보호 상태를 검증하고 정책으로 강제하는가?
- [ ] 공급망에서 DIMM 출처랑 변경 이력을 확인할 수 있는가?

# 마치며
ㅈ됐다.

이거 아이디어 그대로 ssd에 적용해서 구버전 엑셀파일에 악성코드 심기 자동화같은거나 연구해봐야겠다.