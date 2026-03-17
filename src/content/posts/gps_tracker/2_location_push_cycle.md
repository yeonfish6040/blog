---
title: "마라톤 - ep.1"
description: "서버에 위치 업로드하는 사이클"
published: 2026-03-17
tags: [embedded, marathon]
category: developing
draft: false
---

# 일단 위치를 업로드해야겠지??

어떤 방식이 좋을까

일단 LTE를 연결하고.... GPS켜셔 fix를 받고 업로드를 해야겠지?

<img src="https://media.tenor.com/y2JXkY1pXkwAAAAM/cat-computer.gif" title="" alt="Coding GIFs | Tenor" data-align="center">

자 다했다 이제 플래시하고 딱 실행을 시키면??

<img title="" src="img_3.png" alt="img_3.png" data-align="center" width="650">

<img title="" src="https://substackcdn.com/image/fetch/$s_!LsNE!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5565ec07-00a4-423b-ba03-725f584f18c7_400x400.gif" alt="" data-align="center">

LTE랑 GNSS를 같이 실행시키면 LTE가 GNSS의 시간창을 뺐어가서 GNSS수신을 못한다!

그러면,,,

GNSS fix를 받고 LTE로 전송을 하는 사이클을 만들어야겠다!

해서 

<img src="img_5.png" title="" alt="img_5.png" data-align="center">

성공했다!

쉽네 ㅋ
lte 연결 효율은 위해 PSM이 가능하면 동작할 수 있도록 구성하였다.

끗